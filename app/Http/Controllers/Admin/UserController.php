<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->input('search', ''),
            'status' => $request->input('status', ''),
            'role' => $request->input('role', ''),
        ];
        $perPage = (int) $request->input('per_page', 10);

        $users = User::query()
            ->with('avatarMedia')
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $stats = [
            'total' => User::count(),
            'enabled' => User::enabled()->count(),
            'disabled' => User::disabled()->count(),
            'admins' => User::admin()->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user (including soft-deleted).
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $user = User::withTrashed()->with('avatarMedia')->find($userId);

        if (! $user) {
            return to_route('users.index')->with('error', 'User not found.');
        }

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Get the user ID from the request route parameter.
     */
    private function getUserIdFromRequest(Request $request): int|string
    {
        // Try 'id' parameter first (for additional routes)
        $userParam = $request->route()->parameter('id');

        // If not found, try 'user' parameter (for resource routes)
        if ($userParam === null) {
            $userParam = $request->route()->parameter('user');
        }

        if ($userParam === null) {
            return 0;
        }

        if (is_numeric($userParam)) {
            return (int) $userParam;
        }

        if (is_array($userParam) && isset($userParam['id'])) {
            return $userParam['id'];
        }

        if ($userParam instanceof User) {
            return $userParam->id;
        }

        return $userParam;
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $user = User::withTrashed()->find($userId);

        if (! $user) {
            return to_route('users.index')->with('error', 'User not found.');
        }

        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $user = User::withTrashed()->find($userId);

        if (! $user) {
            return to_route('users.index')->with('error', 'User not found.');
        }

        $validated = $request->validated();

        if (isset($validated['password']) && ! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()
            ->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Soft delete the specified user.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $user = User::withTrashed()->find($userId);

        if (! $user) {
            return to_route('users.index')->with('error', 'User not found.');
        }

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(Request $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $user = User::withTrashed()->find($userId);

        if (! $user) {
            return to_route('users.index')->with('error', 'User not found.');
        }

        $user->update([
            'status' => $user->status === 'enable' ? 'disable' : 'enable',
        ]);

        return redirect()
            ->back()
            ->with('success', 'User status updated successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(Request $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $userModel = User::withTrashed()->findOrFail($userId);
        $userModel->restore();

        return redirect()
            ->route('users.index')
            ->with('success', 'User restored successfully.');
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete(Request $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);

        $userModel = User::withTrashed()->findOrFail($userId);
        $userModel->forceDelete();

        return redirect()
            ->route('users.trashed')
            ->with('success', 'User permanently deleted.');
    }

    /**
     * Display a listing of soft-deleted users.
     */
    public function trashed(Request $request): Response
    {
        $filters = [
            'search' => $request->input('search', ''),
            'status' => $request->input('status', ''),
            'role' => $request->input('role', ''),
        ];
        $perPage = (int) $request->input('per_page', 10);

        $users = User::onlyTrashed()
            ->filter($filters)
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/users/trashed', [
            'users' => $users,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
        ]);
    }
}
