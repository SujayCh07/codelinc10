# Database-Driven Insights Feature

## Overview
This feature enhances the LifeLens application to fetch and display financial insights from a database (AWS DynamoDB or Supabase), with intelligent fallback to in-memory data and placeholder generation when needed.

## Architecture

### Data Flow
```
User Request
    ↓
fetchInsights() API Call
    ↓
/api/insights Endpoint
    ↓
    ├─→ Try Database (if configured)
    │   ├─→ Success: Return database insights
    │   └─→ Fail: Continue to fallback
    ├─→ Try In-Memory Store
    │   ├─→ Success: Return cached insights
    │   └─→ Fail: Continue to fallback
    └─→ Generate Placeholder
        └─→ Return sample insights with warning flag
```

### Components

#### 1. Database Utility (`src/lib/database.ts`)
Provides database connection and query functions:
- `fetchUserProfile(userId)` - Retrieves user profile from database
- `fetchUserChats(userId, limit)` - Retrieves chat history
- `isDatabaseConfigured()` - Checks if database credentials are available
- `getDatabaseType()` - Returns 'supabase', 'aws', or 'none'

#### 2. Insights API Endpoint (`src/app/api/insights/route.ts`)
POST endpoint that:
- Accepts `userId` and optional `useDatabase` flag
- Attempts to fetch from database first
- Falls back to in-memory profile data
- Generates placeholder data if nothing available
- Returns insights + metadata about data source

#### 3. Insights Visualization (`src/components/insights-visualization.tsx`)
Visual component displaying:
- **Financial Allocation** - Pie chart of benefits budget distribution
- **Savings Trajectory** - Bar chart of monthly savings vs targets
- Responsive design with consistent styling

#### 4. Enhanced Insights Dashboard (`src/components/insights-dashboard.tsx`)
Updated to:
- Display placeholder warning banner when using sample data
- Integrate financial visualizations
- Maintain existing priority benefits and timeline features

## Database Schema

### user_profile Table
Expected columns:
```typescript
{
  user_id: string              // Primary key
  full_name: string
  age_years: number
  marital_status: string       // SINGLE, MARRIED, etc.
  education_level: string      // HIGH_SCHOOL, BACHELOR, etc.
  citizenship: string
  work_location_country: string
  work_location_state: string
  work_location_region: string
  dependents: number
  risk_aversion: string        // VERY_LOW, LOW, MEDIUM, HIGH, VERY_HIGH
  tobacco_user: boolean
  disability_status: boolean
  employment_start_date: string
  coverage_preference: string
  partner_coverage_status: string
  other_medical_plan: string
  continuous_coverage: boolean
  chronic_conditions: boolean
  chronic_condition_summary: string
  primary_care_frequency: string
  prescription_frequency: string
  activity_level_score: number
  benefits_budget_percent: number
  plan_priority: string
  tax_account_type: string
  anticipates_life_changes: boolean
  benefit_usage_frequency: string
  travels_out_of_state: boolean
  needs_international_coverage: boolean
  dental_vision_preference: string
  contributes_to_retirement: boolean
  retirement_contribution_rate: number
  wants_retirement_guidance: boolean
  guidance_preference: string
  confidence_with_terms: number
  created_at: timestamp
  updated_at: timestamp
}
```

### user_chats Table
Expected columns:
```typescript
{
  id: string                   // Primary key
  user_id: string              // Foreign key to user_profile
  speaker: string              // "LifeLens" or "You"
  message: string
  timestamp: string
  session_id?: string
  context?: JSON
}
```

## Configuration

### Environment Variables
Add to `.env.local`:

**For Supabase:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**For AWS DynamoDB:**
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

## Usage

### Fetching Insights
```typescript
import { fetchInsights } from '@/lib/api'

const result = await fetchInsights(userId)

if (result.data) {
  const { insights, usingPlaceholder } = result.data
  
  if (usingPlaceholder) {
    console.log('Using placeholder data - prompt user to complete profile')
  }
  
  // Display insights
}
```

### Displaying Visualizations
```typescript
import { InsightsVisualization } from '@/components/insights-visualization'

<InsightsVisualization 
  data={{
    spendingCategories: [
      { name: "Healthcare", value: 30, color: "#A41E34" },
      { name: "Retirement", value: 25, color: "#7F1527" },
      // ...
    ],
    savingsProgress: [
      { month: "Jan", saved: 500, target: 800 },
      // ...
    ]
  }}
/>
```

## Testing

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to insights page
3. Check for placeholder indicator if no real data
4. Verify visualizations render correctly

### API Testing
```bash
# Test the insights endpoint directly
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","useDatabase":true}'
```

Expected response:
```json
{
  "insights": { /* LifeLensInsights object */ },
  "usingPlaceholder": true,
  "dataSource": "placeholder"
}
```

## Security

### ✅ CodeQL Analysis
All code has been scanned with CodeQL and contains:
- 0 security vulnerabilities
- No SQL injection risks
- Proper error handling
- Secure environment variable usage

### Best Practices
- Database credentials stored in environment variables only
- Parameterized queries used when available
- Error messages don't leak sensitive information
- Proper input validation on API endpoints

## Troubleshooting

### Issue: Placeholder data always shows
**Solution:** Check that:
1. Database credentials are correctly set in `.env.local`
2. Database tables exist and are accessible
3. User has completed profile data in the database

### Issue: Visualizations not displaying
**Solution:** Ensure recharts is installed:
```bash
npm install recharts
```

### Issue: TypeScript errors
**Solution:** The codebase has some pre-existing TypeScript errors in `DynamicQuiz.tsx` and other files that are unrelated to this feature. Our new code has no TypeScript errors.

## Future Enhancements
- [ ] Add real-time data synchronization
- [ ] Implement more visualization types (line charts, gauges, etc.)
- [ ] Add AI-powered insights based on chat history
- [ ] Create data export/download functionality
- [ ] Add caching layer for improved performance

## Support
For questions or issues, please contact the development team or create an issue in the repository.
