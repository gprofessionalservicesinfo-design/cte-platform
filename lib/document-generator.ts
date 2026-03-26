import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DocumentTemplate, DocSection, GenerationRequest, GenerationResult } from './document-templates/types'
import { buildArticlesTemplate } from './document-templates/articles'
import { buildOATemplate }       from './document-templates/operating-agreement'

// ─── PDF rendering ────────────────────────────────────────────────────────────

const FONT_REGULAR = 'Helvetica'
const FONT_BOLD    = 'Helvetica-Bold'
const MARGIN       = 72   // 1 inch
const BODY_WIDTH   = 451  // 8.5in - 2in margins (pt)

function renderSections(doc: PDFKit.PDFDocument, sections: DocSection[]): void {
  for (const section of sections) {
    switch (section.type) {

      case 'watermark_notice': {
        doc
          .fontSize(8)
          .font(FONT_BOLD)
          .fillColor('#DC2626')
          .text(
            'DRAFT — FOR REVIEW ONLY — NOT A FILED LEGAL DOCUMENT',
            MARGIN, doc.y,
            { align: 'center', width: BODY_WIDTH },
          )
          .fillColor('#000000')
          .moveDown(0.5)
        break
      }

      case 'title': {
        doc
          .fontSize(16)
          .font(FONT_BOLD)
          .text(section.text ?? '', MARGIN, doc.y, {
            align: section.centered ? 'center' : 'left',
            width: BODY_WIDTH,
          })
          .moveDown(0.3)
        break
      }

      case 'subtitle': {
        doc
          .fontSize(11)
          .font(FONT_REGULAR)
          .text(section.text ?? '', MARGIN, doc.y, {
            align: section.centered ? 'center' : 'left',
            width: BODY_WIDTH,
          })
          .moveDown(0.2)
        break
      }

      case 'section_heading': {
        doc.moveDown(0.5)
        doc
          .fontSize(11)
          .font(FONT_BOLD)
          .text(section.text ?? '', MARGIN, doc.y, {
            align: 'left',
            width: BODY_WIDTH,
            underline: true,
          })
          .moveDown(0.3)
        break
      }

      case 'paragraph': {
        const x = section.indent ? MARGIN + 24 : MARGIN
        const w = section.indent ? BODY_WIDTH - 24 : BODY_WIDTH
        doc
          .fontSize(10)
          .font(section.bold ? FONT_BOLD : FONT_REGULAR)
          .text(section.text ?? '', x, doc.y, {
            align: section.centered ? 'center' : 'left',
            width: w,
          })
          .moveDown(0.4)
        break
      }

      case 'numbered_list': {
        const items = section.items ?? []
        items.forEach((item, idx) => {
          const label = `${idx + 1}.`
          const x = MARGIN + 20
          const w = BODY_WIDTH - 20
          doc
            .fontSize(10)
            .font(FONT_BOLD)
            .text(label, MARGIN, doc.y, { continued: true, width: 20 })
            .font(FONT_REGULAR)
            .text(' ' + item, x, doc.y, { width: w })
            .moveDown(0.35)
        })
        break
      }

      case 'bullet_list': {
        const items = section.items ?? []
        items.forEach((item) => {
          doc
            .fontSize(10)
            .font(FONT_REGULAR)
            .text('• ' + item, MARGIN + 12, doc.y, { width: BODY_WIDTH - 12 })
            .moveDown(0.3)
        })
        break
      }

      case 'signature_block': {
        const items = section.items ?? []
        items.forEach((item) => {
          if (item === '') {
            doc.moveDown(0.5)
          } else {
            doc
              .fontSize(10)
              .font(FONT_REGULAR)
              .text(item, MARGIN, doc.y, { width: BODY_WIDTH })
              .moveDown(0.3)
          }
        })
        break
      }

      case 'horizontal_rule': {
        const y = doc.y
        doc
          .moveTo(MARGIN, y)
          .lineTo(MARGIN + BODY_WIDTH, y)
          .strokeColor('#999999')
          .lineWidth(0.5)
          .stroke()
          .strokeColor('#000000')
          .lineWidth(1)
          .moveDown(0.4)
        break
      }

      case 'spacer': {
        const pts = section.height ?? 12
        doc.moveDown(pts / 12)
        break
      }
    }
  }
}

