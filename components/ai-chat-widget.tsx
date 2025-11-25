"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

import { AIChat } from "@/components/ai-chat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePetBehavior, type PetMood, type PetPosition } from "@/hooks/use-pet-behavior"

interface DigitalPetProps {
  onClick?: () => void
  mood?: PetMood
  showParticles?: boolean
}

function DigitalPet({ onClick, mood = 'idle', showParticles }: DigitalPetProps) {
  const petRef = useRef<HTMLDivElement>(null)
  const pupilsRef = useRef<HTMLDivElement[]>([])

  const isHappy = mood === 'happy' || mood === 'excited'
  const isTalking = mood === 'thinking'
  const isSleepy = mood === 'sleepy'
  const isGreeting = mood === 'greeting'

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!petRef.current || pupilsRef.current.length === 0) return

      const rect = petRef.current.getBoundingClientRect()
      const petCenterX = rect.left + rect.width / 2
      const petCenterY = rect.top + rect.height / 2

      const angle = Math.atan2(e.clientY - petCenterY, e.clientX - petCenterX)
      const distance = Math.min(5, Math.hypot(e.clientX - petCenterX, e.clientY - petCenterY) / 10)

      pupilsRef.current.forEach(pupil => {
        if (pupil) {
          const x = Math.cos(angle) * distance
          const y = Math.sin(angle) * distance
          pupil.style.transform = `translate(${x}px, ${y}px)`
        }
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={petRef}
      className={`relative cursor-pointer transition-transform duration-300 ${
        isHappy ? 'scale-105' : 'scale-100'
      }`}
      onClick={onClick}
      style={{
        animation: 'float 3s ease-in-out infinite',
      }}
    >
      {/* Antenna Ears */}
      <div className="absolute left-[30px] -top-[35px] w-5 h-12 bg-slate-300 border-[3px] border-slate-700 rounded-xl -rotate-[15deg] z-[1]">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-700" style={{ animation: 'pulse-glow 2s infinite' }} />
        <div className="w-2.5 h-8 bg-slate-700 rounded mt-1.5 mx-auto" />
      </div>
      <div className="absolute right-[30px] -top-[35px] w-5 h-12 bg-slate-300 border-[3px] border-slate-700 rounded-xl rotate-[15deg] z-[1]">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-700" style={{ animation: 'pulse-glow 2s infinite' }} />
        <div className="w-2.5 h-8 bg-slate-700 rounded mt-1.5 mx-auto" />
      </div>

      {/* Head */}
      <div className="relative w-40 h-[120px] bg-slate-200 rounded-3xl border-4 border-slate-700 z-10" style={{ boxShadow: 'inset 0 -8px 0 #cbd5e1, 0 10px 20px rgba(0,0,0,0.3)' }}>
        {/* Screen */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[90px] bg-[#1e1b4b] rounded-2xl border-2 border-slate-700 overflow-hidden" style={{ boxShadow: 'inset 0 0 10px #8b5cf6' }}>
          {/* CRT Effect Overlay */}
          <div className="absolute inset-0 z-[5] pointer-events-none" style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 2px, 2px 100%'
          }} />

          {/* Eyes */}
          <div
            className={`absolute left-[30px] w-6 bg-cyan-400 rounded-xl transition-all duration-200 ${
              isHappy ? 'h-2.5 top-10 rounded' : isSleepy ? 'h-1 top-12 rounded-full' : 'h-8 top-[30px]'
            }`}
            style={{ boxShadow: '0 0 10px #22d3ee', animation: isSleepy ? 'blink 2s infinite' : 'blink 4s infinite' }}
          >
            <div
              ref={(el) => { if (el) pupilsRef.current[0] = el }}
              className="absolute top-1 left-1.5 w-3 h-4 bg-cyan-100 rounded-md transition-transform"
            />
          </div>
          <div
            className={`absolute right-[30px] w-6 bg-cyan-400 rounded-xl transition-all duration-200 ${
              isHappy ? 'h-2.5 top-10 rounded' : isSleepy ? 'h-1 top-12 rounded-full' : 'h-8 top-[30px]'
            }`}
            style={{ boxShadow: '0 0 10px #22d3ee', animation: isSleepy ? 'blink 2s infinite' : 'blink 4s infinite' }}
          >
            <div
              ref={(el) => { if (el) pupilsRef.current[1] = el }}
              className="absolute top-1 left-1.5 w-3 h-4 bg-cyan-100 rounded-md transition-transform"
            />
          </div>

          {/* Cheeks */}
          <div className="absolute left-5 top-[55px] w-3 h-1.5 bg-pink-400 opacity-60 rounded-full" />
          <div className="absolute right-5 top-[55px] w-3 h-1.5 bg-pink-400 opacity-60 rounded-full" />

          {/* Mouth */}
          <div
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 w-5 bg-cyan-400 transition-all duration-200 ${
              isHappy ? 'h-3 rounded-b-xl' : isTalking ? 'h-4 rounded-lg' : isSleepy ? 'h-1 rounded-full w-3' : 'h-2 rounded'
            }`}
            style={{ boxShadow: '0 0 5px #22d3ee' }}
          />

          {/* Wave Hand Animation */}
          {isGreeting && (
            <div className="absolute -right-8 top-8 text-2xl animate-wave origin-bottom-right">
              👋
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-12 bg-slate-100 border-4 border-slate-700 rounded-2xl z-[5] flex items-center justify-center">
        <div className="relative w-10 h-5 bg-slate-700 rounded">
          <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
          <div className="absolute top-1.5 left-[18px] w-2 h-2 bg-red-500 rounded-full" />
          <div className="absolute top-1.5 left-[30px] w-2 h-2 bg-yellow-400 rounded-full" />
        </div>
        {/* Hands */}
        <div className="absolute -bottom-5 -left-2.5 w-5 h-5 bg-slate-200 border-[3px] border-slate-700 rounded-full z-20 transition-transform" />
        <div className="absolute -bottom-5 -right-2.5 w-5 h-5 bg-slate-200 border-[3px] border-slate-700 rounded-full z-20 transition-transform" />
      </div>

      {/* Particle Effects */}
      {showParticles && mood === 'happy' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span className="text-lg animate-float-up" style={{ animationDelay: '0s' }}>⭐</span>
          <span className="text-lg animate-float-up" style={{ animationDelay: '0.2s' }}>✨</span>
          <span className="text-lg animate-float-up" style={{ animationDelay: '0.4s' }}>⭐</span>
        </div>
      )}
      {showParticles && mood === 'sleepy' && (
        <div className="absolute -top-6 right-4 text-xl animate-float-up">
          💤
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.8); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const behavior = usePetBehavior()

  const handlePetClick = () => {
    setIsOpen(true)
    behavior.setMood('happy')
    behavior.resetInteraction()
    behavior.showRandomMessage('happy')
    setShowParticles(true)
    setTimeout(() => {
      setShowParticles(false)
      behavior.setMood('idle')
    }, 2000)
  }

  const handleMultiClick = () => {
    setClickCount(prev => prev + 1)
    
    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }

    // Reset click count after 1 second
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0)
    }, 1000)

    // Triple click: change position
    if (clickCount === 2) {
      const positions: PetPosition[] = ['bottom-right', 'bottom-left']
      const currentIndex = positions.indexOf(behavior.position)
      const nextPosition = positions[(currentIndex + 1) % positions.length]
      behavior.setPosition(nextPosition)
      setClickCount(0)
    }

    // 5 rapid clicks: excited/dizzy
    if (clickCount === 4) {
      behavior.setMood('excited')
      behavior.showRandomMessage('excited')
      setShowParticles(true)
      setTimeout(() => {
        setShowParticles(false)
        behavior.setMood('idle')
      }, 3000)
      setClickCount(0)
    }
  }

  // Update pet mood when chat is active
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        if (behavior.mood !== 'thinking') {
          behavior.setMood('thinking')
        } else {
          behavior.setMood('idle')
        }
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isOpen, behavior])

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  }

  return (
    <>
      {!isOpen && (
        <div
          className={`fixed z-50 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500 scale-[0.6] ${positionClasses[behavior.position]}`}
          style={{ cursor: 'pointer' }}
          onClick={handleMultiClick}
          onDoubleClick={handlePetClick}
        >
          {/* Speech Bubble */}
          {behavior.showMessage && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg border-2 border-slate-700 shadow-lg whitespace-nowrap animate-in slide-in-from-bottom-4 z-10">
              <p className="text-sm font-medium text-slate-900">{behavior.message}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-700" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
            </div>
          )}
          
          <DigitalPet
            onClick={handlePetClick}
            mood={behavior.mood}
            showParticles={showParticles}
          />
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[22rem] md:w-[28rem] bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center scale-[0.35] origin-center">
                <DigitalPet mood={behavior.mood} showParticles={false} />
              </div>
              <span className="text-sm font-medium">BYTE - Your AI Pet</span>
              <Badge variant="secondary" className="text-[10px]">
                Beta
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-96">
            <AIChat 
              onMessageSent={() => {
                behavior.setMood('thinking')
                behavior.resetInteraction()
              }} 
              onResponseReceived={() => {
                behavior.setMood('happy')
                behavior.showRandomMessage('happy')
                setTimeout(() => behavior.setMood('idle'), 2000)
              }} 
            />
          </div>
        </div>
      )}
    </>
  )
}
