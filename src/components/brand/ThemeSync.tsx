import { useEffect } from 'react'
import { useOrbitStore } from '../../store/orbitStore'
import { resolveTheme } from '@/domain/theme/resolve-theme'

/** Syncs persisted theme onto <html data-theme> for CSS + logo swaps. */
export function ThemeSync() {
  const theme = useOrbitStore((s) => s.theme)
  const largerText = useOrbitStore((s) => s.largerText)
  const reduceMotion = useOrbitStore((s) => s.reduceMotion)

  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const resolved = resolveTheme(theme, prefersDark)
      const root = document.documentElement
      root.dataset.theme = resolved
      root.style.colorScheme = resolved
      root.dataset.a11yText = largerText ? 'large' : 'default'
      root.dataset.a11yMotion = reduceMotion ? 'reduce' : 'full'
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', resolved === 'light' ? '#F4F7FC' : '#0B1F44')
      const icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
      if (icon) {
        icon.href = resolved === 'light' ? '/brand/orbit-icon-light.png?v11' : '/brand/orbit-icon-dark.png?v11'
      }
    }
    apply()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme, largerText, reduceMotion])

  return null
}

