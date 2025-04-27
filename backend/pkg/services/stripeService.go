package services

import (
	"encoding/json"
	"fmt"

	"github.com/go-redis/redis/v8"
)

type Subscription struct {
	Tier string `json:"tier"`
}

func getUserSubscriptionFromRedis(email string) (*Subscription, error) {
	val, err := rdb.Get(ctx, "subscriptions:"+email).Result()
	if err == redis.Nil {
		// No subscription found, return nil (user is on free tier)
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to retrieve subscription from Redis: %v", err)
	}

	var subscription Subscription
	err = json.Unmarshal([]byte(val), &subscription)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal subscription data: %v", err)
	}

	return &subscription, nil
}

func StoreSubscriptionInfoInRedis(email string, subscription *Subscription) error {
	data, err := json.Marshal(subscription)
	if err != nil {
		return fmt.Errorf("failed to marshal subscription: %v", err)
	}

	err = rdb.Set(ctx, "subscriptions:"+email, data, 0).Err()
	if err != nil {
		return fmt.Errorf("failed to store subscription in Redis: %v", err)
	}

	return nil
}

// DeleteSubscriptionFromRedis removes the subscription data for the given email
func DeleteSubscriptionFromRedis(email string) error {
	err := rdb.Del(ctx, "subscriptions:"+email).Err()
	if err != nil {
		return fmt.Errorf("failed to delete subscription from Redis: %v", err)
	}
	return nil
}
