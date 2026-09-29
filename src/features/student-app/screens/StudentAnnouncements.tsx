import { useOrbitStore } from '../../../store/orbitStore'
import { SaCard, SaSection } from '../components/SaUi'
import { AlertsPanel } from '../../shared/AlertsPanel'

/** Glance announcements + optional push preferences (Level 3). */
export function StudentAnnouncements() {
  const notifications = useOrbitStore((s) => s.notifications)
  const markNotificationRead = useOrbitStore((s) => s.markNotificationRead)
  const markAllNotificationsRead = useOrbitStore((s) => s.markAllNotificationsRead)
  const refreshNotifications = useOrbitStore((s) => s.refreshNotifications)

  const visible = notifications.filter((n) => n.role === 'student' || n.role === 'all')

  return (
    <div className="space-y-5 pb-4">
      <SaSection
        eyebrow="Inbox"
        title="What needs your attention"
        action={
          <button
            type="button"
            className="text-[10px] font-bold text-[var(--accent)]"
            onClick={() => {
              markAllNotificationsRead()
              void refreshNotifications()
            }}
          >
            Mark all read
          </button>
        }
      >
        <SaCard className="p-1">
          {visible.length === 0 ? (
            <p className="p-4 text-xs text-[var(--muted)]">No announcements right now.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {visible.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left px-3.5 py-3.5 ${n.unread ? 'bg-[var(--accent)]/5' : ''}`}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-bold text-[var(--fg)]">{n.title}</p>
                      <span className="text-[9px] text-[var(--muted)] shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">{n.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Settings" title="Alert preferences">
        <div className="student-embed -mx-1">
          <AlertsPanel />
        </div>
      </SaSection>
    </div>
  )
}