function buildFooter(doc: PDFKit.PDFDocument, meta: DocumentTemplate['meta']): void {
  const range = doc.bufferedPageRange()
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i)
    const pageNum  = i + 1
    const total    = range.count
    const bottomY  = doc.page.height - 40
    doc
      .fontSize(8)
      .font(FONT_REGULAR)
      .fillColor('#666666')
      .text(
        `${meta.title} — ${meta.state} — Page ${pageNum} of ${total}`,
        MARGIN, bottomY,
        { align: 'center', width: BODY_WIDTH },
      )
      .text(
        meta.disclaimer,
        MARGIN, bottomY + 12,
        { align: 'center', width: BODY_WIDTH },
      )
      .fillColor('#000000')
  }
}

export async function renderTemplateToPDF(template: DocumentTemplate): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Fix pdfkit AFM font path for Next.js
    process.env.PDFKIT_AFM_PATH = require('path').join(process.cwd(), 'node_modules/pdfkit/js/data')
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: MARGIN, bottom: 60, left: MARGIN, right: MARGIN },
      bufferPages: true,
      info: {
        Title:   template.meta.title,
        Subject: template.meta.document_type,
        Creator: 'CreaTuEmpresaUSA Platform',
      },
    })

    const chunks: Buffer[] = []
    doc.on('data',  (chunk) => chunks.push(chunk))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    renderSections(doc, template.sections)
    buildFooter(doc, template.meta)

    doc.end()
  })
}

// ─── Generation entry point ───────────────────────────────────────────────────

export async function generateDocument(
  req: GenerationRequest,
  supabase: SupabaseClient,
  adminUserId: string,
): Promise<GenerationResult> {
  // 1. Fetch company (and client) from Supabase — admin bypass via service role or admin RLS
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
    const p = {
      company_name:               company.company_name,
      state:                      company.state,
      state_code:                 company.state_code,
      // Fields not in companies table must come from req.params
      principal_office_address:   req.params.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]',
      registered_agent_name:      company.registered_agent            ?? req.params.registered_agent_name    ?? '[REGISTERED AGENT]',
      registered_agent_address:   req.params.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]',
      organizer_name:             req.params.organizer_name           ?? '[ORGANIZER NAME]',
      organizer_address:          req.params.organizer_address        ?? '[ORGANIZER ADDRESS]',
      management_type:            req.params.management_type          ?? 'member_managed',
      effective_date:             req.params.effective_date,
      purpose:                    req.params.purpose,
      mailing_address:            req.params.mailing_address,
    } as Parameters<typeof buildArticlesTemplate>[0]

    template = buildArticlesTemplate(p)

  } else if (req.doc_type === 'operating_agreement') {
    if (!req.subtype) throw new Error('subtype required for operating_agreement')
    const members = req.params.members
    if (!members || members.length === 0) {
      throw new Error('At least one member is required for operating agreement generation.')
    }

    const p = {
      company_name:               company.company_name,
      state:                      company.state,
      state_code:                 company.state_code,
      effective_date:             req.params.effective_date ?? new Date().toISOString().split('T')[0],
      members,
      management_type:            req.params.management_type ?? 'member_managed',
      managers:                   req.params.managers,
      fiscal_year_end:            req.params.fiscal_year_end,
      purpose:                    req.params.purpose,
      principal_office_address:   req.params.principal_office_address,
      registered_agent_name:      company.registered_agent ?? req.params.registered_agent_name,
      registered_agent_address:   req.params.registered_agent_address,
    } as Parameters<typeof buildOATemplate>[0]

    template = buildOATemplate(p, req.subtype)

  } else {
    throw new Error(`Unknown doc_type: ${req.doc_type}`)
  }

  // 3. Render to PDF
  const pdfBuffer = await renderTemplateToPDF(template)

  // 4. Upload to Supabase Storage
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName  = `${template.meta.template_id}_${timestamp}.pdf`
  const storagePath = `${req.company_id}/${fileName}`

  const { error: uploadErr } = await supabase.storage
    .from('documents')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`)
  }

  // 5. If replacing a document, delete the old one
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
      type:              req.doc_type,          // 'articles' | 'operating_agreement'
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

  // 7. Build a signed URL for immediate access
  const { data: signedData } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60 * 60) // 1 hour

  return {
    document_id:  docRecord.id,
    file_name:    fileName,
    file_url:     signedData?.signedUrl ?? storagePath,
    template_id:  template.meta.template_id,
    status:       'draft',
  }
}
