<?php

namespace App\Enums;

enum UserStatus: string
{
    case ENABLE = 'enable';
    case DISABLE = 'disable';

    public function label(): string
    {
        return match ($this) {
            self::ENABLE => 'Enabled',
            self::DISABLE => 'Disabled',
        };
    }

    public function isActive(): bool
    {
        return $this === self::ENABLE;
    }

    public function toggle(): self
    {
        return match ($this) {
            self::ENABLE => self::DISABLE,
            self::DISABLE => self::ENABLE,
        };
    }

    /**
     * Get all cases as an array of values.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all cases as an array of options with labels.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases()
        );
    }
}
