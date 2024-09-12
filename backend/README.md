# YouTube Learning Mode Backend

This is the Golang backend service for the YouTube Learning Mode project. It acts as the main orchestrator, handling requests from the frontend (e.g., a browser extension), communicating with the YouTube Info Service (Python microservice), and interacting with OpenAI's GPT-4 API to provide AI-powered responses based on YouTube video content.

## Features

- **Video Processing**: Accepts YouTube video URLs and extracts video information and transcripts via the Python microservice.
- **AI Integration**: Initializes AI chat sessions using OpenAI's GPT-4 API based on video content.
- **Question Handling**: Processes user questions about the video content and returns AI-generated responses.
- **API Endpoints**: Provides endpoints for processing videos and handling user questions.
- **Microservices Architecture**: Designed for scalability and modularity.

## Prerequisites

- **Go**: Version 1.16 or higher.
- **OpenAI API Key**: For GPT-4 integration.
- **YouTube Info Service**: Ensure the Python microservice is running and accessible locally.
- **Youtube Video Processing Serivce**: Ensure the Golang microservice is running and accessible locally.


## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AnasKhan0607/Youtube-Learning-Mode.git
cd Youtube-Learning-Mode-Backend
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory to store your environment variables:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** Do not commit the `.env` file to version control.

### 3. Install Dependencies

```bash
go mod download
```

## Running the Application

### 1. Start the YouTube Info Service

Make sure the [YouTube-Learning-Mode-Info-Service](https://github.com/AnasKhan0607/Youtube-Learning-Mode-Info-Service) Python microservice is running locally.

```bash
cd path/to/Youtube-Learning-Mode-Info-Service
uvicorn app.main:app --reload
```

By default, it will be accessible at `http://localhost:8000`.

### 2. Start the Backend Server

```bash
go run cmd/main.go
```

The server will start on port `8080`.

### 3. Testing the API Endpoints

#### Process Video Endpoint

```bash
curl -X POST http://localhost:8080/processVideo \
-H "Content-Type: application/json" \
-d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

Replace `VIDEO_ID` with the actual YouTube video ID.

#### Handle Question Endpoint

```bash
curl -X POST http://localhost:8080/api/question \
-H "Content-Type: application/json" \
-d '{"videoId": "VIDEO_ID", "userQuestion": "Your question here"}'
```

## API Endpoints

### 1. `/processVideo` (POST)

Processes a YouTube video URL, fetches video information and transcript, and initializes an AI chat session.

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
    ]
  }
  ```

### 2. `/api/question` (POST)

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
│   │   ├── aiService.go          # Handles AI ChatGPT interactions
│   └── router/
│       └── router.go             # Defines API routes
├── go.mod                 # Go module dependencies
├── go.sum                 # Checksums for Go modules
├── .env                   # Environment variables (DO NOT COMMIT)
└── README.md              # Project documentation
```

## Dependencies

- **Gorilla Mux**: Router for HTTP requests.
- **OpenAI Go SDK**: For interacting with OpenAI's GPT-4 API.
- **HTTP Client Libraries**: For making HTTP requests to the Python microservice.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.
2. **Create a new branch**:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit your changes**:

   ```bash
   git commit -am 'Add some feature'
   ```

4. **Push to the branch**:

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**.
