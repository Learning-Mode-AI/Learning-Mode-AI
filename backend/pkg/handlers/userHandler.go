package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"log"
	"net/http"
)

// User struct for creating new users
type User struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
}

// Handler to Create a New User
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var newUser User

	// Decode request body
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Store user in Redis
	err = services.StoreUserInRedis(newUser.UserID, newUser.Email)
	if err != nil {
		log.Println("Failed to store user in Redis:", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated) // 201 Created
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}
