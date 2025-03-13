package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

type CreateCheckoutRequest struct {
	PriceID string `json:"price_id"`
	UserID  string `json:"user_id"`
	Email   string `json:"email"`
}

// CreateCheckoutSessionHandler creates a Stripe checkout session
func CreateCheckoutSessionHandler(w http.ResponseWriter, r *http.Request) {
	// Extract user information from request
	var req CreateCheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.PriceID == "" || req.UserID == "" || req.Email == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Define the success and cancel URLs
	// These should be updated to match your extension's URLs
	successURL := "https://www.youtube.com/success?session_id={CHECKOUT_SESSION_ID}"
	cancelURL := "https://www.youtube.com/cancel"

	// Create checkout session parameters
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(req.PriceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		CustomerEmail: stripe.String(req.Email),
		ClientReferenceID: stripe.String(req.UserID),
	}

	// Create the checkout session
	s, err := session.New(params)
	if err != nil {
		log.Printf("Error creating checkout session: %v", err)
		http.Error(w, fmt.Sprintf("Error creating checkout session: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the session ID to the client
	response := map[string]string{
		"sessionId": s.ID,
		"url":       s.URL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}