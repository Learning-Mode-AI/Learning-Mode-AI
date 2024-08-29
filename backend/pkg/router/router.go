package router

import (
	"YOUTUBE-LEARNING-MODE/pkg/handlers"

	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	// Define your routes here
	r.HandleFunc("/processVideo", handlers.ProcessVideo).Methods("POST")
	r.HandleFunc("/api/question", handlers.HandleQuestion).Methods("POST")

	return r
}
