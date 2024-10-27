package services

import (
	"YOUTUBE-LEARNING-MODE/pkg/config"
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
func InitGPTSession(videoID, title, channel string, transcript []string) (string, error) {
	// Join the transcript array into a single string
	transcriptStr := strings.Join(transcript, " ")

	// Create the AIRequest payload
	payload := map[string]interface{}{
		"video_id":   videoID,
		"title":      title,
		"channel":    channel,
		"transcript": transcriptStr,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal AIRequest: %v", err)
	}
	log.Println("this is the req body::", string(payloadBytes))

	// Create an HTTP POST request to initialize the session
	aiServiceURL := fmt.Sprintf("%s/ai/init-session", config.AiServiceURL)
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", aiServiceURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Set the content-type header to application/json
	req.Header.Set("Content-Type", "application/json")

	// Make the HTTP request
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to initialize GPT session: %v", err)
	}
	defer resp.Body.Close()

	// Read response body for debugging purposes
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	// Check if the response is successful
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("AI service returned an error: %v, Body: %s", resp.Status, string(body))
	}

	// Parse the JSON response to get the assistant ID
	var responseData map[string]string
	err = json.Unmarshal(body, &responseData)
	if err != nil {
		return "", fmt.Errorf("failed to parse AI session response: %v", err)
	}

	assistantID, ok := responseData["assistant_id"]
	if !ok {
		return "", fmt.Errorf("assistant_id not found in response: %v", responseData)
	}

	// Return the assistant ID for future use
	return assistantID, nil
}

// AskGPTQuestion sends a question to the AI service using the assistant_id and returns the response.
func AskGPTQuestion(videoID, assistantID, userQuestion string) (string, error) {
	// Log the incoming parameters for debugging
	log.Printf("Preparing to ask GPT a question. VideoID: %s, AssistantID: %s, Question: %s", videoID, assistantID, userQuestion)

	// Create the request payload
	reqPayload := map[string]interface{}{
		"video_id":     videoID,
		"assistant_id": assistantID,
		"question":     userQuestion,
	}

	// Convert payload to JSON
	reqBody, err := json.Marshal(reqPayload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal AIRequest: %v", err)
	}

	// Log the JSON payload for debugging
	log.Printf("Request payload: %s", string(reqBody))

	// Make HTTP POST request to the AI service to ask a question
	aiServiceURL := fmt.Sprintf("%s/ai/ask-question", config.AiServiceURL)
	client := &http.Client{Timeout: 30 * time.Second}
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

	// Parse the JSON response to get the assistant's answer
	var aiResponse map[string]string
	err = json.Unmarshal(body, &aiResponse)
	if err != nil {
		return "", fmt.Errorf("failed to parse AI response: %v", err)
	}

	// Check if the response contains the 'answer' field
	answer, ok := aiResponse["answer"]
	if !ok {
		return "", fmt.Errorf("AI response did not contain 'answer' field: %v", aiResponse)
	}

	// Return the assistant's answer
	return answer, nil
}

// AIServiceURL is the configuration for the base URL of the AI service
func getAIServiceURL() string {
	return config.AiServiceURL
}
