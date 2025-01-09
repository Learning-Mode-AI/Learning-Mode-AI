package config

import (
	"fmt"
	"os"
)

var (
	YoutubeInfoServiceURL     string
	VideoProcessingServiceURL string
	AiServiceURL              string
	QuizServiceURL			  string
	RedisHost                 string
)

func InitConfig() {
	env := os.Getenv("ENVIRONMENT")
	if env == "local" {
		YoutubeInfoServiceURL = "http://localhost:8000"
		VideoProcessingServiceURL = "http://localhost:8081"
		AiServiceURL = "http://localhost:8082"
		QuizServiceURL="http://localhost:8084"
		RedisHost = "localhost:6379"
		fmt.Println("Running in local mode")
	} else {
		YoutubeInfoServiceURL = "http://youtube-info-service:8000"
		VideoProcessingServiceURL = "http://video-processing-service:8081"
		AiServiceURL = "http://ai-service:8082"
		RedisHost = "redis:6379"
		fmt.Println("Running in Docker mode")
	}
}
