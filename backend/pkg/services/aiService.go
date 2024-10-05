package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

// AIRequest struct to send to AI service
type AIRequest struct {
	VideoID      string   `json:"video_id"`
	Title        string   `json:"title"`
	Channel      string   `json:"channel"`
	Transcript   []string `json:"transcript"`
	UserQuestion string   `json:"user_question"`
}

// InitGPTSession initializes a GPT session for the given video information.
func InitGPTSession(videoID, title, channel string, transcript []string) error {
	// Create the AIRequest payload
	payload := map[string]interface{}{
		"video_id":   videoID,
		"title":      title,
		"channel":    channel,
		"transcript": transcript,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal AIRequest: %v", err)
	}
	log.Println("this is the req body::", string(payloadBytes))

	// Create an HTTP POST request
	aiServiceURL := "http://localhost:8082/ai/init-session"
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", aiServiceURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Set the content-type header to application/json
	req.Header.Set("Content-Type", "application/json")

	// Make the HTTP request
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to initialize GPT session: %v", err)
	}
	defer resp.Body.Close()

	// Read response body for debugging purposes
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %v", err)
	}

	// Check if the response is successful
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("AI service returned an error: %v, Body: %s", resp.Status, string(body))
	}

	return nil
}

// AskGPTQuestion sends a question to the AI service and returns the response.
func AskGPTQuestion(videoID, userQuestion string) (string, error) {
	// Log the incoming parameters for debugging
	log.Printf("Preparing to ask GPT a question. VideoID: %s, Question: %s", videoID, userQuestion)

	// Create the AIRequest payload
	reqPayload := AIRequest{
		VideoID:      videoID,
		UserQuestion: userQuestion,
	}

	// Convert payload to JSON
	reqBody, err := json.Marshal(reqPayload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal AIRequest: %v", err)
	}

	// Log the JSON payload for debugging
	log.Printf("Request payload: %s", string(reqBody))

	// Make HTTP POST request to the AI service
	aiServiceURL := "http://localhost:8082/ai/ask-question"
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(aiServiceURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("failed to send question to GPT: %v", err)
	}
	defer resp.Body.Close()

	// Read the raw response body for logging and debugging
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	// Log the raw response for debugging
	log.Printf("Raw AI Response: %s", string(body))

	// Check if the content type contains "application/json"
	contentType := resp.Header.Get("Content-Type")
	log.Printf("Response Content-Type: %s", contentType) // Log the content type for debugging
	if !strings.Contains(contentType, "application/json") {
		return "", fmt.Errorf("AI service returned a non-JSON response: %s", string(body))
	}

	// Parse the JSON response
	var aiResponse map[string]string
	err = json.Unmarshal(body, &aiResponse)
	if err != nil {
		return "", fmt.Errorf("failed to parse AI response: %v", err)
	}

	// Check if "response" field is present
	gptResponse, ok := aiResponse["response"]
	if !ok {
		return "", fmt.Errorf("AI response did not contain 'response' field: %v", aiResponse)
	}

	// Return the GPT response
	return gptResponse, nil
}
