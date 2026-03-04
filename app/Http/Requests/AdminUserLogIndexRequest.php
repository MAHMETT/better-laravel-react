<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminUserLogIndexRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $rawUserIds = $this->input('user_ids', []);

        if (is_numeric($rawUserIds)) {
            $rawUserIds = [(string) $rawUserIds];
        }

        if (is_string($rawUserIds)) {
            $rawUserIds = array_filter(
                explode(',', $rawUserIds),
                static fn (string $value): bool => trim($value) !== '',
            );
        }

        if (! is_array($rawUserIds)) {
            $rawUserIds = [];
        }

        $normalizedUserIds = array_values(array_unique(array_map(
            static fn (mixed $value): int => (int) $value,
            $rawUserIds,
        )));

        $this->merge([
            'user_ids' => $normalizedUserIds,
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_ids' => ['nullable', 'array', 'max:200'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'event_type' => ['nullable', 'in:login,logout,forced_logout'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_ids.array' => 'The selected users filter is invalid.',
            'user_ids.max' => 'You can only filter by up to 200 users at once.',
            'user_ids.*.integer' => 'One or more selected users are invalid.',
            'user_ids.*.exists' => 'One or more selected users do not exist.',
            'event_type.in' => 'The selected event type is invalid.',
            'date_from.date' => 'The start date must be a valid date.',
            'date_to.date' => 'The end date must be a valid date.',
            'date_to.after_or_equal' => 'The end date must be after or equal to the start date.',
            'per_page.in' => 'The selected page size is invalid.',
        ];
    }
}
