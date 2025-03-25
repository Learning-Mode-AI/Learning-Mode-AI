package services

import (
	"encoding/json"
	"fmt"
	"log"
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
		log.Printf("Error checking user in Redis: %v\n", err)
		return err
	}

	if userExists {
		log.Printf("User already exists in Redis: %s\n", userID)
		return nil
	}

	log.Printf("User not found in Redis. Creating user: %s, Email: %s\n", userID, email)

	err = StoreUserInRedis(userID, email)
	if err != nil {
		log.Printf("Error storing user in Redis: %v\n", err)
		return err
	}

	log.Printf("Successfully stored new user in Redis: %s\n", userID)
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
