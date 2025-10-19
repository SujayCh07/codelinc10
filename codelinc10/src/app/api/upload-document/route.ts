import { NextRequest, NextResponse } from 'next/server'

interface FileUploadRequest {
  bucketName: string
  objectKey: string
  fileType: string
  fileData: string // base64 encoded file data
}

interface LambdaResponse {
  success: boolean
  message: string
  id?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FileUploadRequest = await request.json()
    
    // Validate required fields
    if (!body.bucketName || !body.objectKey || !body.fileType || !body.fileData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const supportedTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/jpg']
    if (!supportedTypes.includes(body.fileType)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Prepare payload for lambda function
    const lambdaPayload = {
      bucketName: body.bucketName,
      objectKey: body.objectKey,
      fileType: body.fileType,
      fileData: body.fileData
    }

    // Call your lambda function
    // Replace with your actual lambda function URL
    const lambdaUrl = process.env.LAMBDA_UPLOAD_URL || 'https://your-lambda-function-url.amazonaws.com/upload'
    
    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here
        // 'Authorization': `Bearer ${process.env.LAMBDA_API_KEY}`,
      },
      body: JSON.stringify(lambdaPayload)
    })

    if (!lambdaResponse.ok) {
      const errorData = await lambdaResponse.json()
      throw new Error(errorData.error || 'Lambda function error')
    }

    const result: LambdaResponse = await lambdaResponse.json()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      id: result.id || Date.now().toString()
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
