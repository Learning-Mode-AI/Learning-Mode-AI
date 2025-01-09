package router

import (
	"Learning-Mode-AI/pkg/handlers"

	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	// Define your routes here
	r.HandleFunc("/processVideo", handlers.ProcessVideo).Methods("POST")
	r.HandleFunc("/api/question", handlers.AskGPTQuestion).Methods("POST")
	r.HandleFunc("/api/quiz", handlers.GenerateQuiz).Methods("POST")

	return r
}
