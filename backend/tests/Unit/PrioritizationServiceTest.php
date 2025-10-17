<?php

namespace Tests\Unit;

use App\Services\PrioritizationService;
use PHPUnit\Framework\TestCase;

class PrioritizationServiceTest extends TestCase
{
    public function test_dds_score_calculates_correctly()
    {
        $assignment = (object)[
            'due_date' => now()->addDays(5)->format('Y-m-d')
        ];

        $score = PrioritizationService::ddsScore($assignment);

        $this->assertEquals(1/5, $score);
    }

    public function test_dod_score_calculates_correctly()
    {
        $assignment = (object)[
            'due_date' => now()->addDays(4)->format('Y-m-d'),
            'difficulty' => 2,
        ];

        $score = PrioritizationService::dodScore($assignment);

        $this->assertEquals(2/4, $score);
    }

    public function test_b2d_score_calculates_correctly()
    {
        $assignment = (object)[
            'due_date' => now()->addDays(2)->format('Y-m-d'),
            'difficulty' => 2,
            'points' => 8,
        ];

        $score = PrioritizationService::b2dScore($assignment);

        $this->assertEquals(8/(2*2), $score);
    }

    public function test_eoc_score_uses_default_when_no_grade()
    {
        $assignment = (object)[
            'due_date' => now()->addDays(2)->format('Y-m-d'),
            'weight' => 0.5,
            'points' => 10,
        ];

        $user = (object)['current_grade' => null];

        $score = PrioritizationService::eocScore($assignment, $user);

        $this->assertIsFloat($score);
    }
}
