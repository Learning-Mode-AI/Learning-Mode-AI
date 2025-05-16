# CloudWatch Logs to Slack Alert Integration

This document outlines how our system forwards important CloudWatch log events to Slack via a Lambda function. It explains the setup, involved components, and how to enhance or modify the alerting pipeline.

---

## 🔧 Overview

We use:
- **AWS CloudWatch Logs** for log monitoring
- **AWS Lambda** to process and filter log events
- **Slack Webhooks** to send alerts to a dedicated Slack channel

---

## ✅ Setup Summary

### 1. **Slack Setup**
- Created a Slack channel: `#system-alerts`
- Created a **Slack App** with Incoming Webhook enabled
- Generated a webhook URL and stored it as an environment variable in Lambda (`SLACK_WEBHOOK_URL`)

---

### 2. **Lambda Function**
- Runtime: Python 3.9
- Reads logs from CloudWatch subscription filters
- Filters out known noisy patterns (e.g., `snapshot`, `video processing`)
- Sends formatted Slack alerts using Block Kit UI
- Includes link back to the originating log group in CloudWatch

---

### 3. **Log Group Subscriptions**

The following **production log groups** are wired to trigger the Lambda:

| Log Group               | Slack Filter Pattern                  |
|------------------------|----------------------------------------|
| `main-backend-logs`    | `?ERROR ?Exception ?Fail`              |
| `quiz-service-logs`    | `?ERROR ?Exception ?Fail`              |
| `info-service-logs`    | `?ERROR ?Exception ?Fail`              |
| `ai-service-logs`      | `?ERROR ?Exception ?Fail`              |
| `nginx-logs`           | `?500 ?502 ?503 ?504 ?ERROR`           |
| `LM-Elasticache-Log`   | `?error ?fail ?evicted ?oom`           |

---

## 🚀 How to Enhance or Modify

### ✏️ To Modify Filter Patterns:
1. Go to **CloudWatch > Log Groups**
2. Select the log group
3. Edit the **subscription filter** (change the pattern)

---

### 🔧 To Update Slack Message Logic:
1. Open the Lambda function (`CloudWatchSlackAlert`)
2. Modify formatting inside the `slack_message["blocks"]` section
3. Deploy changes

---

### 🧹 To Silence More Noisy Logs:
1. Edit the `IGNORED_KEYWORDS` list at the top of the Lambda:
```python
IGNORED_KEYWORDS = ['snapshot', 'video processing', 'heartbeat']
