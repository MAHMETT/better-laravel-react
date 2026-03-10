<?php

namespace App\Services;

use App\Models\User;
use App\Services\User\UserAvatarService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        protected UserAvatarService $userAvatarService
    ) {}

    /**
     * Create a new user with optional avatar.
     *
     * @param  array{name: string, email: string, password: string, role: string, status: string}  $data
     */
    public function create(array $data, ?UploadedFile $avatar = null): User
    {
        return DB::transaction(function () use ($data, $avatar) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'] ?? 'user',
                'status' => $data['status'] ?? 'enable',
            ]);

            if ($avatar) {
                $this->userAvatarService->uploadAvatar($user, $avatar);
            }

            return $user;
        });
    }

    /**
     * Update an existing user.
     *
     * @param  array{name?: string, email?: string, password?: string, role?: string, status?: string}  $data
     */
    public function update(User $user, array $data): User
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        if (isset($data['password']) && ! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }

        if (isset($data['status'])) {
            $updateData['status'] = $data['status'];
        }

        $user->update($updateData);

        return $user->fresh();
    }

    /**
     * Soft delete a user.
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(User $user): bool
    {
        return $user->restore();
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete(User $user): bool
    {
        return $user->forceDelete();
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(User $user): User
    {
        $currentStatus = $user->status instanceof \App\Enums\UserStatus
            ? $user->status->value
            : $user->status;

        $newStatus = $currentStatus === 'enable' ? 'disable' : 'enable';

        $user->update(['status' => $newStatus]);

        return $user->fresh();
    }

    /**
     * Enable a user.
     */
    public function enable(User $user): User
    {
        $currentStatus = $user->status instanceof \App\Enums\UserStatus
            ? $user->status->value
            : $user->status;

        if ($currentStatus === 'disable') {
            $user->update(['status' => 'enable']);
        }

        return $user->fresh();
    }

    /**
     * Disable a user.
     */
    public function disable(User $user): User
    {
        $currentStatus = $user->status instanceof \App\Enums\UserStatus
            ? $user->status->value
            : $user->status;

        if ($currentStatus === 'enable') {
            $user->update(['status' => 'disable']);
        }

        return $user->fresh();
    }
}
