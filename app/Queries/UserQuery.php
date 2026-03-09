<?php

namespace App\Queries;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class UserQuery
{
    /**
     * Default pagination limit.
     */
    private const DEFAULT_PER_PAGE = 10;

    /**
     * Maximum allowed pagination limit.
     */
    private const MAX_PER_PAGE = 100;

    /**
     * Get paginated users with filters applied.
     *
     * @param  array{search?: string, status?: string, role?: string}  $filters
     */
    public function paginate(array $filters = [], int $perPage = self::DEFAULT_PER_PAGE): LengthAwarePaginator
    {
        return $this->applyFilters(User::query(), $filters)
            ->select([
                'id',
                'name',
                'email',
                'role',
                'status',
                'avatar',
                'created_at',
                'updated_at',
            ])
            ->with(['avatarMedia' => function ($query) {
                $query->select(['id', 'path', 'disk', 'metadata']);
            }])
            ->orderBy('updated_at', 'desc')
            ->paginate($this->sanitizePerPage($perPage))
            ->withQueryString();
    }

    /**
     * Get paginated trashed users with filters applied.
     *
     * @param  array{search?: string, status?: string, role?: string}  $filters
     */
    public function paginateTrashed(array $filters = [], int $perPage = self::DEFAULT_PER_PAGE): LengthAwarePaginator
    {
        return $this->applyFilters(User::onlyTrashed(), $filters)
            ->select([
                'id',
                'name',
                'email',
                'role',
                'status',
                'avatar',
                'deleted_at',
                'updated_at',
            ])
            ->with(['avatarMedia' => function ($query) {
                $query->select(['id', 'path', 'disk', 'metadata']);
            }])
            ->orderBy('updated_at', 'desc')
            ->paginate($this->sanitizePerPage($perPage))
            ->withQueryString();
    }

    /**
     * Find a user by ID with avatar media.
     */
    public function findWithAvatar(int $id, bool $withTrashed = false): ?User
    {
        $query = $withTrashed ? User::withTrashed() : User::query();

        return $query->select([
            'id',
            'name',
            'email',
            'role',
            'status',
            'avatar',
            'created_at',
            'updated_at',
            'deleted_at',
        ])
            ->with(['avatarMedia' => function ($query) {
                $query->select(['id', 'path', 'disk', 'metadata', 'type', 'extension']);
            }])
            ->find($id);
    }

    /**
     * Find a user by ID or fail with avatar media.
     */
    public function findWithAvatarOrFail(int $id, bool $withTrashed = false): User
    {
        $query = $withTrashed ? User::withTrashed() : User::query();

        return $query->select([
            'id',
            'name',
            'email',
            'role',
            'status',
            'avatar',
            'created_at',
            'updated_at',
            'deleted_at',
        ])
            ->with(['avatarMedia' => function ($query) {
                $query->select(['id', 'path', 'disk', 'metadata', 'type', 'extension']);
            }])
            ->findOrFail($id);
    }

    /**
     * Apply search and filter conditions to the query.
     *
     * @param  array{search?: string, status?: string, role?: string}  $filters
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when(
                $filters['search'] ?? '',
                fn (Builder $q, string $search) => $q->where(fn (Builder $innerQuery) => $innerQuery
                    ->where('name', 'ilike', "%{$search}%")
                    ->where('email', 'ilike', "%{$search}%")
                )
            )
            ->when(
                in_array($filters['status'] ?? '', UserStatus::values()),
                fn (Builder $q) => $q->where('status', $filters['status'])
            )
            ->when(
                in_array($filters['role'] ?? '', ['admin', 'user']),
                fn (Builder $q) => $q->where('role', $filters['role'])
            );
    }

    /**
     * Sanitize pagination limit to prevent abuse.
     */
    protected function sanitizePerPage(int $perPage): int
    {
        return min(max($perPage, 1), self::MAX_PER_PAGE);
    }
}
