<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class CreateContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'exists:donation_projects,id'],
            'montant' => ['required', 'numeric', 'min:1'],
            'nom_sadaqa' => ['nullable', 'string', 'max:255'],
        ];
    }
}
