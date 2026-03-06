<?php

namespace App\Observers;

use App\Models\User;
use App\Services\User\UserAvatarService;

class UserObserver
{
    public function __construct(
        protected UserAvatarService $avatarService,
    ) {}

    /**
     * Handle the User "deleting" event.
     * When a user is being permanently deleted, also delete their avatar.
     */
    public function deleting(User $user): void
    {
        // Only delete avatar on force delete (not soft delete)
        if ($user->trashed()) {
            $this->avatarService->deleteAvatar($user);
        }
    }

    /**
     * Handle the User "forceDeleted" event.
     * Additional cleanup after force delete if needed.
     */
    public function forceDeleted(User $user): void
    {
        // Additional cleanup can be added here if needed
        // Avatar is already deleted in the "deleting" event
    }
}
