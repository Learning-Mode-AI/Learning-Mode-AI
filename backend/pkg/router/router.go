package router

import (
	"YOUTUBE-LEARNING-MODE/pkg/handlers"

	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	// Define your routes here
	r.HandleFunc("/api/question", handlers.HandleQuestion).Methods("POST")
	r.HandleFunc("/api/context", handlers.HandleVideoContext).Methods("GET")

	return r
}
