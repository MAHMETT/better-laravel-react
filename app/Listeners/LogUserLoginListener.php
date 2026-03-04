<?php

namespace App\Listeners;

use App\Enums\UserLogEventType;
use App\Models\User;
use App\Services\Auth\UserActivityLogService;
use Illuminate\Auth\Events\Login;

class LogUserLoginListener
{
    /**
     * Create the event listener.
     */
    public function __construct(protected UserActivityLogService $userActivityLogService) {}

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->userActivityLogService->log(
            user: $event->user,
            eventType: UserLogEventType::Login,
            request: request(),
        );
    }
}
