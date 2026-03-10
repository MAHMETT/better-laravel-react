import { AppearanceMenu } from './appearance-menu';
import { AppearanceDropdown } from './appearance-dropdown';
import { AppearanceToggle } from './appearance-toggle';
import type { AppearanceMenuProps } from './appearance-menu';
import type { AppearanceDropdownProps } from './appearance-dropdown';
import type { AppearanceToggleProps } from './appearance-toggle';

export type AppearanceComponentVariant = 'menu' | 'dropdown' | 'toggle';

export interface AppearanceProps {
    /**
     * Component variant to render
     * @default 'menu'
     */
    variant?: AppearanceComponentVariant;
    
    /**
     * Props for menu variant
     */
    menuProps?: Omit<AppearanceMenuProps, 'className'>;
    
    /**
     * Props for dropdown variant
     */
    dropdownProps?: Omit<AppearanceDropdownProps, 'className'>;
    
    /**
     * Props for toggle variant
     */
    toggleProps?: Omit<AppearanceToggleProps, 'className'>;
    
    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Appearance component with three variants: menu, dropdown, and toggle
 * 
 * @example
 * // Menu variant (default)
 * <Appearance />
 * 
 * @example
 * // Dropdown variant
 * <Appearance variant="dropdown" />
 * 
 * @example
 * // Toggle variant with icon-label
 * <Appearance variant="toggle" toggleProps={{ variant: 'icon-label' }} />
 * 
 * @example
 * // With custom props
 * <Appearance 
 *   variant="menu" 
 *   menuProps={{ orientation: 'vertical', showDescriptions: true }} 
 * />
 */
export function Appearance({
    variant = 'menu',
    menuProps,
    dropdownProps,
    toggleProps,
    className = '',
}: AppearanceProps) {
    switch (variant) {
        case 'dropdown':
            return (
                <AppearanceDropdown
                    className={className}
                    {...dropdownProps}
                />
            );
        
        case 'toggle':
            return (
                <AppearanceToggle
                    className={className}
                    {...toggleProps}
                />
            );
        
        case 'menu':
        default:
            return (
                <AppearanceMenu
                    className={className}
                    {...menuProps}
                />
            );
    }
}

export default Appearance;
