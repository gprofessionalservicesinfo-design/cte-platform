/**
 * lib/document-generator.ts
 *
 * PDF generation using jsPDF (no native dependencies — works on Vercel serverless).
 * Replaces the previous PDFKit implementation which required AFM font files
 * that were unavailable at runtime on Vercel Lambda.
 */

import { jsPDF } from 'jspdf'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DocumentTemplate, DocSection, GenerationRequest, GenerationResult,
} from './document-templates/types'
import { buildArticlesTemplate } from './document-templates/articles'
import { buildOATemplate }       from './document-templates/operating-agreement'

// ─── Layout constants ────────────────────────────────────────────────────────

const PAGE_W     = 216   // mm — US Letter width
const PAGE_H     = 279   // mm — US Letter height
const MARGIN     = 25.4  // mm — 1 inch
const BODY_W     = PAGE_W - MARGIN * 2
const FONT_SIZE  = { title: 14, heading: 10, body: 9, small: 7.5 }
const LINE_H     = { title: 7, heading: 6, body: 5, small: 4.5 }

// ─── PDF renderer ────────────────────────────────────────────────────────────

function addPage(doc: jsPDF): void {
  doc.addPage('letter', 'portrait')
}

/**
 * Renders all sections into the jsPDF document.
 * Handles page breaks automatically.
 */
export function renderTemplateToPDF(template: DocumentTemplate): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit:        'mm',
    format:      'letter',
  })

  let y = MARGIN

  /** Ensure there's at least `needed` mm left on the page; add new page if not. */
  function ensureSpace(needed: number): void {
    if (y + needed > PAGE_H - 20) {
      addPage(doc)
      y = MARGIN
    }
  }

  /** Write wrapped text and return new y position. */
  function writeText(
    text: string,
    opts: {
      fontSize: number
      lineH:    number
      bold?:    boolean
      italic?:  boolean
      color?:   string
      align?:   'left' | 'center' | 'right'
      indent?:  number
      maxW?:    number
    },
  ): void {
    const {
      fontSize, lineH, bold = false, italic = false,
      color = '#000000', align = 'left', indent = 0, maxW,
    } = opts

    doc.setFontSize(fontSize)
    doc.setTextColor(color)

    const style = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal'
    doc.setFont('helvetica', style)

    const xBase  = MARGIN + indent
    const width  = (maxW ?? BODY_W) - indent
    const lines  = doc.splitTextToSize(text, width) as string[]

    for (const line of lines) {
      ensureSpace(lineH + 1)
      const x = align === 'center'
        ? PAGE_W / 2
        : align === 'right'
          ? MARGIN + BODY_W
          : xBase
      doc.text(line, x, y, { align })
      y += lineH
    }
  }

  function moveDown(mm: number): void { y += mm }

  function drawHRule(): void {
    ensureSpace(4)
    doc.setDrawColor('#999999')
    doc.setLineWidth(0.2)
    doc.line(MARGIN, y, MARGIN + BODY_W, y)
    doc.setDrawColor('#000000')
    doc.setLineWidth(0.2)
    y += 3
  }

  // ── Render each section ───────────────────────────────────────────────────

  for (const section of template.sections) {
    switch (section.type) {

      case 'watermark_notice':
        writeText('DRAFT — FOR REVIEW ONLY — NOT A FILED LEGAL DOCUMENT', {
          fontSize: FONT_SIZE.small, lineH: LINE_H.small,
          bold: true, color: '#DC2626', align: 'center',
        })
        moveDown(3)
        break

      case 'title':
        moveDown(2)
        writeText(section.text ?? '', {
          fontSize: FONT_SIZE.title, lineH: LINE_H.title,
          bold: true, align: section.centered ? 'center' : 'left',
        })
        moveDown(1)
        break

      case 'subtitle':
        writeText(section.text ?? '', {
          fontSize: FONT_SIZE.body, lineH: LINE_H.body,
          align: section.centered ? 'center' : 'left',
        })
        break

      case 'section_heading':
        moveDown(4)
        writeText(section.text ?? '', {
          fontSize: FONT_SIZE.heading, lineH: LINE_H.heading,
          bold: true,
        })
        moveDown(1)
        break

      case 'paragraph':
        writeText(section.text ?? '', {
          fontSize: FONT_SIZE.body, lineH: LINE_H.body,
          bold:   section.bold   ?? false,
          indent: section.indent ? 8 : 0,
          align:  section.centered ? 'center' : 'left',
        })
        moveDown(2)
        break

      case 'numbered_list': {
        const items = section.items ?? []
        items.forEach((item, idx) => {
          const label = `${idx + 1}.`
          ensureSpace(LINE_H.body + 1)

          doc.setFontSize(FONT_SIZE.body)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor('#000000')
          doc.text(label, MARGIN + 4, y)

          doc.setFont('helvetica', 'normal')
          const lines = doc.splitTextToSize(item, BODY_W - 14) as string[]
          lines.forEach((line, li) => {
            ensureSpace(LINE_H.body + 1)
            doc.text(line, MARGIN + 14, li === 0 ? y : y)
            if (li === 0 && lines.length > 1) y += LINE_H.body
            else if (li > 0) y += LINE_H.body
          })
          y += LINE_H.body + 0.5
        })
        moveDown(1)
        break
      }

      case 'bullet_list': {
        const items = section.items ?? []
        items.forEach((item) => {
          const lines = doc.splitTextToSize('• ' + item, BODY_W - 8) as string[]
          lines.forEach((line) => {
            ensureSpace(LINE_H.body + 1)
            writeText(line, { fontSize: FONT_SIZE.body, lineH: LINE_H.body, indent: 4 })
          })
          moveDown(1)
        })
        break
      }

      case 'signature_block': {
        const items = section.items ?? []
        items.forEach((item) => {
          if (item === '') {
            moveDown(4)
          } else {
            writeText(item, { fontSize: FONT_SIZE.body, lineH: LINE_H.body })
            moveDown(1)
          }
        })
        moveDown(3)
        break
      }

      case 'horizontal_rule':
        moveDown(2)
        drawHRule()
        break

      case 'spacer':
        moveDown((section.height ?? 12) * 0.35) // pt → approx mm
        break
    }
  }

  // ── Footer on every page ──────────────────────────────────────────────────

  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(FONT_SIZE.small)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor('#666666')
    doc.text(
      `${template.meta.title} — ${template.meta.state} — Page ${i} of ${totalPages}`,
      PAGE_W / 2, PAGE_H - 12, { align: 'center' },
    )
    doc.text(
      template.meta.disclaimer,
      PAGE_W / 2, PAGE_H - 8,
      { align: 'center', maxWidth: BODY_W },
    )
  }

  // jsPDF returns base64 string via output('arraybuffer') or Buffer via output('nodebuffer')
  const buf = doc.output('arraybuffer')
  return Buffer.from(buf)
}

