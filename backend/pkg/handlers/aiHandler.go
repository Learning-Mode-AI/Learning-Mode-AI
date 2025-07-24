package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// InitializeGPTRequest struct for the video info request
type InitializeGPTRequest struct {
	VideoID    string   `json:"video_id"`
	Title      string   `json:"title"`
	Channel    string   `json:"channel"`
	Transcript []string `json:"transcript"`
}

// GPTQuestionRequest struct for asking questions
type GPTQuestionRequest struct {
	VideoID      string `json:"video_id"`
	UserQuestion string `json:"user_question"`
	Timestamp    int    `json:"timestamp"`
	UserID       string `json:"userId"`
}

// GPTQuestionWithFileRequest struct for asking questions with file context
type GPTQuestionWithFileRequest struct {
	VideoID        string `json:"video_id"`
	UserQuestion   string `json:"user_question"`
	Timestamp      int    `json:"timestamp"`
	UserID         string `json:"userId"`
	OpenAIFileID   string `json:"openai_file_id,omitempty"`   // OpenAI file ID
	FileName       string `json:"file_name,omitempty"`
}

// AskGPTQuestion handles user questions for the GPT session
func AskGPTQuestion(w http.ResponseWriter, r *http.Request) {
	var questionReq GPTQuestionRequest

	// Decode request body
	err := json.NewDecoder(r.Body).Decode(&questionReq)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Log timestamp for debugging
	log.Printf("Received question at timestamp: %d seconds", questionReq.Timestamp)

	// TESTING: Comment out user access check to allow unlimited questions
	/*
	hasAccess, err := services.CheckUserAccess(questionReq.UserID)
	if err != nil {
		log.Printf("Failed to check user access: %v", err)
		http.Error(w, "Failed to check user access", http.StatusInternalServerError)
		return
	}

	if !hasAccess {
		log.Printf("User %s has ran out of monthly questions", questionReq.UserID)
		http.Error(w, "Monthly question limit reached", http.StatusForbidden)
		return
	}

	services.IncrementUserQuestionCount(questionReq.UserID)
	*/

	// Ask GPT the question
	aiResponse, err := services.AskGPTQuestion(questionReq.VideoID, questionReq.UserID, questionReq.UserQuestion, questionReq.Timestamp)
	if err != nil {
		log.Printf("Failed to get AI response: %v", err)
		http.Error(w, "Failed to get AI response", http.StatusInternalServerError)
		return
	}

	// Respond with the AI's answer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": aiResponse})
}

