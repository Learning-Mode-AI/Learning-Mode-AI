# CloudWatch Logging Setup

## Objective
The Learning Mode AI platform required a reliable logging solution for its Docker-based services. The goal was to centralize logs for easier debugging and monitoring while ensuring persistence beyond container restarts.

## Analysis of Current System Structure

### **Main Backend**
#### **Responsibilities:**
- Handles user requests from the extension or web interface.
- Manages logging configurations and interacts with AWS CloudWatch for real-time log monitoring.

#### **Key Components:**
- **Logging Driver:** AWS CloudWatch (`awslogs` driver) is configured for Docker containers.
- **Log Groups:** Each microservice has a dedicated log group in AWS CloudWatch.
- **Access:** Logs can be accessed via AWS Console under **CloudWatch Logs**.

## Options Considered
### **1. Local Docker Logs**
- ✅ Simple, no extra configuration.
- ❌ Logs are ephemeral and lost after container restarts.

### **2. Self-Hosted Logging (ELK Stack, Loki, etc.)**
- ✅ Full control over logs and analysis.
- ❌ High maintenance and resource-intensive.

### **3. AWS CloudWatch (Chosen Solution)**
- ✅ Managed service, integrates with AWS IAM, supports alerts and long-term retention.
- ✅ Accessible via AWS Console.
- ❌ Some cost associated, AWS-dependent.

## Decision
We chose AWS CloudWatch because:
- It integrates well with AWS services.
- Logs persist beyond container restarts.
- Easy access to logs via AWS Console.
- Future scalability and support for alerts.

## Implementation
- **Docker services** were configured to log to CloudWatch using the `awslogs` driver.
- Each service has a dedicated **log group** in AWS CloudWatch.
- Logs can be accessed through **AWS Console → CloudWatch Logs**.

## Accessing the Logs
1. Navigate to **AWS Console → CloudWatch**.
2. Select **Log groups**.
3. Locate the relevant log group (e.g., `main-backend-logs`).
4. Use **Live Tail** to stream logs in real-time.

## Potential Next Steps
- **Optional:** Configure CloudWatch Alarms for error monitoring.
- **Optional:** Set up retention policies for log storage optimization.

