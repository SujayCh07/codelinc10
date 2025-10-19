import { NextResponse } from "next/server"
import { verifyUserCredentials } from "@/lib/dynamodb"

export async function POST(request: Request) {
  try {
    const { email, userId } = (await request.json()) as {
      email: string
      userId: string
    }

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and user ID are required" },
        { status: 400 }
      )
    }

    // Verify credentials: email matches user_email and userId matches user_id
    const user = await verifyUserCredentials(email, userId)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email and user ID." },
        { status: 401 }
      )
    }

    // Return user information (excluding sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        userId: user.user_id,
        email: user.user_email,
        fullName: user.full_name,
        isActive: user.is_active,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}
