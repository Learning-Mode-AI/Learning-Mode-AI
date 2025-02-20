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

func StoreSubscriptioninfoInRedis(email string, subscription *Subscription) error {
	data, err := json.Marshal(subscription)
	if err != nil {
		return fmt.Errorf("failed to marshal subscriptiom: %v", err)
	}

	err = rdb.Set(ctx, email, data, 0).Err()
	if err != nil {
		return fmt.Errorf("failed to store subscription in Redis: %v", err)
	}

	return nil
}

// DeleteSubscriptionFromRedis removes the subscription data for the given email
func DeleteSubscriptionFromRedis(email string) error {
	err := rdb.Del(ctx, email).Err()
	if err != nil {
		return fmt.Errorf("failed to delete subscription from Redis: %v", err)
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

// StoreUserInRedis stores a new user in Redis with default tier "free".
func StoreUserInRedis(userID, email string) error {
	key := fmt.Sprintf("user:%s", userID)
	// Include default tier as "free" (modify as needed if you wish to support tier upgrades).
	userData := map[string]string{
		"userID": userID,
		"email":  email,
		"tier":   "free",
	}
	data, err := json.Marshal(userData)
	if err != nil {
		return fmt.Errorf("failed to marshal user data: %v", err)
	}

	// No expiration for user records.
	err = rdb.Set(ctx, key, data, 0).Err()
	if err != nil {
		return fmt.Errorf("failed to store user in Redis: %v", err)
	}
	return nil
}

// UpdateUserTier updates a user's tier in Redis
func UpdateUserTier(email string, productID string) error {
    // Default to free tier if no product ID is provided
    tierName := config.TierFree
    if productID != "" {
        if tierConfig, exists := config.ProductTierMap[productID]; exists {
            tierName = tierConfig.TierName
        } else {
            return fmt.Errorf("unknown product ID: %s", productID)
        }
    }

    // Get user data by email
    key := fmt.Sprintf("user:%s", email)
    userData, err := rdb.Get(ctx, key).Result()
    if err == redis.Nil {
        return fmt.Errorf("user not found: %s", email)
    } else if err != nil {
        return fmt.Errorf("failed to get user data: %v", err)
    }

    // Parse existing user data
    var user User
    if err := json.Unmarshal([]byte(userData), &user); err != nil {
        return fmt.Errorf("failed to unmarshal user data: %v", err)
    }

    // Update tier
    user.Tier = tierName

    // Save updated user data
    data, err := json.Marshal(user)
    if err != nil {
        return fmt.Errorf("failed to marshal user data: %v", err)
    }

    if err := rdb.Set(ctx, key, data, 0).Err(); err != nil {
        return fmt.Errorf("failed to update user tier: %v", err)
    }

    return nil
}