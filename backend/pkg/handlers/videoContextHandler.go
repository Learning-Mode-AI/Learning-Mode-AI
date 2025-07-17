package handlers

import (
	"Learning-Mode-AI/pkg/context"
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"strconv"
	"github.com/tiktoken-go/tokenizer"
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

	log.Printf("Processing video for User: %s, Email: %s\n", userID, userEmail)

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
	log.Println("Video URL:", videoRequest.VideoUrl)

	// Extract video ID
	videoID := extractVideoID(videoRequest.VideoUrl)
	if videoID == "" {
		http.Error(w, "Invalid video URL", http.StatusBadRequest)
		return
	}

	// Fetch video information from the info service
	videoInfo, err := services.FetchVideoInfo(videoID)
	if err != nil {
		log.Println("error:", err)
		http.Error(w, "Failed to fetch video info", http.StatusInternalServerError)
		return
	}

	const maxTokens = 95000;

	transcriptTokens := getTranscriptTokens(videoInfo.Transcript)
	log.Printf("Transcript contains %d tokens", transcriptTokens)
	log.Printf("Transcript contains %d characters", len(strings.Join(videoInfo.Transcript, " ")));
	if transcriptTokens>maxTokens{
		videoInfo.Transcript = TruncateTranscript(videoInfo.Transcript, maxTokens)
	}
	//Check if transcript exceeds max tokens then reduce if needed

	// Store video info in Redis (without snapshots for now)
	err = services.StoreVideoInfoInRedis(videoID, videoInfo)
	if err != nil {
		log.Println("Failed to store video info in Redis:", err)
	}

	// Initialize Assistant session with video info
	assistantID, err := services.InitGPTSession(userID, videoID, videoInfo.Title, videoInfo.Channel, videoInfo.Transcript)

	if err != nil {
		log.Println("Failed to initialize assistant session:", err)
		http.Error(w, "Failed to initialize assistant session", http.StatusInternalServerError)
		return
	}
	context.Instance.AssistantIDs.Store(videoID, assistantID)

	// Extract timestamps from the transcript
	timestamps := ExtractTimestampsFromTranscript(videoInfo.Transcript)
	//log.Println("Extracted Timestamps:", timestamps)

	// Trigger snapshot processing (non-blocking)
	go func() {
		err = services.CallVideoProcessingService(videoID, videoRequest.VideoUrl, timestamps)
		if err != nil {
			log.Println("Failed to process snapshots:", err)
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
// Calculate the amount of tokens in a transcript
func getTranscriptTokens(transcript []string) int{
	transcriptString := strings.Join(transcript, " ")
	enc, err := tokenizer.Get(tokenizer.Cl100kBase)
	if err != nil {
		log.Printf("Failed to get tokenizer (Cl100kBase): %v", err)
	}
	tokenIds, _, _ := enc.Encode(transcriptString)
	return len(tokenIds)
}
// Truncate transcript if it's too long
func TruncateTranscript(transcript []string, maxTokens int) []string {
	enc, err := tokenizer.Get(tokenizer.Cl100kBase)
	if err != nil {
		log.Printf("Failed to get tokenizer (Cl100kBase): %v", err)
	}
	totalTokens:=0
	var resultTranscript []string
	for _,entry := range transcript {
		tokenIds, _, err := enc.Encode(entry)
		if err != nil {
			log.Printf("Error encoding entry: %v", err)
			continue 
		}
		
		if totalTokens + len(tokenIds) > maxTokens {
			break
		}
		
		resultTranscript = append(resultTranscript, entry)
		totalTokens += len(tokenIds)
	}
	// Extract timestamp from final element of slice
	timestampStr := strings.SplitN(resultTranscript[len(resultTranscript)-1], ":", 2)[0]
	// Convert timestamp string to float
	timestampSeconds, err := strconv.ParseFloat(timestampStr, 64)
	if err != nil {
		log.Printf("Error converting timestamp: %v", err)
	} else {
		//Convert seconds to hours + min for more clear idea of when transcript ends
		totalSeconds := int(timestampSeconds)
		hours := totalSeconds / 3600
		minutes := (totalSeconds % 3600) / 60
		log.Printf("Truncation complete at %d tokens (max: %d). Final timestamp: %.2f sec (%02d:%02d)", totalTokens, maxTokens, timestampSeconds, hours, minutes)
	}
	return resultTranscript
}
