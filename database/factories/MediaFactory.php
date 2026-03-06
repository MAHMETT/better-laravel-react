<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fileName = fake()->unique()->word().'.'.fake()->fileExtension();
        $path = 'avatars/'.$fileName;

        return [
            'name' => fake()->word(),
            'path' => $path,
            'disk' => 'public',
            'type' => 'image',
            'extension' => fake()->fileExtension(),
            'size' => fake()->numberBetween(1024, 102400),
            'uploaded_by' => User::factory(),
            'collection' => 'avatars',
            'metadata' => [
                'thumbnail_path' => 'avatars/thumbnails/'.$fileName,
                'width' => fake()->numberBetween(100, 1000),
                'height' => fake()->numberBetween(100, 1000),
            ],
        ];
    }

    /**
     * Indicate that the media is an avatar.
     */
    public function avatar(): static
    {
        return $this->state(fn (array $attributes) => [
            'collection' => 'avatars',
            'type' => 'image',
        ]);
    }

    /**
     * Indicate that the media has a thumbnail.
     */
    public function withThumbnail(): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'thumbnail_path' => 'thumbnails/'.$attributes['path'],
            ]),
        ]);
    }
}
