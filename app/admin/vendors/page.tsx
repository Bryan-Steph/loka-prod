'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Store, Phone, User, ExternalLink, ChevronDown,
  Loader2, Video, ImageIcon, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationStatus = 'pending' | 'approved' | 'suspended' | 'rejected'

interface VendorDoc {
  id: string
  document_type: string
  front_url: string
  back_url:  string | null
  status:    string
  created_at: string
}

interface VendorRow {
  id:                  string
  shop_name:           string
  shop_avatar_url:     string | null
  address_text:        string | null
  verification_status: VerificationStatus
  suspension_reason:   string | null
  is_active:           boolean
  created_at:          string
  users: { id: string; full_name: string; phone: string | null } | null
  verification_documents: VendorDoc[]
}

const TABS: { label: string; value: string }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Approved',  value: 'approved' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected',  value: 'rejected' },
]

const STATUS_BADGE: Record<VerificationStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-primary/15 text-primary' },
  approved:  { label: 'Approved',  className: 'bg-success/15 text-success' },
  suspended: { label: 'Suspended', className: 'bg-error/15 text-error' },
  rejected:  { label: 'Rejected',  className: 'bg-surface-3 text-muted-foreground' },
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const { label, className } = STATUS_BADGE[status] ?? STATUS_BADGE.pending
  return (
    <span className={cn('rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold', className)}>
      {label}
    </span>
  )
}

function isVideoUrl(url: string): boolean {
  return url.includes('/video/upload/') || /\.(mp4|mov|webm|avi)(\?|$)/i.test(url)
}

