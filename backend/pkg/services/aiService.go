package services

import (
	"Learning-Mode-AI/pkg/config"
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
func InitGPTSession(userID, videoID, title, channel string, transcript []string) (string, error) {
	// 1️⃣ **Check Redis for an existing assistant**
	existingID, err := GetAssistantFromRedis(userID, videoID)
	if err == nil && existingID != "" {
		log.Printf("✅ Reusing existing assistant ID: %s for User: %s, Video: %s", existingID, userID, videoID)
		return existingID, nil
	} else if err != nil {
		log.Printf("⚠️ Error checking Redis for assistant ID: %v", err)
	}

	// 2️⃣ **No assistant found – create a new one**
	log.Printf("❌ No existing assistant found. Creating a new one for User: %s, Video: %s", userID, videoID)

	// Convert transcript array to a string
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

	// Call the AI Service to initialize the session
	aiServiceURL := fmt.Sprintf("%s/ai/init-session", config.AiServiceURL)
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", aiServiceURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Send request to AI service
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to initialize GPT session: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
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

	// 3️⃣ **Store the new assistant ID in Redis for future reuse**
	err = StoreAssistantInRedis(userID, videoID, assistantID)
	if err != nil {
		log.Printf("⚠️ Failed to store assistant ID in Redis: %v", err)
	}

	log.Printf("✅ Successfully created and stored assistant ID: %s for User: %s, Video: %s", assistantID, userID, videoID)
	return assistantID, nil
}

// AskGPTQuestion sends a question to the AI service using the assistant_id and returns the response.
func AskGPTQuestion(videoID, userID, userQuestion string, timestamp int) (string, error) {
	// Log the incoming parameters for debugging
	log.Printf("Preparing to ask GPT a question. VideoID: %s, UserID: %s, Question: %s, Timestamp: %d", videoID, userID, userQuestion, timestamp)

	// Create the request payload
	reqPayload := map[string]interface{}{
		"video_id":  videoID,
		"userId":    userID,
		"question":  userQuestion,
		"timestamp": timestamp,
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

func GetVideoSummary(videoID string) (string, error) {
	// Construct the request payload
	payload := map[string]string{"video_id": videoID}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %v", err)
	}

	// Define the AI Service URL
	aiServiceURL := fmt.Sprintf("%s/ai/generate-summary", config.AiServiceURL)
	client := &http.Client{Timeout: 60 * time.Second}

	// Make the POST request to the AI Service
	req, err := http.NewRequest("POST", aiServiceURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call AI Service: %v", err)
	}
	defer resp.Body.Close()

	// Handle non-200 responses
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("AI Service error: %s", string(body))
	}

	// Decode the AI Service response
	var aiResponse map[string]string
	err = json.NewDecoder(resp.Body).Decode(&aiResponse)
	if err != nil {
		return "", fmt.Errorf("failed to decode AI response: %v", err)
	}

	// Extract and return the summary
	summary, ok := aiResponse["summary"]
	if !ok {
		return "", fmt.Errorf("summary not found in AI response")
	}

	return summary, nil
}
