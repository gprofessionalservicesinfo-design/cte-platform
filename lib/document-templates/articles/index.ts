import type { ArticlesParams, DocumentTemplate } from '../types'
import { buildColoradoArticles } from './CO'
import { buildWyomingArticles }  from './WY'
import { buildFloridaArticles }  from './FL'
import { buildTexasArticles }    from './TX'

const BUILDERS: Record<string, (p: ArticlesParams) => DocumentTemplate> = {
  CO: buildColoradoArticles,
  WY: buildWyomingArticles,
  FL: buildFloridaArticles,
  TX: buildTexasArticles,
}

export function buildArticlesTemplate(p: ArticlesParams): DocumentTemplate {
  const builder = BUILDERS[p.state_code.toUpperCase()]
  if (!builder) {
    throw new Error(
      `No Articles of Organization template for state "${p.state_code}". ` +
      `Supported states: ${Object.keys(BUILDERS).join(', ')}.`
    )
  }
  return builder(p)
}

export const SUPPORTED_ARTICLES_STATES = Object.keys(BUILDERS)
