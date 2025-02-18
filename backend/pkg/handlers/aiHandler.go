package handlers

import (
	"Learning-Mode-AI/pkg/context"
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"log"
	"net/http"
)

// InitializeGPTRequest struct for the video info request
type InitializeGPTRequest struct {
	VideoID    string   `json:"video_id"`
	Title      string   `json:"title"`
	Channel    string   `json:"channel"`
	Transcript []string `json:"transcript"`
}

// GPTQuestionRequest struct for asking questions
type GPTQuestionRequest struct {
	VideoID      string `json:"video_id"`
	UserQuestion string `json:"user_question"`
	Timestamp    int    `json:"timestamp"`
	UserID       string `json:"userId"`
}

// AskGPTQuestion handles user questions for the GPT session
func AskGPTQuestion(w http.ResponseWriter, r *http.Request) {
	var questionReq GPTQuestionRequest

	// Decode request body
	err := json.NewDecoder(r.Body).Decode(&questionReq)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Retrieve the assistantID from context using videoID
	assistantIDValue, ok := context.Instance.AssistantIDs.Load(questionReq.VideoID)
	if !ok {
		http.Error(w, "Assistant session not found for this video", http.StatusBadRequest)
		return
	}
	assistantID, _ := assistantIDValue.(string)

	// Log timestamp for debugging
	log.Printf("Received question at timestamp: %d seconds", questionReq.Timestamp)

	// Ask GPT the question
	aiResponse, err := services.AskGPTQuestion(questionReq.VideoID, assistantID, questionReq.UserQuestion, questionReq.Timestamp)
	if err != nil {
		log.Printf("Failed to get AI response: %v", err)
		http.Error(w, "Failed to get AI response", http.StatusInternalServerError)
		return
	}

	// Respond with the AI's answer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": aiResponse})
}
