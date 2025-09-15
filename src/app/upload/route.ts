import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false })

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err || !files.file) {
        return resolve(NextResponse.json({ error: 'Upload failed' }, { status: 400 }))
      }

      const file = files.file[0]
      const buffer = fs.readFileSync(file.filepath)
      const data = await pdfParse(buffer)

      const userId = fields.userId?.[0]
      const filename = file.originalFilename || 'untitled.pdf'
      const content = data.text

      // ✅ Store in Supabase
      const { error } = await supabase.from('documents').insert([
        { user_id: userId, filename, content }
      ])

      if (error) {
        console.error('Supabase insert error:', error)
        return resolve(NextResponse.json({ error: 'Failed to save document' }, { status: 500 }))
      }

      return resolve(NextResponse.json({ text: content }))
    })
  })
}
