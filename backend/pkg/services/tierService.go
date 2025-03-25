package services

import (
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

const (
	FREE_TIER_MONTHLY_LIMIT = 10
)

// CheckUserAccess determines if a user has access based on subscription tier and usage
func CheckUserAccess(userID string) (bool, error) {
	// Step 1: Get user email from Redis
	email, err := getUserEmail(userID)
	if err != nil {
		log.Printf("Error getting user email: %v", err)
		return false, fmt.Errorf("failed to get user email: %v", err)
	}

	// Step 2: Get user subscription from Redis
	subscription, err := getUserSubscriptionFromRedis(email)
	if err != nil {
		log.Printf("Error getting user subscription: %v", err)
		return false, fmt.Errorf("failed to get user subscription: %v", err)
	}

	// Step 3: Check if user has Pro tier
	if subscription != nil && subscription.Tier == "Pro" {
		log.Printf("User %s has Pro tier access", userID)
		return true, nil
	}

	// Step 4: Check how many questions the user has asked this month
	count, err := getMonthlyQuestionCount(userID)
	if err != nil {
		log.Printf("Error checking question count: %v", err)
		return false, fmt.Errorf("failed to check monthly question count: %v", err)
	}

	// Step 5: Determine access based on question count
	hasAccess := count < FREE_TIER_MONTHLY_LIMIT

	if hasAccess {
		log.Printf("User %s has free tier access with %d/%d questions used", userID, count, FREE_TIER_MONTHLY_LIMIT)
	} else {
		log.Printf("User %s has reached free tier limit of %d questions", userID, FREE_TIER_MONTHLY_LIMIT)
	}

	return hasAccess, nil
}

// getUserEmail retrieves the user's email from Redis
func getUserEmail(userID string) (string, error) {
	user, err := getUserFromRedis(userID)
	if err != nil {
		return "", fmt.Errorf("failed to get user from Redis: %v", err)
	}

	email := user.Email

	return email, nil
}

// getMonthlyQuestionCount retrieves the number of questions the user has asked this month
func getMonthlyQuestionCount(userID string) (int, error) {
	// Create a key that includes the current month and year
	currentTime := time.Now()
	monthYear := fmt.Sprintf("%d-%02d", currentTime.Year(), currentTime.Month())
	key := fmt.Sprintf("question_count:%s:%s", userID, monthYear)

	count, err := rdb.Get(ctx, key).Int()
	if err == redis.Nil {
		// No questions asked this month
		return 0, nil
	} else if err != nil {
		return 0, fmt.Errorf("failed to get question count: %v", err)
	}

	return count, nil
}

func IncrementUserQuestionCount(userID string) error {
	// Create a key that includes the current month and year
	currentTime := time.Now()
	monthYear := fmt.Sprintf("%d-%02d", currentTime.Year(), currentTime.Month())
	key := fmt.Sprintf("question_count:%s:%s", userID, monthYear)

	// Calculate remaining days in current month for TTL
	firstDayNextMonth := time.Date(currentTime.Year(), currentTime.Month()+1, 1, 0, 0, 0, 0, currentTime.Location())
	ttl := firstDayNextMonth.Sub(currentTime)

	// Increment the counter and set TTL if it doesn't exist
	_, err := rdb.Incr(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("failed to increment question count: %v", err)
	}

	// Set expiration if not already set
	err = rdb.Expire(ctx, key, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to set expiration on question count: %v", err)
	}

	return nil
}
