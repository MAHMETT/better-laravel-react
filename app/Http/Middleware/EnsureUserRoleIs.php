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

        $user = $request->user();

        // Check if user is soft-deleted
        if ($user->trashed()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->withErrors(['email' => 'Your account has been deleted. Please contact support.']);
        }

        // Check if user is disabled
        if ($user->status === 'disable') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->withErrors(['email' => 'Your account has been disabled. Please contact support.']);
        }

        $userRole = $user->role;

        if (empty($userRole) || empty($roles)) {
            abort(403, 'Unauthorized');
        }

        if (! in_array(strtolower($userRole), array_map('strtolower', $roles))) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
