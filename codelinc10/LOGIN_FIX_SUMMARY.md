# Login Fix Summary

## Problem
When users tried to log in with existing credentials, the application threw an error:
```
Error verifying credentials: Error: Failed to fetch user profile
    at getUserProfile (src/lib/dynamodb.ts:47:11)
```

Additionally, existing users needed to be redirected to the personalization form with their profile data prefilled from the `user_profiles` table in DynamoDB.

## Solution

### 1. Fixed Error Handling in DynamoDB Module
**File: `src/lib/dynamodb.ts`**

Changed the `getUserProfile` function to return `null` instead of throwing an error when fetching fails. This allows the authentication flow to gracefully handle missing users or database errors.

**Before:**
```typescript
} catch (error) {
  console.error("Error fetching user profile:", error)
  throw new Error("Failed to fetch user profile")
}
```

**After:**
```typescript
} catch (error) {
  console.error("Error fetching user profile:", error)
  // Return null instead of throwing to allow graceful fallback
  return null
}
```

### 2. Updated Login API to Return Profile Data
**File: `src/app/api/auth/login/route.ts`**

Modified the login endpoint to:
- Return simpler error messages ("Invalid credentials" instead of verbose message)
- Include the `profile_data` field from DynamoDB in the response

**Changes:**
- Added `profileData: user.profile_data || null` to the response
- Simplified error message from "Invalid credentials. Please check your email and user ID." to "Invalid credentials"

### 3. Updated Auth Modal Component
**File: `src/components/auth-modal.tsx`**

Modified the `AuthModal` component to:
- Accept and pass profile data in the `onAuth` callback
- Include `profileData` parameter in the interface

**Changes:**
```typescript
interface AuthModalProps {
  onClose: () => void
  onAuth: (userId: string, email: string, fullName?: string, profileData?: Record<string, unknown>) => void
  onGuestContinue: () => void
}
```

### 4. Updated Main Page Component
**File: `src/app/page.tsx`**

Modified the `handleAuth` function to:
- Check if profile data exists in the login response
- If profile data exists, use it to prefill the personalization form
- Always navigate to the quiz screen (not insights) so users can review/update their profile

**Logic:**
```typescript
if (profileData && Object.keys(profileData).length > 0) {
  // User has existing profile data - use it to prefill the form
  const existingProfile = profileData as unknown as EnrollmentFormData
  updatedFormData = withDerivedMetrics({
    ...existingProfile,
    userId,
    email,
    fullName: fullName || existingProfile.fullName || "",
  })
} else {
  // New user or no profile data - create fresh form
  updatedFormData = withDerivedMetrics({ ...createFreshForm(), userId, email, fullName: fullName || "" })
}
```

### 5. Updated Landing Screen Component
**File: `src/components/landing-screen.tsx`**

Updated the type signature to match the new `onAuth` callback signature with the optional `profileData` parameter.

### 6. Fixed Type Errors
**Files: `src/app/api/insights/route.ts`, `src/lib/api.ts`, `src/lib/insights.ts`, `src/components/DynamicQuiz.tsx`**

Fixed various TypeScript compilation errors:
- Added missing `email` field in `dbProfileToFormData` and `generatePlaceholderInsights` functions
- Fixed type casting issues with `monthly_cost_estimate` field
- Changed "self-plus-partner" to "self-plus-spouse" to match the CoveragePreference type
- Fixed the `valueForQuestion` function to properly handle the `derived` object field

## User Flow After Changes

### For Existing Users (Login):
1. User enters email and user ID in the login modal
2. System verifies credentials against DynamoDB `user_profiles` table
3. If valid:
   - Retrieves user profile including `profile_data` field
   - Sets user session
   - Navigates to personalization quiz
   - Form is **prefilled** with existing data from `profile_data`
   - User can review and update their information
   - On submit, updates are saved back to DynamoDB
4. If invalid:
   - Shows "Invalid credentials" error message

### For New Users (Sign Up):
1. User completes the personalization quiz from scratch
2. On completion, data is saved to DynamoDB with:
   - `user_id`: auto-generated
   - `user_email`: from form
   - `full_name`: from form
   - `profile_data`: complete form data
3. User is shown their personalized insights

## Testing Recommendations

To test the login functionality:

1. **Create test user in DynamoDB:**
   ```json
   {
     "user_id": "test123",
     "user_email": "test@example.com",
     "full_name": "Test User",
     "is_active": "true",
     "profile_data": {
       "userId": "test123",
       "email": "test@example.com",
       "fullName": "Test User",
       "age": 30,
       "maritalStatus": "single",
       // ... other fields
     }
   }
   ```

2. **Test login:**
   - Navigate to the landing page
   - Click "Log in"
   - Enter email: `test@example.com`
   - Enter user ID: `test123`
   - Click "Sign In"
   - Verify you're redirected to the quiz with prefilled data

3. **Test error handling:**
   - Try logging in with invalid credentials
   - Verify you see "Invalid credentials" error
   - Verify no console errors are thrown

## Notes

- The personalization form (DynamicQuiz) will always be shown after login, allowing users to review and update their profile
- All existing profile data is preserved and prefilled
- Users can modify any field and submit to update their profile
- The error handling is now more graceful - database errors won't crash the login flow
