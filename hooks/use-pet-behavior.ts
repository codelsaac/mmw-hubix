"use client"

import { useState, useEffect, useCallback } from 'react'

export type PetMood = 'idle' | 'happy' | 'thinking' | 'greeting' | 'sleepy' | 'excited'
export type PetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center'

interface PetBehaviorState {
  mood: PetMood
  position: PetPosition
  message: string
  showMessage: boolean
}

const MESSAGES = {
  idle: [
    "Need help? Click me! ⚡",
    "I'm here if you need me!",
    "Battery at 98%! 🔋",
    "System Normal 🟢",
  ],
  greeting: [
    "Hello there, human! 👋",
    "Welcome back! 🎉",
    "Good to see you! 😊",
    "Hey! What's up? ✨",
  ],
  sleepy: [
    "Zzz... 😴",
    "Time to rest? 💤",
    "Getting sleepy... 🌙",
  ],
  happy: [
    "Yay! I love chatting! 💕",
    "That was fun! 🎉",
    "Great conversation! ⭐",
  ],
  excited: [
    "Woohoo! 🚀",
    "So excited! ⚡⚡⚡",
    "Let's go! 🎊",
  ],
  thinking: [
    "Hmm... 🤔",
    "Processing... 💭",
    "Let me think... 🧠",
  ],
}

export function usePetBehavior() {
  const [state, setState] = useState<PetBehaviorState>({
    mood: 'greeting',
    position: 'bottom-right',
    message: '',
    showMessage: false,
  })

  const [lastInteraction, setLastInteraction] = useState(0)

  useEffect(() => {
    setLastInteraction(Date.now())
  }, [])

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('byte_position') as PetPosition
    if (savedPosition) {
      setState(prev => ({ ...prev, position: savedPosition }))
    }
  }, [])

  // Save position to localStorage
  const savePosition = useCallback((position: PetPosition) => {
    localStorage.setItem('byte_position', position)
  }, [])

  // Change mood
  const setMood = useCallback((mood: PetMood) => {
    setState(prev => ({ ...prev, mood }))
    setLastInteraction(Date.now())
  }, [])

  // Change position
  const setPosition = useCallback((position: PetPosition) => {
    setState(prev => ({ ...prev, position }))
    savePosition(position)
  }, [savePosition])

  // Show random message
  const showRandomMessage = useCallback((mood?: PetMood) => {
    const currentMood = mood || state.mood
    const messages = MESSAGES[currentMood] || MESSAGES.idle
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    setState(prev => ({
      ...prev,
      message: randomMessage,
      showMessage: true,
    }))

    setTimeout(() => {
      setState(prev => ({ ...prev, showMessage: false }))
    }, 3000)
  }, [state.mood])

  // Auto-wander to different positions
  useEffect(() => {
    const wanderInterval = setInterval(() => {
      const positions: PetPosition[] = ['bottom-right', 'bottom-left']
      const randomPosition = positions[Math.floor(Math.random() * positions.length)]
      setPosition(randomPosition)
      showRandomMessage()
    }, 120000) // Every 2 minutes

    return () => clearInterval(wanderInterval)
  }, [setPosition, showRandomMessage])

  // Auto-show greeting message
  useEffect(() => {
    const timer = setTimeout(() => {
      showRandomMessage('greeting')
    }, 2000)

    return () => clearTimeout(timer)
  }, [showRandomMessage])

  // Random messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance
        showRandomMessage()
      }
    }, 20000) // Every 20 seconds

    return () => clearInterval(messageInterval)
  }, [showRandomMessage])

  // Sleepy mode after inactivity
  useEffect(() => {
    const sleepyTimer = setTimeout(() => {
      const timeSinceInteraction = Date.now() - lastInteraction
      if (timeSinceInteraction > 300000) { // 5 minutes
        setMood('sleepy')
        showRandomMessage('sleepy')
      }
    }, 300000)

    return () => clearTimeout(sleepyTimer)
  }, [lastInteraction, setMood, showRandomMessage])

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours()
    let timeMessage = "Hello! 👋"
    
    if (hour >= 6 && hour < 12) {
      timeMessage = "Good morning! ☀️"
    } else if (hour >= 12 && hour < 18) {
      timeMessage = "Good afternoon! 🌤️"
    } else if (hour >= 18 && hour < 22) {
      timeMessage = "Good evening! 🌆"
    } else {
      timeMessage = "Working late? 🌙"
    }

    setState(prev => ({ ...prev, message: timeMessage }))
  }, [])

  return {
    ...state,
    setMood,
    setPosition,
    showRandomMessage,
    resetInteraction: () => setLastInteraction(Date.now()),
  }
}
