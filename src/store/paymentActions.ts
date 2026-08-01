import { initialFees } from '../data/demo'
import {
  createPaymentSubmission,
  fetchPaymentSubmissions,
  fetchSchoolPaymentSettings,
  reviewPaymentSubmission,
  saveSchoolPaymentSettings,
} from '../lib/paymentsApi'
import { FEE_PAGE_SIZE, fetchFeeItemsPage, markAllFeesPaid, markFeeItemsStatus } from '../lib/feesApi'
import { isSupabaseConfigured } from '../lib/supabase'
import { withSample } from '../lib/sampleData'
import { friendlyError } from '../lib/errors'

/** Payment / fee ledger actions extracted from orbitStore. */
// Zustand set/get typed loosely so slice helpers stay decoupled from OrbitState.
// oxlint-disable-next-line typescript/no-explicit-any
export function createPaymentActions(set: any, get: any) {
  return {
    setPaymentMethod: (paymentMethod: string) => set({ paymentMethod }),
    setUpiId: (upiId: string) => set({ upiId }),

    nudgeFeeParents: () => {
      get().pushNotification({
        role: 'parent',
        title: 'Fee reminder',
        body: 'School accounts nudged families with pending dues.',
      })
      get().triggerToast('Fee reminder notifications queued for pending accounts.')
    },

    setSchoolPaymentSettings: (patch: Record<string, unknown>) =>
      set((s: { schoolPaymentSettings: Record<string, unknown> }) => ({
        schoolPaymentSettings: { ...s.schoolPaymentSettings, ...patch },
      })),

    loadPaymentWorkspace: async () => {
      const cloud = isSupabaseConfigured()
      const childId = get().linkedStudent?.id as string | undefined
      const [settings, submissions, feePage] = await Promise.all([
        fetchSchoolPaymentSettings(),
        fetchPaymentSubmissions(),
        fetchFeeItemsPage(childId, { offset: 0, limit: FEE_PAGE_SIZE }),
      ])
      const fees = feePage.items
      const outstandingFees = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0)
      const filledFees = withSample(fees, initialFees)
      set((s: { paymentSubmissions: { id: string }[]; showingSampleData: boolean }) => ({
        schoolPaymentSettings: settings,
        paymentSubmissions: cloud
          ? submissions.filter((p) => !p.id.startsWith('local_'))
          : submissions.length
            ? submissions
            : s.paymentSubmissions.filter((p) => !p.id.startsWith('local_')),
        fees: filledFees,
        feesHasMore: cloud ? feePage.hasMore : false,
        outstandingFees: cloud
          ? outstandingFees
          : filledFees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0),
        showingSampleData: cloud ? false : Boolean(s.showingSampleData || fees.length === 0),
      }))
    },

    loadMoreFees: async () => {
      if (!isSupabaseConfigured() || !get().feesHasMore) return
      const childId = get().linkedStudent?.id as string | undefined
      const offset = get().fees.length as number
      const page = await fetchFeeItemsPage(childId, { offset, limit: FEE_PAGE_SIZE })
      if (!page.items.length) {
        set({ feesHasMore: false })
        return
      }
      set((s: { fees: { id: string; status: string; amount: number }[] }) => {
        const seen = new Set(s.fees.map((f) => f.id))
        const merged = [...s.fees, ...page.items.filter((f) => !seen.has(f.id))]
        return {
          fees: merged,
          feesHasMore: page.hasMore,
          outstandingFees: merged.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0),
        }
      })
    },

    submitUtrPayment: async (input: {
      amount: number
      utr: string
      paidOn: string
      note: string
      payerName: string
      userId?: string
    }) => {
      if (!input.utr.trim() || input.amount <= 0) {
        get().triggerToast('Enter a valid UTR and amount.')
        return false
      }
      const result = await createPaymentSubmission({
        ...input,
        studentId: get().linkedStudent?.id,
      })
      if (!result.ok) {
        get().triggerToast(friendlyError(result.error))
        return false
      }
      const studentId = result.submission.studentId
      set((s: { fees: { studentId?: string; status: string; amount: number }[]; paymentSubmissions: unknown[] }) => {
        const fees = s.fees.map((f) => {
          const sameChild = !studentId || !f.studentId || f.studentId === studentId
          return sameChild && f.status !== 'Paid' ? { ...f, status: 'Pending' as const } : f
        })
        return {
          paymentSubmissions: [result.submission, ...s.paymentSubmissions],
          fees,
          outstandingFees: fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0),
        }
      })
      const feeMark = await markFeeItemsStatus('Pending', studentId)
      if (!feeMark.ok) {
        get().triggerToast(friendlyError(`UTR saved, but fee status update failed: ${feeMark.error}`))
      } else {
        get().pushNotification({
          role: 'school',
          title: 'UTR payment submitted',
          body: `${input.payerName || 'Parent'} submitted UTR ${input.utr} for ₹${input.amount.toLocaleString()}.`,
        })
        get().pushNotification({
          role: 'parent',
          title: 'Payment under review',
          body: `UTR ${input.utr} submitted. School will verify shortly.`,
        })
        get().triggerToast('UTR submitted for school verification.')
      }
      return true
    },

    reviewUtrPayment: async (id: string, status: 'Verified' | 'Rejected', reviewerId?: string) => {
      const target = get().paymentSubmissions.find((p: { id: string }) => p.id === id) as
        | { amount?: number; studentId?: string; studentName?: string }
        | undefined
      const result = await reviewPaymentSubmission(id, status, reviewerId)
      if (!result.ok) {
        get().triggerToast(friendlyError(result.error ?? 'Could not update payment on server.'))
        return
      }

      if (status !== 'Verified') {
        set((s: { paymentSubmissions: { id: string; status: string }[] }) => ({
          paymentSubmissions: s.paymentSubmissions.map((p) => (p.id === id ? { ...p, status } : p)),
        }))
        get().pushNotification({
          role: 'parent',
          title: 'Payment rejected',
          body: 'School could not verify the UTR. Please check and resubmit.',
        })
        get().triggerToast('Payment marked rejected.')
        return
      }

      const amount = target?.amount ?? 0
      const studentId = target?.studentId
      const feeMark = await markAllFeesPaid(studentId)
      if (!feeMark.ok) {
        get().triggerToast(friendlyError(feeMark.error ?? 'UTR verified but could not mark fee invoices paid.'))
        set((s: { paymentSubmissions: { id: string; status: string }[] }) => ({
          paymentSubmissions: s.paymentSubmissions.map((p) => (p.id === id ? { ...p, status } : p)),
        }))
        return
      }

      const receiptId = `UTR-${Math.floor(10000 + Math.random() * 90000)}`
      const date = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      })

      set((s: {
        fees: { studentId?: string; status: string; amount: number }[]
        paymentSubmissions: { id: string }[]
        paymentHistory: unknown[]
      }) => {
        const fees = s.fees.map((f) => {
          if (studentId && f.studentId && f.studentId !== studentId) return f
          if (!studentId && f.studentId) return f
          return { ...f, status: 'Paid' as const }
        })
        const outstandingFees = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0)
        return {
          paymentSubmissions: s.paymentSubmissions.map((p) => (p.id === id ? { ...p, status } : p)),
          outstandingFees,
          fees,
          paymentHistory: [
            {
              id: Date.now(),
              name: target?.studentName
                ? `UPI / UTR · ${target.studentName}`
                : 'UPI / UTR settlement',
              amount,
              status: 'Paid' as const,
              date,
              receiptId,
            },
            ...s.paymentHistory,
          ],
          paymentReceipt: { id: receiptId, date, amount, ref: id },
        }
      })
      get().pushNotification({
        role: 'parent',
        title: 'Fee payment verified',
        body: `UTR payment of ₹${amount.toLocaleString()} verified by school.`,
      })
      get().triggerToast('Payment verified · fees cleared.')
    },

    persistSchoolPaymentSettings: async () => {
      const settings = get().schoolPaymentSettings
      const result = await saveSchoolPaymentSettings(settings)
      if (!result.ok) {
        get().triggerToast(friendlyError(result.error ?? 'Could not save payment settings.'))
        return
      }
      get().triggerToast('School UPI / bank details saved.')
    },
  }
}
