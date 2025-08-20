import { useState } from 'react'
import { supabase } from '@/config/supabase'
import { sanitizeFilename } from '@/utils/sanitize'
import { toast } from 'react-hot-toast'

const FileUploader = ({ 
  accept, 
  maxSize, 
  onUpload, 
  type = 'image',
  preview = true 
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateFile = (file) => {
    if (type === 'image') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return 'Solo se permiten archivos JPG y PNG'
      }
      if (file.size > 10 * 1024 * 1024) {
        return 'La imagen debe ser menor a 10MB'
      }
    } else if (type === 'video') {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return 'Solo se permiten videos MP4, WebM, MOV y AVI'
      }
      if (file.size > 50 * 1024 * 1024) {
        return `El video debe ser menor a 50MB.\n\n📱 Puedes usar apps como:\n• Video Compressor (Android/iOS)\n• Compress Videos & Resize Video\n\n💻 O sitios web como:\n• cloudconvert.com\n• freeconvert.com\n• compressvideo.io`
      }
    }
    
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName) {
      return 'Nombre de archivo no válido'
    }
    
    return null
  }

  const handleUpload = async (file) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setUploading(true)
    
    try {
      const sanitizedFilename = sanitizeFilename(file.name)
      const filename = `${Date.now()}_${sanitizedFilename}`
      
      const { data, error } = await supabase.storage
        .from('memorial-media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error
      
      onUpload(data.path)
    } catch (error) {
      toast.error('Error al subir archivo')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <FileDropzone 
      onDrop={handleUpload}
      accept={accept}
      uploading={uploading}
      progress={progress}
    />
  );
};