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

func HandleQuestion(w http.ResponseWriter, r *http.Request) {
	var questionRequest QuestionRequest

	err := json.NewDecoder(r.Body).Decode(&questionRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Fetch video info using the video ID
	videoInfo, err := services.FetchVideoInfo(questionRequest.VideoID)
	if err != nil {
		http.Error(w, "Failed to fetch video info", http.StatusInternalServerError)
		return
	}

	// Get AI response
	aiResponse, err := services.FetchGPTResponse(*videoInfo, questionRequest.UserQuestion)
	if err != nil {
		http.Error(w, "Failed to fetch AI response", http.StatusInternalServerError)
		return
	}

	// Return the AI response as a JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": aiResponse})
}
