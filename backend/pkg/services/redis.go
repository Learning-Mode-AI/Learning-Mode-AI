package services

import (
	"context"
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
	rdb = redis.NewClient(&redis.Options{
		Addr:     config.RedisHost, // Replace with Redis server address
		Password: "",               // If no password set
		DB:       0,                // Use default DB
	})
}

// Store video info in Redis
func StoreVideoInfoInRedis(videoID string, videoInfo *VideoInfo) error {
	data, err := json.Marshal(videoInfo)
	if err != nil {
		return fmt.Errorf("failed to marshal video info: %v", err)
	}

	// Store the video info with a TTL (optional)
	err = rdb.Set(ctx, videoID, data, 24*time.Hour).Err()
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
	return rdb.Set(ctx, "summary:"+videoID, summary, 24*time.Hour).Err()
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