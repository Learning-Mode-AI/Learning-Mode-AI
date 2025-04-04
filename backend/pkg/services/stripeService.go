package services

import (
	"encoding/json"

	"github.com/go-redis/redis/v8"
	"github.com/sirupsen/logrus"
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
		logrus.WithError(err).Error("Failed to retrieve subscription from Redis")
		return nil, err
	}

	var subscription Subscription
	err = json.Unmarshal([]byte(val), &subscription)
	if err != nil {
		logrus.WithError(err).Error("Failed to unmarshal subscription data")
		return nil, err
	}

	return &subscription, nil
}

func StoreSubscriptionInfoInRedis(email string, subscription *Subscription) error {
	data, err := json.Marshal(subscription)
	if err != nil {
		logrus.WithError(err).Error("Failed to marshal subscription")
		return err
	}

	err = rdb.Set(ctx, "subscriptions:"+email, data, 0).Err()
	if err != nil {
		logrus.WithError(err).Error("Failed to store subscription in Redis")
		return err
	}

	return nil
}

// DeleteSubscriptionFromRedis removes the subscription data for the given email
func DeleteSubscriptionFromRedis(email string) error {
	err := rdb.Del(ctx, "subscriptions:"+email).Err()
	if err != nil {
		logrus.WithError(err).Error("Failed to delete subscription from Redis")
		return err
	}
	return nil
}
