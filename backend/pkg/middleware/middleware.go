package middleware

import (
	"Learning-Mode-AI/pkg/services"
	"net/http"
)

// ValidateUserID is a middleware function that ensures the userID exists in Redis before proceeding
func ValidateUserID(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get userID from the request header
		userID := r.Header.Get("User-ID")
		if userID == "" {
			http.Error(w, "Missing User-ID in request headers", http.StatusBadRequest)
			return
		}

		// Check if userID exists in Redis
		userExists, err := services.CheckUserExistsInRedis(userID)
		if err != nil {
			http.Error(w, "Error checking user in Redis", http.StatusInternalServerError)
			return
		}
		if !userExists {
			http.Error(w, "User ID not found", http.StatusNotFound) // **404 Not Found**
			return
		}

		// If userID is valid, proceed with the request
		next(w, r)
	}
}
