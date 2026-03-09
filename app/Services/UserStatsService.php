<?php

namespace App\Services;

use App\Models\User;

class UserStatsService
{
    /**
     * Calculate user statistics using efficient Eloquent queries.
     * Uses separate queries that are cached at the database level.
     *
     * @return array{total: int, enabled: int, disabled: int, admins: int}
     */
    public function calculate(): array
    {
        $baseQuery = User::query();

        $total = $baseQuery->count();

        $enabled = (clone $baseQuery)->where('status', 'enable')->count();

        $disabled = (clone $baseQuery)->where('status', 'disable')->count();

        $admins = (clone $baseQuery)->where('role', 'admin')->count();

        return [
            'total' => $total,
            'enabled' => $enabled,
            'disabled' => $disabled,
            'admins' => $admins,
        ];
    }

    /**
     * Get total user count.
     */
    public function getTotalCount(): int
    {
        return User::query()->count();
    }

    /**
     * Get count of enabled users.
     */
    public function getEnabledCount(): int
    {
        return User::query()->where('status', 'enable')->count();
    }

    /**
     * Get count of disabled users.
     */
    public function getDisabledCount(): int
    {
        return User::query()->where('status', 'disable')->count();
    }

    /**
     * Get count of admin users.
     */
    public function getAdminCount(): int
    {
        return User::query()->where('role', 'admin')->count();
    }
}
