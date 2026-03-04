<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\Media\MediaService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(protected MediaService $mediaService) {}

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $request->user()->load('avatarMedia');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            try {
                $this->mediaService->replaceUserAvatar(
                    user: $user,
                    file: $request->file('avatar'),
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Avatar upload failed: '.$e->getMessage(), [
                    'user_id' => $user->id,
                    'exception' => $e,
                ]);

                return back()->withErrors([
                    'avatar' => 'Failed to upload avatar. Please try again. '.$e->getMessage(),
                ]);
            }
        }

        $user->fill($request->except('avatar'));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
