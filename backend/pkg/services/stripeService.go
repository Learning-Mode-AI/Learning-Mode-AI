package services

type Subscription struct {
	Tier             string `json:"tier"`
	StripeCustomerId string `json:"customer_id"`
	ActiveUntil      string `json:"active_until"`
}
