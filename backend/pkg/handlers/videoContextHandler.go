package handlers

import (
	"YOUTUBE-LEARNING-MODE/pkg/services"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type VideoRequest struct {
	VideoUrl string `json:"videoUrl"`
}

func ProcessVideo(w http.ResponseWriter, r *http.Request) {

	// Handle CORS preflight requests
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Add CORS headers to actual request response
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	log.Println("Received ProcessVideo request")
	var videoRequest VideoRequest

	err := json.NewDecoder(r.Body).Decode(&videoRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	log.Println("Video URL:", videoRequest.VideoUrl)

	// Extract the video ID from the URL
	videoID := extractVideoID(videoRequest.VideoUrl)
	if videoID == "" {
		http.Error(w, "Invalid video URL", http.StatusBadRequest)
		return
	}

	// Use the YouTube API to process the video information
	videoInfo, err := services.FetchVideoInfo(videoID)
	if err != nil {
		http.Error(w, "Failed to fetch video info", http.StatusInternalServerError)
		return
	}

	print(videoInfo.Title)

	// Return the video information as a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videoInfo)
}

// Helper function to extract the video ID from the YouTube URL
func extractVideoID(url string) string {
	parts := strings.Split(url, "v=")
	if len(parts) > 1 {
		return strings.Split(parts[1], "&")[0]
	}
	return ""
}
