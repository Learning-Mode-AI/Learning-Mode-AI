package main

import (
	"Learning-Mode-AI/pkg/config"
	"Learning-Mode-AI/pkg/router"
	"Learning-Mode-AI/pkg/services"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go"
)

func init() {
	// Initialize logrus
	logrus.SetFormatter(&logrus.JSONFormatter{})
	
	// Initialize configuration (loads environment variables)
	config.InitConfig()

	// Set the Stripe secret key globally
	stripe.Key = config.StripeSecretKey

	// Initialize Redis
	services.InitRedis()
}

func main() {
	if config.StripeWebhookSecret == "" {
		logrus.Fatal("STRIPE_WEBHOOK_SECRET environment variable is not set")
	}

	r := router.NewRouter(config.StripeWebhookSecret) // Initialize your router

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization", "User-ID", "User-Email"})
	originsOk := handlers.AllowedOrigins([]string{"https://www.youtube.com"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	logrus.Info("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(r)); err != nil {
		logrus.Fatalf("Could not start server: %s", err.Error())
	}
}
