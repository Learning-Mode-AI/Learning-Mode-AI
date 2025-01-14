package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"log"
	"net/http"
)

type VideoSummaryRequest struct {
	VideoID string `json:"video_id"` // Only video_id is required
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

	if req.VideoID == "" {
		http.Error(w, "video_id is required", http.StatusBadRequest)
		return
	}

	// Check if summary exists in Redis first
	summary, err := services.GetVideoSummaryFromRedis(req.VideoID)
	if err != nil {
		log.Printf("Error retrieving summary from Redis: %v", err)
	}

	if summary != "" {
		// Return cached summary if available
		resp := VideoSummaryResponse{Summary: summary}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	// Call AI service only if summary not found in cache
	summary, err = services.GetVideoSummary(req.VideoID)
	if err != nil {
		log.Printf("Error generating video summary: %v", err)
		http.Error(w, "Failed to generate summary", http.StatusInternalServerError)
		return
	}

	// Store the newly generated summary in Redis
	services.StoreVideoSummaryInRedis(req.VideoID, summary)

	// Respond with the generated summary
	resp := VideoSummaryResponse{Summary: summary}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
