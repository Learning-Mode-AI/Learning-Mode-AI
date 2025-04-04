package handlers

import (
	"Learning-Mode-AI/pkg/context"
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/sirupsen/logrus"
)

type VideoRequest struct {
	VideoUrl string `json:"videoUrl"`
}

func ProcessVideo(w http.ResponseWriter, r *http.Request) {
	// Handle CORS preflight requests (skipping for brevity)

	// Extract User-ID and Email from request headers
	userID := r.Header.Get("User-ID")
	userEmail := r.Header.Get("User-Email")
	if userID == "" || userEmail == "" {
		http.Error(w, "Missing User-ID or User-Email in request headers", http.StatusBadRequest)
		return
	}

	logrus.WithFields(logrus.Fields{
		"user_id":  userID,
		"email":    userEmail,
	}).Info("Processing video")

	// Ensure user exists in Redis (Create if not)
	err := services.CheckAndCreateUser(userID, userEmail)
	if err != nil {
		http.Error(w, "Error ensuring user exists", http.StatusInternalServerError)
		return
	}

	// Log the request and decode payload
	var videoRequest VideoRequest
	err = json.NewDecoder(r.Body).Decode(&videoRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	logrus.WithField("video_url", videoRequest.VideoUrl).Info("Received video URL")

	// Extract video ID
	videoID := extractVideoID(videoRequest.VideoUrl)
	if videoID == "" {
		http.Error(w, "Invalid video URL", http.StatusBadRequest)
		return
	}

	// Fetch video information from the info service
	videoInfo, err := services.FetchVideoInfo(videoID)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch video info")
		http.Error(w, "Failed to fetch video info", http.StatusInternalServerError)
		return
	}

	// Define the max allowed transcript length
	const maxTranscriptTokens = 256000 // OpenAI limit

	if len(strings.Join(videoInfo.Transcript, " ")) > maxTranscriptTokens {
		logrus.Warn("Transcript too long, rejecting request")
		http.Error(w, `{"error": "This video is too long. Try a shorter one."}`, http.StatusBadRequest)
		return
	}

	// Store video info in Redis (without snapshots for now)
	err = services.StoreVideoInfoInRedis(videoID, videoInfo)
	if err != nil {
		logrus.WithError(err).Error("Failed to store video info in Redis")
	}

	// Initialize Assistant session with video info
	assistantID, err := services.InitGPTSession(userID, videoID, videoInfo.Title, videoInfo.Channel, videoInfo.Transcript)

	if err != nil {
		logrus.WithError(err).Error("Failed to initialize assistant session")
		http.Error(w, "Failed to initialize assistant session", http.StatusInternalServerError)
		return
	}
	context.Instance.AssistantIDs.Store(videoID, assistantID)

	// Extract timestamps from the transcript
	timestamps := ExtractTimestampsFromTranscript(videoInfo.Transcript)
	logrus.WithField("timestamps", timestamps).Info("Extracted timestamps")

	// Trigger snapshot processing (non-blocking)
	go func() {
		err = services.CallVideoProcessingService(videoID, videoRequest.VideoUrl, timestamps)
		if err != nil {
			logrus.WithError(err).Error("Failed to process snapshots")
		}
	}()

	// Return the video information (transcript) as a response to the client
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

// ExtractTimestampsFromTranscript extracts all timestamps from the transcript array
func ExtractTimestampsFromTranscript(transcript []string) []string {
	var timestamps []string
	for _, entry := range transcript {
		// Split each entry on the colon to get the timestamp and the text
		parts := strings.Split(entry, ":")
		if len(parts) > 1 {
			// The first part before the colon is the timestamp
			timestamp := strings.TrimSpace(parts[0])
			timestamps = append(timestamps, timestamp)
		}
	}
	return timestamps
}
