package handlers

import (
	"Learning-Mode-AI/pkg/config"
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

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
			log.Printf("Error reading request body: %v\n", err)
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}

		// Get the Stripe-Signature header
		signatureHeader := req.Header.Get("Stripe-Signature")
		if signatureHeader == "" {
			log.Println("Missing Stripe-Signature header")
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Verify the webhook signature
		event, err := webhook.ConstructEvent(payload, signatureHeader, endpointSecret)
		if err != nil {
			log.Printf("⚠️ Webhook signature verification failed: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		log.Printf("Successfully constructed event: %s", event.Type)
		// Handle the webhook events
		switch event.Type {

		case "invoice.payment_succeeded":
			var invoice stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
				log.Printf("Error parsing payment success: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			customerEmail := invoice.CustomerEmail
			if customerEmail == "" {
				log.Println("⚠️ No customer email found in invoice event")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			productID := invoice.Lines.Data[0].Plan.Product.ID // Get product ID
			tier, exists := productTierMap[productID]
			if !exists {
				log.Printf("⚠️ No matching tier found for product ID: %s", productID)
				tier = "Unknown" // Default fallback
			}

			// Create Subscription struct
			subscription := &services.Subscription{
				Tier: tier,
			}

			// Store in Redis
			err := services.StoreSubscriptioninfoInRedis(customerEmail, subscription)
			if err != nil {
				log.Printf("⚠️ Error storing subscription in Redis: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			log.Printf("Stored subscription for %s - Tier: %s", customerEmail, tier)

		case "customer.subscription.deleted":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				log.Printf("Error parsing subscription deletion: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			//Fetch customer details if email is missing
			customerDetails, err := customer.Get(subscription.Customer.ID, nil)
			if err != nil {
				log.Printf("Error fetching customer details: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			customerEmail := customerDetails.Email
			if customerEmail == "" {
				log.Println("⚠️ No customer email found")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			//Remove subscription from Redis
			err = services.DeleteSubscriptionFromRedis(customerEmail)
			if err != nil {
				log.Printf("⚠️ Error deleting subscription from Redis: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			log.Printf("Subscription deleted for %s - Access revoked", customerEmail)

		default:
			log.Printf("Unhandled event type: %s", event.Type)
		}

		// Acknowledge receipt of the event
		w.WriteHeader(http.StatusOK)
	}
}
