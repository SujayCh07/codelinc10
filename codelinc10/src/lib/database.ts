/**
 * Database utilities for connecting to AWS/Supabase and fetching user data
 */

export interface UserProfile {
  user_id: string
  full_name: string
  age_years: number | null
  marital_status: string
  education_level: string
  citizenship: string
  work_location_country: string
  work_location_state: string
  work_location_region: string
  dependents: number
  risk_aversion: string
  tobacco_user: boolean | null
  disability_status: boolean
  employment_start_date: string
  coverage_preference: string
  partner_coverage_status: string
  other_medical_plan: string
  continuous_coverage: boolean | null
  chronic_conditions: boolean | null
  chronic_condition_summary: string
  primary_care_frequency: string
  prescription_frequency: string
  activity_level_score: number
  benefits_budget_percent: number
  plan_priority: string
  tax_account_type: string
  anticipates_life_changes: boolean | null
  benefit_usage_frequency: string
  travels_out_of_state: boolean | null
  needs_international_coverage: boolean | null
  dental_vision_preference: string
  contributes_to_retirement: boolean | null
  retirement_contribution_rate: number
  wants_retirement_guidance: boolean | null
  guidance_preference: string
  confidence_with_terms: number
  created_at?: string
  updated_at?: string
}

export interface UserChat {
  id: string
  user_id: string
  speaker: string
  message: string
  timestamp: string
  session_id?: string
  context?: Record<string, unknown>
}

export interface DatabaseResult<T> {
  data?: T
  error?: string
}

/**
 * Initialize database client based on available environment variables
 */
function getDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if Supabase is configured
  if (supabaseUrl && supabaseKey) {
    // Supabase client would be initialized here
    // For now, return a mock client indicator
    return { type: 'supabase' as const, configured: true }
  }

  // Check if AWS credentials are configured
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY
  
  if (awsAccessKey && awsSecretKey) {
    return { type: 'aws' as const, configured: true }
  }

  return { type: 'none' as const, configured: false }
}

/**
 * Fetch user profile from database
 */
export async function fetchUserProfile(userId: string): Promise<DatabaseResult<UserProfile>> {
  const client = getDbClient()

  if (!client.configured) {
    return { error: 'Database not configured' }
  }

  try {
    if (client.type === 'supabase') {
      // TODO: Implement Supabase query when credentials are available
      // const { data, error } = await supabase
      //   .from('user_profile')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single()
      // 
      // if (error) throw error
      // return { data }
      
      return { error: 'Supabase integration not yet implemented' }
    }

    if (client.type === 'aws') {
      // TODO: Implement AWS DynamoDB query when credentials are available
      // const command = new GetItemCommand({
      //   TableName: 'user_profile',
      //   Key: { user_id: { S: userId } }
      // })
      // const result = await dynamoClient.send(command)
      // return { data: unmarshall(result.Item) }
      
      return { error: 'AWS integration not yet implemented' }
    }

    return { error: 'Unknown database type' }
  } catch (error) {
    console.error('Database fetch error:', error)
    return { error: error instanceof Error ? error.message : 'Database query failed' }
  }
}

/**
 * Fetch user chat history from database
 */
export async function fetchUserChats(userId: string, limit: number = 50): Promise<DatabaseResult<UserChat[]>> {
  const client = getDbClient()

  if (!client.configured) {
    return { error: 'Database not configured' }
  }

  try {
    if (client.type === 'supabase') {
      // TODO: Implement Supabase query
      // const { data, error } = await supabase
      //   .from('user_chats')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('timestamp', { ascending: false })
      //   .limit(limit)
      // 
      // if (error) throw error
      // return { data }
      
      return { error: 'Supabase integration not yet implemented' }
    }

    if (client.type === 'aws') {
      // TODO: Implement AWS DynamoDB query
      // const command = new QueryCommand({
      //   TableName: 'user_chats',
      //   KeyConditionExpression: 'user_id = :userId',
      //   ExpressionAttributeValues: { ':userId': { S: userId } },
      //   Limit: limit
      // })
      // const result = await dynamoClient.send(command)
      // return { data: result.Items?.map(item => unmarshall(item)) }
      
      return { error: 'AWS integration not yet implemented' }
    }

    return { error: 'Unknown database type' }
  } catch (error) {
    console.error('Database fetch error:', error)
    return { error: error instanceof Error ? error.message : 'Database query failed' }
  }
}

/**
 * Check if database is configured and accessible
 */
export function isDatabaseConfigured(): boolean {
  const client = getDbClient()
  return client.configured
}

/**
 * Get database type being used
 */
export function getDatabaseType(): 'supabase' | 'aws' | 'none' {
  return getDbClient().type
}
