<?php

use App\Jobs\DeleteOldSoftDeletedUsers;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule daily cleanup of old soft-deleted users (older than 30 days)
Schedule::job(new DeleteOldSoftDeletedUsers)->dailyAt('03:00')->name('delete-old-soft-deleted-users');
