# Icon and Color Picker Components

## Overview
This document describes the visual icon and color picker components implemented for category management in MMW Hubix. These components provide an intuitive, visual interface for selecting icons and colors when creating or editing resource categories.

## Components

### IconPicker (`components/ui/icon-picker.tsx`)
A visual icon selection component that displays available icons in a grid layout with search functionality.

**Features:**
- **Visual Grid Display**: Shows all available icons in a 4-column grid
- **Search Functionality**: Real-time search to filter icons by name
- **Preview Display**: Shows selected icon with name in the trigger button
- **Keyboard Accessible**: Full keyboard navigation support
- **26 Available Icons**: BookOpen, Users, FileText, Laptop, Library, Building, Heart, Briefcase, DollarSign, Home, Car, PartyPopper, UserCheck, Microscope, Globe2, GraduationCap, Phone, Calendar, Mail, Clock, MapPin, ExternalLink, Search, Settings, Shield, Star

**Usage:**
```tsx
import { IconPicker } from "@/components/ui/icon-picker"

<IconPicker
  value={selectedIcon}
  onChange={(icon) => setSelectedIcon(icon)}
  icons={availableIcons} // Optional: array of icon names
/>
```

**Props:**
- `value?: string` - Currently selected icon name
- `onChange: (icon: string) => void` - Callback when icon is selected
- `icons?: string[]` - Optional array of available icon names (defaults to all icons)
- `className?: string` - Additional CSS classes

### ColorPicker (`components/ui/color-picker.tsx`)
A visual color selection component with preset colors and custom color input.

**Features:**
- **Preset Color Palette**: 16 predefined colors in an 8x2 grid
- **Custom Color Input**: HTML5 color picker + hex input field
- **Visual Feedback**: Selected color highlighted with checkmark and ring
- **Real-time Preview**: Shows selected color in the trigger button
- **Hex Color Support**: Validates and displays hex color codes

**Available Preset Colors:**
- Blue (#3b82f6), Red (#ef4444), Green (#10b981), Orange (#f59e0b)
- Purple (#8b5cf6), Cyan (#06b6d4), Lime (#84cc16), Amber (#f97316)
- Pink (#ec4899), Gray (#6b7280), Slate (#1f2937), Emerald (#059669)
- Indigo (#6366f1), Teal (#14b8a6), Rose (#f43f5e), Yellow (#eab308)

**Usage:**
```tsx
import { ColorPicker } from "@/components/ui/color-picker"

<ColorPicker
  value={selectedColor}
  onChange={(color) => setSelectedColor(color)}
  colors={availableColors} // Optional: array of hex colors
/>
```

**Props:**
- `value?: string` - Currently selected color (hex format)
- `onChange: (color: string) => void` - Callback when color is selected
- `colors?: string[]` - Optional array of preset colors (defaults to 16 colors)
- `className?: string` - Additional CSS classes

## Favicon Fetching

The system includes automatic favicon fetching functionality for resources:

### Favicon Utils (`lib/favicon-utils.ts`)
Utility functions for working with favicons:

```typescript
// Get favicon URL from website URL (32px)
const faviconUrl = getFaviconUrl('https://google.com')
// Returns: https://www.google.com/s2/favicons?domain=google.com&sz=32

// Get high-resolution favicon (custom size)
const hiresFavicon = getHighResFaviconUrl('https://google.com', 64)

// Parse icon value (determines if it's a URL or icon name)
const { type, value } = parseIconValue(icon)
// type: 'url' | 'icon' | null
```

**Features:**
- Uses Google's reliable favicon service
- Supports custom sizes for high-resolution displays
- Graceful fallback when favicons fail to load
- Parses icon values to distinguish URLs from icon names

## Integration

### Category Management (`components/admin/category-management.tsx`)
The icon and color pickers are integrated into the CategoryDialog component:

```tsx
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="icon">Icon</Label>
    <IconPicker
      value={formData.icon}
      onChange={(value) => setFormData({ ...formData, icon: value })}
      icons={iconOptions}
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="color">Color</Label>
    <ColorPicker
      value={formData.color}
      onChange={(value) => setFormData({ ...formData, color: value })}
      colors={colorOptions}
    />
  </div>
</div>
```

### Resource Management (`components/admin/resource-management.tsx`)
Resources now support custom icons with automatic favicon fetching:

```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="icon">Icon</Label>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleFetchFavicon}
      disabled={!formData.url || isFetchingIcon}
    >
      <Download className="w-3 h-3 mr-1" />
      Fetch Favicon
    </Button>
  </div>
  <IconPicker
    value={formData.icon}
    onChange={(value) => setFormData({ ...formData, icon: value })}
    icons={iconOptions}
  />
  <p className="text-xs text-muted-foreground">
    Select an icon or fetch the website's favicon
  </p>
</div>
```

**Resource Icon Features:**
- Manual icon selection from 26 Lucide icons
- One-click favicon fetching from resource URL
- Automatic favicon display using Google's service
- Fallback to Lucide icons if favicon fails
- Supports both icon names and favicon URLs

## API Support

### Meta Endpoint (`/api/admin/categories/meta`)
Provides available icon and color options to the frontend:

```typescript
GET /api/admin/categories/meta

Response:
{
  "iconOptions": ["BookOpen", "Users", "FileText", ...],
  "colorOptions": ["#3b82f6", "#ef4444", "#10b981", ...]
}
```

## User Experience

### Icon Selection Flow
1. User clicks the icon picker button
2. Popover opens with search bar and icon grid
3. User can search for icons by name
4. Click on an icon to select it
5. Popover closes automatically
6. Selected icon displays in the button with its name

### Color Selection Flow
1. User clicks the color picker button
2. Popover opens with preset colors and custom input
3. User can click a preset color or use the custom color picker
4. Selected color displays with checkmark in the grid
5. Custom hex input allows manual color entry
6. Popover closes automatically on preset selection
7. Selected color displays in the button with hex code

## Design Considerations

### Accessibility
- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

### Responsiveness
- Popover positioning adapts to viewport
- Touch-friendly button sizes
- Scrollable content areas
- Mobile-optimized layouts

### Visual Feedback
- Hover states on all interactive elements
- Selected state indicators (ring, checkmark)
- Smooth transitions and animations
- Clear visual hierarchy

## Future Enhancements

Potential improvements for future iterations:
- Add more icon options (currently 26 icons)
- Support for icon libraries (Heroicons, Feather, etc.)
- Color themes and palettes
- Recent colors history
- Favorite icons/colors
- Icon categories/grouping
- Color gradient support
- Accessibility color contrast checking
