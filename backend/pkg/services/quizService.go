package services

import (
	"Learning-Mode-AI/pkg/config"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/sirupsen/logrus"
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
		logrus.WithError(err).Error("Failed to marshal request")
		return nil, err
	}

	resp, err := http.Post(fmt.Sprintf("%s/quiz/generate-quiz", config.QuizServiceURL), "application/json", bytes.NewBuffer(body))
	if err != nil {
		logrus.WithError(err).Error("Failed to call quiz service")
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logrus.WithField("status_code", resp.StatusCode).Error("Quiz service returned error")
		return nil, fmt.Errorf("quiz service returned status code %d", resp.StatusCode)
	}

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logrus.WithError(err).Error("Failed to read response body")
		return nil, err
	}

	var quizResponse QuizResponse
	if err := json.Unmarshal(respBody, &quizResponse); err != nil {
		logrus.WithError(err).Error("Failed to parse quiz response")
		return nil, err
	}

	return &quizResponse, nil
}
