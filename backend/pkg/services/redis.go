package services

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"Learning-Mode-AI/pkg/config"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

// Initialize a new Redis client
var rdb *redis.Client

func InitRedis() {
	var tlsConfig *tls.Config
	if config.TLSEnabled {
		tlsConfig = &tls.Config{
			InsecureSkipVerify: true,
		}
	} else {
		tlsConfig = nil
	}

	rdb = redis.NewClient(&redis.Options{
		Addr:      config.RedisHost, // Replace with Redis server address
		TLSConfig: tlsConfig,
	})

	err := rdb.Ping(ctx).Err()
	if err != nil {
		panic(err)
	}
}

// Store video info in Redis
func StoreVideoInfoInRedis(videoID string, videoInfo *VideoInfo) error {
	data, err := json.Marshal(videoInfo)
	if err != nil {
		return fmt.Errorf("failed to marshal video info: %v", err)
	}

	// Store the video info with a TTL (optional)
	err = rdb.Set(ctx, videoID, data, 168*time.Hour).Err()
	if err != nil {
		return fmt.Errorf("failed to store video info in Redis: %v", err)
	}

	return nil
}

// Retrieve video info from Redis
func GetVideoInfoFromRedis(videoID string) (*VideoInfo, error) {
	val, err := rdb.Get(ctx, videoID).Result()
	if err == redis.Nil {
		// Cache miss, return nil
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to retrieve video info from Redis: %v", err)
	}

	var videoInfo VideoInfo
	err = json.Unmarshal([]byte(val), &videoInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal video info: %v", err)
	}

	return &videoInfo, nil
}

func StoreVideoSummaryInRedis(videoID string, summary string) error {
	return rdb.Set(ctx, "summary:"+videoID, summary, 168*time.Hour).Err()
}

func GetVideoSummaryFromRedis(videoID string) (string, error) {
	summary, err := rdb.Get(ctx, "summary:"+videoID).Result()
	if err == redis.Nil {
		return "", nil
	}
	return summary, err
}

func StoreInterestClick(feature string) error {
	sanitizedFeature := strings.ReplaceAll(feature, " ", "_") // Replace spaces with underscores
	key := fmt.Sprintf("interest:feature:%s", sanitizedFeature)
	err := rdb.Incr(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to increment interest count for feature %s: %v", feature, err)
	}
	return nil
}

func GetInterestCount(feature string) (int64, error) {
	sanitizedFeature := strings.ReplaceAll(feature, " ", "_") // Consistent sanitization
	key := fmt.Sprintf("interest:feature:%s", sanitizedFeature)
	count, err := rdb.Get(ctx, key).Int64()
	if err != nil {
		return 0, fmt.Errorf("failed to get interest count for feature %s: %v", feature, err)
	}
	return count, nil
}

// To check if user ID exists in Redis
func CheckUserExistsInRedis(userID string) (bool, error) {
	_, err := rdb.Get(ctx, "user:"+userID).Result()
	if err == redis.Nil {
		return false, nil // User does not exist
	} else if err != nil {
		return false, fmt.Errorf("failed to check user in Redis: %v", err)
	}
	return true, nil // User exists
}

// StoreUserInRedis stores a new user in Redis
func StoreUserInRedis(userID, email string) error {
	key := fmt.Sprintf("user:%s", userID)

	// Store user as JSON (userID + email)
	userData := map[string]string{"userID": userID, "email": email, "created_at": time.Now().Format(time.RFC3339)}
	data, err := json.Marshal(userData)
	if err != nil {
		return fmt.Errorf("failed to marshal user data: %v", err)
	}

	err = rdb.Set(ctx, key, data, 0).Err()
	if err != nil {
		return fmt.Errorf("failed to store user in Redis: %v", err)
	}
	return nil
}

// GetAssistantFromRedis checks if an assistant ID already exists for the given UserID and VideoID
func GetAssistantFromRedis(userID, videoID string) (string, error) {
	redisKey := fmt.Sprintf("assistant:%s:%s", userID, videoID)

	assistantID, err := rdb.Get(ctx, redisKey).Result()
	if err == redis.Nil {
		// No existing assistant found
		return "", nil
	} else if err != nil {
		return "", fmt.Errorf("failed to check assistant ID in Redis: %v", err)
	}

	return assistantID, nil
}

// StoreAssistantInRedis saves an assistant ID for a specific UserID and VideoID
func StoreAssistantInRedis(userID, videoID, assistantID string) error {
	redisKey := fmt.Sprintf("assistant:%s:%s", userID, videoID)

	err := rdb.Set(ctx, redisKey, assistantID, 168*time.Hour).Err()
	if err != nil {
		return fmt.Errorf("failed to store assistant ID in Redis: %v", err)
	}

	return nil
}
