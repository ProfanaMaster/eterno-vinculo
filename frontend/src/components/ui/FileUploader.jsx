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
    // Validaciones básicas de archivo - las validaciones de tipo y tamaño
    // se manejan en uploadService.ts
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