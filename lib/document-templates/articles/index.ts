import type { ArticlesParams, DocumentTemplate } from '../types'
import { buildColoradoArticles }   from './CO'
import { buildWyomingArticles }    from './WY'
import { buildFloridaArticles }    from './FL'
import { buildTexasArticles }      from './TX'
import { buildDelawareArticles }   from './DE'
import { buildNewMexicoArticles }  from './NM'
import { buildGenericArticles }    from './generic'

const BUILDERS: Record<string, (p: ArticlesParams) => DocumentTemplate> = {
  CO: buildColoradoArticles,
  WY: buildWyomingArticles,
  FL: buildFloridaArticles,
  TX: buildTexasArticles,
  DE: buildDelawareArticles,
  NM: buildNewMexicoArticles,
}

export function buildArticlesTemplate(p: ArticlesParams): DocumentTemplate {
  const code    = (p.state_code ?? '').toUpperCase()
  const builder = BUILDERS[code]
  // Fall back to generic template for unsupported states instead of throwing
  return builder ? builder(p) : buildGenericArticles(p)
}

export const SUPPORTED_ARTICLES_STATES = Object.keys(BUILDERS)
