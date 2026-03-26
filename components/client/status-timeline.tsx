import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'name_check', label: 'Name Check', description: 'Verifying company name availability' },
  { key: 'articles_filed', label: 'Articles Filed', description: 'Filing formation documents' },
  { key: 'ein_processing', label: 'EIN Processing', description: 'Obtaining tax ID number' },
  { key: 'completed', label: 'Completed', description: 'Formation complete' },
]

const STATUS_ORDER: Record<string, number> = {
  name_check: 0,
  articles_filed: 1,
  ein_processing: 2,
  completed: 3,
}

interface StatusTimelineProps {
  currentStatus: string
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER[currentStatus] ?? 0

  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute h-0.5 top-5 -translate-y-1/2',
                    'transition-colors duration-300'
                  )}
                  style={{
                    left: `${((index - 1) / (STEPS.length - 1)) * 100 + 100 / (STEPS.length * 2)}%`,
                    width: `${100 / (STEPS.length - 1) - 100 / (STEPS.length * 2) * 2}%`,
                    backgroundColor: isCompleted || isCurrent ? '#2563EB' : '#E5E7EB',
                  }}
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-primary border-primary text-white',
                  isCurrent && 'border-primary bg-white text-primary ring-4 ring-primary/20',
                  isPending && 'border-gray-200 bg-white text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center px-1">
                <p
                  className={cn(
                    'text-xs font-semibold',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-gray-700',
                    isPending && 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'text-xs mt-0.5 hidden sm:block',
                    isCurrent && 'text-gray-600',
                    isCompleted && 'text-gray-500',
                    isPending && 'text-gray-300'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
