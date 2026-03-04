<?php

namespace App\Providers;

use App\Listeners\LogUserLoginListener;
use App\Listeners\LogUserLogoutListener;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * @var array<string, list<string>>
     */
    protected $listen = [
        Login::class => [
            LogUserLoginListener::class,
        ],
        Logout::class => [
            LogUserLogoutListener::class,
        ],
    ];
}
