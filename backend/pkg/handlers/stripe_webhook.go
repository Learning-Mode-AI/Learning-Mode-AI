package handlers

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
)

const MaxBodyBytes = int64(65536)

func StripeWebhookHandler(endpointSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
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

		// Debugging: log payload and headers (only for testing, remove in production)
		log.Printf("Payload received: %s\n", string(payload))
		log.Printf("Stripe-Signature header: %s\n", signatureHeader)
		log.Printf("Endpoint secret: %s\n", endpointSecret)

		// Verify the webhook signature
		event, err := webhook.ConstructEvent(payload, signatureHeader, endpointSecret)
		if err != nil {
			log.Printf("⚠️ Webhook signature verification failed: %v\n", err)
			log.Printf("Payload: %s\n", string(payload))
			log.Printf("Signature Header: %s\n", signatureHeader)
			log.Printf("Endpoint Secret: %s\n", endpointSecret)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		log.Printf("Successfully constructed event: %s", event.Type)

		// Handle the event based on its type
		switch event.Type {
		case "checkout.session.completed":
			var session stripe.CheckoutSession
			if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
				log.Printf("Error parsing checkout session: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			log.Printf("Checkout session completed for customer: %s", session.Customer.Email)
			// TODO: Add logic to provision services or update the database.

		case "customer.subscription.created":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				log.Printf("Error parsing subscription created: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			log.Printf("Subscription created: %s for customer: %s", subscription.ID, subscription.Customer)
			// TODO: Add logic to activate access for the user.

		case "customer.subscription.deleted":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				log.Printf("Error parsing subscription deletion: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			log.Printf("Subscription deleted: %s for customer: %s", subscription.ID, subscription.Customer)
			// TODO: Add logic to revoke access for the user.

		case "customer.subscription.updated":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				log.Printf("Error parsing subscription update: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			log.Printf("Subscription updated: %s for customer: %s", subscription.ID, subscription.Customer)
			// TODO: Add logic to update the user's plan in your system.

		case "invoice.payment_failed":
			var invoice stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
				log.Printf("Error parsing payment failure: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			log.Printf("Invoice payment failed: %s for customer: %s", invoice.ID, invoice.CustomerEmail)
			// TODO: Add logic to notify the user or retry payment.

		case "invoice.payment_succeeded":
			var invoice stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
				log.Printf("Error parsing payment success: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			log.Printf("Invoice payment succeeded: %s for customer: %s", invoice.ID, invoice.CustomerEmail)
			// TODO: Add logic to mark invoices as paid in your database.

		default:
			log.Printf("Unhandled event type: %s", event.Type)
			// Optionally log or handle untracked events for debugging.
		}

		// Acknowledge receipt of the event
		w.WriteHeader(http.StatusOK)
	}
}
