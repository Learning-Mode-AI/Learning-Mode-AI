package context

import "sync"

// AppContext holds shared data like assistant IDs
type AppContext struct {
	AssistantIDs sync.Map // Map to store assistant IDs by videoID
}

// Global instance of AppContext
var Instance *AppContext

func init() {
	Instance = &AppContext{}
}
