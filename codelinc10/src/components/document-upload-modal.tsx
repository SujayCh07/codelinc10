"use client"

import { useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  X, 
  CheckCircle, 
  Loader2,
  AlertCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

// TypeScript interfaces for file upload
interface FileUploadRequest {
  bucketName: string
  objectKey: string
  fileType: string
  localFilePath?: string
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'uploading' | 'success' | 'error'
}

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUploaded: (file: UploadedFile) => void
}

const SUPPORTED_FILE_TYPES = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg'
} as const

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function DocumentUploadModal({ isOpen, onClose, onFileUploaded }: DocumentUploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const validateFile = (file: File): string | null => {
    if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
      return `Unsupported file type. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
    
    return null
  }

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const validationError = validateFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    const fileExtension = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]
    const objectKey = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}.${fileExtension}`
    
    const uploadRequest: FileUploadRequest = {
      bucketName: "brock-knowledge",
      objectKey,
      fileType: file.type
    }

    // Convert file to base64 for upload
    const base64File = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    const response = await fetch('/api/upload-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...uploadRequest,
        fileData: base64File
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }

    const result = await response.json()
    
    return {
      id: result.id || Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      status: 'success'
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const uploadedFile = await uploadFile(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Wait a moment to show 100% progress
      setTimeout(() => {
        onFileUploaded(uploadedFile)
        setUploading(false)
        setUploadProgress(0)
        onClose()
      }, 500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image
    if (fileType === 'application/pdf') return FileText
    return File
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-6 bg-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={uploading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {uploading ? (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            
            <p className="text-xs text-center text-gray-500">
              {uploadProgress}% complete
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mb-4"
            >
              Choose File
            </Button>
            
            <div className="text-xs text-gray-400 space-y-1">
              <p>Supported formats: PDF, TXT, JPG, JPEG</p>
              <p>Maximum size: 10MB</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
