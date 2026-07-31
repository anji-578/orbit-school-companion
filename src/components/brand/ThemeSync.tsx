import { useEffect } from 'react'
import { useOrbitStore } from '../../store/orbitStore'

/** Syncs persisted theme onto <html data-theme> for CSS + logo swaps. */
export function ThemeSync() {
  const theme = useOrbitStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F7FC' : '#0B1F44')
    const icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (icon) {
      icon.href = theme === 'light' ? '/brand/orbit-icon-light.png?v6' : '/brand/orbit-icon-dark.png?v6'
    }
  }, [theme])

  return null
}