function DocPreviewModal({
  doc,
  shopName,
  onClose,
}: {
  doc: VendorDoc
  shopName: string
  onClose: () => void
}) {
  const url   = doc.front_url
  const isVid = isVideoUrl(url)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-surface-1 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-syne text-[15px] font-bold text-foreground">{shopName}</p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              {doc.document_type === 'verification_video' ? 'Verification Video' : 'National ID'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-surface-2"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {isVid ? (
          <video
            src={url}
            controls
            className="w-full rounded-xl bg-black"
            style={{ maxHeight: '400px' }}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <img
            src={url}
            alt="Verification document"
            className="w-full rounded-xl object-contain"
            style={{ maxHeight: '400px' }}
          />
        )}

        {doc.back_url && !isVideoUrl(doc.back_url) && (
          <div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Back</p>
            <img
              src={doc.back_url}
              alt="Document back"
              className="w-full rounded-xl object-contain"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-[12px] text-primary"
        >
          <ExternalLink size={12} />
          Open original in new tab
        </a>
      </div>
    </div>
  )
}

function VendorCard({
  vendor,
  onActionComplete,
}: {
  vendor: VendorRow
  onActionComplete: (id: string, newStatus: VerificationStatus) => void
}) {
  const [showReason, setShowReason] = useState<'reject' | 'suspend' | null>(null)
  const [reason, setReason]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [docModal, setDocModal]     = useState(false)
  const [error, setError]           = useState('')

  const latestDoc = vendor.verification_documents
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  async function doAction(action: 'approve' | 'reject' | 'suspend') {
    if ((action === 'reject' || action === 'suspend') && !reason.trim()) {
      setError('A reason is required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, reason: reason.trim() || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Action failed')
      const statusMap: Record<string, VerificationStatus> = {
        approve: 'approved', reject: 'rejected', suspend: 'suspended',
      }
      onActionComplete(vendor.id, statusMap[action])
      setShowReason(null)
      setReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const status = vendor.verification_status

  return (
    <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
          {vendor.shop_avatar_url ? (
            <img src={vendor.shop_avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Store size={20} className="text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-syne text-[15px] font-bold text-foreground">
              {vendor.shop_name}
            </h3>
            <StatusBadge status={status} />
          </div>

          {vendor.users && (
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <User size={11} />
                {vendor.users.full_name}
              </span>
              {vendor.users.phone && (
                <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                  <Phone size={11} />
                  {vendor.users.phone}
                </span>
              )}
            </div>
          )}

          {vendor.address_text && (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {vendor.address_text}
            </p>
          )}
        </div>

        {/* Submitted date */}
        <div className="shrink-0 text-right">
          <p className="font-mono text-[10px] text-muted-foreground">Submitted</p>
          <p className="font-mono text-[10px] text-foreground">
            {new Date(vendor.created_at).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Suspension reason */}
      {vendor.suspension_reason && (
        <div className="mt-3 rounded-xl bg-error/10 px-3 py-2">
          <p className="font-mono text-[10px] uppercase text-error">Reason</p>
          <p className="mt-0.5 text-[12px] text-foreground">{vendor.suspension_reason}</p>
        </div>
      )}

      {/* Verification document */}
      {latestDoc ? (
        <button
          onClick={() => setDocModal(true)}
          className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 p-3 text-left hover:border-primary/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3">
            {isVideoUrl(latestDoc.front_url)
              ? <Video size={16} className="text-primary" />
              : <ImageIcon size={16} className="text-primary" />
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-foreground">
              {latestDoc.document_type === 'verification_video' ? 'Verification Video' : 'National ID'}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Click to preview
            </p>
          </div>
          <ExternalLink size={14} className="shrink-0 text-primary" />
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
          <AlertTriangle size={14} className="text-muted-foreground" />
          <p className="text-[12px] text-muted-foreground">No verification document submitted</p>
        </div>
      )}

      {/* Action buttons */}
      {status === 'pending' && (
        <div className="mt-4">
          {showReason ? (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError('') }}
                placeholder={`Reason for ${showReason}ing (required)…`}
                rows={2}
                className="w-full resize-none rounded-xl border border-surface-3 bg-surface-2 p-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {error && <p className="text-[11px] text-error">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowReason(null); setReason(''); setError('') }}
                  className="flex h-9 flex-1 items-center justify-center rounded-xl border border-surface-3 text-[12px] text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doAction(showReason)}
                  disabled={loading}
                  className={cn(
                    'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold disabled:opacity-60',
                    showReason === 'reject'
                      ? 'bg-surface-3 text-foreground'
                      : 'bg-error text-background',
                  )}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirm {showReason === 'reject' ? 'Reject' : 'Suspend'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => doAction('approve')}
                disabled={loading}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success text-[13px] font-semibold text-background disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Approve
              </button>
              <button
                onClick={() => { setShowReason('reject'); setError('') }}
                disabled={loading}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 text-[13px] text-foreground disabled:opacity-60 hover:bg-surface-2"
              >
                <XCircle size={14} className="text-muted-foreground" />
                Reject
              </button>
              <button
                onClick={() => { setShowReason('suspend'); setError('') }}
                disabled={loading}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-error/40 px-3 text-[13px] text-error disabled:opacity-60 hover:bg-error/10"
              >
                <AlertTriangle size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'approved' && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => { setShowReason('suspend'); setError('') }}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-error/40 px-3 text-[12px] text-error hover:bg-error/10 disabled:opacity-60"
          >
            <AlertTriangle size={13} />
            Suspend
          </button>
          {showReason === 'suspend' && (
            <div className="mt-2 w-full space-y-2">
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError('') }}
                placeholder="Suspension reason (required)…"
                rows={2}
                className="w-full resize-none rounded-xl border border-surface-3 bg-surface-2 p-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {error && <p className="text-[11px] text-error">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setShowReason(null); setReason(''); setError('') }} className="h-9 flex-1 rounded-xl border border-surface-3 text-[12px] text-foreground">Cancel</button>
                <button onClick={() => doAction('suspend')} disabled={loading} className="flex h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-error text-[12px] font-semibold text-background disabled:opacity-60">
                  {loading && <Loader2 size={13} className="animate-spin" />} Suspend
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Doc preview modal */}
      {docModal && latestDoc && (
        <DocPreviewModal
          doc={latestDoc}
          shopName={vendor.shop_name}
          onClose={() => setDocModal(false)}
        />
      )}
    </div>
  )
}

export default function AdminVendorsPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const activeTab    = (searchParams.get('status') ?? 'pending') as string

  const [vendors, setVendors]     = useState<VendorRow[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const loadVendors = useCallback((status: string) => {
    setLoading(true)
    setError('')
    fetch(`/api/admin/vendors?status=${status}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setVendors(d.vendors ?? [])
        setTotal(d.total ?? 0)
      })
      .catch(() => setError('Failed to load vendors'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadVendors(activeTab)
  }, [activeTab, loadVendors])

  const handleTabChange = (tab: string) => {
    router.push(`/admin/vendors?status=${tab}`)
  }

  const handleStatusChange = (id: string, newStatus: VerificationStatus) => {
    setVendors(prev =>
      prev.map(v => v.id === id ? { ...v, verification_status: newStatus } : v)
    )
  }

  const pendingCount = vendors.filter(v => v.verification_status === 'pending').length

  return (
    <div className="p-5 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-syne text-[24px] font-bold text-foreground">Vendors</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {total} vendor{total !== 1 ? 's' : ''} total
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 font-mono text-[12px] text-primary">
            <Clock size={12} />
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <AlertTriangle size={32} className="text-error" />
          <p className="text-[14px] text-error">{error}</p>
          <button
            onClick={() => loadVendors(activeTab)}
            className="mt-2 rounded-xl border border-surface-3 px-4 py-2 text-[13px] text-foreground"
          >
            Retry
          </button>
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Store size={40} className="text-muted-foreground" />
          <p className="font-syne text-[16px] font-bold text-foreground">
            No {activeTab !== 'all' ? activeTab : ''} vendors
          </p>
          <p className="text-[13px] text-muted-foreground">
            {activeTab === 'pending'
              ? 'All vendors have been reviewed.'
              : 'No vendors match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map(vendor => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onActionComplete={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}