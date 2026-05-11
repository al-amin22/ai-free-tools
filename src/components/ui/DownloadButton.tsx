'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

type Format = 'txt' | 'docx'

interface DownloadButtonProps {
  content:    string
  filename?:  string   // without extension
  format?:    Format
  className?: string
}

// ─── Plain text download ──────────────────────────────────────────────────────

function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, `${filename}.txt`)
}

// ─── Minimal DOCX builder (no dependencies) ──────────────────────────────────
// Creates a valid .docx by hand using the Open XML spec.
// Each newline becomes a paragraph. Bold markdown (**text**) is preserved as-is.

function buildDocx(content: string): Blob {
  const paragraphs = content
    .split('\n')
    .map((line) => {
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
    })
    .join('')

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

  // Build a minimal ZIP manually (stored, no compression)
  const files = [
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels',         data: relsXml },
    { name: 'word/document.xml',   data: docXml },
  ]

  const parts: Uint8Array[] = []
  const enc = new TextEncoder()
  const centralDir: { name: string; offset: number; crc: number; size: number }[] = []

  let offset = 0

  for (const file of files) {
    const nameBytes = enc.encode(file.name)
    const dataBytes = enc.encode(file.data)
    const crc       = crc32(dataBytes)

    // Local file header
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length)
    const view  = new DataView(local.buffer)
    view.setUint32(0, 0x504b0304, true)   // local file header sig
    view.setUint16(4, 20, true)            // version needed
    view.setUint16(6, 0, true)             // flags
    view.setUint16(8, 0, true)             // no compression
    view.setUint16(10, 0, true)            // mod time
    view.setUint16(12, 0, true)            // mod date
    view.setUint32(14, crc, true)          // crc32
    view.setUint32(18, dataBytes.length, true)  // compressed size
    view.setUint32(22, dataBytes.length, true)  // uncompressed size
    view.setUint16(26, nameBytes.length, true)  // name length
    view.setUint16(28, 0, true)            // extra length
    local.set(nameBytes, 30)
    local.set(dataBytes, 30 + nameBytes.length)
    parts.push(local)
    centralDir.push({ name: file.name, offset, crc, size: dataBytes.length })
    offset += local.length
  }

  // Central directory
  const cdParts: Uint8Array[] = []
  for (const { name, offset: fileOffset, crc, size } of centralDir) {
    const nameBytes = enc.encode(name)
    const cd = new Uint8Array(46 + nameBytes.length)
    const v  = new DataView(cd.buffer)
    v.setUint32(0, 0x504b0102, true)   // central dir sig
    v.setUint16(4, 20, true)
    v.setUint16(6, 20, true)
    v.setUint16(8, 0, true)
    v.setUint16(10, 0, true)
    v.setUint16(12, 0, true)
    v.setUint16(14, 0, true)
    v.setUint32(16, crc, true)
    v.setUint32(20, size, true)
    v.setUint32(24, size, true)
    v.setUint16(28, nameBytes.length, true)
    v.setUint16(30, 0, true)
    v.setUint16(32, 0, true)
    v.setUint16(34, 0, true)
    v.setUint16(36, 0, true)
    v.setUint32(38, 0, true)
    v.setUint32(42, fileOffset, true)
    cd.set(nameBytes, 46)
    cdParts.push(cd)
  }

  const cdBytes    = concat(cdParts)
  const cdOffset   = offset
  const eocd       = new Uint8Array(22)
  const eocdView   = new DataView(eocd.buffer)
  eocdView.setUint32(0, 0x504b0506, true)
  eocdView.setUint16(4, 0, true)
  eocdView.setUint16(6, 0, true)
  eocdView.setUint16(8, centralDir.length, true)
  eocdView.setUint16(10, centralDir.length, true)
  eocdView.setUint32(12, cdBytes.length, true)
  eocdView.setUint32(16, cdOffset, true)
  eocdView.setUint16(20, 0, true)

  return new Blob([concat(parts), cdBytes, eocd], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const a of arrays) { out.set(a, pos); pos += a.length }
  return out
}

function crc32(data: Uint8Array): number {
  const table = crc32Table()
  let crc = 0xffffffff
  for (const byte of data) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff]
  return (crc ^ 0xffffffff) >>> 0
}

let _crc32Table: Uint32Array | null = null
function crc32Table(): Uint32Array {
  if (_crc32Table) return _crc32Table
  _crc32Table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    _crc32Table[i] = c
  }
  return _crc32Table
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DownloadButton({
  content,
  filename  = 'document',
  format    = 'txt',
  className = '',
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      if (format === 'docx') {
        const blob = buildDocx(content)
        triggerDownload(blob, `${filename}.docx`)
      } else {
        downloadTxt(content, filename)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      aria-label={`Download as ${format.toUpperCase()}`}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors ${className}`}
    >
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : <Download size={15} />
      }
      Download .{format}
    </button>
  )
}
