'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Pointer, Eye, Navigation, ImageIcon } from 'lucide-react'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import type { Map, Marker, LeafletMouseEvent } from 'leaflet'

const DEFAULT_LAT = 5.9597
const DEFAULT_LNG = 10.1455

export default function LocationStepPage() {
  const router = useRouter()
  const mapRef  = useRef<HTMLDivElement>(null)
const leaflet = useRef<{ map: Map; marker: Marker } | null>(null)


  const [lat, setLat]           = useState(DEFAULT_LAT)
  const [lng, setLng]           = useState(DEFAULT_LNG)
  const [address, setAddress]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    let mounted = true
    import('leaflet').then((L) => {
      if (!mounted || !mapRef.current || leaflet.current) return

      const link = document.createElement('link')
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom:   15,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const icon = L.icon({
        iconUrl:      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize:     [25, 41],
        iconAnchor:   [12, 41],
      })

      const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon, draggable: true }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setLat(pos.lat)
        setLng(pos.lng)
      })

    map.on('click', (e: LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        setLat(e.latlng.lat)
        setLng(e.latlng.lng)
      })

      leaflet.current = { map, marker }
    })

    return () => { mounted = false }
  }, [])

  const handleConfirm = async () => {
    if (!address.trim()) { setError('Please confirm your address'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/vendors/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude:     lat,
          longitude:    lng,
          address_text: address.trim(),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save location')
      }
      router.push('/identity')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout
      step={3}
      backHref="/shop"
      topTitle="Your Shed Location"
      footer={
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/shop')}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-surface-3 text-sm text-foreground"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            <MapPin size={16} />
            {saving ? 'Saving...' : 'Confirm Location'}
          </button>
        </div>
      }
    >
      <div className="px-4 pt-4">
        <h2 className="font-heading text-[22px] text-foreground">
          Pin Your Shed on the Map
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Buyers will see exactly where your shed is before visiting.
        </p>
      </div>

      {/* Real map */}
      <div
        ref={mapRef}
        className="relative m-4 h-[220px] overflow-hidden rounded-2xl border border-surface-3"
      />

      <div className="mx-4 flex items-center gap-2 rounded-xl bg-surface-2 p-3.5">
        <Pointer size={16} className="shrink-0 text-primary" />
        <p className="text-[13px] text-muted-foreground">
          Tap the map to drop your pin. Drag to adjust.
        </p>
      </div>

      <div className="m-4 rounded-xl border border-surface-3 bg-surface-1 p-4">
        <label className="mb-2 block text-[13px] text-foreground">
          Confirm your address
        </label>
        <div className="relative">
          <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Commercial Avenue, Shed 14A, Bamenda"
            className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
          This address is shown to buyers after they pay.
        </p>
        {error && <p className="mt-2 text-xs text-error">{error}</p>}
      </div>

      <div className="mx-4 mb-4 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <Eye size={14} className="text-primary" />
          <span className="text-xs text-primary">How buyers see your location</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-lg bg-surface-1">
            <ImageIcon size={20} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-foreground">Your shop · {address || 'Your address here'}</p>
            <span className="mt-1 flex items-center gap-1 text-xs text-primary">
              <Navigation size={14} />
              Get Directions
            </span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}