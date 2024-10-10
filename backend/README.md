# YouTube Learning Mode Backend

This is the Golang backend service for the YouTube Learning Mode project. It acts as the main orchestrator, handling requests from the frontend (e.g., a browser extension), communicating with the YouTube Info Service (Python microservice), the Video Processing Service (Golang microservice), and interacting with OpenAI's GPT-4 API to provide AI-powered responses based on YouTube video content.

## Features

- **Video Processing**: Accepts YouTube video URLs, extracts video information and transcripts via the Python microservice, and captures snapshots through the Video Processing Service.
- **AI Integration**: Initializes AI chat sessions using OpenAI's GPT-4 API based on video content via the AI Service (a Golang microservice).
- **Question Handling**: Processes user questions about the video content through the AI Service and returns AI-generated responses.
- **API Endpoints**: Provides endpoints for processing videos and handling user questions.
- **Microservices Architecture**: Designed for scalability and modularity, using Docker for containerization.

## Prerequisites

- **Go**: Version 1.16 or higher.
- **Docker & Docker Compose**: For containerizing and running the services.
- **OpenAI API Key**: For GPT-4 integration.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AnasKhan0607/Youtube-Learning-Mode.git
cd Youtube-Learning-Mode-Backend
```

### 2. Docker Setup

> ### ⚠️ **Important:** For Docker Compose to work, Please clone earch services repository, and place under the same folder. In the root of that folder place the docker compose file which is found in the docs folder of this repo.

All services, including the backend, Redis, Python Info Service, AI Service, and Video Processing Service, are managed using Docker Compose.

Make sure you have a `.env` file in each respective service directory (if required) containing necessary environment variables like `OPENAI_API_KEY`.

### 3. Run Docker Compose

To build and start all services:

```bash
docker-compose up --build
```

This command will:

- Build the Docker images for the main backend, info service, AI service, and video processing service.
- Start all services along with a Redis instance.
- Create a network for inter-service communication.

### 4. Access the Backend

Once all services are running, the backend will be accessible at `http://localhost:8080`.

## Running the Application Without Docker

> ⚠️ **Important:** Ensure that Redis is running before starting the backend services, as it is required for caching.

1. **Start the YouTube Info Service**

   Make sure the YouTube-Learning-Mode-Info-Service Python microservice is running locally:

   ```bash
   cd path/to/Youtube-Learning-Mode-Info-Service
   uvicorn app.main:app --reload
   ```

   By default, it will be accessible at `http://localhost:8000`.

2. **Start the Ai Service**

   Ensure the AI Service is running locally:

   ```bash
   cd path/to/Youtube-Learning-Mode-Ai-Service
   go run cmd/main.go
   ```

   This will start the AI service on port `8082`.


3. **Start the Video Processing Service**

   Make sure the Video Processing Service is running locally:

   ```bash
   cd path/to/Youtube-Learning-Mode-Video-Processing-Service
   go run main.go
   ```

   The service will start on port `8081`.

4. **Start the Backend Server**

   ```bash
   go run cmd/main.go
   ```

   The server will start on port `8080`.

## Testing the API Endpoints

### Process Video Endpoint

```bash
curl -X POST http://localhost:8080/processVideo \
-H "Content-Type: application/json" \
-d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

Replace `VIDEO_ID` with the actual YouTube video ID.

### Handle Question Endpoint

```bash
curl -X POST http://localhost:8080/api/question \
-H "Content-Type: application/json" \
-d '{"videoId": "VIDEO_ID", "userQuestion": "Your question here"}'
```

## API Endpoints

### 1. /processVideo (POST)
Processes a YouTube video URL, fetches video information and transcript, initializes an AI chat session, and captures video snapshots.

- **Request Body**:

  ```json
  {
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
  ```

- **Response**:

  ```json
  {
    "title": "Video Title",
    "description": "Video Description",
    "channel": "Channel Name",
    "transcript": [
      "0.00: Transcript line 1",
      "0.05: Transcript line 2",
      "..."
    ],
    "snapshots": [
      "snapshot_0-00-05.png",
      "snapshot_0-01-00.png"
    ]
  }
  ```

### 2. /api/question (POST)
Handles user questions related to the video content and returns AI-generated responses.

- **Request Body**:

  ```json
  {
    "videoId": "VIDEO_ID",
    "userQuestion": "Your question here"
  }
  ```

- **Response**:

  ```json
  {
    "response": "AI-generated answer"
  }
  ```

## Project Structure

```
├── cmd/
│   └── main.go            # Entry point of the application
├── pkg/
│   ├── handlers/
│   │   ├── videoHandler.go       # Handles /processVideo requests
│   │   └── questionHandler.go    # Handles /api/question requests
│   ├── services/
│   │   ├── youtubeService.go     # Communicates with the YouTube Info Service
│   │   ├── aiService.go          # Handles communication with the AI Service for GPT-4 interactions
│   │   ├── gptService.go         # Loads environment and initializes OpenAI client
│   │   ├── videoProcessing.go    # Communicates with the video processing service for snapshots
│   └── router/
│       └── router.go             # Defines API routes
├── go.mod                 # Go module dependencies
├── go.sum                 # Checksums for Go modules
├── .env                   # Environment variables (DO NOT COMMIT)
├── Dockerfile             # Docker configuration for containerizing the backend
└── README.md              # Project documentation
```

## Dependencies

- **Gorilla Mux**: Router for HTTP requests.
- **OpenAI Go SDK**: For interacting with OpenAI's GPT-4 API.
- **HTTP Client Libraries**: For making HTTP requests to the Python microservice, Ai Service and video processing service.
- **Go-Redis**: For connecting to the Redis database.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.

2. Create a new branch:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. Commit your changes:

   ```bash
   git commit -am 'Add some feature'
   ```

4. Push to the branch:

   ```bash
   git push origin feature/YourFeature
   ```

5. Open a Pull Request.
