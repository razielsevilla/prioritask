<?php // File: c:\Users\razie\Desktop\Prioritask_Project\backend\app\Models\User.php

namespace App\Models;
use App\Models\Assignment;


use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ add this

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; // ✅ include HasApiTokens

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function assignments()
{
    return $this->hasMany(\App\Models\Assignment::class);
}

}
