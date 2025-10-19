# Authentication Flow Diagram

## User Journey: New User (Sign Up)

```
┌─────────────────┐
│  Landing Page   │
│  - Click "Sign  │
│    up" or       │
│    "Start now"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quiz Screen    │
│  Step 1: Email  │
│  - Enter email  │
│    address      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quiz Screen    │
│  Steps 2-N:     │
│  - Personal     │
│  - Coverage     │
│  - Financial    │
│  - Health info  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quiz Complete  │
│  POST /api/     │
│  users          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DynamoDB Save  │
│  - user_id      │
│  - user_email   │
│  - full_name    │
│  - profile_data │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /api/     │
│  generatePlans  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bedrock Claude │
│  AI generates   │
│  insights       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insights       │
│  Dashboard      │
│  - Personalized │
│    insights     │
│  - Priority     │
│    benefits     │
│  - Plans        │
└─────────────────┘
```

## User Journey: Existing User (Login)

```
┌─────────────────┐
│  Landing Page   │
│  - Click "Log   │
│    in" button   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth Modal     │
│  - Enter email  │
│  - Enter        │
│    user_id      │
│  - Click "Sign  │
│    In"          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /api/     │
│  auth/login     │
│  {              │
│    email,       │
│    userId       │
│  }              │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DynamoDB       │
│  Verify:        │
│  - user_id      │
│    exists       │
│  - user_email   │
│    matches      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Valid │ │Invalid│
└───┬───┘ └───┬───┘
    │         │
    │         ▼
    │    ┌─────────────┐
    │    │ Show Error  │
    │    │ "Invalid    │
    │    │ credentials"│
    │    └─────────────┘
    │
    ▼
┌─────────────────┐
│  Set User       │
│  Session        │
│  - userId       │
│  - email        │
│  - fullName     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Load Existing  │
│  Profile Data   │
│  from Local     │
│  Storage        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insights       │
│  Dashboard      │
│  - View saved   │
│    insights     │
└─────────────────┘
```

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
├──────────────────────────────────────────────────────────┤
│  Landing Screen  │  Auth Modal  │  Quiz  │  Dashboard    │
└──────────┬───────────────┬───────────┬─────────┬─────────┘
           │               │           │         │
           │               │           │         │
┌──────────▼───────────────▼───────────▼─────────▼─────────┐
│                  Next.js API Routes                       │
├──────────────────────────────────────────────────────────┤
│  /api/auth/login  │  /api/users  │  /api/generatePlans   │
└──────────┬───────────────┬───────────┬──────────────────┘
           │               │           │
           │               │           │
┌──────────▼───────────────▼───────────▼──────────────────┐
│                  Helper Libraries                         │
├──────────────────────────────────────────────────────────┤
│  dynamodb.ts     │  bedrock.ts   │  insights.ts          │
└──────────┬───────────────┬───────────┬──────────────────┘
           │               │           │
           │               │           │
┌──────────▼───────────────▼───────────▼──────────────────┐
│                    AWS Services                           │
├──────────────────────────────────────────────────────────┤
│  DynamoDB         │  Bedrock      │  (Claude AI)          │
│  user_profiles    │  Claude-3     │                       │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### Sign Up Flow
```
User Input (Quiz)
    │
    ▼
EnrollmentFormData
  {
    email: string
    userId: string
    fullName: string
    ... 40+ fields
  }
    │
    ├──> Local Storage (Browser)
    │
    ├──> In-Memory Store (Server)
    │
    └──> DynamoDB (AWS)
         {
           user_id: string (PK)
           user_email: string
           full_name: string
           profile_data: Map
           is_active: string
         }
```

### Login Flow
```
User Input
  {
    email: string
    userId: string
  }
    │
    ▼
DynamoDB Query
  WHERE user_id = :userId
    │
    ▼
Verify
  user_email === :email
    │
    ├──> Success: Return user data
    │
    └──> Failure: Return error
```

### Insights Generation Flow
```
Profile Data
    │
    ▼
Build Prompt
  "Based on user profile..."
    │
    ▼
Bedrock API Call
  Model: claude-3-sonnet
    │
    ▼
Claude AI Response
  {
    focusGoal: string
    statement: string
    goalTheme: string
    priorityBenefits: []
  }
    │
    ▼
Merge with Local Data
  {
    ...claudeInsights,
    plans: localPlans,
    timeline: localTimeline
  }
    │
    ▼
Return to User
```

## Security Considerations

### Current Implementation (Makeshift)
```
┌─────────────────────────────────────┐
│ Email (username)                     │
│ User ID (password) ← Not hashed!    │
└─────────────────────────────────────┘
```

### Recommended for Production
```
┌─────────────────────────────────────┐
│ Email (username)                     │
│ Password ─┬─> bcrypt hash           │
│           └─> Salt + Hash stored    │
│                                      │
│ Session ──┬─> JWT token             │
│           └─> Secure HTTP-only cookie│
│                                      │
│ MFA ──────┬─> TOTP (optional)       │
│           └─> SMS/Email code        │
└─────────────────────────────────────┘
```

## Environment Configuration

```
.env.local (Not committed)
    │
    ├─> AWS_REGION=us-east-1
    ├─> AWS_ACCESS_KEY_ID=xxxxx
    ├─> AWS_SECRET_ACCESS_KEY=xxxxx
    │
    ├─> DYNAMODB_USER_PROFILES_TABLE=user_profiles
    ├─> DYNAMODB_CHAT_SESSIONS_TABLE=user_chat_sessions
    │
    ├─> BEDROCK_REGION=us-east-1
    └─> BEDROCK_MODEL_ID=anthropic.claude-3-sonnet...
```

## Error Handling

```
API Call
    │
    ├─> AWS Available?
    │   ├─> Yes ─> Use DynamoDB/Bedrock
    │   └─> No ──> Fallback to local
    │
    ├─> User Found?
    │   ├─> Yes ─> Return user data
    │   └─> No ──> 401 Unauthorized
    │
    └─> Credentials Valid?
        ├─> Yes ─> Proceed
        └─> No ──> Show error message
```

## File Structure

```
codelinc10/
├── .env.local (created, not committed)
├── AUTH_SETUP.md (new)
├── IMPLEMENTATION_SUMMARY.md (new)
├── README.md (updated)
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   │       └── route.ts (new)
│   │   │   ├── users/
│   │   │   │   └── route.ts (modified)
│   │   │   └── generatePlans/
│   │   │       └── route.ts (modified)
│   │   └── page.tsx (modified)
│   │
│   ├── components/
│   │   ├── auth-modal.tsx (modified)
│   │   ├── landing-screen.tsx (modified)
│   │   └── DynamicQuiz.tsx (modified)
│   │
│   └── lib/
│       ├── dynamodb.ts (new)
│       ├── bedrock.ts (new)
│       ├── types.ts (modified)
│       ├── enrollment.ts (modified)
│       └── quiz.ts (modified)
│
└── package.json (dependencies added)
```
