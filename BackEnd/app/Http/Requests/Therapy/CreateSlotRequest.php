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
            'date.required' => 'La date est obligatoire.',
            'date.date' => 'La date doit être une date valide.',
            'date.after_or_equal' => 'La date doit être aujourd\'hui ou une date future.',
            'start_time.required' => 'L\'heure de début est obligatoire.',
            'start_time.date_format' => 'L\'heure de début doit être au format HH:mm (ex: 14:30).',
            'end_time.required' => 'L\'heure de fin est obligatoire.',
            'end_time.date_format' => 'L\'heure de fin doit être au format HH:mm (ex: 16:30).',
            'end_time.after' => 'L\'heure de fin doit être après l\'heure de début.',
            'max_clients.required' => 'Le nombre maximum de clients est obligatoire.',
            'max_clients.integer' => 'Le nombre maximum de clients doit être un nombre entier.',
            'max_clients.min' => 'Le nombre maximum de clients doit être au moins 1.',
            'max_clients.max' => 'Le nombre maximum de clients ne peut pas dépasser 10.',
            'hijama_type.required' => 'Le type de hijama est obligatoire.',
            'hijama_type.in' => 'Type de hijama invalide. Valeurs acceptées : hijama_seche, hijama_humide, hijama_sunnah, hijama_esthetique, autres.',
            'duration_minutes.integer' => 'La durée doit être un nombre entier.',
            'duration_minutes.min' => 'La durée minimale est de 15 minutes.',
            'duration_minutes.max' => 'La durée maximale est de 480 minutes (8 heures).',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix ne peut pas être négatif.',
        ];
    }
}
