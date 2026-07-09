<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function reviewsGiven(): HasMany{
        return $this->hasMany(Review::class, 'reviewer_id');
    }
    
    public function reviewsReceived(): HasMany{
        return $this->hasMany(Review::class, 'reviewed_user_id');
    }

    public function reports(): HasMany{
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function listings(): HasMany{
        return $this->hasMany(Listing::class);
    }

    public function messagesSent(): HasMany{
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function messagesReceived(): HasMany{
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function notifications(): HasMany{
        return $this->hasMany(UserNotification::class);
    }
}