// ─── Generation entry point ───────────────────────────────────────────────────

export async function generateDocument(
  req: GenerationRequest,
  supabase: SupabaseClient,
  adminUserId: string,
): Promise<GenerationResult> {
  // 1. Fetch company from Supabase
  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .select('id, company_name, state, state_code, entity_type, registered_agent')
    .eq('id', req.company_id)
    .single()

  if (companyErr || !company) {
    throw new Error(`Company not found: ${companyErr?.message ?? 'unknown'}`)
  }

  // 2. Build template
  let template: DocumentTemplate

  if (req.doc_type === 'articles') {
    template = buildArticlesTemplate({
      company_name:             company.company_name,
      state:                    company.state,
      state_code:               company.state_code,
      principal_office_address: req.params.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]',
      registered_agent_name:    company.registered_agent ?? req.params.registered_agent_name ?? '[REGISTERED AGENT]',
      registered_agent_address: req.params.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]',
      organizer_name:           req.params.organizer_name    ?? '[ORGANIZER NAME]',
      organizer_address:        req.params.organizer_address ?? '[ORGANIZER ADDRESS]',
      management_type:          req.params.management_type   ?? 'member_managed',
      effective_date:           req.params.effective_date,
      purpose:                  req.params.purpose,
      mailing_address:          req.params.mailing_address,
    })

  } else if (req.doc_type === 'operating_agreement') {
    if (!req.subtype) throw new Error('subtype required for operating_agreement')

    const members = req.params.members
    if (!members || members.length === 0) {
      throw new Error('At least one member is required for operating agreement generation.')
    }

    template = buildOATemplate({
      company_name:             company.company_name,
      state:                    company.state,
      state_code:               company.state_code,
      effective_date:           req.params.effective_date ?? new Date().toISOString().split('T')[0],
      members,
      management_type:          req.params.management_type  ?? 'member_managed',
      managers:                 req.params.managers,
      fiscal_year_end:          req.params.fiscal_year_end,
      purpose:                  req.params.purpose,
      principal_office_address: req.params.principal_office_address,
      registered_agent_name:    company.registered_agent ?? req.params.registered_agent_name,
      registered_agent_address: req.params.registered_agent_address,
    }, req.subtype)

  } else {
    throw new Error(`Unknown doc_type: ${req.doc_type}`)
  }

  // 3. Render to PDF buffer
  const pdfBuffer = renderTemplateToPDF(template)

  // 4. Upload to Supabase Storage
  const timestamp   = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName    = `${template.meta.template_id}_${timestamp}.pdf`
  const storagePath = `${req.company_id}/${fileName}`

  const { error: uploadErr } = await supabase.storage
    .from('documents')
    .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: false })

  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`)
  }

  // 5. Delete old document if replacing
  if (req.replace_doc_id) {
    const { data: oldDoc } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', req.replace_doc_id)
      .single()

    if (oldDoc?.file_url && !oldDoc.file_url.startsWith('http')) {
      await supabase.storage.from('documents').remove([oldDoc.file_url])
    }
    await supabase.from('documents').delete().eq('id', req.replace_doc_id)
  }

  // 6. Insert documents record
  const { data: docRecord, error: insertErr } = await supabase
    .from('documents')
    .insert({
      company_id:        req.company_id,
      type:              req.doc_type,
      file_name:         fileName,
      file_url:          storagePath,
      file_size:         pdfBuffer.length,
      mime_type:         'application/pdf',
      status:            'draft',
      template_id:       template.meta.template_id,
      generation_params: req.params,
      generated_at:      new Date().toISOString(),
      generated_by:      adminUserId,
    })
    .select('id')
    .single()

  if (insertErr || !docRecord) {
    throw new Error(`DB insert failed: ${insertErr?.message ?? 'unknown'}`)
  }

  // 7. Signed URL for immediate preview
  const { data: signedData } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60 * 60)

  return {
    document_id: docRecord.id,
    file_name:   fileName,
    file_url:    signedData?.signedUrl ?? storagePath,
    template_id: template.meta.template_id,
    status:      'draft',
  }
}
