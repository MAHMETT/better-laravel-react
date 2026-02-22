<?php

namespace App\Concerns;

use Illuminate\Support\Str;

trait HasUUID
{
    protected static function bootHasUuid()
    {
        static::creating(function ($model) {
            if (!$model->uuid) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }
}
