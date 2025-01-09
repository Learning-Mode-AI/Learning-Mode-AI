package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type QuizRequest struct {
	VideoID string `json:"video_id"`
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

var quizServiceBaseURL = "http://localhost:8084"

func GenerateQuiz(videoID string) (*QuizResponse, error) {
	payload := QuizRequest{VideoID: videoID}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := http.Post(fmt.Sprintf("%s/quiz/generate-quiz", quizServiceBaseURL), "application/json", bytes.NewBuffer(body))
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
