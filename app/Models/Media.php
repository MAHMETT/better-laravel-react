<?php

namespace App\Models;

use App\Concerns\HasUUID;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasUUID;
    protected $fillable = [
        'name',
        'path',
        'disk',
        'type',
        'extension',
        'size',
        'uploaded_by',
        'collection',
        'metadata',
        'alt',
        'title'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
