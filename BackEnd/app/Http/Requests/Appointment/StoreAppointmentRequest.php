<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
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
            'type' => ['required', Rule::in(['hijama'])],
            'gender' => ['required', Rule::in(['homme', 'femme'])],
            'appointment_date' => ['required', 'date', 'after:now'],
            'number_of_people' => ['required', 'integer', 'min:1', 'max:5'],
        ];
    }
}
