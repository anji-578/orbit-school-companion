type Props = { title: string; action?: { label: string; onClick: () => void }; first?: boolean }

export function SectionHeader({ title, action, first }: Props) {
  return (
    <div className={`mb-3 flex items-center justify-between ${first ? 'mt-0' : 'mt-6'}`}>
      <h2 className="o-label">{title}</h2>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="o-focus -my-2 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-o-primary"
        >
          {action.label}
          <span aria-hidden>→</span>
        </button>
      ) : null}
    </div>
  )
}
