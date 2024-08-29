package services

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"google.golang.org/api/option"
	"google.golang.org/api/youtube/v3"
)

type VideoInfo struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Channel     string `json:"channel"`
	Transcript  string `json:"transcript"`
}

func FetchVideoInfo(videoID string) (*VideoInfo, error) {
	ctx := context.Background()
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	youtubeService, err := youtube.NewService(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create YouTube client: %v", err)
	}

	call := youtubeService.Videos.List([]string{"snippet"}).Id(videoID)
	response, err := call.Do()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch video info: %v", err)
	}

	if len(response.Items) == 0 {
		return nil, fmt.Errorf("no video info found")
	}

	snippet := response.Items[0].Snippet

	// Fetch the transcript
	transcript, err := FetchVideoTranscript(youtubeService, videoID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch video transcript: %v", err)
	}

	return &VideoInfo{
		Title:       snippet.Title,
		Description: snippet.Description,
		Channel:     snippet.ChannelTitle,
		Transcript:  transcript,
	}, nil
}

// FetchVideoTranscript fetches the transcript (captions) for a given video ID.
func FetchVideoTranscript(service *youtube.Service, videoID string) (string, error) {
	// List all caption tracks associated with the video
	captionsCall := service.Captions.List([]string{"snippet"}, "videoId").Id(videoID)
	captionsResponse, err := captionsCall.Do()
	if err != nil {
		return "", fmt.Errorf("failed to fetch captions: %v", err)
	}

	if len(captionsResponse.Items) == 0 {
		return "", fmt.Errorf("no captions available for video")
	}

	// Assuming the first caption track is the one we want (you might want to add more logic here)
	captionID := captionsResponse.Items[0].Id

	// Download the caption track in the desired format (e.g., "srt")
	captionDownloadCall := service.Captions.Download(captionID).Tfmt("srt")
	response, err := captionDownloadCall.Download()
	if err != nil {
		return "", fmt.Errorf("failed to download captions: %v", err)
	}
	defer response.Body.Close()

	// Read the response body
	captionData, err := io.ReadAll(response.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read caption data: %v", err)
	}

	// Parse the SRT data
	transcript := parseSRT(string(captionData))

	return transcript, nil
}

// parseSRT parses the SRT data and returns it in "time:phrase" format.
func parseSRT(srtData string) string {
	lines := strings.Split(srtData, "\n")
	var transcript []string
	for i := 0; i < len(lines); i++ {
		if strings.Contains(lines[i], "-->") {
			// This line contains the timestamp
			timestamp := lines[i]
			// The next line should contain the phrase
			if i+1 < len(lines) && lines[i+1] != "" {
				phrase := lines[i+1]
				transcript = append(transcript, fmt.Sprintf("%s: %s", timestamp, phrase))
			}
		}
	}
	return strings.Join(transcript, "\n")
}
