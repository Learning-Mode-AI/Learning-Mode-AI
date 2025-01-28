package main

import (
	"Learning-Mode-AI/pkg/config"
	"Learning-Mode-AI/pkg/router"
	"Learning-Mode-AI/pkg/services"
	"log"
	"net/http"
	"os"

	//"Learning-Mode-AI/pkg/handlers"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
	"github.com/stripe/stripe-go"
)

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(err)
		// log.Fatal("Error loading .env file")
	}
	// Set the Stripe secret key globally
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	config.InitConfig()
	services.InitRedis()
}

func main() {
	stripeSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if stripeSecret == "" {
		log.Fatal("STRIPE_WEBHOOK_SECRET environment variable is not set")
	}

	r := router.NewRouter(stripeSecret) // Initialize your router

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	originsOk := handlers.AllowedOrigins([]string{"https://www.youtube.com"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(r)); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
