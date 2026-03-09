<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Queries\UserQuery;
use App\Services\User\UserAvatarService;
use App\Services\UserService;
use App\Services\UserStatsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected UserAvatarService $userAvatarService,
        protected UserStatsService $userStatsService,
        protected UserQuery $userQuery
    ) {}

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $filters = $this->getFilters($request);
        $perPage = $this->sanitizePerPage($request);

        $users = $this->userQuery->paginate($filters, $perPage);
        $stats = $this->userStatsService->calculate();

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
        $avatar = $request->file('avatar');

        try {
            $this->userService->create($validated, $avatar);
        } catch (\Exception $e) {
            Log::error('User creation failed', [
                'exception' => [
                    'message' => $e->getMessage(),
                    'type' => get_class($e),
                ],
            ]);

            return back()->withErrors(['general' => 'Failed to create user. Please try again.']);
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user = $this->userQuery->findWithAvatarOrFail($user->id, withTrashed: true);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $user = $this->userQuery->findWithAvatarOrFail($user->id, withTrashed: true);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $this->userService->update($user, $validated);

        return redirect()
            ->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Soft delete the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->userService->delete($user);

        return redirect()
            ->route('users.index')
            ->with('success', 'User deleted successfully.')
            ->with('deleted_user_id', $user->id);
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        $this->userService->toggleStatus($user);

        return redirect()
            ->back()
            ->with('success', 'User status updated successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(User $user): RedirectResponse
    {
        $this->userService->restore($user);

        return redirect()
            ->route('users.index')
            ->with('success', 'User restored successfully.');
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete(User $user): RedirectResponse
    {
        $this->userService->forceDelete($user);

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
        $perPage = $this->sanitizePerPage($request);

        $users = $this->userQuery->paginateTrashed($filters, $perPage);

        return Inertia::render('admin/users/trashed', [
            'users' => $users,
            'filters' => [...$filters, 'per_page' => $perPage],
        ]);
    }

    /**
     * Update user avatar.
     */
    public function updateAvatar(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120', 'min:10'],
        ]);

        try {
            $this->userAvatarService->uploadAvatar($user, $request->file('avatar'));
        } catch (\Exception $e) {
            $this->userAvatarService->logError($user, $e);

            return back()->withErrors(['avatar' => 'Failed to upload avatar. Please try again.']);
        }

        return back()->with('success', 'Avatar updated successfully.');
    }

    /**
     * Delete user avatar.
     */
    public function deleteAvatar(User $user): RedirectResponse
    {
        $this->userAvatarService->deleteAvatar($user);

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
     * Sanitize pagination limit to prevent abuse.
     */
    protected function sanitizePerPage(Request $request): int
    {
        return min((int) $request->input('per_page', 10), 100);
    }
}
