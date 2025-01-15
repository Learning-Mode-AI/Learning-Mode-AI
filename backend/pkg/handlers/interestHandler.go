package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type ShowInterestRequest struct {
    Feature string `json:"feature"`
}

// Handles storing dynamic feature interest clicks
func ShowInterestHandler(w http.ResponseWriter, r *http.Request) {
    var req ShowInterestRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        log.Println("Invalid request received")
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    log.Printf("Received show interest request for feature: %s", req.Feature)

    if req.Feature == "" {
        http.Error(w, "Feature name is required", http.StatusBadRequest)
        return
    }

    if err := services.StoreInterestClick(req.Feature); err != nil {
        log.Printf("Failed to store click for feature: %s", req.Feature)
        http.Error(w, "Failed to record interest", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "Interest recorded successfully"})
}


func GetInterestCountHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    feature := vars["feature"]

    count, err := services.GetInterestCount(feature)
    if err != nil {
        http.Error(w, "Error fetching interest count", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]int64{"interest_count": count})
}
