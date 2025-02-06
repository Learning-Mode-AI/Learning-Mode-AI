package middleware

import (
	"Learning-Mode-AI/pkg/services"
	"log"
	"net/http"
)

// ValidateUserID is a middleware function that ensures the User-ID exists in Redis before proceeding.
// If the user is not found, it returns a 404 error.
func ValidateUserID(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get User-ID from the request header.
		userID := r.Header.Get("User-ID")
		userEmail := r.Header.Get("User-Email")

		log.Println("Middleware: Received request with User-ID:", userID, "Email:", userEmail)

		if userID == "" {
			log.Println("Middleware: Missing User-ID in request headers")
			http.Error(w, "Missing User-ID in request headers", http.StatusBadRequest)
			return
		}

		// Check if user exists in Redis.
		userExists, err := services.CheckUserExistsInRedis(userID)
		if err != nil {
			log.Println("Middleware: Error checking Redis for user:", err)
			http.Error(w, "Error checking user in Redis", http.StatusInternalServerError)
			return
		}
		if !userExists {
			// Return 404 indicating the user is not found.
			log.Println("Middleware: User NOT FOUND in Redis. Returning 404.")
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		// User exists; proceed with the request.
		log.Println("Middleware: User found in Redis. Proceeding with request.")
		next(w, r)
	}
}
