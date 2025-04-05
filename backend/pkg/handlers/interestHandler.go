package handlers

import (
	"Learning-Mode-AI/pkg/services"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

type ShowInterestRequest struct {
    Feature string `json:"feature"`
}

// Handles storing dynamic feature interest clicks
func ShowInterestHandler(w http.ResponseWriter, r *http.Request) {
    var req ShowInterestRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        logrus.Error("Invalid request received")
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    logrus.WithField("feature", req.Feature).Info("Received show interest request")

    if req.Feature == "" {
        http.Error(w, "Feature name is required", http.StatusBadRequest)
        return
    }

    if err := services.StoreInterestClick(req.Feature); err != nil {
        logrus.WithError(err).WithField("feature", req.Feature).Error("Failed to store click for feature")
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
