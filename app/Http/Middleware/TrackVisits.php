<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackVisits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Skip tracking for admin analytics routes to prevent self-tracking
        if ($this->shouldSkipTracking($request)) {
            return $response;
        }

        // Skip bots and crawlers
        if ($this->isBot($request)) {
            return $response;
        }

        // Track the visit asynchronously using queue if available
        $this->trackVisit($request);

        return $response;
    }

    /**
     * Determine if tracking should be skipped.
     */
    protected function shouldSkipTracking(Request $request): bool
    {
        // Skip admin analytics routes
        if ($request->routeIs('admin.analytics.*') || $request->routeIs('activity-logs.*')) {
            return true;
        }

        // Skip static assets and API routes
        if ($request->is('api/*') || $request->is('storage/*') || $request->is('build/*')) {
            return true;
        }

        return false;
    }

    /**
     * Check if the request is from a bot or crawler.
     */
    protected function isBot(Request $request): bool
    {
        $userAgent = $request->userAgent();

        if (! $userAgent) {
            return false;
        }

        $botPatterns = [
            'googlebot',
            'bingbot',
            'slurp',
            'duckduckbot',
            'baiduspider',
            'yandexbot',
            'sogou',
            'exabot',
            'facebot',
            'ia_archiver',
            'facebookexternalhit',
            'twitterbot',
            'linkedinbot',
            'pinterest',
            'slackbot',
            'telegrambot',
            'whatsapp',
            'spider',
            'crawler',
            'bot',
        ];

        $userAgentLower = strtolower($userAgent);

        foreach ($botPatterns as $pattern) {
            if (str_contains($userAgentLower, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Track the visit in the database.
     */
    protected function trackVisit(Request $request): void
    {
        $sessionId = $this->getSessionId($request);
        $routeName = $request->route() ? $request->route()->getName() : null;

        // Debounce: prevent duplicate tracking for same session + route within 30 seconds
        $cacheKey = "visit_debounce:{$sessionId}:{$routeName}:{$request->path()}";

        if (Cache::has($cacheKey)) {
            return;
        }

        Cache::set($cacheKey, true, 30); // 30 seconds debounce

        Visit::create([
            'session_id' => $sessionId,
            'ip_address' => $request->ip(),
            'user_id' => $request->user()?->id,
            'route_path' => '/'.$request->path(),
            'route_name' => $routeName,
            'user_agent' => $request->userAgent(),
            'device_type' => $this->detectDeviceType($request),
            'referrer' => $request->headers->get('referer'),
            'visited_at' => now(),
        ]);
    }

    /**
     * Get or generate a session identifier for the visitor.
     */
    protected function getSessionId(Request $request): string
    {
        // Use Laravel session ID if available
        if ($request->session()->isStarted()) {
            return $request->session()->getId();
        }

        // Fallback: generate a fingerprint-based ID
        $fingerprint = hash('sha256', $request->ip().$request->userAgent());

        return "fp_{$fingerprint}";
    }

    /**
     * Detect the device type from the request.
     */
    protected function detectDeviceType(Request $request): string
    {
        $userAgent = $request->userAgent() ?? '';

        // Mobile detection patterns
        $mobilePatterns = [
            'Mobile', 'Android', 'iPhone', 'iPad', 'iPod',
            'BlackBerry', 'Windows Phone', 'webOS', 'Opera Mini',
            'IEMobile', 'Mobile Safari',
        ];

        // Tablet detection patterns
        $tabletPatterns = [
            'iPad', 'Android.*Tablet', 'Tablet', 'Silk', 'PlayBook',
        ];

        foreach ($tabletPatterns as $pattern) {
            if (preg_match('/'.$pattern.'/i', $userAgent)) {
                return 'tablet';
            }
        }

        foreach ($mobilePatterns as $pattern) {
            if (preg_match('/'.$pattern.'/i', $userAgent)) {
                return 'mobile';
            }
        }

        return 'desktop';
    }
}
