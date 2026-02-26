<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:user'])->group(function () {
    //
});
