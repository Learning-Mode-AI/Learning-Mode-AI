package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

// Global variables for services and secrets
var (
	YoutubeInfoServiceURL     string
	VideoProcessingServiceURL string
	AiServiceURL              string
	QuizServiceURL            string
	RedisHost                 string
	TLSEnabled                bool
	StripeSecretKey           string
	StripeWebhookSecret       string
	ProductIdPro              string
)

// InitConfig initializes the environment variables
func InitConfig() {
	// Load .env file
	err := godotenv.Load(".env")
	if err != nil {
		logrus.Fatal("Error loading .env file")
	}

	ProductIdPro = os.Getenv("PRODUCT_ID_PRO")

	// Retrieve and store environment variables
	StripeSecretKey = os.Getenv("STRIPE_SECRET_KEY")
	StripeWebhookSecret = os.Getenv("STRIPE_WEBHOOK_SECRET")
	tlsEnv := os.Getenv("TLS_ENABLED")
	TLSEnabled, err = strconv.ParseBool(tlsEnv)
	if err != nil {
		TLSEnabled = false
	}

	env := os.Getenv("ENVIRONMENT")
	if env == "local" {
		YoutubeInfoServiceURL = "http://localhost:8000"
		VideoProcessingServiceURL = "http://localhost:8081"
		AiServiceURL = "http://localhost:8082"
		QuizServiceURL = "http://localhost:8084"
		RedisHost = "localhost:6379"
		TLSEnabled = false
		logrus.Info("Running in local mode")
	} else {
		YoutubeInfoServiceURL = "http://youtube-info-service:8000"
		VideoProcessingServiceURL = "http://video-processing-service:8081"
		AiServiceURL = "http://ai-service:8082"
		QuizServiceURL = "http://quiz-service:8084"
		redisEnvHost := os.Getenv("REDIS_HOST")
		if redisEnvHost != "" {
			RedisHost = redisEnvHost
		} else {
			RedisHost = "redis:6379"
		}
		logrus.Info("Running in Docker mode")
	}
}
