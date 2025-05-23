package services

import (
	"Learning-Mode-AI/pkg/config"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type QuizRequest struct {
	VideoID string `json:"video_id"`
	UserID string `json:"user_id"`
}

type Option struct {
	Option      string `json:"option"`
	Explanation string `json:"explanation"`
}

type Question struct {
	Text      string   `json:"text"`
	Options   []Option `json:"options"`
	Answer    string   `json:"answer"`
	Timestamp string   `json:"timestamp"`
}

type QuizResponse struct {
	QuizID    string     `json:"quiz_id"`
	Questions []Question `json:"questions"`
}


func GenerateQuiz(videoID string, userID string) (*QuizResponse, error) {
	payload := QuizRequest{VideoID: videoID, UserID: userID}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := http.Post(fmt.Sprintf("%s/quiz/generate-quiz", config.QuizServiceURL), "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to call quiz service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("quiz service returned status code %d", resp.StatusCode)
	}

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var quizResponse QuizResponse
	if err := json.Unmarshal(respBody, &quizResponse); err != nil {
		return nil, fmt.Errorf("failed to parse quiz response: %w", err)
	}

	return &quizResponse, nil
}
