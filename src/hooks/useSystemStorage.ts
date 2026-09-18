import { useCallback, useMemo, useState } from 'react'
import type { SystemConfig } from '../types'

/* ВОССТАНОВЛЕНО: файл был обрезан при копировании (~25 КБ).
   Запросы и заголовок X-Project-Token — дословно из видимой части дампа. */

export interface StoredFile {
  id: number
  name: string
  size: number
  mimeType?: string
  url: string
  createdAt?: string
}

interface UploadResponse {
  file: StoredFile
  error?: string
  message?: string
}

interface FilesResponse {
  files: StoredFile[]
}

function readConfig(): Pick<SystemConfig, 'apiUrl' | 'projectId' | 'apiToken'> | null {
  if (typeof window === 'undefined') return null
  const config = window.__APP_CONFIG__
  if (!config?.apiUrl || !config?.projectId || !config?.apiToken) return null
  return {
    apiUrl: config.apiUrl,
    projectId: config.projectId,
    apiToken: config.apiToken,
  }
}

/** Загрузка, чтение и удаление файлов в хранилище проекта. */
export function useSystemStorage() {
  const config = useMemo(() => readConfig(), [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File): Promise<StoredFile | null> => {
      if (!config) {
        setError('Storage not configured')
        return null
      }

      setUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${config.apiUrl}/api/app/${config.projectId}/files`, {
          method: 'POST',
          headers: {
            'X-Project-Token': config.apiToken,
          },
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || data.message || 'Upload failed')
        }

        const data: UploadResponse = await response.json()
        return data.file
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        return null
      } finally {
        setUploading(false)
      }
    },
    [config]
  )

  const deleteFile = useCallback(
    async (fileId: number): Promise<boolean> => {
      if (!config) {
        setError('Storage not configured')
        return false
      }

      try {
        const response = await fetch(
          `${config.apiUrl}/api/app/${config.projectId}/files/${fileId}`,
          {
            method: 'DELETE',
            headers: {
              'X-Project-Token': config.apiToken,
            },
          }
        )
        return response.ok
      } catch {
        return false
      }
    },
    [config]
  )

  const getFiles = useCallback(async (): Promise<StoredFile[]> => {
    if (!config) {
      return []
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/app/${config.projectId}/files`, {
        headers: {
          'X-Project-Token': config.apiToken,
        },
      })

      if (!response.ok) {
        return []
      }

      const data: FilesResponse = await response.json()
      return data.files || []
    } catch {
      return []
    }
  }, [config])

  const isConfigured = !!config

  return {
    upload,
    deleteFile,
    getFiles,
    uploading,
    error,
    isConfigured,
  }
}