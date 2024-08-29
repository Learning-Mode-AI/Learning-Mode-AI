package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type GPTRequest struct {
	Model    string       `json:"model"`
	Messages []GPTMessage `json:"messages"`
}

type GPTMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GPTResponse struct {
	Choices []struct {
		Message GPTMessage `json:"message"`
	} `json:"choices"`
}

// FetchGPTResponse sends a request to the GPT-4 API with the provided context and question
func FetchGPTResponse(videoInfo VideoInfo, userQuestion string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	apiUrl := "https://api.openai.com/v1/chat/completions"

	systemMessage := GPTMessage{
		Role:    "system",
		Content: fmt.Sprintf("You are a helpful assistant that provides detailed information based on the YouTube video with title: %s, description: %s, by channel: %s", videoInfo.Title, videoInfo.Description, videoInfo.Channel),
	}

	userMessage := GPTMessage{
		Role:    "user",
		Content: userQuestion,
	}

	gptRequest := GPTRequest{
		Model: "gpt-4",
		Messages: []GPTMessage{
			systemMessage,
			userMessage,
		},
	}

	requestBody, err := json.Marshal(gptRequest)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", apiUrl, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var gptResponse GPTResponse
	err = json.NewDecoder(resp.Body).Decode(&gptResponse)
	if err != nil {
		return "", err
	}

	if len(gptResponse.Choices) > 0 {
		return gptResponse.Choices[0].Message.Content, nil
	}

	return "", fmt.Errorf("no response from GPT-4")
}
