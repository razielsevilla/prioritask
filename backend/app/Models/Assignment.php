<?php // File: c:\Users\razie\Desktop\Prioritask_Project\backend\app\Models\Assignment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

protected $fillable = [
    'title',
    'description',
    'due_date',
    'points',
    'weight',
    'difficulty',
    'effort',
    'completed',
];


}
