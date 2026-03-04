<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminUserLogUserSearchRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $rawSelectedIds = $this->input('selected_ids', []);

        if (is_numeric($rawSelectedIds)) {
            $rawSelectedIds = [(string) $rawSelectedIds];
        }

        if (is_string($rawSelectedIds)) {
            $rawSelectedIds = array_filter(
                explode(',', $rawSelectedIds),
                static fn (string $value): bool => trim($value) !== '',
            );
        }

        if (! is_array($rawSelectedIds)) {
            $rawSelectedIds = [];
        }

        $normalizedSelectedIds = array_values(array_unique(array_map(
            static fn (mixed $value): int => (int) $value,
            $rawSelectedIds,
        )));

        $this->merge([
            'selected_ids' => $normalizedSelectedIds,
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
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'in:admin,user'],
            'status' => ['nullable', 'in:enable,disable'],
            'cursor' => ['nullable', 'string', 'max:2048'],
            'per_page' => ['nullable', 'integer', 'in:20,30,50'],
            'selected_ids' => ['nullable', 'array', 'max:200'],
            'selected_ids.*' => ['integer', 'exists:users,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'search.max' => 'Search keyword may not be greater than 100 characters.',
            'role.in' => 'The selected role filter is invalid.',
            'status.in' => 'The selected status filter is invalid.',
            'cursor.max' => 'The pagination cursor is invalid.',
            'per_page.in' => 'The page size is invalid.',
            'selected_ids.array' => 'The selected users payload is invalid.',
            'selected_ids.max' => 'You can only preselect up to 200 users.',
            'selected_ids.*.integer' => 'One or more selected users are invalid.',
            'selected_ids.*.exists' => 'One or more selected users do not exist.',
        ];
    }
}
