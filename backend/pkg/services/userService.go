package services

import (
	"encoding/json"
	"fmt"

	"github.com/sirupsen/logrus"
)

// User represents a user in the system
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// CheckAndCreateUser checks if the user exists in Redis. If not, creates them.
func CheckAndCreateUser(userID, email string) error {

	userExists, err := CheckUserExistsInRedis(userID)
	if err != nil {
		logrus.WithError(err).Error("Error checking user in Redis")
		return err
	}

	if userExists {
		logrus.WithFields(logrus.Fields{
			"user_id": userID,
		}).Info("User already exists in Redis")
		return nil
	}

	logrus.WithFields(logrus.Fields{
		"user_id": userID,
		"email":   email,
	}).Info("User not found in Redis. Creating user")

	err = StoreUserInRedis(userID, email)
	if err != nil {
		logrus.WithError(err).Error("Error storing user in Redis")
		return err
	}

	logrus.WithFields(logrus.Fields{
		"user_id": userID,
	}).Info("Successfully stored new user in Redis")
	return nil
}

func getUserFromRedis(userID string) (User, error) {
	key := fmt.Sprintf("user:%s", userID)
	val, err := rdb.Get(ctx, key).Result()
	if err != nil {
		return User{}, fmt.Errorf("failed to retrieve user from Redis: %v", err)
	}

	var userData map[string]string
	err = json.Unmarshal([]byte(val), &userData)
	if err != nil {
		return User{}, fmt.Errorf("failed to unmarshal user data: %v", err)
	}

	user := User{
		ID:    userID,
		Email: userData["email"],
	}

	return user, nil
}
