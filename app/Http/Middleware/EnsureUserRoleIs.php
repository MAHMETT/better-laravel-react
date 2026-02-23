<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRoleIs
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! Auth::check()) {
            abort(403, 'Unauthorized');
        }

        $userRole = $request->user()?->role;

        if (empty($userRole) || empty($roles)) {
            abort(403, 'Unauthorized');
        }

        if (! in_array(strtolower($userRole), array_map('strtolower', $roles))) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
