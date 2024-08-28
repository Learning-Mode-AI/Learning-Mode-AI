package main

import (
	"YOUTUBE-LEARNING-MODE/pkg/router"
	"log"
	"net/http"
)

func main() {
	r := router.NewRouter() // Initialize your router

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
