'use client'
// location/page.tsx
import Link from 'next/link'
import {
  MapPin,
  Plus,
  Minus,
  Pointer,
  Eye,
  Navigation,
  ImageIcon,
} from 'lucide-react'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'

export default function LocationStepPage() {
  return (
    <OnboardingLayout
      step={3}
      backHref="/shop"
      topTitle="Your Shed Location"
      footer={
        <div className="flex gap-3">
          <Link
            href="/shop"
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-surface-3 text-sm text-foreground"
          >
            Back
          </Link>
          <Link
            href="/identity"
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground"
          >
            <MapPin size={16} />
            Confirm Location
          </Link>
        </div>
      }
    >
      <div className="px-4 pt-4">
        <h2 className="font-heading text-[22px] text-foreground">
          Pin Your Shed on the Map
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Buyers will see exactly where your shed is before visiting.
          GPS-accurate location increases trust.
        </p>
      </div>

      {/* Map container */}
      <div
        className="relative m-4 h-[200px] overflow-hidden rounded-2xl border border-surface-3 bg-surface-2"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 19px, var(--surface-3) 19px, var(--surface-3) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, var(--surface-3) 19px, var(--surface-3) 20px)',
        }}
      >
        {/* Pin with ripple */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            <span className="absolute h-16 w-16 rounded-full bg-primary/20 animate-loka-ripple" />
            <span className="absolute h-16 w-16 rounded-full bg-primary/10 animate-loka-ripple [animation-delay:1s]" />
            <MapPin size={48} className="relative text-primary" />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-3 bg-surface-1 text-foreground">
            <Plus size={16} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-3 bg-surface-1 text-foreground">
            <Minus size={16} />
          </button>
        </div>

        {/* Attribution */}
        <span className="absolute bottom-2 left-2 font-mono text-[9px] text-muted-foreground">
          Map · Leaflet.js + OpenStreetMap
        </span>

        {/* Area label */}
        <span className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[10px] text-primary">
          Commercial Avenue area, Bamenda
        </span>
      </div>

      {/* Tap instruction */}
      <div className="mx-4 flex items-center gap-2 rounded-xl bg-surface-2 p-3.5">
        <Pointer size={16} className="shrink-0 text-primary" />
        <p className="text-[13px] text-muted-foreground">
          Tap the map to drop your pin. Drag to adjust.
        </p>
      </div>

      {/* Address field */}
      <div className="m-4 rounded-xl border border-surface-3 bg-surface-1 p-4">
        <label className="mb-2 block text-[13px] text-foreground">
          Confirm your address
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
          />
          <input
            placeholder="e.g. Commercial Avenue, Shed 14A, Bamenda"
            className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
          This address is shown to buyers after they pay.
        </p>
      </div>

      {/* Buyer preview */}
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
            <p className="text-xs text-foreground">
              Mama Agnes Electronics · Shed 14A, Commercial Avenue
            </p>
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
