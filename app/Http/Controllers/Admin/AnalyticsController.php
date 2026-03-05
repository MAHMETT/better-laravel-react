<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display the visitor analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $filters = $this->resolveFilters($request);

        return Inertia::render('admin/analytics/index', [
            'filters' => $filters,
        ]);
    }

    /**
     * Get analytics summary data (total, new, loyal, other visitors).
     */
    public function summary(Request $request): JsonResponse
    {
        $filters = $this->resolveFilters($request);

        // Build base query with proper Eloquent filtering
        $query = $this->buildBaseQuery($filters);

        // Total unique visitors
        $totalVisitors = $query->clone()
            ->distinct('session_id')
            ->count('session_id');

        // Quick return if no data
        if ($totalVisitors === 0) {
            return $this->jsonEmptySummary($filters);
        }

        // New visitors: sessions with only 1 visit total
        $newVisitors = $query->clone()
            ->select('session_id')
            ->groupBy('session_id')
            ->havingRaw('COUNT(*) = 1')
            ->count();

        // Loyal visitors: sessions with visits on multiple different days
        $loyalVisitors = $query->clone()
            ->select('session_id')
            ->groupBy('session_id')
            ->havingRaw('COUNT(DISTINCT DATE(visited_at)) > 1')
            ->count();

        // Other visitors
        $otherVisitors = max(0, $totalVisitors - $newVisitors - $loyalVisitors);

        // Device distribution
        $deviceDistribution = $query->clone()
            ->select('device_type', DB::raw('COUNT(*) as count'))
            ->groupBy('device_type')
            ->pluck('count', 'device_type');

        // User vs Guest distribution
        $userVisits = $query->clone()->whereNotNull('user_id')->count();
        $guestVisits = $query->clone()->whereNull('user_id')->count();

        return response()->json([
            'summary' => [
                'total_visitors' => $totalVisitors,
                'new_visitors' => $newVisitors,
                'loyal_visitors' => $loyalVisitors,
                'other_visitors' => $otherVisitors,
            ],
            'device_distribution' => [
                'desktop' => $deviceDistribution->get('desktop', 0),
                'mobile' => $deviceDistribution->get('mobile', 0),
                'tablet' => $deviceDistribution->get('tablet', 0),
                'unknown' => $deviceDistribution->get(null, 0),
            ],
            'user_type' => [
                'users' => $userVisits,
                'guests' => $guestVisits,
            ],
            'date_range' => $this->getDateRange($filters),
        ]);
    }

    /**
     * Get chart data for traffic over time.
     */
    public function chartData(Request $request): JsonResponse
    {
        $filters = $this->resolveFilters($request);
        $granularity = $filters['granularity'] ?? 'daily';

        // Build base query
        $query = $this->buildBaseQuery($filters);

        $chartData = match ($granularity) {
            'hourly' => $this->getHourlyData($query),
            'daily' => $this->getDailyData($query),
            'weekly' => $this->getWeeklyData($query),
            'monthly' => $this->getMonthlyData($query),
            default => $this->getDailyData($query),
        };

        return response()->json([
            'chart_data' => $chartData,
            'granularity' => $granularity,
            'date_range' => $this->getDateRange($filters),
        ]);
    }

    /**
     * Get top visited routes.
     */
    public function topRoutes(Request $request): JsonResponse
    {
        $filters = $this->resolveFilters($request);

        $topRoutes = $this->buildBaseQuery($filters)
            ->select('route_path', 'route_name', DB::raw('COUNT(*) as visits'))
            ->groupBy('route_path', 'route_name')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn ($route) => [
                'route_path' => $route->route_path,
                'route_name' => $route->route_name,
                'visits' => (int) $route->visits,
            ]);

        return response()->json([
            'top_routes' => $topRoutes,
        ]);
    }

    /**
     * Get top referrers.
     */
    public function topReferrers(Request $request): JsonResponse
    {
        $filters = $this->resolveFilters($request);

        $topReferrers = $this->buildBaseQuery($filters)
            ->whereNotNull('referrer')
            ->select('referrer', DB::raw('COUNT(*) as visits'))
            ->groupBy('referrer')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn ($referrer) => [
                'referrer' => $referrer->referrer,
                'visits' => (int) $referrer->visits,
            ]);

        return response()->json([
            'top_referrers' => $topReferrers,
        ]);
    }

    /**
     * @return array{
     *     date_from: string,
     *     date_to: string,
     *     time_from: string,
     *     time_to: string,
     *     preset: string,
     *     granularity: string,
     *     per_page: int
     * }
     */
    protected function resolveFilters(Request $request): array
    {
        $preset = (string) ($request->get('preset') ?? 'today');
        $dateRange = $this->getDateRangeFromPreset($preset);

        return [
            'date_from' => (string) ($request->get('date_from') ?? $dateRange['from']),
            'date_to' => (string) ($request->get('date_to') ?? $dateRange['to']),
            'time_from' => (string) ($request->get('time_from') ?? '0'),
            'time_to' => (string) ($request->get('time_to') ?? '23'),
            'preset' => $preset,
            'granularity' => (string) ($request->get('granularity') ?? 'daily'),
            'per_page' => (int) ($request->get('per_page') ?? 10),
        ];
    }

    /**
     * Build base query with proper filtering.
     */
    protected function buildBaseQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        $query = Visit::query();

        // Apply date filters
        $query->when(
            ! empty($filters['date_from']),
            fn ($q) => $q->where('visited_at', '>=', Carbon::parse($filters['date_from'])->startOfDay())
        );

        $query->when(
            ! empty($filters['date_to']),
            fn ($q) => $q->where('visited_at', '<=', Carbon::parse($filters['date_to'])->endOfDay())
        );

        // Apply time filters using database-agnostic method
        $query->when(
            ! empty($filters['time_from']) && $filters['time_from'] !== '0',
            fn ($q) => $q->whereRaw(
                'EXTRACT(HOUR FROM visited_at) >= ?',
                [(int) $filters['time_from']]
            )
        );

        $query->when(
            ! empty($filters['time_to']) && $filters['time_to'] !== '23',
            fn ($q) => $q->whereRaw(
                'EXTRACT(HOUR FROM visited_at) <= ?',
                [(int) $filters['time_to']]
            )
        );

        return $query;
    }

    /**
     * Return empty summary response.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function jsonEmptySummary(array $filters): JsonResponse
    {
        return response()->json([
            'summary' => [
                'total_visitors' => 0,
                'new_visitors' => 0,
                'loyal_visitors' => 0,
                'other_visitors' => 0,
            ],
            'device_distribution' => [
                'desktop' => 0,
                'mobile' => 0,
                'tablet' => 0,
                'unknown' => 0,
            ],
            'user_type' => [
                'users' => 0,
                'guests' => 0,
            ],
            'date_range' => $this->getDateRange($filters),
        ]);
    }

    /**
     * @return array{from: string, to: string}
     */
    protected function getDateRange(array $filters): array
    {
        return [
            'from' => $filters['date_from'],
            'to' => $filters['date_to'],
        ];
    }

    /**
     * @return array{from: string, to: string}
     */
    protected function getDateRangeFromPreset(string $preset): array
    {
        return match ($preset) {
            'today' => [
                'from' => now()->toDateString(),
                'to' => now()->toDateString(),
            ],
            'yesterday' => [
                'from' => now()->subDay()->toDateString(),
                'to' => now()->toDateString(),
            ],
            'this_week' => [
                'from' => now()->startOfWeek()->toDateString(),
                'to' => now()->toDateString(),
            ],
            'last_week' => [
                'from' => now()->subWeek()->startOfWeek()->toDateString(),
                'to' => now()->subWeek()->endOfWeek()->toDateString(),
            ],
            'this_month' => [
                'from' => now()->startOfMonth()->toDateString(),
                'to' => now()->toDateString(),
            ],
            'last_month' => [
                'from' => now()->subMonth()->startOfMonth()->toDateString(),
                'to' => now()->subMonth()->endOfMonth()->toDateString(),
            ],
            'this_year' => [
                'from' => now()->startOfYear()->toDateString(),
                'to' => now()->toDateString(),
            ],
            'custom' => [
                'from' => now()->subDays(30)->toDateString(),
                'to' => now()->toDateString(),
            ],
            default => [
                'from' => now()->toDateString(),
                'to' => now()->toDateString(),
            ],
        };
    }

    /**
     * Get hourly aggregated data.
     *
     * @return list<array{period: string, visits: int, unique_visitors: int}>
     */
    protected function getHourlyData($query): array
    {
        return $query
            ->select(
                DB::raw('DATE(visited_at) as date'),
                DB::raw('EXTRACT(HOUR FROM visited_at) as hour'),
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors'),
            )
            ->groupBy('date', 'hour')
            ->orderBy('date')
            ->orderBy('hour')
            ->get()
            ->map(fn ($row) => [
                'period' => Carbon::parse($row->date)->format('Y-m-d').' '.str_pad((string) (int) $row->hour, 2, '0', STR_PAD_LEFT).':00',
                'visits' => (int) $row->visits,
                'unique_visitors' => (int) $row->unique_visitors,
            ])
            ->toArray();
    }

    /**
     * Get daily aggregated data.
     *
     * @return list<array{period: string, visits: int, unique_visitors: int}>
     */
    protected function getDailyData($query): array
    {
        return $query
            ->select(
                DB::raw('DATE(visited_at) as date'),
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors'),
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'period' => $row->date,
                'visits' => (int) $row->visits,
                'unique_visitors' => (int) $row->unique_visitors,
            ])
            ->toArray();
    }

    /**
     * Get weekly aggregated data.
     *
     * @return list<array{period: string, visits: int, unique_visitors: int}>
     */
    protected function getWeeklyData($query): array
    {
        return $query
            ->select(
                DB::raw('EXTRACT(YEAR FROM visited_at) as year'),
                DB::raw('EXTRACT(WEEK FROM visited_at) as week'),
                DB::raw('MIN(DATE(visited_at)) as week_start'),
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors'),
            )
            ->groupBy('year', 'week')
            ->orderBy('year')
            ->orderBy('week')
            ->get()
            ->map(fn ($row) => [
                'period' => Carbon::parse($row->week_start)->format('Y-m-d'),
                'visits' => (int) $row->visits,
                'unique_visitors' => (int) $row->unique_visitors,
            ])
            ->toArray();
    }

    /**
     * Get monthly aggregated data.
     *
     * @return list<array{period: string, visits: int, unique_visitors: int}>
     */
    protected function getMonthlyData($query): array
    {
        return $query
            ->select(
                DB::raw('EXTRACT(YEAR FROM visited_at) as year'),
                DB::raw('EXTRACT(MONTH FROM visited_at) as month'),
                DB::raw('MIN(DATE(visited_at)) as month_start'),
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors'),
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'period' => sprintf('%04d-%02d-01', (int) $row->year, (int) $row->month),
                'visits' => (int) $row->visits,
                'unique_visitors' => (int) $row->unique_visitors,
            ])
            ->toArray();
    }
}
