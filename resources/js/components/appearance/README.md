# Appearance Components

Reusable, dynamic appearance toggle components with three variants using Zustand v5.

## Features

- ✨ **Three Variants**: Menu, Dropdown, and Toggle
- 🎨 **Fully Customizable**: Multiple size options, orientations, and display modes
- 🔄 **Real-time Updates**: Instant theme switching with visual feedback
- 💾 **Persistent**: Saves preference to localStorage and cookies
- 🌐 **SSR Ready**: Cookie support for server-side rendering
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation
- 📱 **Responsive**: Works on all device sizes
- 🎯 **Type Safe**: Full TypeScript support

## Installation

No additional installation required. Uses existing project dependencies:

- Zustand v5
- shadcn/ui components
- Lucide React icons

## Usage

### Basic Usage

```tsx
import { Appearance } from '@/components/appearance';

// Default menu variant
<Appearance />;
```

### Menu Variant

Display all appearance options as a menu with buttons.

```tsx
import { Appearance } from '@/components/appearance';

// Horizontal menu (default)
<Appearance variant="menu" />

// Vertical menu
<Appearance
    variant="menu"
    menuProps={{ orientation: 'vertical' }}
/>

// With descriptions
<Appearance
    variant="menu"
    menuProps={{
        orientation: 'vertical',
        showDescriptions: true,
        size: 'lg'
    }}
/>
```

**Props:**

- `orientation`: `'horizontal' | 'vertical'` (default: `'horizontal'`)
- `showDescriptions`: `boolean` (default: `false`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)

### Dropdown Variant

Compact dropdown menu for appearance selection.

```tsx
import { Appearance } from '@/components/appearance';

// Default dropdown
<Appearance variant="dropdown" />

// Without current appearance text
<Appearance
    variant="dropdown"
    dropdownProps={{ showCurrent: false }}
/>

// Custom alignment
<Appearance
    variant="dropdown"
    dropdownProps={{ align: 'start', sideOffset: 12 }}
/>
```

**Props:**

- `showCurrent`: `boolean` (default: `true`)
- `align`: `'start' | 'center' | 'end'` (default: `'end'`)
- `sideOffset`: `number` (default: `8`)

### Toggle Variant

Simple toggle button for quick theme switching.

```tsx
import { Appearance } from '@/components/appearance';

// Icon only (toggles light/dark)
<Appearance variant="toggle" />

// Icon with label
<Appearance
    variant="toggle"
    toggleProps={{ variant: 'icon-label', size: 'lg' }}
/>

// Cycling toggle (light -> dark -> system)
<Appearance
    variant="toggle"
    toggleProps={{ variant: 'icon-cycle' }}
/>
```

**Props:**

- `variant`: `'icon' | 'icon-label' | 'icon-cycle'` (default: `'icon'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)

## State Management

Uses Zustand v5 for state management. Access the store directly:

```tsx
import { useAppearanceStore } from '@/stores/appearance';

function MyComponent() {
    const { appearance, setAppearance, toggle } = useAppearanceStore();

    return <button onClick={() => setAppearance('dark')}>Set Dark Mode</button>;
}
```

**Store API:**

- `appearance`: Current appearance setting (`'light' | 'dark' | 'system'`)
- `resolvedAppearance`: Actual resolved appearance (`'light' | 'dark'`)
- `setAppearance(mode)`: Set appearance mode
- `toggle()`: Toggle to next mode
- `reset()`: Reset to default

## Persistence

Appearance preference is automatically saved to:

1. **localStorage** - Client-side persistence
2. **Cookies** - SSR support

The system theme change is automatically detected when using `'system'` mode.

## Customization

### Custom Styling

All components accept `className` prop for custom styling:

```tsx
<Appearance
    className="bg-custom dark:bg-custom-dark"
    menuProps={{ size: 'lg' }}
/>
```

### Individual Components

You can also import and use individual variant components:

```tsx
import {
    AppearanceMenu,
    AppearanceDropdown,
    AppearanceToggle
} from '@/components/appearance';

<AppearanceMenu orientation="vertical" />
<AppearanceDropdown showCurrent={false} />
<AppearanceToggle variant="icon-label" />
```

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Technical Details

- **State Management**: Zustand v5
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **SSR**: Cookie-based persistence

## Migration

### From appearance-tabs.tsx

```tsx
// Old
import AppearanceToggleTab from '@/components/appearance-tabs';
<AppearanceToggleTab />;

// New (same API)
import { Appearance } from '@/components/appearance';
<Appearance variant="menu" menuProps={{ orientation: 'horizontal' }} />;
```

## Troubleshooting

### Theme not persisting

- Check browser localStorage is enabled
- Verify cookies are allowed for your domain

### System theme not detected

- Ensure browser supports `prefers-color-scheme` media query
- Check OS theme settings

### TypeScript errors

- Ensure you're using the correct variant props
- Check import paths are correct

## Contributing

When adding new variants or features:

1. Add TypeScript types
2. Update this README
3. Test with screen readers
