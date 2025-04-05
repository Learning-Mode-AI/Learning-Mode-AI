package handlers

import (
	"Learning-Mode-AI/pkg/config"
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/customer"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
)

const MaxBodyBytes = int64(65536)

func StripeWebhookHandler(endpointSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {

		var productTierMap = map[string]string{
			config.ProductIdPro: "Pro",
		}
		// Limit request body size for safety
		req.Body = http.MaxBytesReader(w, req.Body, MaxBodyBytes)
		payload, err := ioutil.ReadAll(req.Body)
		if err != nil {
			logrus.WithError(err).Error("Error reading request body")
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}

		// Get the Stripe-Signature header
		signatureHeader := req.Header.Get("Stripe-Signature")
		if signatureHeader == "" {
			logrus.Error("Missing Stripe-Signature header")
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Verify the webhook signature
		event, err := webhook.ConstructEvent(payload, signatureHeader, endpointSecret)
		if err != nil {
			logrus.WithError(err).Error("Webhook signature verification failed")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		logrus.WithField("event_type", event.Type).Info("Successfully constructed event")

		// Handle the webhook events
		switch event.Type {

		case "invoice.payment_succeeded":
			var invoice stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
				logrus.WithError(err).Error("Error parsing payment success")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			customerEmail := invoice.CustomerEmail
			if customerEmail == "" {
				logrus.Error("No customer email found in invoice event")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			productID := invoice.Lines.Data[0].Plan.Product.ID // Get product ID
			tier, exists := productTierMap[productID]
			if !exists {
				logrus.WithField("product_id", productID).Warn("No matching tier found for product ID")
				tier = "Unknown" // Default fallback
			}

			// Create Subscription struct
			subscription := &services.Subscription{
				Tier: tier,
			}

			// Store in Redis
			err := services.StoreSubscriptionInfoInRedis(customerEmail, subscription)
			if err != nil {
				logrus.WithError(err).Error("Error storing subscription in Redis")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			logrus.WithFields(logrus.Fields{
				"email": customerEmail,
				"tier":  tier,
			}).Info("Stored subscription")

		case "customer.subscription.deleted":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				logrus.WithError(err).Error("Error parsing subscription deletion")
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			//Fetch customer details if email is missing
			customerDetails, err := customer.Get(subscription.Customer.ID, nil)
			if err != nil {
				logrus.WithError(err).Error("Error fetching customer details")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			customerEmail := customerDetails.Email
			if customerEmail == "" {
				logrus.Error("No customer email found")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			//Remove subscription from Redis
			err = services.DeleteSubscriptionFromRedis(customerEmail)
			if err != nil {
				logrus.WithError(err).Error("Error deleting subscription from Redis")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			logrus.WithField("email", customerEmail).Info("Subscription deleted - Access revoked")

		default:
			logrus.WithField("event_type", event.Type).Info("Unhandled event type")
		}

		// Acknowledge receipt of the event
		w.WriteHeader(http.StatusOK)
	}
}
