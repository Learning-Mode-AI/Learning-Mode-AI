package services

// import (
//     "Learning-Mode-AI/pkg/context"
//     "log"
// )

// // CheckUserExistsInRedis checks if a userID exists in Redis
// func CheckUserExistsInRedis(userID string) (bool, error) {
//     val, err := context.Instance.RedisClient.Get(context.Instance.Ctx, userID).Result()
//     if err != nil {
//         if err.Error() == "redis: nil" { // Key does not exist
//             return false, nil
//         }
//         log.Printf("Redis error: %v", err)
//         return false, err
//     }
//     return val != "", nil
// }
