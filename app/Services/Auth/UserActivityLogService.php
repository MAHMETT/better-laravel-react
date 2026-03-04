<?php

namespace App\Services\Auth;

use App\Enums\UserLogEventType;
use App\Models\User;
use App\Models\UserLog;
use App\Support\UserAgentParser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserActivityLogService
{
    public function __construct(protected UserAgentParser $userAgentParser) {}

    public function log(User $user, UserLogEventType $eventType, ?Request $request = null): void
    {
        try {
            $request ??= request();

            $sessionId = $this->resolveSessionId($request);
            $userAgent = $request?->userAgent();

            UserLog::query()->firstOrCreate(
                attributes: [
                    'user_id' => $user->id,
                    'event_type' => $eventType->value,
                    'session_id' => $sessionId,
                ],
                values: [
                    'ip_address' => $request?->ip(),
                    'user_agent' => $userAgent,
                    'device_info' => $this->userAgentParser->parse($userAgent),
                    'created_at' => now(),
                ],
            );
        } catch (Throwable $exception) {
            Log::warning('Failed to persist user activity log.', [
                'user_id' => $user->id,
                'event_type' => $eventType->value,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    protected function resolveSessionId(?Request $request): ?string
    {
        if (! $request || ! $request->hasSession()) {
            return null;
        }

        $sessionId = $request->session()->getId();

        return $sessionId !== '' ? $sessionId : null;
    }
}
