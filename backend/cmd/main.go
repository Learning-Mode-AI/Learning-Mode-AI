package main

import (
	"Learning-Mode-AI/pkg/config"
	"Learning-Mode-AI/pkg/router"
	"Learning-Mode-AI/pkg/services"
	"log"
	"net/http"

	//"Learning-Mode-AI/pkg/handlers"

	"github.com/gorilla/handlers"
	"github.com/stripe/stripe-go"
)

func init() {
	// Initialize configuration (loads environment variables)
	config.InitConfig()

	// Set the Stripe secret key globally
	stripe.Key = config.StripeSecretKey

	// Initialize Redis
	services.InitRedis()
}

func main() {
	if config.StripeWebhookSecret == "" {
		log.Fatal("STRIPE_WEBHOOK_SECRET environment variable is not set")
	}

	r := router.NewRouter(config.StripeWebhookSecret) // Initialize your router

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	originsOk := handlers.AllowedOrigins([]string{"https://www.youtube.com"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(r)); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
