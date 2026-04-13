interface Step {
  number: number
  title: string
  description: string
}

interface ProcessStepsProps {
  steps: Step[]
}

export default function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <div className="my-8 space-y-4">
      {steps.map((step) => (
        <div key={step.number} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0A2540] text-white text-sm font-bold flex items-center justify-center mt-0.5">
            {step.number}
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
