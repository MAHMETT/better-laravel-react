<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(protected MediaService $mediaService) {}

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
            ->select(['id', 'name', 'email', 'role', 'status', 'avatar', 'created_at', 'updated_at'])
            ->with('avatarMedia')
            ->filter($filters)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $stats = [
            'total' => User::count(),
            'enabled' => User::where('status', 'enable')->count(),
            'disabled' => User::where('status', 'disable')->count(),
            'admins' => User::where('role', 'admin')->count(),
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
     * Get the user ID from the request route parameter.
     */
    private function getUserIdFromRequest(Request $request): int|string
    {
        $userParam = $request->route()->parameter('id')
            ?? $request->route()->parameter('user');

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
     * Find a user by ID with optional soft deletes.
     */
    private function findUser(int|string $userId, bool $withTrashed = false): ?User
    {
        return $withTrashed
            ? User::withTrashed()->find($userId)
            : User::find($userId);
    }

    /**
     * Find a user by ID or fail with soft deletes.
     */
    private function findUserOrFail(int|string $userId, bool $withTrashed = false): User
    {
        return $withTrashed
            ? User::withTrashed()->findOrFail($userId)
            : User::findOrFail($userId);
    }

    /**
     * Display the specified user (including soft-deleted).
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);
        $user = $this->findUser($userId, withTrashed: true);

        if (! $user) {
            return to_route('users.index')->with('error', 'User not found.');
        }

        return Inertia::render('admin/users/show', [
            'user' => $user->load('avatarMedia'),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);
        $user = $this->findUser($userId, withTrashed: true);

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
        $user = $this->findUser($userId, withTrashed: true);

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
        $user = $this->findUser($userId, withTrashed: true);

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
        $user = $this->findUser($userId, withTrashed: true);

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
        $user = $this->findUserOrFail($userId, withTrashed: true);
        $user->restore();

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
        $user = $this->findUserOrFail($userId, withTrashed: true);
        $user->forceDelete();

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
            ->select(['id', 'name', 'email', 'role', 'status', 'avatar', 'deleted_at', 'updated_at'])
            ->filter($filters)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/users/trashed', [
            'users' => $users,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
        ]);
    }

    /**
     * Update user avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);
        $user = $this->findUser($userId, withTrashed: true);

        if (! $user) {
            return back()->withErrors(['avatar' => 'User not found.']);
        }

        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120', 'min:10'],
        ]);

        try {
            $this->mediaService->replaceUserAvatar(
                user: $user,
                file: $request->file('avatar'),
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Avatar upload failed: '.$e->getMessage(), [
                'user_id' => $user->id,
                'exception' => $e,
            ]);

            return back()->withErrors(['avatar' => 'Failed to upload avatar. Please try again.']);
        }

        return back()->with('success', 'Avatar updated successfully.');
    }

    /**
     * Delete user avatar.
     */
    public function deleteAvatar(Request $request): RedirectResponse
    {
        $userId = $this->getUserIdFromRequest($request);
        $user = $this->findUser($userId, withTrashed: true);

        if (! $user) {
            return back()->withErrors(['avatar' => 'User not found.']);
        }

        $this->mediaService->deleteUserAvatar($user);

        return back()->with('success', 'Avatar deleted successfully.');
    }
}
