package services

import (
	"context"
	"fmt"
	"os"

	openai "github.com/sashabaranov/go-openai"
)

type AIChat struct {
	ChatID   string
	Client   *openai.Client
	Messages []openai.ChatCompletionMessage // Store conversation history
}

// FetchGPTResponse generates a response from GPT-4 based on the provided user question.
func (ai *AIChat) FetchGPTResponse(userQuestion string) (string, error) {
	// Append the user question to the conversation history
	ai.Messages = append(ai.Messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: userQuestion,
	})

	// Call the OpenAI API with the entire conversation history
	resp, err := ai.Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:    openai.GPT4,
			Messages: ai.Messages, // Pass the entire conversation history
		},
	)

	if err != nil {
		return "", fmt.Errorf("ChatCompletion error: %v", err)
	}

	// Append the AI response to the conversation history
	ai.Messages = append(ai.Messages, resp.Choices[0].Message)

	// Return the generated response
	return resp.Choices[0].Message.Content, nil
}

// CreateChatGPTInstance initializes a ChatGPT instance with the video context.
func CreateChatGPTInstance(videoInfo *VideoInfo) (*AIChat, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is missing")
	}

	client := openai.NewClient(apiKey)

	// Initialize the ChatGPT session with the video context
	initialMessage := fmt.Sprintf(
		"You are helping a user based on the following video:\n\nTitle: %s\nDescription: %s\nChannel: %s\nTranscript:\n%s",
		videoInfo.Title, videoInfo.Description, videoInfo.Channel, videoInfo.Transcript,
	)

	// Create the initial system message
	systemMessage := openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleSystem,
		Content: initialMessage,
	}

	// Create and return AIChat instance, initializing with the system message
	return &AIChat{
		Client:   client,
		Messages: []openai.ChatCompletionMessage{systemMessage}, // Initialize with system message
	}, nil
}
