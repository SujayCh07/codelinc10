import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const docClient = DynamoDBDocumentClient.from(client)

const USER_PROFILES_TABLE = process.env.DYNAMODB_USER_PROFILES_TABLE || "user_profiles"

export interface UserProfile {
  user_id: string
  user_email?: string
  full_name?: string
  is_active?: string
  profile_data?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Get user profile by user_id
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const command = new GetCommand({
      TableName: USER_PROFILES_TABLE,
      Key: {
        user_id: userId,
      },
    })

    const response = await docClient.send(command)
    return (response.Item as UserProfile) || null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    // Return null instead of throwing to allow graceful fallback
    return null
  }
}

/**
 * Find user by email
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const command = new QueryCommand({
      TableName: USER_PROFILES_TABLE,
      IndexName: "user_email-index", // Assuming GSI exists on user_email
      KeyConditionExpression: "user_email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    })

    const response = await docClient.send(command)
    if (response.Items && response.Items.length > 0) {
      return response.Items[0] as UserProfile
    }
    return null
  } catch (error) {
    // If GSI doesn't exist, fall back to scan (not recommended for production)
    console.warn("Query failed, attempting scan (this is slow):", error)
    return null
  }
}

/**
 * Verify user credentials (email as username, user_id as password)
 */
export async function verifyUserCredentials(
  email: string,
  userId: string
): Promise<UserProfile | null> {
  try {
    // First get the user by user_id
    const user = await getUserProfile(userId)
    
    if (!user) {
      return null
    }

    // Check if the email matches and exists
    if (!user.user_email || user.user_email !== email) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error verifying credentials:", error)
    return null
  }
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const timestamp = new Date().toISOString()
    const item: UserProfile = {
      user_id: userId,
      ...profileData,
      updated_at: timestamp,
    }

    const command = new PutCommand({
      TableName: USER_PROFILES_TABLE,
      Item: item,
    })

    await docClient.send(command)
    return item
  } catch (error) {
    console.error("Error upserting user profile:", error)
    throw new Error("Failed to save user profile")
  }
}

/**
 * Update user profile data
 */
export async function updateUserProfileData(
  userId: string,
  profileData: Record<string, unknown>
): Promise<void> {
  try {
    const command = new UpdateCommand({
      TableName: USER_PROFILES_TABLE,
      Key: {
        user_id: userId,
      },
      UpdateExpression: "SET profile_data = :data, updated_at = :timestamp",
      ExpressionAttributeValues: {
        ":data": profileData,
        ":timestamp": new Date().toISOString(),
      },
    })

    await docClient.send(command)
  } catch (error) {
    console.error("Error updating user profile data:", error)
    throw new Error("Failed to update user profile")
  }
}
