"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Trash2, 
  Download,
  CheckCircle,
  Clock
} from "lucide-react"
import { DocumentUploadModal } from "./document-upload-modal"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'uploading' | 'success' | 'error'
}

interface UploadScreenProps {
  onBack: () => void
}

// Mock uploaded files for demonstration
const mockUploadedFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'receipt.jpg',
    type: 'image/jpeg',
    size: 245760,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'success'
  },
  {
    id: '2',
    name: 'Financial Wellness Websites.pdf',
    type: 'application/pdf',
    size: 1024000,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'success'
  },
  {
    id: '3',
    name: 'benefits_summary.txt',
    type: 'text/plain',
    size: 15360,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    status: 'success'
  }
]

export function UploadScreen({ onBack }: UploadScreenProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(mockUploadedFiles)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleFileUploaded = (newFile: UploadedFile) => {
    setUploadedFiles(prev => [newFile, ...prev])
  }

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image
    if (fileType === 'application/pdf') return FileText
    return File
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error':
        return <div className="h-4 w-4 rounded-full bg-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            ←
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Upload</h1>
            <p className="text-sm text-gray-600">
              Upload and manage your financial documents
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-gray-200">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload New Document
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload receipts, PDFs, or text files to get personalized financial insights
            </p>
            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#A41E34] hover:bg-[#8B1A2E] text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </Card>

        {/* Uploaded Files Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          {uploadedFiles.length === 0 ? (
            <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-gray-200">
              <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No files uploaded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload your first document to get started
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <Card 
                    key={file.id} 
                    className="p-4 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <FileIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          {getStatusIcon(file.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {file.type.split('/')[1]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">i</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Supported File Types
              </h4>
              <p className="text-xs text-blue-700">
                PDF, TXT, JPG, and JPEG files up to 10MB. Upload receipts, 
                statements, or any financial documents for AI-powered insights.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUploaded={handleFileUploaded}
      />
    </div>
  )
}
