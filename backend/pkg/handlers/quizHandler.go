package handlers

import (
	"encoding/json"
	"Learning-Mode-AI/pkg/services"
	"net/http"
)

func GenerateQuiz(w http.ResponseWriter, r *http.Request) {
	
	// Retrieve the User-ID from request headers.
	userID := r.Header.Get("User-ID")
	if userID == "" {
		http.Error(w, "Missing User-ID header", http.StatusBadRequest)
		return
	}

	// Enforce tier limits for the quiz service.
	if err := services.ValidateUserTierRequest(userID, "quiz"); err != nil {
		http.Error(w, err.Error(), http.StatusTooManyRequests)
		return
	}

	var request struct {
		VideoID string `json:"video_id"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	quiz, err := services.GenerateQuiz(request.VideoID)
	if err != nil {
		http.Error(w, "Failed to generate quiz: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}
