package services

import (
	"Learning-Mode-AI/pkg/config"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

// VideoInfo struct to represent video metadata and transcript
type VideoInfo struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Channel     string   `json:"channel"`
	Transcript  []string `json:"transcript"`
	ChatID      string   `json:"chatId"` // Store the ChatGPT session ID
}

// FetchVideoInfo sends a request to the Python service to get video information and transcript
func FetchVideoInfo(videoID string) (*VideoInfo, error) {
	// Define the URL to call the Python service
	pythonServiceURL := fmt.Sprintf("%s/video-info/%s", config.YoutubeInfoServiceURL, videoID)

	// Create an HTTP GET request to the Python service
	client := &http.Client{Timeout: 1000 * time.Second}
	req, err := http.NewRequest("GET", pythonServiceURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Execute the request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch video info from Python service: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code from Python service: %v", resp.Status)
	}

	// Read and parse the response from Python service
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	var videoInfo VideoInfo
	err = json.Unmarshal(body, &videoInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal video info: %v", err)
	}

	return &videoInfo, nil
}
