// ─── Shared types for document templates and generation ───────────────────────

export type DocType = 'articles' | 'operating_agreement'
export type OASubtype = 'single_member' | 'multi_member' | 'manager_managed'
export type ManagementType = 'member_managed' | 'manager_managed'
export type DocumentStatus = 'draft' | 'final' | 'uploaded'

// ── Template section types ─────────────────────────────────────────────────────
export type SectionType =
  | 'title'            // Large centered title
  | 'subtitle'         // Smaller centered subtitle
  | 'section_heading'  // Bold left-aligned section number + heading
  | 'paragraph'        // Body text paragraph
  | 'numbered_list'    // Numbered list items
  | 'bullet_list'      // Bulleted list items
  | 'signature_block'  // Signature lines at end
  | 'watermark_notice' // DRAFT / FOR REVIEW notice
  | 'horizontal_rule'  // Visual separator
  | 'spacer'           // Vertical whitespace

export interface DocSection {
  type: SectionType
  text?: string               // Main content string
  items?: string[]            // For list types
  bold?: boolean              // Extra emphasis
  indent?: boolean            // Indent paragraph
  centered?: boolean          // Center-align text
  height?: number             // For spacer: points of space
}

// ── Template metadata ──────────────────────────────────────────────────────────
export interface TemplateMeta {
  template_id:   string          // e.g. 'articles_CO', 'oa_single_member'
  document_type: DocType
  subtype?:      OASubtype
  state:         string          // e.g. 'Wyoming'
  state_code:    string          // e.g. 'WY'
  title:         string          // Document title
  version:       string          // e.g. '1.0'
  disclaimer:    string          // Legal disclaimer shown in doc
}

export interface DocumentTemplate {
  meta:     TemplateMeta
  sections: DocSection[]
}

// ── Articles of Organization params ───────────────────────────────────────────
export interface ArticlesParams {
  company_name:             string
  state:                    string
  state_code:               string
  principal_office_address: string
  mailing_address?:         string    // if different from principal
  registered_agent_name:    string
  registered_agent_address: string
  organizer_name:           string
  organizer_address:        string
  management_type:          ManagementType
  effective_date?:          string    // ISO date string, defaults to filing date
  purpose?:                 string    // optional business purpose
}

// ── Operating Agreement params ─────────────────────────────────────────────────
export interface OAMember {
  name:                string
  address:             string
  ownership_percentage: number   // 0-100
  capital_contribution?: string  // e.g. "$1,000"
}

export interface OperatingAgreementParams {
  company_name:     string
  state:            string
  state_code:       string
  effective_date:   string
  members:          OAMember[]
  management_type:  ManagementType
  managers?:        string[]     // manager names if manager-managed
  fiscal_year_end?: string       // default "December 31"
  purpose?:         string
  principal_office_address?: string
  registered_agent_name?:    string
  registered_agent_address?: string
}

// ── Generation request (API body) ─────────────────────────────────────────────
export interface GenerationRequest {
  company_id:   string
  doc_type:     DocType
  subtype?:     OASubtype
  params:       Partial<ArticlesParams> & Partial<OperatingAgreementParams>
  replace_doc_id?: string   // if regenerating, replace existing record
}

export interface GenerationResult {
  document_id: string
  file_name:   string
  file_url:    string
  template_id: string
  status:      DocumentStatus
  html?:       string
  success?:    boolean
}
