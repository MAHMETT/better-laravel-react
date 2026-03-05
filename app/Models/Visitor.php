<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visitor extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'visitor_id',
        'full_name',
        'email',
        'phone',
        'company',
        'purpose',
        'region',
        'country_code',
        'host_user_id',
        'location',
        'site',
        'check_in_at',
        'check_out_at',
        'status',
        'is_returning',
        'notes',
        'photo_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'is_returning' => 'boolean',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when(
            ! empty($filters['search']),
            fn ($q) => $q->where(function ($innerQuery) use ($filters) {
                $innerQuery->where('full_name', 'ilike', '%'.(string) $filters['search'].'%')
                    ->orWhere('visitor_id', 'ilike', '%'.(string) $filters['search'].'%')
                    ->orWhere('email', 'ilike', '%'.(string) $filters['search'].'%');
            })
        )
            ->when(
                ! empty($filters['location']),
                fn ($q) => $q->where('location', $filters['location'])
            )
            ->when(
                ! empty($filters['site']),
                fn ($q) => $q->where('site', $filters['site'])
            )
            ->when(
                ! empty($filters['status']),
                fn ($q) => $q->where('status', $filters['status'])
            )
            ->when(
                ! empty($filters['purpose']),
                fn ($q) => $q->where('purpose', $filters['purpose'])
            )
            ->when(
                ! empty($filters['date_from']),
                fn ($q) => $q->whereDate('check_in_at', '>=', $filters['date_from'])
            )
            ->when(
                ! empty($filters['date_to']),
                fn ($q) => $q->whereDate('check_in_at', '<=', $filters['date_to'])
            );
    }

    /**
     * Scope for today's visitors.
     */
    public function scopeToday(Builder $query): void
    {
        $query->whereDate('check_in_at', today());
    }

    /**
     * Scope for currently checked in visitors.
     */
    public function scopeCheckedIn(Builder $query): void
    {
        $query->where('status', 'checked_in');
    }

    /**
     * Scope for checked out visitors.
     */
    public function scopeCheckedOut(Builder $query): void
    {
        $query->where('status', 'checked_out');
    }

    /**
     * Scope for returning visitors.
     */
    public function scopeReturning(Builder $query): void
    {
        $query->where('is_returning', true);
    }
}
