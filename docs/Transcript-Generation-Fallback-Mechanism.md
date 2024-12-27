### **Transcript Generation Fallback Mechanism**

---

### **Context:**

Our system currently relies on YouTube videos having existing transcripts. However, many videos do not provide transcripts, preventing users from utilizing our services. To address this limitation, we need a fallback mechanism to generate transcripts incase of missing transcripts. The generated transcripts must align with the existing system format, including timestamp intervals and text content.

---

### **Objective:**

Enable automatic transcript generation for YouTube videos without transcripts, ensuring seamless integration into the current workflow and compatibility with our services.

---

### **Analysis of Current System Structure:**

#### **Main Backend:**

* **Responsibilities**:  
  * Processes user requests and manages data flow between services.  
  * Interfaces with Redis for caching and data storage.  
* **Key Components**:  
  * `youtubeService.go`: Fetches video metadata and transcripts.  
  * `videoContextHandler.go`: Handles user requests and coordinates transcript retrieval.

  #### **Python Service:**

* **Responsibilities**:  
  * Extracts metadata and transcripts from YouTube videos.  
  * Provides fallback mechanisms for missing transcripts.

  #### **Redis:**

* **Responsibilities**:  
  * Caches video information, including transcripts, for performance optimization.

---

### **Feature Requirements:**

#### **Functional Requirements:**

1. Detect when a YouTube video does not have a transcript.  
2. Generate transcripts automatically using a fallback mechanism.  
3. Store generated transcripts in Redis.

   #### **Non-Functional Requirements:**

1. High transcription accuracy.  
2. Minimal latency in generating transcripts.  
3. Scalable solution for high-volume usage.

---

### **Implementation Options:**

#### **Option 1: Amazon Transcribe**

* **Description**: Use Amazon Transcribe to generate transcripts from audio extracted from YouTube videos.  
* **Advantages**:  
  * High accuracy and multi-language support.  
  * Seamless integration with AWS ecosystem (e.g., S3 for audio storage).  
* **Disadvantages**:  
  * Higher costs for large-scale usage.  
  * Dependency on AWS infrastructure.

  #### **Option 2: OpenAI Whisper**

* **Description**: Use OpenAI Whisper for local transcript generation.  
* **Advantages**:  
  * Open-source and highly accurate.  
  * No ongoing API costs for self-hosted deployments.  
* **Disadvantages**:  
  * Requires significant computational resources.  
  * Slower processing for long videos.

  #### **Option 3: Google Speech-to-Text**

* **Description**: Leverage Google’s Speech-to-Text API for generating transcripts.  
* **Advantages**:  
  * Competitive pricing and high accuracy.  
  * Provides additional features like speaker identification.  
* **Disadvantages**:  
  * Requires integration with Google Cloud Platform.  
  * Limited free tier compared to AWS.

  #### **Option 4: Azure Cognitive Services**

* **Description**: Use Azure Speech-to-Text for transcript generation.  
* **Advantages**:  
  * High accuracy and robust API.  
  * Competitive pricing and integration options.  
* **Disadvantages**:  
  * Slightly more complex integration compared to AWS or Google.

---

### **Proposed Solution: Amazon Transcribe**

#### **Rationale:**

1. **Accuracy**: Proven reliability for generating high-quality transcripts.  
2. **Integration**: AWS provides a streamlined workflow for uploading audio and retrieving transcripts.  
3. **Scalability**: Supports large-scale usage with minimal performance degradation.  
4. **Cost Efficiency**: Leverages existing AWS credits, minimizing initial costs.

   #### **Trade-offs:**

* Higher costs compared to self-hosted solutions like OpenAI Whisper.  
* Dependency on AWS infrastructure.

---

### **Architecture and Data Flow:**

#### **Workflow for Transcript Generation Fallback:**

1. **Detect Missing Transcript**:  
   * Info service checks if a transcript is unavailable or disabled.  
2. **Audio Extraction**:  
   * Use **yt-dlp** to extract audio and store it temporarily as an `.mp3` file.  
3. **Call Amazon Transcribe**:  
   * Send the extracted audio to Amazon Transcribe for transcription.  
4. **Store and Deliver Transcript**:  
   * Store the generated transcript in Redis for caching.  
   * Format the transcript to match the current system requirements.

---

### **Acceptance Criteria:**

1. **Complete ADR**:  
   * Clear documentation of the decision-making process, tools evaluated, and rationale.  
2. **Seamless Integration**:  
   * Fallback mechanism is fully integrated and functional.  
3. **Accurate Transcripts**:  
   * Generated transcripts meet accuracy and format requirements.

---

### **Next Steps:**

1. Create detailed implementation tickets for:  
   * Modifying `fetch_video_transcript` to handle missing transcripts by calling `yt-dlp`.  
   * Integrating Amazon Transcribe for audio-to-text conversion.  
   * Storing and formatting transcripts in Redis.  
2. Begin development and integration tasks.  
3. Validate the solution through testing.  
4. Monitor performance and optimize costs.  
 


