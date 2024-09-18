package main

import (
	"YOUTUBE-LEARNING-MODE/pkg/router"
	"YOUTUBE-LEARNING-MODE/pkg/services"
	"log"
	"net/http"
	"path/filepath"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func init() {
	envPath := filepath.Join("..", ".env")
	err := godotenv.Load(envPath)
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	r := router.NewRouter() // Initialize your router
	services.InitRedis()

	// Set CORS options
	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	originsOk := handlers.AllowedOrigins([]string{"https://www.youtube.com"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(r)); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
