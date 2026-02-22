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
        // if (!Auth::check() || !in_array($request->user()->role, $roles)) {
        //     abort(403, "Unauthhhh");
        // }

        // if (Auth::user()->role !== $roles) {
        //     abort(403, "Unauthorized");
        // }


        if (!Auth::check() || !in_array(strtolower($request->user()->role), array_map('strtolower', $roles))) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
