package router

import (
	"Learning-Mode-AI/pkg/handlers"
	"Learning-Mode-AI/pkg/middleware"

	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	// Define routes with user validation middleware
	r.HandleFunc("/processVideo", middleware.ValidateUserID(handlers.ProcessVideo)).Methods("POST")
	r.HandleFunc("/api/question", middleware.ValidateUserID(handlers.AskGPTQuestion)).Methods("POST")
	r.HandleFunc("/api/quiz", middleware.ValidateUserID(handlers.GenerateQuiz)).Methods("POST")
	r.HandleFunc("/video-summary", middleware.ValidateUserID(handlers.VideoSummaryHandler)).Methods("POST")

	// Routes that DO NOT require user validation
	r.HandleFunc("/api/show-interest", handlers.ShowInterestHandler).Methods("POST")
	r.HandleFunc("/api/interest-count/{feature}", handlers.GetInterestCountHandler).Methods("GET")

	r.HandleFunc("/createUser", handlers.CreateUserHandler).Methods("POST")

	return r
}
