package handlers

import (
	"YOUTUBE-LEARNING-MODE/pkg/services"
	"encoding/json"
	"net/http"
)

type QuestionRequest struct {
	VideoID      string `json:"videoId"`
	UserQuestion string `json:"userQuestion"`
}

var aiChat *services.AIChat

func HandleQuestion(w http.ResponseWriter, r *http.Request) {
	var questionRequest QuestionRequest

	err := json.NewDecoder(r.Body).Decode(&questionRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if aiChat is initialized
	if aiChat == nil {
		http.Error(w, "AI session not initialized. Please process the video first.", http.StatusBadRequest)
		return
	}

	// Use the existing AIChat instance to fetch a response
	aiResponse, err := aiChat.FetchGPTResponse(questionRequest.UserQuestion)
	if err != nil {
		http.Error(w, "Failed to fetch AI response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": aiResponse})
}
