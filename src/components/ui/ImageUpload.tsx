'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  className?: string
  placeholder?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  className = '',
  placeholder = 'Cliquez pour télécharger une image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onChange(data.data.url)
      } else {
        alert(data.error || 'Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    onRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
          <img 
            src={value} 
            alt="Uploaded image" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-2">
              <button
                onClick={openFileDialog}
                className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                title="Changer l'image"
              >
                <Upload className="h-4 w-4" />
              </button>
              {onRemove && (
                <button
                  onClick={removeImage}
                  className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                  title="Supprimer l'image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={`
          relative w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
          ${dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Téléchargement en cours...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP ou GIF (max. 5MB)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Ou glissez-déposez votre fichier ici
              </p>
            </>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}