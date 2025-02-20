package services

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

// User represents the structure of a user stored in Redis.
type User struct {
	UserID string `json:"userID"`
	Email  string `json:"email"`
	Tier   string `json:"tier"`
}

// serviceTierLimits defines the allowed number of requests per day for each service by user tier.
// A value of 0 means that the tier has no limits (unlimited).
var serviceTierLimits = map[string]map[string]int{
	"chat": {
		"free":    10,
		"pro":     100,
		"premium": 0,
	},
	"quiz": {
		"free":    3,
		"pro":     20,
		"premium": 0,
	},
	"summary": {
		"free":    5,
		"pro":     50,
		"premium": 0,
	},
}

// GetUserTier fetches the user data from Redis and returns the user's tier.
// If the user is not found or the tier field is missing, it defaults to "free".
func GetUserTier(userID string) (string, error) {
	key := fmt.Sprintf("user:%s", userID)
	data, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		// User not found; default to free tier.
		return "free", nil
	} else if err != nil {
		return "", fmt.Errorf("failed to get user data: %v", err)
	}

	var user User
	if err := json.Unmarshal([]byte(data), &user); err != nil {
		// If unmarshaling fails, assume free tier.
		return "free", nil
	}

	if user.Tier == "" {
		return "free", nil
	}

	return user.Tier, nil
}

// ValidateUserTierRequest checks if a user's request for a given service is within their tier limits.
// It increments a request counter in Redis for daily limits and returns an error if limits are exceeded.
func ValidateUserTierRequest(userID, service string) error {
	tier, err := GetUserTier(userID)
	if err != nil {
		return err
	}

	limits, ok := serviceTierLimits[service]
	if !ok {
		return fmt.Errorf("unknown service %s", service)
	}

	allowed := limits[tier]
	// If allowed is 0, it means no limit is enforced for this tier.
	if allowed == 0 {
		return nil
	}

	// Create a rate limit key for the user and service.
	rateLimitKey := fmt.Sprintf("limit:%s:%s", service, userID)
	count, err := rdb.Incr(ctx, rateLimitKey).Result()
	if err != nil {
		return fmt.Errorf("failed to increment rate limit counter: %v", err)
	}

	if count == 1 {
		// Set the expiration for the counter to 24 hours for daily limits.
		err = rdb.Expire(ctx, rateLimitKey, 24*time.Hour).Err()
		if err != nil {
			return fmt.Errorf("failed to set expiration on rate limit key: %v", err)
		}
	}

	if int(count) > allowed {
		return fmt.Errorf("request limit exceeded for %s tier: allowed %d requests per day", tier, allowed)
	}

	return nil
}
