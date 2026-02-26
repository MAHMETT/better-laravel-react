<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'avatar_url',
        'is_enabled',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Scope a query to only include enabled users.
     */
    public function scopeEnabled($query)
    {
        return $query->where('status', 'enable');
    }

    /**
     * Scope a query to only include disabled users.
     */
    public function scopeDisabled($query)
    {
        return $query->where('status', 'disable');
    }

    /**
     * Scope a query to only include admin users.
     */
    public function scopeAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Get the avatar media record for the user.
     */
    public function avatarMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'avatar', 'id');
    }

    /**
     * Get the avatar URL for the user.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        $media = $this->avatarMedia;

        if (! $media) {
            return null;
        }

        return $media->getUrl();
    }

    /**
     * Check if the user is enabled.
     */
    public function getIsEnabledAttribute(): bool
    {
        return $this->status === 'enable';
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }

    /**
     * Apply filters to the query.
     */
    public function scopeFilter($query, array $filters): void
    {
        $query->when(
            $filters['search'] ?? '',
            fn ($q, $search) => $q->where(fn ($query) => $query
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%"))
        )
            ->when(
                in_array($filters['status'] ?? '', ['enable', 'disable']),
                fn ($q) => $q->where('status', $filters['status'])
            )
            ->when(
                in_array($filters['role'] ?? '', ['admin', 'user']),
                fn ($q) => $q->where('role', $filters['role'])
            );
    }
}
