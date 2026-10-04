import { useMemo, useState } from 'react'
import { useOrbitStore } from '../../../store/orbitStore'
import { SaCard, SaChip, SaSection } from '../components/SaUi'
import { AlertsPanel } from '../../shared/AlertsPanel'
import { EmptyState, ICON, IconTile } from '@/shared/ui/orbit'
import { useStudentNav } from '../StudentNavContext'
import { routeForNotification } from '@/domain/notifications/notification-route'

/** Glance announcements + optional push preferences. */
export function StudentAnnouncements() {
  const { push } = useStudentNav()
  const notifications = useOrbitStore((s) => s.notifications)
  const markNotificationRead = useOrbitStore((s) => s.markNotificationRead)
  const markAllNotificationsRead = useOrbitStore((s) => s.markAllNotificationsRead)
  const refreshNotifications = useOrbitStore((s) => s.refreshNotifications)
  const Bell = ICON.chrome.bell
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const visible = useMemo(() => {
    const mine = notifications.filter((n) => n.role === 'student' || n.role === 'all')
    return filter === 'unread' ? mine.filter((n) => n.unread) : mine
  }, [notifications, filter])

  return (
    <div className="space-y-5 pb-4">
      <SaSection
        eyebrow="Inbox"
        title="What needs your attention"
        action={
          <button
            type="button"
            className="o-focus inline-flex min-h-11 items-center text-[13px] font-semibold text-o-primary"
            onClick={() => {
              markAllNotificationsRead()
              void refreshNotifications()
            }}
          >
            Mark all read
          </button>
        }
      >
        <div className="flex gap-2">
          <SaChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </SaChip>
          <SaChip active={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread
          </SaChip>
        </div>
        {visible.length === 0 ? (
          <EmptyState
            art="/art/caught-up.svg"
            title={filter === 'unread' ? 'No unread notifications' : 'No announcements right now'}
            body="School notices will land here."
          />
        ) : (
          <SaCard className="divide-y divide-o-border p-1">
            <ul>
              {visible.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id)
                      const route = routeForNotification({
                        eventType: n.eventType,
                        title: n.title,
                        body: n.body,
                      })
                      if (route.dest !== 'alerts') push(route.dest, route.params, route.title)
                    }}
                    className={`o-focus flex min-h-14 w-full items-start gap-3 px-3 py-3.5 text-left ${n.unread ? 'bg-o-primary/5' : ''}`}
                  >
                    <IconTile icon={Bell} tone="blue" size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-o-text">{n.title}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-o-muted">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-o-faint">{n.time}</span>
                  </button>
                </li>
              ))}
            </ul>
          </SaCard>
        )}
      </SaSection>

      <SaSection eyebrow="Settings" title="Alert preferences">
        <div className="student-embed -mx-1">
          <AlertsPanel />
        </div>
      </SaSection>
    </div>
  )
}
