<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'session_id',
        'ip_address',
        'user_id',
        'route_path',
        'route_name',
        'user_agent',
        'device_type',
        'referrer',
        'visited_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visited_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when(
            ! empty($filters['date_from']),
            fn (Builder $q) => $q->where(
                'visited_at',
                '>=',
                Carbon::parse((string) $filters['date_from'])->startOfDay(),
            )
        )
            ->when(
                ! empty($filters['date_to']),
                fn (Builder $q) => $q->where(
                    'visited_at',
                    '<=',
                    Carbon::parse((string) $filters['date_to'])->endOfDay(),
                )
            )
            ->when(
                ! empty($filters['time_from']),
                fn (Builder $q) => $q->whereRaw(
                    'HOUR(visited_at) >= ?',
                    [(int) $filters['time_from']],
                )
            )
            ->when(
                ! empty($filters['time_to']),
                fn (Builder $q) => $q->whereRaw(
                    'HOUR(visited_at) <= ?',
                    [(int) $filters['time_to']],
                )
            )
            ->when(
                ! empty($filters['route_path']),
                fn (Builder $q) => $q->where('route_path', 'like', '%'.(string) $filters['route_path'].'%')
            )
            ->when(
                ! empty($filters['device_type']),
                fn (Builder $q) => $q->where('device_type', $filters['device_type'])
            )
            ->when(
                isset($filters['user_only']) && $filters['user_only'] === true,
                fn (Builder $q) => $q->whereNotNull('user_id')
            )
            ->when(
                isset($filters['guest_only']) && $filters['guest_only'] === true,
                fn (Builder $q) => $q->whereNull('user_id')
            );
    }

    /**
     * Scope to filter by session_id for visitor classification.
     */
    public function scopeBySession(Builder $query, string $sessionId): void
    {
        $query->where('session_id', $sessionId);
    }
}
