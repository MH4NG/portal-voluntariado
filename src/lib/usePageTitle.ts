import { useEffect } from 'react'
import { SITE } from '../config'

/** Define o <title> da página (WCAG 2.4.2). Sem argumento, usa o título padrão. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`
  }, [title])
}
