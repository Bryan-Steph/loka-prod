'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ImageUploadFolder =
  | 'loka/products'
  | 'loka/identity_docs'
  | 'loka/shop_avatars'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface ImageUploadProps {
  folder: ImageUploadFolder
  onUpload: (url: string) => void
  onError?: (msg: string) => void
  accept?: string
  maxSizeMB?: number
  resourceType?: 'image' | 'auto'
  className?: string
  children?: React.ReactNode
}

export function ImageUpload({
  folder,
  onUpload,
  onError,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
  resourceType = 'image',
  className,
  children,
}: ImageUploadProps) {
  const [state, setState]     = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        const msg = `File must be under ${maxSizeMB}MB`
        setErrorMsg(msg); setState('error'); onError?.(msg)
        return
      }

      setState('uploading'); setProgress(0); setErrorMsg('')

      try {
        const sigRes = await fetch(
          `/api/products/cloudinary-signature?folder=${encodeURIComponent(folder)}&resourceType=${resourceType}`,
        )
        if (!sigRes.ok) throw new Error('Could not get upload token')
        const sig = await sigRes.json()

        const form = new FormData()
        form.append('file',      file)
        form.append('api_key',   sig.apiKey)
        form.append('timestamp', String(sig.timestamp))
        form.append('signature', sig.signature)
        form.append('folder',    sig.folder)
        if (resourceType === 'auto') form.append('resource_type', 'auto')

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open(
            'POST',
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
          )
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText)
              setState('done'); setProgress(100)
              onUpload(data.secure_url)
              resolve()
            } else {
              reject(new Error('Cloudinary upload failed'))
            }
          }
          xhr.onerror = () => reject(new Error('Network error'))
          xhr.send(form)
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setErrorMsg(msg); setState('error'); onError?.(msg)
      }
    },
    [folder, resourceType, maxSizeMB, onUpload, onError],
  )

  const reset = () => {
    setState('idle'); setProgress(0); setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />
      <button
        type="button"
        disabled={state === 'uploading'}
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        {children ?? <DefaultUI state={state} progress={progress} errorMsg={errorMsg} />}
      </button>

      {state === 'uploading' && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {state === 'error' && (
        <button
          type="button"
          onClick={reset}
          className="mt-1.5 w-full text-center font-mono text-[10px] text-primary underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}

function DefaultUI({
  state,
  progress,
  errorMsg,
}: {
  state: UploadState
  progress: number
  errorMsg: string
}) {
  return (
    <div
      className={cn(
        'flex h-[100px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors',
        state === 'idle'      && 'border-surface-3 bg-surface-2',
        state === 'uploading' && 'border-primary bg-primary/5',
        state === 'done'      && 'border-success bg-success/10',
        state === 'error'     && 'border-error bg-error/10',
      )}
    >
      {state === 'idle'      && <><Upload size={24} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Tap to upload</span></>}
      {state === 'uploading' && <><Loader2 size={24} className="animate-spin text-primary" /><span className="font-mono text-xs text-primary">{progress}%</span></>}
      {state === 'done'      && <><CheckCircle2 size={24} className="text-success" /><span className="text-xs text-success">Uploaded</span></>}
      {state === 'error'     && <><AlertCircle size={24} className="text-error" /><span className="text-xs text-error">{errorMsg || 'Failed'}</span></>}
    </div>
  )
}