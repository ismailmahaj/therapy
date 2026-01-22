<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;

class CreateExceptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exception_type' => ['required', 'in:unavailable,special_hours,holiday'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i', 'required_if:exception_type,special_hours'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time', 'required_if:exception_type,special_hours'],
            'reason' => ['nullable', 'string', 'max:500'],
            'is_recurring_yearly' => ['nullable', 'boolean'],
        ];
    }
}
