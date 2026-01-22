<?php

namespace App\Http\Requests\Therapy;

use Illuminate\Foundation\Http\FormRequest;

class CreateSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'max_clients' => ['required', 'integer', 'min:1', 'max:10'],
            'location' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'hijama_type' => ['required', 'in:hijama_seche,hijama_humide,hijama_sunnah,hijama_esthetique,autres'],
        ];
    }

    public function messages(): array
    {
        return [
            'hijama_type.required' => 'Le type de hijama est obligatoire.',
            'hijama_type.in' => 'Type de hijama invalide.',
        ];
    }
}
