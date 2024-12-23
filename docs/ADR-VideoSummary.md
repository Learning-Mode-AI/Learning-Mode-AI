# Video Summary Feature Planning

## **Objective**

Develop a Video Summary feature for Learning Mode, enabling users to generate and view concise summaries of YouTube videos.

---

## **Analysis of Current System Structure**

### **Main Backend**

- **Responsibilities:**
    
    - Handles user requests from the extension or web interface.
        
    - Manages session data and interacts with various services, including AI Service.
        
- **Key Components:**
    
    - `cmd/`: Entry points for the application, defining how the backend starts and operates.
        
    - `pkg/`: Contains packages for routing, data handling, and integration logic.
        

### **AI Service**

- **Responsibilities:**
    
    - Processes AI-specific tasks such as question answering and contextual understanding.
        
    - Leverages OpenAI's GPT models to generate responses.
        
- **Key Components:**
    
    - `cmd/`: Main entry points for AI-specific services.
        
    - `pkg/`: Contains core logic for AI interaction, Redis caching, and OpenAI API integration.
        

---

## **Feature Requirements**

### **Functional Requirements**

1. Allow users to request a summary for the entire video.
    
2. Generate a concise and accurate summary using video transcripts.
    
3. Display the summary within the extension or web interface.
    

### **Non-Functional Requirements**

1. Efficient processing for varying video lengths.
    
2. Scalable solution capable of handling high user demand.
    
3. Ensure a seamless user experience by minimizing response times.
    

---

## **Implementation Options**

### **Option 1: Handle as a Question in Main Backend**

- **Description:**
    
    - Treat the summary request as a user question (e.g., "Summarize this video").
        
    - Forward the request to the AI Service, which generates the summary.
        
- **Advantages:**
    
    - Minimal changes to the existing architecture.
        
    - Leverages current question-handling mechanisms.
        
- **Disadvantages:**
    
    - Less modular; summary logic blends with general question handling.

### **Option 2: Dedicated Function in AI Service**

- **Description:**
    
    - Add a specialized function in the AI Service for summary generation.
        
    - Expose a distinct API endpoint for the feature.
        
- **Advantages:**
    
    - Better modularity and separation of concerns.
        
    - Easier to optimize and maintain summary-specific logic.
        
- **Disadvantages:**
    
    - Requires changes to the AI Service and integration updates in the Main Backend.
        

---

## **Proposed Solution**

### **Preferred Approach: Dedicated Function in AI Service**

- **Rationale:**
    
    - Clear separation of responsibilities.
        
    - Scalability: Allows optimization specifically for summary generation.
        
    - Reusability: Functionality can be extended for other summary-related features in the future.
        

---

## **Architecture and Data Flow**

### **API Routes**

1. **Main Backend**
    
    - **Endpoint:** `POST /video-summary`
        
    - **Description:** Receives summary requests from users and forwards them to the AI Service.
        
    - **Request Payload:**
        
        ```
        {
          "video_id": "<video_id>",
          "transcript": "<transcript>"
        }
        ```
        
    - **Response Payload:**
        
        ```
        {
          "summary": "<summary_text>"
        }
        ```
        
2. **AI Service**
    
    - **Endpoint:** `POST /generate-summary`
        
    - **Description:** Processes transcript data and returns a summary.
        
    - **Request Payload:**
        
        ```
        {
          "transcript": "<transcript>"
        }
        ```
        
    - **Response Payload:**
        
        ```
        {
          "summary": "<summary_text>"
        }
        ```
        

### **Data Flow**

1. User requests a video summary via the interface.
    
2. Main Backend forwards the request to the AI Service.
    
3. AI Service generates the summary and returns it to the Main Backend.
    
4. Main Backend delivers the summary to the user.
    

---

## **Error Handling**

3. **API Errors:**
    
    - Retry mechanisms for transient failures.
        
    - Inform users about the issue and suggest trying again later.
        
 

---

## **Display Plan**

- Integrate the summary feature into the existing interface:
    
    - **Extension:** Add a "Generate Summary" button in the video player controls.

---

## **Architectural Decision Record (ADR)**

### **Title:** Video Summary Feature

### **Context:**

The Video Summary feature aims to enhance user engagement by providing concise video summaries.

### **Decision:**

Implement the feature as a dedicated function in the AI Service.

### **Rationale:**

- Better modularity and maintainability.
    
- Optimized performance for summary-specific tasks.
    

### **Trade-offs:**

- Requires updates to both the Main Backend and AI Service.
    
- Initial implementation effort is higher.
    
---

## **Next Steps**

1. Breakdown into tickets for implementation.
    
2. Begin implementation of the API endpoints in both the Main Backend and AI Service.
    
3. Test the feature for scalability, performance, and user experience.
    
4. Deploy the feature and monitor usage for feedback and further improvements.