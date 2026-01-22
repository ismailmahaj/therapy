<?php

namespace App\Http\Requests\Donation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['puit', 'arbre', 'mosquee', 'ecole', 'orphelinat', 'eau', 'nourriture', 'autre'])],
            'pays' => ['required', 'string', 'max:100'],
            'nom' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'montant_requis' => ['required', 'numeric', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'beneficiaries_count' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
