package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"net/http"
)

// GetUserTierHandler returns the current tier status for a user
func GetUserTierHandler(w http.ResponseWriter, r *http.Request) {
	// Extract User-ID from request headers
	userID := r.Header.Get("User-ID")
	if userID == "" {
		http.Error(w, "Missing User-ID header", http.StatusBadRequest)
		return
	}

	// Get the user's current tier
	tier, err := services.GetUserTier(userID)
	if err != nil {
		http.Error(w, "Error retrieving user tier", http.StatusInternalServerError)
		return
	}

	// Get remaining requests for each service
	chatRemaining, quizRemaining, summaryRemaining, err := services.GetRemainingRequests(userID)
	if err != nil {
		http.Error(w, "Error retrieving remaining requests", http.StatusInternalServerError)
		return
	}

	// Return the tier information
	response := map[string]interface{}{
		"tier": tier,
		"limits": map[string]interface{}{
			"chat": map[string]interface{}{
				"remaining": chatRemaining,
				"limit":     services.GetServiceLimit("chat", tier),
			},
			"quiz": map[string]interface{}{
				"remaining": quizRemaining,
				"limit":     services.GetServiceLimit("quiz", tier),
			},
			"summary": map[string]interface{}{
				"remaining": summaryRemaining,
				"limit":     services.GetServiceLimit("summary", tier),
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}