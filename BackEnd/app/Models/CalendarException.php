<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CalendarException extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exception_type',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'reason',
        'is_recurring_yearly',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_recurring_yearly' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function affectsDate($date): bool
    {
        $carbonDate = Carbon::parse($date);

        if ($this->is_recurring_yearly) {
            $startMonthDay = $this->start_date->format('m-d');
            $dateMonthDay = $carbonDate->format('m-d');
            
            if ($this->end_date) {
                $endMonthDay = $this->end_date->format('m-d');
                return $dateMonthDay >= $startMonthDay && $dateMonthDay <= $endMonthDay;
            }
            
            return $dateMonthDay === $startMonthDay;
        }

        if ($carbonDate->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date) {
            return $carbonDate->lte($this->end_date);
        }

        return $carbonDate->eq($this->start_date);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', now()->toDateString());
        });
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', now()->toDateString());
    }

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->where(function ($q) use ($from, $to) {
            $q->whereBetween('start_date', [$from, $to])
              ->orWhereBetween('end_date', [$from, $to])
              ->orWhere(function ($q2) use ($from, $to) {
                  $q2->where('start_date', '<=', $from)
                     ->where(function ($q3) use ($to) {
                         $q3->whereNull('end_date')->orWhere('end_date', '>=', $to);
                     });
              });
        });
    }
}
