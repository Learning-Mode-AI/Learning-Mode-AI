package main

import (
	"Learning-Mode-AI/pkg/config"
	"Learning-Mode-AI/pkg/router"
	"Learning-Mode-AI/pkg/services"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(err)
		// log.Fatal("Error loading .env file")
	}
	config.InitConfig()
	services.InitRedis()
}

func main() {
	r := router.NewRouter() // Initialize your router

	// Set CORS options
	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization", "User-ID"})
	originsOk := handlers.AllowedOrigins([]string{"https://www.youtube.com"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(r)); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
