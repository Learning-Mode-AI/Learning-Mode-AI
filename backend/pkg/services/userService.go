package services

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

// FeatureUsage holds usage counts for each feature.
// It stores counts for chat, summary, and quiz features.
// Usage will reset monthly.

type FeatureUsage struct {
	Chat    int `json:"chat"`
	Summary int `json:"summary"`
	Quiz    int `json:"quiz"`
}

// User holds user information including subscription tier and feature usage.
// All user details are stored in a single Redis key.

type User struct {
	UserID         string       `json:"userId"`
	Email          string       `json:"email"`
	Tier           string       `json:"tier"`
	Usage          FeatureUsage `json:"usage"`
	ResetTimestamp int64        `json:"resetTimestamp"` // Unix timestamp for next usage reset
}

// TierLimits defines the usage limits for features per tier.

type TierLimits struct {
	ChatLimit    int
	SummaryLimit int
	QuizLimit    int
}

// limits defines configurable limits for each tier (Free and Pro).
var limits = map[string]TierLimits{
	"Free": {ChatLimit: 10, SummaryLimit: 5, QuizLimit: 3},
	"Pro":  {ChatLimit: 100, SummaryLimit: 50, QuizLimit: 30},
}

// getNextResetTimestamp calculates the Unix timestamp for the first day of the next month at midnight.
func getNextResetTimestamp() int64 {
	now := time.Now()
	nextMonth := now.AddDate(0, 1, 0)
	reset := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, now.Location())
	return reset.Unix()
}

// GetUser retrieves a User from Redis by userID.
func GetUser(userID string) (*User, error) {
	key := fmt.Sprintf("user:%s", userID)
	data, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to get user from redis: %v", err)
	}
	var user User
	err = json.Unmarshal([]byte(data), &user)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user data: %v", err)
	}
	return &user, nil
}

// SaveUser saves the User struct to Redis under the key 'user:<userId>'.
func SaveUser(user *User) error {
	key := fmt.Sprintf("user:%s", user.UserID)
	data, err := json.Marshal(user)
	if err != nil {
		return fmt.Errorf("failed to marshal user data: %v", err)
	}
	err = rdb.Set(ctx, key, data, 0).Err()
	if err != nil {
		return fmt.Errorf("failed to save user in redis: %v", err)
	}
	return nil
}

// CheckAndCreateUser checks if the user exists in Redis. If not, it creates a new user with default Free tier and zero usage counts.
func CheckAndCreateUser(userID, email string) error {
	user, err := GetUser(userID)
	if err != nil {
		log.Printf("Error checking user in Redis: %v\n", err)
		return err
	}
	if user != nil {
		log.Printf("User already exists in Redis: %s\n", userID)
		return nil
	}

	// Create a new user with default values
	user = &User{
		UserID:         userID,
		Email:          email,
		Tier:           "Free", // default tier for new users
		Usage:          FeatureUsage{Chat: 0, Summary: 0, Quiz: 0},
		ResetTimestamp: getNextResetTimestamp(),
	}

	err = SaveUser(user)
	if err != nil {
		log.Printf("Error storing user in Redis: %v\n", err)
		return err
	}
	log.Printf("Successfully stored new user in Redis: %s\n", userID)
	return nil
}

// CheckAndIncrementUsage checks if the user has exceeded the usage limit for the specified feature:
//   - "chat" for GPT questions
//   - "summary" for video summarization
//   - "quiz" for quiz generation
// If within limit, increments the usage count and saves the updated user. Usage counters reset monthly.
func CheckAndIncrementUsage(userID, feature string) error {
	user, err := GetUser(userID)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	// Reset usage if current time is past the reset timestamp
	now := time.Now().Unix()
	if now > user.ResetTimestamp {
		user.Usage = FeatureUsage{Chat: 0, Summary: 0, Quiz: 0}
		user.ResetTimestamp = getNextResetTimestamp()
	}

	tierLimits, exists := limits[user.Tier]
	if !exists {
		tierLimits = limits["Free"]
	}

	var currentUsage int
	var limitValue int
	switch feature {
	case "chat":
		currentUsage = user.Usage.Chat
		limitValue = tierLimits.ChatLimit
	case "summary":
		currentUsage = user.Usage.Summary
		limitValue = tierLimits.SummaryLimit
	case "quiz":
		currentUsage = user.Usage.Quiz
		limitValue = tierLimits.QuizLimit
	default:
		return fmt.Errorf("unknown feature: %s", feature)
	}

	if currentUsage >= limitValue {
		return fmt.Errorf("usage limit reached for %s feature", feature)
	}

	// Increment the usage count
	switch feature {
	case "chat":
		user.Usage.Chat++
	case "summary":
		user.Usage.Summary++
	case "quiz":
		user.Usage.Quiz++
	}

	return SaveUser(user)
}

// UpdateUserTier updates the user's subscription tier in the stored user record.
func UpdateUserTier(userID, newTier string) error {
	user, err := GetUser(userID)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}
	user.Tier = newTier
	return SaveUser(user)
}
