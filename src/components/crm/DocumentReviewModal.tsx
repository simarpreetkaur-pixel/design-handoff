import React, { useState } from "react"
import { X, FileText, Image, Download, Check, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DocumentFile {
  id: string
  name: string
  type: "image" | "pdf" | "document"
  url: string
  uploadedAt: string
  size?: string
}

export interface DocumentReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  documents: DocumentFile[]
  documentLabel?: string
  customerName?: string
}

function DocumentPreview({ document, isActive }: { document: DocumentFile; isActive: boolean }) {
  const getFileIcon = () => {
    switch (document.type) {
      case "image":
        return <Image className="w-4 h-4" />
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className={cn(
      "border rounded-lg p-3 cursor-pointer transition-colors",
      isActive ? "border-[#7c47e1] bg-[#f8f7fc]" : "border-[#e7e7f0] bg-white hover:border-[#d1d0dc]"
    )}>
      <div className="flex items-center gap-3">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <div className="font-euclid text-sm font-medium text-[#040222] truncate">
            {document.name}
          </div>
          <div className="font-euclid text-xs text-[#5b5675]">
            {document.size && `${document.size} • `}Uploaded {document.uploadedAt}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function DocumentViewer({ document }: { document: DocumentFile }) {
  if (document.type === "image") {
    return (
      <div className="flex items-center justify-center h-full bg-[#fafafa] rounded-lg">
        <img
          src={document.url}
          alt={document.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  if (document.type === "pdf") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#fafafa] rounded-lg">
        <FileText className="w-16 h-16 text-[#5b5675] mb-4" />
        <p className="font-euclid text-sm text-[#5b5675] mb-2">PDF Document</p>
        <p className="font-euclid text-xs text-[#5b5675] mb-4">{document.name}</p>
        <Button
          variant="outline"
          className="font-euclid text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download to View
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#fafafa] rounded-lg">
      <FileText className="w-16 h-16 text-[#5b5675] mb-4" />
      <p className="font-euclid text-sm text-[#5b5675] mb-2">Document</p>
      <p className="font-euclid text-xs text-[#5b5675]">{document.name}</p>
    </div>
  )
}

export function DocumentReviewModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  documents,
  documentLabel = "documents",
  customerName = "Customer"
}: DocumentReviewModalProps) {
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  if (!isOpen) return null

  const selectedDocument = documents[selectedDocumentIndex]
  const hasMultipleDocuments = documents.length > 1

  const handleApprove = async () => {
    setIsApproving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsApproving(false)
    onApprove()
    onClose()
  }

  const handleReject = async () => {
    setIsRejecting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRejecting(false)
    onReject()
    onClose()
  }

  const nextDocument = () => {
    setSelectedDocumentIndex((prev) => (prev + 1) % documents.length)
  }

  const previousDocument = () => {
    setSelectedDocumentIndex((prev) => (prev - 1 + documents.length) % documents.length)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e7e7f0]">
          <div>
            <h2 className="font-euclid text-lg font-semibold text-[#040222]">
              Review {documentLabel}
            </h2>
            <p className="font-euclid text-sm text-[#5b5675] mt-1">
              Documents received from {customerName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar - Document List */}
          <div className="w-80 border-r border-[#e7e7f0] p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-euclid text-sm font-semibold text-[#040222]">
                  Documents ({documents.length})
                </h3>
              </div>
              {documents.map((document, index) => (
                <div
                  key={document.id}
                  onClick={() => setSelectedDocumentIndex(index)}
                >
                  <DocumentPreview
                    document={document}
                    isActive={index === selectedDocumentIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Document Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Document Navigation */}
            {hasMultipleDocuments && (
              <div className="flex items-center justify-between p-4 border-b border-[#e7e7f0]">
                <div className="font-euclid text-sm text-[#5b5675]">
                  {selectedDocumentIndex + 1} of {documents.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousDocument}
                    disabled={documents.length <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextDocument}
                    disabled={documents.length <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Document Viewer */}
            <div className="flex-1 p-4">
              {selectedDocument ? (
                <DocumentViewer document={selectedDocument} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="font-euclid text-sm text-[#5b5675]">No document selected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-[#e7e7f0] bg-[#fafafa]">
          <div className="flex items-center gap-2 text-sm text-[#5b5675]">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-euclid">Review all documents before approval</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isApproving || isRejecting}
              className="font-euclid"
            >
              {isRejecting ? "Rejecting..." : "Request Again"}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="bg-[#0fa457] hover:bg-[#0d8a4a] font-euclid"
            >
              {isApproving ? "Approving..." : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approve {documentLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}