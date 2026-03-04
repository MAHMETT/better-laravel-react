<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SelfUserLogIndexRequest;
use App\Models\UserLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class UserSelfLogController extends Controller
{
    /**
     * Display paginated login activity logs for the authenticated user.
     */
    public function index(SelfUserLogIndexRequest $request): Response
    {
        $filters = $this->resolveFilters($request);
        $user = $request->user();

        if (! Schema::hasTable('user_logs')) {
            return Inertia::render('settings/login-activity', [
                'logs' => $this->emptyPaginator($filters['per_page']),
                'filters' => $filters,
                'schema_ready' => false,
            ]);
        }

        $logs = UserLog::query()
            ->where('user_id', $user->id)
            ->filter($filters)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('settings/login-activity', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    /**
     * @return array{
     *     event_type: string,
     *     date_from: string,
     *     date_to: string,
     *     per_page: int
     * }
     */
    protected function resolveFilters(SelfUserLogIndexRequest $request): array
    {
        $validated = $request->validated();

        return [
            'event_type' => (string) ($validated['event_type'] ?? ''),
            'date_from' => (string) ($validated['date_from'] ?? ''),
            'date_to' => (string) ($validated['date_to'] ?? ''),
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
