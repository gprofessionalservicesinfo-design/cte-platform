'use client'

import { useState } from 'react'
import { ADDONS, buildWhatsAppUrl, type AddonId } from '@/lib/billing'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Hash, Shield, FileText, MapPin, Landmark,
  UserCheck, CalendarCheck, Stamp,
  CheckCircle2, ExternalLink, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ICON_MAP: Record<string, React.ElementType> = {
  hash:            Hash,
  shield:          Shield,
  'file-text':     FileText,
  'map-pin':       MapPin,
  landmark:        Landmark,
  'user-check':    UserCheck,
  'calendar-check': CalendarCheck,
  stamp:           Stamp,
}

interface AddonGridProps {
  packageId: string | null        // e.g. 'professional'
  hasStripeCustomer: boolean
}

export function AddonGrid({ packageId, hasStripeCustomer }: AddonGridProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleBuy(addonId: AddonId) {
    setLoading(addonId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ addon_id: addonId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Could not start checkout')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {ADDONS.map((addon) => {
        const included   = packageId ? addon.included_in.includes(packageId as never) : false
        const Icon       = ICON_MAP[addon.icon] ?? FileText
        const isLoading  = loading === addon.id
        const waUrl      = buildWhatsAppUrl(addon.wa_msg)

        return (
          <Card
            key={addon.id}
            className={cn(
              'relative flex flex-col transition-shadow',
              included && 'border-green-200 bg-green-50/40',
            )}
          >
            {included && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-100 text-green-700 border-0 text-xs font-medium">
                  Incluido
                </Badge>
              </div>
            )}

            <CardContent className="pt-5 flex flex-col flex-1 gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  included ? 'bg-green-100' : 'bg-gray-100',
                )}
              >
                <Icon className={cn('h-4.5 w-4.5', included ? 'text-green-600' : 'text-gray-500')} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{addon.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{addon.description}</p>
              </div>

              {/* Price + CTA */}
              <div className="pt-1 border-t border-gray-100 flex items-center justify-between gap-2">
                <div>
                  {included ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Incluido en tu plan</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      ${addon.price}
                      {addon.period && (
                        <span className="text-xs font-normal text-gray-500">{addon.period}</span>
                      )}
                    </span>
                  )}
                </div>

                {!included && (
                  hasStripeCustomer ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5"
                      disabled={isLoading}
                      onClick={() => handleBuy(addon.id as AddonId)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Agregar'
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5"
                      asChild
                    >
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Solicitar
                      </a>
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
