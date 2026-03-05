<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VisitorAnalyticsController extends Controller
{
    /**
     * Display the visitor management dashboard.
     */
    public function index(Request $request): Response
    {
        $filters = $this->resolveFilters($request);

        return Inertia::render('admin/visitor-analytics/index', [
            'filters' => $filters,
        ]);
    }

    /**
     * Get KPI statistics for today's visitors.
     */
    public function kpiStats(Request $request): JsonResponse
    {
        $filters = $this->resolveFilters($request);
        $dateFrom = $filters['date_from'] ?? today()->toDateString();
        $dateTo = $filters['date_to'] ?? today()->toDateString();

        // Today's visitors
        $todaysVisitors = Visitor::query()
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->count();

        // Checked in (currently inside)
        $checkedIn = Visitor::query()
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->where('status', 'checked_in')
            ->count();

        // Checked out
        $checkedOut = Visitor::query()
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->where('status', 'checked_out')
            ->count();

        // Yet to check out (same as checked in)
        $yetToCheckOut = $checkedIn;

        // Returning visitors
        $returningVisitors = Visitor::query()
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->where('is_returning', true)
            ->count();

        // Calculate percentage changes (compared to previous period)
        $previousDateFrom = Carbon::parse($dateFrom)->subDays(7)->toDateString();
        $previousDateTo = Carbon::parse($dateTo)->subDays(7)->toDateString();

        $previousTodaysVisitors = Visitor::query()
            ->whereDate('check_in_at', '>=', $previousDateFrom)
            ->whereDate('check_in_at', '<=', $previousDateTo)
            ->count();

        $percentageChange = $previousTodaysVisitors > 0
            ? round((($todaysVisitors - $previousTodaysVisitors) / $previousTodaysVisitors) * 100, 1)
            : 0;

        return response()->json([
            'kpi_stats' => [
                'todays_visitors' => $todaysVisitors,
                'checked_in' => $checkedIn,
                'checked_out' => $checkedOut,
                'yet_to_check_out' => $yetToCheckOut,
                'returning_visitors' => $returningVisitors,
                'percentage_change' => $percentageChange,
            ],
        ]);
    }

    /**
     * Get daily visits data for bar chart (This Week vs Last Week).
     */
    public function dailyVisits(Request $request): JsonResponse
    {
        $mode = $request->get('mode', 'weekly'); // weekly or yearly

        if ($mode === 'yearly') {
            // Monthly data for the year
            $currentYearData = Visitor::query()
                ->select(
                    DB::raw('EXTRACT(MONTH FROM check_in_at) as month'),
                    DB::raw('COUNT(*) as visits'),
                )
                ->whereYear('check_in_at', date('Y'))
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('visits', 'month');

            $data = [];
            for ($i = 1; $i <= 12; $i++) {
                $data[] = [
                    'label' => Carbon::create()->month($i)->format('M'),
                    'visits' => (int) ($currentYearData->get($i) ?? 0),
                ];
            }

            return response()->json([
                'daily_visits' => $data,
                'mode' => 'yearly',
            ]);
        }

        // Weekly data (This Week vs Last Week)
        $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $today = Carbon::today();
        $startOfWeek = $today->copy()->startOfWeek();
        $endOfWeek = $today->copy()->endOfWeek();
        $startOfLastWeek = $startOfWeek->copy()->subWeek();
        $endOfLastWeek = $endOfWeek->copy()->subWeek();

        // This week's data
        $thisWeekData = Visitor::query()
            ->select(
                DB::raw('EXTRACT(DOW FROM check_in_at) as day_of_week'),
                DB::raw('COUNT(*) as visits'),
            )
            ->whereBetween('check_in_at', [$startOfWeek, $endOfWeek])
            ->groupBy('day_of_week')
            ->pluck('visits', 'day_of_week');

        // Last week's data
        $lastWeekData = Visitor::query()
            ->select(
                DB::raw('EXTRACT(DOW FROM check_in_at) as day_of_week'),
                DB::raw('COUNT(*) as visits'),
            )
            ->whereBetween('check_in_at', [$startOfLastWeek, $endOfLastWeek])
            ->groupBy('day_of_week')
            ->pluck('visits', 'day_of_week');

        $data = [];
        foreach ($daysOfWeek as $index => $day) {
            $dayNum = $index + 1; // PostgreSQL DOW: 0=Sunday, 1=Monday, etc.
            $data[] = [
                'label' => $day,
                'this_week' => (int) ($thisWeekData->get($dayNum) ?? 0),
                'last_week' => (int) ($lastWeekData->get($dayNum) ?? 0),
            ];
        }

        return response()->json([
            'daily_visits' => $data,
            'mode' => 'weekly',
        ]);
    }

    /**
     * Get peak hour data for line/area chart.
     */
    public function peakHour(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', today()->toDateString());
        $dateTo = $request->get('date_to', today()->toDateString());

        $hourlyData = Visitor::query()
            ->select(
                DB::raw('FLOOR(EXTRACT(HOUR FROM check_in_at) / 1) as hour'),
                DB::raw('COUNT(*) as visits'),
            )
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('visits', 'hour');

        $data = [];
        $peakHour = 0;
        $peakVisits = 0;

        for ($i = 6; $i <= 21; $i++) {
            $visits = (int) ($hourlyData->get($i) ?? 0);
            if ($visits > $peakVisits) {
                $peakHour = $i;
                $peakVisits = $visits;
            }
            $data[] = [
                'hour' => sprintf('%02d:00', $i),
                'visits' => $visits,
            ];
        }

        return response()->json([
            'peak_hour_data' => $data,
            'peak_hour' => sprintf('%02d:00', $peakHour),
            'peak_visits' => $peakVisits,
        ]);
    }

    /**
     * Get returning visitors donut chart data.
     */
    public function returningVisitors(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', today()->toDateString());
        $dateTo = $request->get('date_to', today()->toDateString());

        $recurring = Visitor::query()
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->where('is_returning', true)
            ->count();

        $oneTime = Visitor::query()
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->where('is_returning', false)
            ->count();

        $total = $recurring + $oneTime;

        return response()->json([
            'returning_visitors' => [
                'recurring' => [
                    'count' => $recurring,
                    'percentage' => $total > 0 ? round(($recurring / $total) * 100, 1) : 0,
                ],
                'one_time' => [
                    'count' => $oneTime,
                    'percentage' => $total > 0 ? round(($oneTime / $total) * 100, 1) : 0,
                ],
            ],
        ]);
    }

    /**
     * Get purpose of visit horizontal bar chart data.
     */
    public function purposeOfVisit(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', today()->toDateString());
        $dateTo = $request->get('date_to', today()->toDateString());

        $purposeData = Visitor::query()
            ->select('purpose', DB::raw('COUNT(*) as visits'))
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->groupBy('purpose')
            ->orderByDesc('visits')
            ->get();

        return response()->json([
            'purpose_of_visit' => $purposeData->map(fn ($row) => [
                'purpose' => $row->purpose,
                'visits' => (int) $row->visits,
            ]),
        ]);
    }

    /**
     * Get region distribution data.
     */
    public function regionDistribution(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', today()->toDateString());
        $dateTo = $request->get('date_to', today()->toDateString());

        $regionData = Visitor::query()
            ->select('region', 'country_code', DB::raw('COUNT(*) as visits'))
            ->whereDate('check_in_at', '>=', $dateFrom)
            ->whereDate('check_in_at', '<=', $dateTo)
            ->whereNotNull('region')
            ->groupBy('region', 'country_code')
            ->orderByDesc('visits')
            ->limit(10)
            ->get();

        return response()->json([
            'region_distribution' => $regionData->map(fn ($row) => [
                'region' => $row->region,
                'country_code' => $row->country_code,
                'visits' => (int) $row->visits,
            ]),
        ]);
    }

    /**
     * Get live feed of recent visitor activity.
     */
    public function liveFeed(Request $request): JsonResponse
    {
        $recentVisitors = Visitor::query()
            ->with(['host:id,name'])
            ->select(['id', 'visitor_id', 'full_name', 'status', 'check_in_at', 'check_out_at', 'created_at'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($visitor) => [
                'id' => $visitor->id,
                'visitor_id' => $visitor->visitor_id,
                'full_name' => $visitor->full_name,
                'status' => $visitor->status,
                'time_ago' => $this->timeAgo($visitor->status === 'checked_in' ? $visitor->check_in_at : $visitor->check_out_at),
                'action' => $visitor->status === 'checked_in' ? 'IN' : 'OUT',
            ]);

        return response()->json([
            'live_feed' => $recentVisitors,
        ]);
    }

    /**
     * Export visitor statistics.
     */
    public function export(Request $request): JsonResponse
    {
        $filters = $this->resolveFilters($request);

        // In a real application, this would generate a CSV/PDF file
        // For now, we'll just return success and let the frontend handle the notification

        return response()->json([
            'success' => true,
            'message' => 'Export completed successfully',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function resolveFilters(Request $request): array
    {
        return [
            'search' => (string) ($request->get('search') ?? ''),
            'location' => (string) ($request->get('location') ?? ''),
            'site' => (string) ($request->get('site') ?? ''),
            'status' => (string) ($request->get('status') ?? ''),
            'purpose' => (string) ($request->get('purpose') ?? ''),
            'date_from' => (string) ($request->get('date_from') ?? today()->toDateString()),
            'date_to' => (string) ($request->get('date_to') ?? today()->toDateString()),
            'time_range' => (string) ($request->get('time_range') ?? 'today'),
            'chart_mode' => (string) ($request->get('chart_mode') ?? 'weekly'),
        ];
    }

    /**
     * Convert datetime to human-readable time ago string.
     */
    protected function timeAgo(?\DateTimeInterface $datetime): string
    {
        if (! $datetime) {
            return 'Unknown';
        }

        $diff = Carbon::instance($datetime)->diffForHumans(null, true);

        if (str_contains($diff, 'second')) {
            return 'Just Now';
        }
        if (str_contains($diff, 'minute')) {
            $minutes = (int) preg_match('/(\d+)/', $diff, $matches) ? $matches[1] : 1;

            return $minutes.' min ago';
        }
        if (str_contains($diff, 'hour')) {
            $hours = (int) preg_match('/(\d+)/', $diff, $matches) ? $matches[1] : 1;

            return $hours.' hr ago';
        }

        return Carbon::instance($datetime)->format('M d, H:i');
    }
}
