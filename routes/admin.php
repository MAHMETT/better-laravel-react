<?php

use App\Http\Controllers\Admin\AdminUserLogController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Users additional routes (must be before resource routes)
    Route::get('users/trashed', [UserController::class, 'trashed'])
        ->name('users.trashed');
    Route::post('users/{user}/restore', [UserController::class, 'restore'])
        ->name('users.restore')
        ->can('restore', 'user');
    Route::delete('users/{user}/force-delete', [UserController::class, 'forceDelete'])
        ->name('users.force-delete')
        ->can('forceDelete', 'user');
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status')
        ->can('toggleStatus', 'user');
    Route::patch('users/{user}/avatar', [UserController::class, 'updateAvatar'])
        ->name('users.update-avatar')
        ->can('updateAvatar', 'user');
    Route::delete('users/{user}/avatar', [UserController::class, 'deleteAvatar'])
        ->name('users.delete-avatar')
        ->can('deleteAvatar', 'user');
    Route::get('activity-logs/users', [AdminUserLogController::class, 'users'])
        ->name('activity-logs.users');
    Route::get('activity-logs', [AdminUserLogController::class, 'index'])
        ->name('activity-logs.index');
    Route::get('users/{user}/activity-logs', [AdminUserLogController::class, 'user'])
        ->name('activity-logs.user');

    // Users CRUD
    Route::resource('users', UserController::class)->names('users');
});
