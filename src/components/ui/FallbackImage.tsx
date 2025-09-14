'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface FallbackImageProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackText?: string
}

export function FallbackImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '', 
  fallbackText = 'Image' 
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (!src || hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">{fallbackText}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <div className="animate-pulse">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}