// AskGPTQuestionWithFile handles user questions with optional file context
func AskGPTQuestionWithFile(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		log.Printf("Unable to parse form: %v", err)
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Extract form values
	videoID := r.FormValue("video_id")
	userQuestion := r.FormValue("user_question")
	timestamp := r.FormValue("timestamp")
	userID := r.FormValue("userId")

	if videoID == "" || userQuestion == "" || userID == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	var openAIFileID string
	var fileName string

	// Handle file upload if present
	file, handler, err := r.FormFile("context_file")
	if err == nil {
		defer file.Close()
		fileName = handler.Filename
		
		// Check file upload access before processing
		hasFileAccess, err := services.CheckFileUploadAccess(userID)
		if err != nil {
			log.Printf("Failed to check file upload access: %v", err)
			http.Error(w, "Failed to check file upload access", http.StatusInternalServerError)
			return
		}

		if !hasFileAccess {
			log.Printf("User %s has reached their monthly file upload limit", userID)
			http.Error(w, "Monthly file upload limit reached", http.StatusForbidden)
			return
		}
		
		// Read file content
		content, err := io.ReadAll(file)
		if err != nil {
			log.Printf("Error reading file: %v", err)
			http.Error(w, "Error reading file", http.StatusInternalServerError)
			return
		}
		
		// Upload file to OpenAI and get file ID
		openAIFileID, err = uploadFileToOpenAI(content, fileName)
		if err != nil {
			log.Printf("Error uploading file to OpenAI: %v", err)
			http.Error(w, "Error uploading file to OpenAI", http.StatusInternalServerError)
			return
		}

		// Increment file upload count after successful upload
		err = services.IncrementUserFileUploadCount(userID)
		if err != nil {
			log.Printf("Warning: Failed to increment file upload count: %v", err)
			// Don't fail the request, just log the warning
		}

		log.Printf("Successfully uploaded file to OpenAI: %s -> ID: %s", fileName, openAIFileID)
	}

	// Convert timestamp
	timestampInt, err := strconv.Atoi(timestamp)
	if err != nil {
		timestampInt = 0
	}

	log.Printf("Received question with file at timestamp: %d seconds", timestampInt)

	// TESTING: Comment out user access check to allow unlimited questions
	/*
	// Check user access
	hasAccess, err := services.CheckUserAccess(userID)
	if err != nil {
		log.Printf("Failed to check user access: %v", err)
		http.Error(w, "Failed to check user access", http.StatusInternalServerError)
		return
	}

	if !hasAccess {
		log.Printf("User %s has ran out of monthly questions", userID)
		http.Error(w, "Monthly question limit reached", http.StatusForbidden)
		return
	}

	services.IncrementUserQuestionCount(userID)
	*/

	// Create request for AI service
	questionReq := GPTQuestionWithFileRequest{
		VideoID:        videoID,
		UserQuestion:   userQuestion,
		Timestamp:      timestampInt,
		UserID:         userID,
		OpenAIFileID:   openAIFileID,
		FileName:       fileName,
	}

	// Forward to AI service
	response, err := services.AskGPTWithFile(questionReq.VideoID, questionReq.UserID, questionReq.UserQuestion, questionReq.Timestamp, questionReq.OpenAIFileID, questionReq.FileName)
	if err != nil {
		log.Printf("Failed to get AI response: %v", err)
		http.Error(w, "Failed to get AI response", http.StatusInternalServerError)
		return
	}

	// Respond with the AI's answer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": response})
}

// uploadFileToOpenAI uploads a file to OpenAI's file storage and returns the file ID
func uploadFileToOpenAI(content []byte, fileName string) (string, error) {
	// Validate file size and type
	ext := strings.ToLower(filepath.Ext(fileName))
	switch ext {
	case ".pdf", ".txt", ".md", ".doc", ".docx":
		const maxFileSize = 500 * 1024 // 500KB
		if len(content) > maxFileSize {
			return "", fmt.Errorf("file too large: %d KB (max: 500 KB)", len(content)/1024)
		}
	default:
		return "", fmt.Errorf("unsupported file type: %s. Supported types: .txt, .md, .pdf, .doc, .docx", ext)
	}

	// Get OpenAI API key
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OpenAI API key not configured")
	}

	// Create multipart form data
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add file field first (following coworker's pattern)
	fileField, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return "", fmt.Errorf("failed to create file field: %w", err)
	}
	_, err = fileField.Write(content)
	if err != nil {
		return "", fmt.Errorf("failed to write file content: %w", err)
	}

	// Add purpose field (with proper error handling like coworker's pattern)
	err = writer.WriteField("purpose", "assistants")
	if err != nil {
		return "", fmt.Errorf("failed to write field 'purpose': %w", err)
	}

	// Close writer with error handling
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Create HTTP request to OpenAI
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/files", &requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to upload file to OpenAI: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OpenAI API returned error %d: %s", resp.StatusCode, string(respBody))
	}

	// Parse response to get file ID
	var uploadResp struct {
		ID       string `json:"id"`
		Filename string `json:"filename"`
		Purpose  string `json:"purpose"`
	}

	err = json.Unmarshal(respBody, &uploadResp)
	if err != nil {
		return "", fmt.Errorf("failed to parse OpenAI response: %w", err)
	}

	log.Printf("✅ File uploaded to OpenAI: %s -> %s", fileName, uploadResp.ID)
	return uploadResp.ID, nil
}
