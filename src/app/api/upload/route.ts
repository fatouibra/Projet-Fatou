import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Type de fichier non autorisé. Seuls les formats JPG, PNG, WebP et GIF sont acceptés.' },
        { status: 400 }
      )
    }

    // Validation de la taille
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux. Taille maximum: 5MB' },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer le chemin de destination
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)

    // Créer le dossier uploads s'il n'existe pas
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // Si le dossier n'existe pas, le créer
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    // Retourner l'URL publique du fichier
    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}