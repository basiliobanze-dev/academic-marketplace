<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable=[
        'reporter_id',
        'listing_id',
        'reported_user_id',
        'reason',
        'status'
    ];

    public function reporter(): BelongsTo{
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function listing(): BelongsTo{
        return $this->belongsTo(Listing::class);
    }

    public function reportedUser(): BelongsTo{
        return $this->belongsTo(User::class, 'reported_user_id');
    }
}