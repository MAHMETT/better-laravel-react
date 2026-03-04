<?php

namespace App\Listeners;

use App\Enums\UserLogEventType;
use App\Models\User;
use App\Services\Auth\UserActivityLogService;
use Illuminate\Auth\Events\Logout;

class LogUserLogoutListener
{
    /**
     * Create the event listener.
     */
    public function __construct(protected UserActivityLogService $userActivityLogService) {}

    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $request = request();

        $eventType = $request->attributes->get('auth_forced_logout') === true
            ? UserLogEventType::ForcedLogout
            : UserLogEventType::Logout;

        $this->userActivityLogService->log(
            user: $event->user,
            eventType: $eventType,
            request: $request,
        );
    }
}
