'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId || '')

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setText(data.text)
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload PDF</h1>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Uploading...' : 'Upload & Extract'}
      </button>
      {text && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Extracted Text:</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{text}</pre>
        </div>
      )}
    </div>
  )
}
