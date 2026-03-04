<?php

namespace App\Models;

use App\Enums\UserLogEventType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLog extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'event_type',
        'ip_address',
        'user_agent',
        'device_info',
        'session_id',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_type' => UserLogEventType::class,
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when(
            ! empty($filters['user_ids']) && is_array($filters['user_ids']),
            fn (Builder $q) => $q->whereIn(
                'user_id',
                array_map('intval', $filters['user_ids']),
            )
        )
            ->when(
                in_array($filters['event_type'] ?? '', UserLogEventType::values(), true),
                fn (Builder $q) => $q->where('event_type', $filters['event_type'])
            )
            ->when(
                ! empty($filters['date_from']),
                fn (Builder $q) => $q->where(
                    'created_at',
                    '>=',
                    Carbon::parse((string) $filters['date_from'])->startOfDay(),
                )
            )
            ->when(
                ! empty($filters['date_to']),
                fn (Builder $q) => $q->where(
                    'created_at',
                    '<=',
                    Carbon::parse((string) $filters['date_to'])->endOfDay(),
                )
            );
    }
}
