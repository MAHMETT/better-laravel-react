<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Media;
use App\Services\Media\MediaService;
use App\Services\Media\MediaUploadOptions;
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
            $existingMedia = $user->avatar ? Media::find($user->avatar) : null;

            $options = new MediaUploadOptions(
                collection: 'avatars',
                resizeDimensions: [400, 400, 'fit'],
                convertFormat: 'webp',
                optimizeImage: true,
                generateThumbnail: true,
                thumbnailDimensions: [200, 200]
            );

            try {
                $newMedia = $this->mediaService->uploadOrUpdate(
                    $request->file('avatar'),
                    $user->id,
                    $existingMedia,
                    $options
                );

                if ($newMedia instanceof Media) {
                    $user->avatar = $newMedia->id;
                }
            } catch (\Exception $e) {
                return back()->withErrors([
                    'avatar' => 'Failed to upload avatar. Please try again.',
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
