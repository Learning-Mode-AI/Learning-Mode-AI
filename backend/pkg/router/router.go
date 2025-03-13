package router

import (
	"Learning-Mode-AI/pkg/handlers"

	"github.com/gorilla/mux"
)

func NewRouter(stripeSecret string) *mux.Router {
	r := mux.NewRouter()

	// Define your routes here
	r.HandleFunc("/webhook", handlers.StripeWebhookHandler(stripeSecret)).Methods("POST")
	// Define routes with user validation middleware
	r.HandleFunc("/processVideo", handlers.ProcessVideo).Methods("POST")
	r.HandleFunc("/api/question", handlers.AskGPTQuestion).Methods("POST")
	r.HandleFunc("/api/quiz", handlers.GenerateQuiz).Methods("POST")
	r.HandleFunc("/video-summary", handlers.VideoSummaryHandler).Methods("POST")
	r.HandleFunc("/api/user/tier", handlers.GetUserTierHandler).Methods("GET")
	r.HandleFunc("/api/create-checkout-session", handlers.CreateCheckoutSessionHandler).Methods("POST")

	// Routes that DO NOT require user validation
	r.HandleFunc("/api/show-interest", handlers.ShowInterestHandler).Methods("POST")
	r.HandleFunc("/api/interest-count/{feature}", handlers.GetInterestCountHandler).Methods("GET")

	return r
}
