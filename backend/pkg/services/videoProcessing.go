package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// CallVideoProcessingService sends a request to the video processing service
func CallVideoProcessingService(videoID, videoURL string, timestamps []string) error {
	// Define the URL for the video processing service
	videoProcessingServiceURL := "http://video-processing-service:8081/process-snapshots"

	// Create the payload to send (videoID, videoURL, and timestamps)
	payload := map[string]interface{}{
		"video_id":   videoID,
		"video_url":  videoURL,   // This is needed for downloading
		"timestamps": timestamps, // The list of timestamps for snapshots
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %v", err)
	}

	// Create an HTTP POST request
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", videoProcessingServiceURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to make request to video processing service: %v", err)
	}
	defer resp.Body.Close()

	// Check for success response
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code from video processing service: %v", resp.StatusCode)
	}

	log.Println("Successfully triggered video processing for snapshots")
	return nil
}
