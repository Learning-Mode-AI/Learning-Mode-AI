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
	r.HandleFunc("/video-summary", handlers.VideoSummaryHandler).Methods("POST")
	r.HandleFunc("/api/show-interest", handlers.ShowInterestHandler).Methods("POST")
    r.HandleFunc("/api/interest-count/{feature}", handlers.GetInterestCountHandler).Methods("GET")


	return r
}
