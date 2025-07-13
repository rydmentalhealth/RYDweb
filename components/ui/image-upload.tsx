"use client"

import { useState, useRef, ChangeEvent } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CameraIcon, UploadIcon, XIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className
}: ImageUploadProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        // Set canvas dimensions to match video dimensions
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        
        // Draw the current video frame to the canvas
        context.drawImage(
          videoRef.current, 
          0, 0, 
          videoRef.current.videoWidth, 
          videoRef.current.videoHeight
        )
        
        // Convert canvas to data URL
        const dataUrl = canvasRef.current.toDataURL('image/jpeg')
        onChange(dataUrl)
        stopCamera()
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result.toString())
        }
      }
      
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveImage = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {isCameraActive ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-[300px] h-auto"
          />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            <Button 
              onClick={captureImage} 
              variant="secondary" 
              size="sm" 
              className="bg-white/80 backdrop-blur-sm"
            >
              Capture
            </Button>
            <Button 
              onClick={stopCamera} 
              variant="destructive" 
              size="sm"
              className="bg-white/80 backdrop-blur-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : value ? (
        <div className="relative">
          <Image
            src={value}
            alt="Uploaded image"
            width={300}
            height={300}
            className="rounded-xl object-cover aspect-square w-[300px] h-[300px]"
          />
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            disabled={disabled}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 w-[300px] h-[300px] hover:border-primary transition-colors"
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Upload a profile image or take a photo
          </p>
        </div>
      )}

      {!isCameraActive && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={disabled}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            disabled={disabled}
          >
            <CameraIcon className="mr-2 h-4 w-4" />
            Camera
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
} 