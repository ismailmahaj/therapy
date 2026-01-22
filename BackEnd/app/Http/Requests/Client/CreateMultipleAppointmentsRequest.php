<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateMultipleAppointmentsRequest extends FormRequest
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
            'appointments' => ['required', 'array', 'min:1', 'max:10'],
            'appointments.*.slot_id' => ['required', 'integer', 'exists:therapy_slots,id'],
            'appointments.*.persons' => ['required', 'array', 'min:1', 'max:10'],
            'appointments.*.persons.*.prenom' => ['required', 'string', 'max:100'],
            'appointments.*.persons.*.sexe' => ['required', Rule::in(['homme', 'femme'])],
            'appointments.*.client_notes' => ['nullable', 'string', 'max:1000'],
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
            'appointments.required' => 'Au moins un rendez-vous doit être renseigné.',
            'appointments.min' => 'Au moins un rendez-vous doit être renseigné.',
            'appointments.max' => 'Maximum 10 rendez-vous à la fois.',
            'appointments.*.slot_id.required' => 'Le créneau est obligatoire pour chaque rendez-vous.',
            'appointments.*.slot_id.exists' => 'Le créneau sélectionné n\'existe pas.',
            'appointments.*.persons.required' => 'Au moins une personne doit être renseignée pour chaque rendez-vous.',
            'appointments.*.persons.min' => 'Au moins une personne doit être renseignée pour chaque rendez-vous.',
            'appointments.*.persons.max' => 'Maximum 10 personnes par rendez-vous.',
            'appointments.*.persons.*.prenom.required' => 'Le prénom de chaque personne est obligatoire.',
            'appointments.*.persons.*.sexe.required' => 'Le sexe de chaque personne est obligatoire.',
            'appointments.*.persons.*.sexe.in' => 'Le sexe doit être "homme" ou "femme".',
        ];
    }
}
