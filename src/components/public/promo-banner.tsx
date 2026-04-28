"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Tag, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 5000

const slides = [
  {
    id: "maes",
    tag: { Icon: Gift, label: "Dia das Mães" },
    title: "Presentes únicos,",
    accent: "feitos à mão.",
    description:
      "Surpreenda com uma peça exclusiva em resina artesanal. Cada detalhe personalizado com amor.",
    cta: { label: "Ver kits de presente", href: "/pedido/novo" },
    badge: "🚚 Frete grátis acima de R$ 199,90",
    emoji: "💐",
    bg: "from-[#2A1810] via-[#3D2318] to-[#2A1810]",
    tagBg: "bg-primary/30 text-white/90",
    accentColor: "text-primary",
    ctaBg: "bg-primary hover:bg-primary/90 text-white",
    badgeStyle: "bg-white/10 text-white/70",
  },
  {
    id: "canetas",
    tag: { Icon: Sparkles, label: "Mais vendido" },
    title: "Canetas Artesanais",
    accent: "com o seu estilo.",
    description:
      "Personalize com seu nome, cores favoritas e glitter. Uma caneta única, como você.",
    cta: { label: "Personalizar agora", href: "/pedido/novo?category=canetas" },
    badge: "✨ A partir de R$ 12,00",
    emoji: "✒️",
    bg: "from-[#4a1942] via-[#6b2760] to-[#4a1942]",
    tagBg: "bg-white/20 text-white/90",
    accentColor: "text-pink-300",
    ctaBg: "bg-white hover:bg-white/90 text-[#4a1942]",
    badgeStyle: "bg-white/10 text-white/70",
  },
  {
    id: "chaveiros",
    tag: { Icon: Tag, label: "Promoção" },
    title: "Chaveiros para toda",
    accent: "ocasião.",
    description:
      "Do simples ao sofisticado: chaveiros artesanais personalizados para presentear ou usar.",
    cta: { label: "Ver chaveiros", href: "/pedido/novo?category=chaveiros" },
    badge: "🎁 Embalagem para presente inclusa",
    emoji: "🗝️",
    bg: "from-[#0f2b1f] via-[#1a4532] to-[#0f2b1f]",
    tagBg: "bg-emerald-400/20 text-emerald-300",
    accentColor: "text-emerald-400",
    ctaBg: "bg-emerald-500 hover:bg-emerald-400 text-white",
    badgeStyle: "bg-white/10 text-white/70",
  },
]

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-60%" : "60%",
    opacity: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

export function PromoBanner() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback(
    (next: number, d: number) => {
      setDir(d)
      setIndex((next + slides.length) % slides.length)
    },
    []
  )

  const prev = () => go(index - 1, -1)
  const next = useCallback(() => go(index + 1, 1), [index, go])

  useEffect(() => {
    if (paused) return
    timer.current = setTimeout(next, AUTOPLAY_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [index, paused, next])

  const slide = slides[index] ?? slides[0]!

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[280px] sm:h-[330px] lg:h-[370px]">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div
            key={slide.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className={cn(
              "absolute inset-0 bg-gradient-to-r",
              slide.bg
            )}
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            {/* Content */}
            <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
              {/* Left — text */}
              <div className="flex max-w-lg flex-col">
                {/* Tag */}
                <span
                  className={cn(
                    "mb-5 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest",
                    slide.tagBg
                  )}
                >
                  <slide.tag.Icon className="h-3.5 w-3.5" />
                  {slide.tag.label}
                </span>

                {/* Title */}
                <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.title}
                  <br />
                  <em className={cn("italic", slide.accentColor)}>
                    {slide.accent}
                  </em>
                </h2>

                {/* Description */}
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
                  {slide.description}
                </p>

                {/* CTA + badge */}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href={slide.cta.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-md transition-all active:scale-95",
                      slide.ctaBg
                    )}
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span
                    className={cn(
                      "hidden rounded-full px-3.5 py-1.5 text-xs font-medium sm:inline-block",
                      slide.badgeStyle
                    )}
                  >
                    {slide.badge}
                  </span>
                </div>
              </div>

              {/* Right — emoji decoration */}
              <div className="hidden select-none flex-col items-center justify-center sm:flex lg:mr-8">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-white/10 shadow-2xl backdrop-blur-sm lg:h-40 lg:w-40">
                  <span className="text-6xl lg:text-7xl">{slide.emoji}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {!paused && (
              <motion.div
                key={`bar-${slide.id}`}
                className="absolute bottom-0 left-0 h-0.5 bg-white/40"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow — prev */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 sm:left-5"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Arrow — next */}
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 sm:right-5"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i, i > index ? 1 : -1)}
            aria-label={`Ir para slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  )
}
