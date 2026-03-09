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
use Illuminate\Support\Facades\Log;
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
        $filters = $this->getFilters($request);
        $perPage = (int) $request->input('per_page', 10);

        $users = $this->getUsersQuery($filters, $perPage);
        $stats = $this->calculateStats();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [...$filters, 'per_page' => $perPage],
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

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
            'status' => $validated['status'] ?? 'enable',
        ]);

        if ($request->hasFile('avatar')) {
            try {
                $this->handleAvatarUpload($user, $request->file('avatar'));
            } catch (\Exception $e) {
                Log::error('Avatar upload failed: '.$e->getMessage(), [
                    'user_id' => $user->id,
                    'exception' => $e,
                ]);

                return back()->withErrors(['avatar' => 'Failed to upload avatar. Please try again.']);
            }
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user (including soft-deleted).
     */
    public function show(Request $request): Response
    {
        $user = $this->loadUserWithAvatar($request, withTrashed: true);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request): Response
    {
        $user = $this->loadUserWithAvatar($request, withTrashed: true);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request): RedirectResponse
    {
        $user = $this->loadUserWithAvatar($request, withTrashed: true);

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
        $user = $this->loadUser($request, withTrashed: true);

        if (! $user) {
            return to_route('users.index')
                ->with('error', 'User not found.');
        }

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'User deleted successfully.')
            ->with('deleted_user_id', $user->id);
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(Request $request): RedirectResponse
    {
        $user = $this->loadUser($request, withTrashed: true);

        if (! $user) {
            return to_route('users.index')
                ->with('error', 'User not found.');
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
        $user = $this->loadUserOrFail($request, withTrashed: true);
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
        $user = $this->loadUserOrFail($request, withTrashed: true);

        // Force delete will trigger the UserObserver which handles avatar deletion
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
        $filters = $this->getFilters($request);
        $perPage = (int) $request->input('per_page', 10);

        $users = $this->getTrashedUsersQuery($filters, $perPage);

        return Inertia::render('admin/users/trashed', [
            'users' => $users,
            'filters' => [...$filters, 'per_page' => $perPage],
        ]);
    }

    /**
     * Update user avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $user = $this->loadUser($request, withTrashed: true);

        if (! $user) {
            return back()->withErrors(['avatar' => 'User not found.']);
        }

        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120', 'min:10'],
        ]);

        try {
            $this->handleAvatarUpload($user, $request->file('avatar'));
        } catch (\Exception $e) {
            Log::error('Avatar upload failed: '.$e->getMessage(), [
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
        $user = $this->loadUser($request, withTrashed: true);

        if (! $user) {
            return back()->withErrors(['avatar' => 'User not found.']);
        }

        $this->mediaService->deleteUserAvatar($user);

        return back()->with('success', 'Avatar deleted successfully.');
    }

    /**
     * Get filters from request.
     *
     * @return array{search: string, status: string, role: string}
     */
    protected function getFilters(Request $request): array
    {
        return [
            'search' => $request->input('search', ''),
            'status' => $request->input('status', ''),
            'role' => $request->input('role', ''),
        ];
    }

    /**
     * Get paginated users query with filters.
     */
    protected function getUsersQuery(array $filters, int $perPage): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return User::query()
            ->select(['id', 'name', 'email', 'role', 'status', 'avatar', 'created_at', 'updated_at'])
            ->with(['avatarMedia' => fn ($q) => $q->select(['id', 'path', 'disk', 'metadata'])])
            ->filter($filters)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Get paginated trashed users query with filters.
     */
    protected function getTrashedUsersQuery(array $filters, int $perPage): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return User::onlyTrashed()
            ->select(['id', 'name', 'email', 'role', 'status', 'avatar', 'deleted_at', 'updated_at'])
            ->with(['avatarMedia' => fn ($q) => $q->select(['id', 'path', 'disk', 'metadata'])])
            ->filter($filters)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Calculate user statistics.
     *
     * @return array{total: int, enabled: int, disabled: int, admins: int}
     */
    protected function calculateStats(): array
    {
        return [
            'total' => User::query()->count(),
            'enabled' => User::query()->where('status', 'enable')->count(),
            'disabled' => User::query()->where('status', 'disable')->count(),
            'admins' => User::query()->where('role', 'admin')->count(),
        ];
    }

    /**
     * Load user with avatar media relationship.
     */
    protected function loadUserWithAvatar(Request $request, bool $withTrashed = false): User
    {
        $query = $withTrashed ? User::withTrashed() : User::query();

        return $query->select([
            'id',
            'name',
            'email',
            'role',
            'status',
            'avatar',
            'created_at',
            'updated_at',
            'deleted_at',
        ])
            ->with(['avatarMedia' => fn ($q) => $q->select(['id', 'path', 'disk', 'metadata', 'type', 'extension'])])
            ->findOrFail($this->getUserIdFromRequest($request));
    }

    /**
     * Load user without avatar media relationship.
     */
    protected function loadUser(Request $request, bool $withTrashed = false): ?User
    {
        $query = $withTrashed ? User::withTrashed() : User::query();

        return $query->find($this->getUserIdFromRequest($request));
    }

    /**
     * Load user or fail without avatar media relationship.
     */
    protected function loadUserOrFail(Request $request, bool $withTrashed = false): User
    {
        $query = $withTrashed ? User::withTrashed() : User::query();

        return $query->findOrFail($this->getUserIdFromRequest($request));
    }

    /**
     * Get the user ID from the request route parameter.
     */
    protected function getUserIdFromRequest(Request $request): int
    {
        $userParam = $request->route()->parameter('id')
            ?? $request->route()->parameter('user');

        return match (true) {
            $userParam instanceof User => $userParam->id,
            is_numeric($userParam) => (int) $userParam,
            default => 0,
        };
    }

    /**
     * Handle avatar upload for a user.
     */
    protected function handleAvatarUpload(User $user, \Illuminate\Http\UploadedFile $file): void
    {
        try {
            $this->mediaService->replaceUserAvatar(
                user: $user,
                file: $file,
            );
        } catch (\Exception $e) {
            Log::error('Avatar upload failed: '.$e->getMessage(), [
                'user_id' => $user->id,
                'exception' => $e,
            ]);

            throw $e;
        }
    }
}
