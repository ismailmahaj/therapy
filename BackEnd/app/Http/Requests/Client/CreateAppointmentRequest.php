<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'slot_id' => ['required', 'integer', 'exists:therapy_slots,id'],
            'persons' => ['required', 'array', 'min:1', 'max:10'],
            'persons.*.prenom' => ['required', 'string', 'max:100'],
            'persons.*.sexe' => ['required', Rule::in(['homme', 'femme'])],
            'client_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slot_id.required' => 'Le créneau est obligatoire.',
            'slot_id.exists' => 'Le créneau sélectionné n\'existe pas.',
            'persons.required' => 'Au moins une personne doit être renseignée.',
            'persons.min' => 'Au moins une personne doit être renseignée.',
            'persons.max' => 'Maximum 10 personnes par rendez-vous.',
            'persons.*.prenom.required' => 'Le prénom de chaque personne est obligatoire.',
            'persons.*.sexe.required' => 'Le sexe de chaque personne est obligatoire.',
            'persons.*.sexe.in' => 'Le sexe doit être "homme" ou "femme".',
        ];
    }
}
