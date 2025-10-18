<?php
// File: c:\Users\razie\Desktop\Prioritask_Project\backend\app\Services\PrioritizationService.php

namespace App\Services;

use DateTime;

class PrioritizationService {

    public static function daysLeft(DateTime $dueDate){
        $today = new DateTime('today');
        $interval = $today->diff($dueDate);
        $days = (int)$interval->format('%r%a'); // negative if past
        return max(0, $days); // overdue = 0
    }

    public static function ddsScore($assignment){
        $dy = self::daysLeft(new DateTime($assignment->due_date)) ?: 1;
        return 1.0 / $dy;
    }

    public static function dodScore($assignment){
        $dy = self::daysLeft(new DateTime($assignment->due_date)) ?: 1;
        $df = max(1, $assignment->difficulty);
        return $df / $dy;
    }

    public static function b2dScore($assignment){
        $dy = self::daysLeft(new DateTime($assignment->due_date)) ?: 1;
        $df = max(1, $assignment->difficulty);
        $b  = max(1, $assignment->points);
        return $b / ($df * $dy);
    }

    public static function eocScore($assignment, $user){
        $dy = self::daysLeft(new DateTime($assignment->due_date)) + 1;
        $W = $assignment->weight ?: 0;
        $B = $assignment->points ?: 0;
        $G = $user->current_grade ?? null;

        if ($G !== null) {
            return ((100 - $G) * $W * $B) / ($dy);
        } else {
            return (40 * $W * $B) / ($dy);
        }
    }
}
