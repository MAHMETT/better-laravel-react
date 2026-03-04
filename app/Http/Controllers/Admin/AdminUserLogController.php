<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminUserLogIndexRequest;
use App\Http\Requests\AdminUserLogUserSearchRequest;
use App\Models\User;
use App\Models\UserLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserLogController extends Controller
{
    /**
     * Display paginated login activity logs for all users.
     */
    public function index(AdminUserLogIndexRequest $request): Response
    {
        $filters = $this->resolveFilters($request);

        if (! Schema::hasTable('user_logs')) {
            return Inertia::render('admin/user-logs/index', [
                'logs' => $this->emptyPaginator($filters['per_page']),
                'filters' => $filters,
                'schema_ready' => false,
            ]);
        }

        $logs = UserLog::query()
            ->select([
                'id',
                'user_id',
                'event_type',
                'ip_address',
                'user_agent',
                'device_info',
                'session_id',
                'created_at',
            ])
            ->with(['user:id,name,email'])
            ->filter($filters)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('admin/user-logs/index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    /**
     * Display paginated login activity logs for a specific user.
     */
    public function user(AdminUserLogIndexRequest $request, User $user): Response
    {
        $filters = $this->resolveFilters($request);
        $filters['user_ids'] = [$user->id];

        if (! Schema::hasTable('user_logs')) {
            return Inertia::render('admin/users/activity-logs', [
                'user' => $user->only(['id', 'name', 'email']),
                'logs' => $this->emptyPaginator($filters['per_page']),
                'filters' => $filters,
                'schema_ready' => false,
            ]);
        }

        $logs = UserLog::query()
            ->select([
                'id',
                'user_id',
                'event_type',
                'ip_address',
                'user_agent',
                'device_info',
                'session_id',
                'created_at',
            ])
            ->with(['user:id,name,email'])
            ->filter($filters)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('admin/users/activity-logs', [
            'user' => $user->only(['id', 'name', 'email']),
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    /**
     * Search users for the activity log filter modal.
     */
    public function users(AdminUserLogUserSearchRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 30);
        $search = trim((string) ($validated['search'] ?? ''));
        $role = (string) ($validated['role'] ?? '');
        $status = (string) ($validated['status'] ?? '');
        $cursor = isset($validated['cursor']) ? (string) $validated['cursor'] : null;
        $selectedIds = array_values(array_unique(array_map(
            static fn (mixed $value): int => (int) $value,
            $validated['selected_ids'] ?? [],
        )));

        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'status'])
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    if (is_numeric($search)) {
                        $query->where('id', (int) $search);

                        return;
                    }

                    $query->where(function (Builder $innerQuery) use ($search): void {
                        $innerQuery
                            ->where('name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
                },
            )
            ->when(
                $role !== '',
                fn (Builder $query) => $query->where('role', $role),
            )
            ->when(
                $status !== '',
                fn (Builder $query) => $query->where('status', $status),
            )
            ->orderBy('id')
            ->cursorPaginate(
                perPage: $perPage,
                columns: ['id', 'name', 'email', 'role', 'status'],
                cursorName: 'cursor',
                cursor: $cursor,
            );

        $selectedUsers = collect();

        if (! empty($selectedIds)) {
            $selectedUsers = User::query()
                ->select(['id', 'name', 'email', 'role', 'status'])
                ->whereIn('id', $selectedIds)
                ->orderBy('name')
                ->orderBy('id')
                ->get();
        }

        return response()->json([
            'data' => $users->items(),
            'selected' => $selectedUsers,
            'meta' => [
                'per_page' => $users->perPage(),
                'has_more' => $users->hasMorePages(),
                'next_cursor' => $users->nextCursor()?->encode(),
                'previous_cursor' => $users->previousCursor()?->encode(),
            ],
        ]);
    }

    /**
     * @return array{
     *     user_ids: list<int>,
     *     event_type: string,
     *     date_from: string,
     *     date_to: string,
     *     per_page: int
     * }
     */
    protected function resolveFilters(AdminUserLogIndexRequest $request): array
    {
        $validated = $request->validated();

        $userIds = array_values(array_unique(array_map(
            static fn (mixed $value): int => (int) $value,
            $validated['user_ids'] ?? [],
        )));

        return [
            'user_ids' => $userIds,
            'event_type' => (string) ($validated['event_type'] ?? ''),
            'date_from' => (string) ($validated['date_from'] ?? now()->subDays(30)->toDateString()),
            'date_to' => (string) ($validated['date_to'] ?? now()->toDateString()),
            'per_page' => (int) ($validated['per_page'] ?? 10),
        ];
    }

    protected function emptyPaginator(int $perPage): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            items: new Collection,
            total: 0,
            perPage: $perPage,
            currentPage: 1,
            options: [
                'path' => request()->url(),
                'query' => request()->query(),
            ],
        );
    }
}
