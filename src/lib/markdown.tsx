import { createElement, Fragment } from 'react'
import type { ReactNode } from 'react'

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /\*\*(.+?)\*\*|\$\$([\s\S]+?)\$\$|\$(.+?)\$/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    if (match[1] !== undefined) {
      nodes.push(createElement('strong', { key: `${keyPrefix}-b-${key++}`, className: 'font-semibold text-white' }, match[1]))
    } else {
      const codeContent = match[2] !== undefined ? match[2] : match[3]
      nodes.push(
        createElement(
          'code',
          {
            key: `${keyPrefix}-c-${key++}`,
            className: 'px-1.5 py-0.5 rounded bg-white/10 text-indigo-200 font-mono text-[0.9em]',
          },
          codeContent,
        ),
      )
    }
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

export function renderFormattedContent(text: string): ReactNode {
  if (!text || text.trim().length === 0) return null

  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let listBuffer: string[] = []
  let paragraphBuffer: string[] = []
  let blockKey = 0

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    const content = paragraphBuffer.join(' ')
    blocks.push(
      createElement(
        'p',
        { key: `p-${blockKey}`, className: 'leading-relaxed text-slate-200' },
        parseInline(content, `p-${blockKey++}`),
      ),
    )
    paragraphBuffer = []
  }

  const flushList = () => {
    if (listBuffer.length === 0) return
    blocks.push(
      createElement(
        'ul',
        { key: `ul-${blockKey}`, className: 'list-disc pl-5 space-y-1 text-slate-200' },
        listBuffer.map((item, idx) =>
          createElement('li', { key: idx }, parseInline(item, `li-${blockKey}-${idx}`)),
        ),
      ),
    )
    blockKey += 1
    listBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line.length === 0) {
      flushList()
      flushParagraph()
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushList()
      flushParagraph()
      const level = headingMatch[1].length
      const content = headingMatch[2]
      const headingClass =
        level === 1
          ? 'text-2xl font-bold text-white mt-1'
          : level === 2
            ? 'text-xl font-bold text-white mt-1'
            : level === 3
              ? 'text-lg font-bold text-white mt-1'
              : 'text-base font-semibold text-white mt-1'
      blocks.push(
        createElement(
          `h${Math.min(level, 6)}`,
          { key: `h-${blockKey}`, className: headingClass },
          parseInline(content, `h-${blockKey++}`),
        ),
      )
      continue
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/)
    if (listMatch) {
      flushParagraph()
      listBuffer.push(listMatch[1])
      continue
    }

    flushList()
    paragraphBuffer.push(line)
  }

  flushList()
  flushParagraph()

  return createElement(Fragment, null, ...blocks)
}
