import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import os from 'os'

export const dynamic = 'force-dynamic'

export async function GET() {
  const archiverModule = await import('archiver')
  const archiver: any = (archiverModule as any).default || archiverModule
  const pluginDir = path.join(process.cwd(), 'integrations', 'woocommerce')
  const tmpZip = path.join(os.tmpdir(), `trulybot-woocommerce-${Date.now()}.zip`)

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(tmpZip)
    const archive = archiver('zip', { zlib: { level: 9 } })
    output.on('close', () => resolve())
    output.on('error', reject)
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(pluginDir, false)
    archive.finalize()
  })

  const buffer = await fs.promises.readFile(tmpZip)
  try { await fs.promises.unlink(tmpZip) } catch {}

  const res = new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="trulybot-woocommerce.zip"',
      'Cache-Control': 'no-store',
    },
  })
  return res
}
