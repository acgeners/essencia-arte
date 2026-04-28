"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: Array<{
    label: string
    description?: string
  }>
  currentStep: number
  className?: string
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  return (
    <>
      {/* Desktop: horizontal */}
      <div className={cn("hidden lg:block", className)}>
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const stepNumber = index + 1

            return (
              <div key={step.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  {isCompleted && onStepClick ? (
                    <button
                      type="button"
                      onClick={() => onStepClick(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:scale-110 hover:ring-4 hover:ring-primary/20"
                      title={`Voltar para ${step.label}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                        isCurrent &&
                          "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        !isCompleted &&
                          !isCurrent &&
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      {stepNumber}
                    </div>
                  )}
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs font-medium",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                          ? "cursor-pointer text-foreground hover:text-primary"
                          : "text-muted-foreground"
                    )}
                    onClick={() => isCompleted && onStepClick?.(index)}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        index < currentStep
                          ? "bg-primary"
                          : "bg-border"
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: compact bar */}
      <div className={cn("lg:hidden", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Etapa {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm text-primary">
            {steps[currentStep]?.label}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </>
  )
}
