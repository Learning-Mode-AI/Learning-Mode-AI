package handlers

import (
	"encoding/json"
	"net/http"
)

type QuestionRequest struct {
	VideoID  string `json:"video_id"`
	Question string `json:"question"`
}

type QuestionResponse struct {
	Answer string `json:"answer"`
}

func HandleQuestion(w http.ResponseWriter, r *http.Request) {
	var req QuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Process the question here (e.g., interact with an AI service)

	response := QuestionResponse{
		Answer: "This is a placeholder answer.",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func HandleVideoContext(w http.ResponseWriter, r *http.Request) {
	// Handle retrieving video context here
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Video context placeholder"))
}
