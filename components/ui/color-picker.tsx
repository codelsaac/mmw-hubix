"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

// Default color palette
const defaultColors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lime", value: "#84cc16" },
  { name: "Amber", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
  { name: "Slate", value: "#1f2937" },
  { name: "Emerald", value: "#059669" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Yellow", value: "#eab308" },
]

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  colors?: string[]
  className?: string
}

export function ColorPicker({ value, onChange, colors, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value || "#3b82f6")

  const colorPalette = colors
    ? colors.map(color => {
        const preset = defaultColors.find(c => c.value.toLowerCase() === color.toLowerCase())
        return preset || { name: color, value: color }
      })
    : defaultColors

  const handleColorSelect = (color: string) => {
    onChange(color)
    setCustomColor(color)
    setOpen(false)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border border-gray-300"
              style={{ backgroundColor: value || "#3b82f6" }}
            />
            <span className="text-sm font-mono">{value || "#3b82f6"}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium mb-2 block">Preset Colors</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={cn(
                    "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                    value === color.value
                      ? "border-primary ring-2 ring-primary ring-offset-1"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {value === color.value && (
                    <Check className="h-4 w-4 text-white mx-auto drop-shadow-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Custom Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="h-10 w-12 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 h-10 font-mono text-sm"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
