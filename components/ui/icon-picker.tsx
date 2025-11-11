"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Users,
  FileText,
  Laptop,
  Library,
  Building,
  Heart,
  Briefcase,
  DollarSign,
  Home,
  Car,
  PartyPopper,
  UserCheck,
  Microscope,
  Globe2,
  GraduationCap,
  Phone,
  Calendar,
  Mail,
  Clock,
  MapPin,
  ExternalLink,
  Search as SearchIcon,
  Settings,
  Shield,
  Star,
  ChevronDown,
  Package,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Icon mapping for all available icons
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  FileText,
  Laptop,
  Library,
  Building,
  Heart,
  Briefcase,
  DollarSign,
  Home,
  Car,
  PartyPopper,
  UserCheck,
  Microscope,
  Globe2,
  GraduationCap,
  Phone,
  Calendar,
  Mail,
  Clock,
  MapPin,
  ExternalLink,
  Search: SearchIcon,
  Settings,
  Shield,
  Star,
}

interface IconPickerProps {
  value?: string
  onChange: (icon: string) => void
  icons?: string[]
  className?: string
}

export function IconPicker({ value, onChange, icons, className }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const availableIcons = icons || Object.keys(iconMap)

  const filteredIcons = availableIcons.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const SelectedIcon = value && iconMap[value] ? iconMap[value] : Package
  const isUrl = value && (value.startsWith('http://') || value.startsWith('https://'))

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
            {isUrl ? (
              <img src={value} alt="icon" className="h-4 w-4" onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }} />
            ) : (
              <SelectedIcon className="h-4 w-4" />
            )}
            <span className={isUrl ? "text-xs font-mono" : ""}>
              {isUrl ? "Favicon" : (value || "Select icon")}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-4 gap-1 p-2">
            {filteredIcons.length === 0 ? (
              <div className="col-span-4 text-center py-4 text-sm text-muted-foreground">
                No icons found
              </div>
            ) : (
              filteredIcons.map((iconName) => {
                const Icon = iconMap[iconName]
                if (!Icon) return null
                
                const isSelected = value === iconName

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                      isSelected && "bg-accent text-accent-foreground ring-2 ring-primary"
                    )}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium truncate max-w-full">
                      {iconName}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
