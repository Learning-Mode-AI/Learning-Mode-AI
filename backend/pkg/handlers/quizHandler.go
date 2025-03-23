package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"net/http"
)

func GenerateQuiz(w http.ResponseWriter, r *http.Request) {
	var request struct {
		VideoID string `json:"video_id"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	userID := r.Header.Get("User-ID")
	if userID == "" {
		http.Error(w, "Missing User-ID in request headers", http.StatusBadRequest)
		return
	}

	err = services.CheckAndIncrementUsage(userID, "quiz")
	if err != nil {
		http.Error(w, err.Error(), http.StatusTooManyRequests)
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
