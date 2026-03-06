<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\User\UserAvatarService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to permanently delete users who have been soft-deleted for more than 30 days.
 */
class DeleteOldSoftDeletedUsers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(UserAvatarService $avatarService): void
    {
        $retentionDays = 30;
        $cutoffDate = Carbon::now()->subDays($retentionDays);

        // Find users who were soft-deleted before the cutoff date
        $users = User::onlyTrashed()
            ->where('deleted_at', '<=', $cutoffDate)
            ->select(['id', 'name', 'email', 'avatar', 'deleted_at'])
            ->get();

        $deletedCount = 0;
        $failedCount = 0;

        foreach ($users as $user) {
            try {
                // Delete avatar before force deleting user
                if ($user->avatar) {
                    $avatarService->deleteAvatar($user);
                }

                // Force delete the user (avatar already deleted by service)
                $user->forceDelete();

                $deletedCount++;

                Log::info('Old soft-deleted user permanently deleted', [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'deleted_at' => $user->deleted_at,
                ]);
            } catch (\Exception $e) {
                $failedCount++;

                Log::error('Failed to permanently delete old soft-deleted user', [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($deletedCount > 0 || $failedCount > 0) {
            Log::info('Old soft-deleted users cleanup completed', [
                'deleted_count' => $deletedCount,
                'failed_count' => $failedCount,
                'cutoff_date' => $cutoffDate->toDateTimeString(),
            ]);
        }
    }
}
