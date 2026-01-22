<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class CreateMultipleContributionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'contributions' => ['required', 'array', 'min:1', 'max:20'],
            'contributions.*.project_id' => ['required', 'integer', 'exists:donation_projects,id'],
            'contributions.*.montant' => ['required', 'numeric', 'min:1', 'max:100000'],
            'contributions.*.nom_sadaqa' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'contributions.required' => 'Au moins une contribution doit être renseignée.',
            'contributions.min' => 'Au moins une contribution doit être renseignée.',
            'contributions.max' => 'Maximum 20 contributions à la fois.',
            'contributions.*.project_id.required' => 'Le projet est obligatoire pour chaque contribution.',
            'contributions.*.project_id.exists' => 'Un des projets sélectionnés n\'existe pas.',
            'contributions.*.montant.required' => 'Le montant est obligatoire pour chaque contribution.',
            'contributions.*.montant.numeric' => 'Le montant doit être un nombre.',
            'contributions.*.montant.min' => 'Le montant minimum est de 1€.',
            'contributions.*.montant.max' => 'Le montant maximum est de 100 000€.',
        ];
    }
}
