# Authentication System Setup Guide

This guide explains how to configure and use the DynamoDB-based authentication system with Amazon Bedrock integration.

## Prerequisites

1. AWS Account with access to:
   - DynamoDB
   - Amazon Bedrock (Claude AI)

2. DynamoDB Table Setup:
   - Table name: `user_profiles`
   - Primary key: `user_id` (String)
   - Fields:
     - `user_id` (String, required): Unique identifier for the user
     - `user_email` (String, optional): User's email address (used as login username)
     - `full_name` (String, optional): User's full name
     - `is_active` (String, optional): "true" or "false"
     - `profile_data` (Map, optional): Complete enrollment form data
     - Additional fields as needed

3. Optional: Create a Global Secondary Index (GSI) on `user_email` for faster email lookups

## Configuration

1. Copy the `.env.local` file and update with your AWS credentials:

```bash
# AWS Configuration for DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key

# DynamoDB Table Names
DYNAMODB_USER_PROFILES_TABLE=user_profiles
DYNAMODB_CHAT_SESSIONS_TABLE=user_chat_sessions

# Amazon Bedrock Configuration
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

2. Ensure your AWS credentials have the following permissions:
   - `dynamodb:GetItem`
   - `dynamodb:PutItem`
   - `dynamodb:UpdateItem`
   - `dynamodb:Query`
   - `bedrock:InvokeModel`

## How Authentication Works

### For New Users (Sign Up Flow):

1. User clicks "Sign up" or "Start now" on the landing page
2. User completes the personalization quiz, starting with their email
3. Upon quiz completion:
   - Profile data is saved to DynamoDB with the email and auto-generated user_id
   - Amazon Bedrock Claude AI generates personalized insights
   - User can view their personalized dashboard

### For Existing Users (Login Flow):

1. User clicks "Log in" on the landing page
2. User enters:
   - **Username**: Their email address (stored in `user_email` field)
   - **Password**: Their user ID (stored in `user_id` field)
3. System verifies:
   - User exists in DynamoDB
   - Email matches the stored `user_email`
   - User ID matches the stored `user_id`
4. On successful login, user is taken to their insights dashboard

## Sample Data

You can insert test users into DynamoDB using the AWS Console or CLI:

```javascript
// Sample user 1
{
  "user_id": "10010",
  "user_email": "admin@cognizant.com",
  "full_name": "Brittany Spears",
  "is_active": "true",
  "profile_data": { /* enrollment form data */ }
}

// Sample user 2
{
  "user_id": "30332",
  "user_email": "engineer@accenture.com",
  "full_name": "Abraham Lincoln",
  "is_active": "true",
  "profile_data": { /* enrollment form data */ }
}
```

**Login credentials for these users:**
- User 1: Email `admin@cognizant.com`, User ID `10010`
- User 2: Email `engineer@accenture.com`, User ID `30332`

## API Endpoints

### POST /api/auth/login
Authenticates a user with email and user ID.

**Request:**
```json
{
  "email": "admin@cognizant.com",
  "userId": "10010"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "userId": "10010",
    "email": "admin@cognizant.com",
    "fullName": "Brittany Spears",
    "isActive": "true"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials. Please check your email and user ID."
}
```

### POST /api/users
Creates or updates a user profile.

**Request:**
```json
{
  "profile": {
    "userId": "10010",
    "email": "user@example.com",
    "fullName": "John Doe",
    // ... other enrollment form fields
  }
}
```

**Response:**
```json
{
  "userId": "10010"
}
```

### POST /api/generatePlans
Generates personalized financial insights using Claude AI.

**Request:**
```json
{
  "userId": "10010",
  "profile": { /* enrollment form data */ }
}
```

**Response:**
```json
{
  "insights": {
    "ownerName": "John Doe",
    "focusGoal": "Building a secure financial future",
    "statement": "...",
    "goalTheme": "New Professional",
    "priorityBenefits": [ /* benefits array */ ],
    "plans": [ /* plans array */ ],
    // ... other insights
  }
}
```

## Fallback Behavior

If AWS credentials are not configured or DynamoDB is unavailable:
- The system falls back to in-memory storage
- Authentication still works for the current session
- Data will not persist across server restarts
- Bedrock insights will not be generated, local insights will be used instead

## Security Notes

1. **Never commit `.env.local` to version control** - It's already in `.gitignore`
2. Use AWS IAM roles with minimal required permissions
3. Consider implementing rate limiting on the login endpoint
4. In production, use proper password hashing (this is a makeshift system using user_id as password)
5. Implement session management with secure cookies or JWT tokens for production use

## Troubleshooting

### "Invalid credentials" error when logging in
- Verify the user exists in DynamoDB
- Check that `user_email` field is set for the user
- Ensure you're using the correct `user_id` as the password

### Insights not generating
- Check AWS Bedrock credentials and region
- Verify the model ID is correct
- Check CloudWatch logs for Bedrock API errors
- Ensure your AWS account has access to Claude models

### DynamoDB errors
- Verify table exists and has correct name
- Check IAM permissions
- Verify AWS credentials are valid
- Check AWS region configuration

## Development vs Production

**Development:**
- Can run without AWS credentials (uses in-memory storage)
- Bedrock is optional (uses local insights as fallback)

**Production:**
- Configure proper AWS credentials
- Set up DynamoDB tables with appropriate read/write capacity
- Enable CloudWatch logging for monitoring
- Implement proper authentication tokens instead of using user_id as password
