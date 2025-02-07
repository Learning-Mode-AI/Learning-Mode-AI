package services

import (
	"log"
)

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
