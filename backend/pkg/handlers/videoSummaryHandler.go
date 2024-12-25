package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"log"
	"net/http"
)

type VideoSummaryRequest struct {
	VideoID    string `json:"video_id"`
	Transcript string `json:"transcript"`
}

type VideoSummaryResponse struct {
	Summary string `json:"summary"`
}

func VideoSummaryHandler(w http.ResponseWriter, r *http.Request) {
	var req VideoSummaryRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Call AI Service to generate the summary
	summary, err := services.GetVideoSummary(req.Transcript)
	if err != nil {
		log.Printf("Error generating video summary: %v", err)
		http.Error(w, "Failed to generate summary", http.StatusInternalServerError)
		return
	}

	resp := VideoSummaryResponse{Summary: summary}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
