<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Services\PrioritizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssignmentController extends Controller
{
    /**
     * Display all assignments for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();
        $assignments = Assignment::where('user_id', $user->id)->get();
        return response()->json($assignments);
    }

    /**
     * Store a newly created assignment in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'due_date' => 'nullable|date',
        'points' => 'integer|min:0',
        'weight' => 'numeric|min:0|max:100',
        'difficulty' => 'integer|min:1|max:3',
        'effort' => 'integer|min:60|max:100',
    ]);

    $assignment = $request->user()->assignments()->create($validated);

    return response()->json($assignment, 201);
}



    /**
     * Display the specified assignment.
     */
    public function show(string $id)
    {
        $assignment = Assignment::findOrFail($id);
        return response()->json($assignment);
    }

    /**
     * Update the specified assignment.
     */
    public function update(Request $request, string $id)
    {
        $assignment = Assignment::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'points' => 'integer|min:0',
            'weight' => 'numeric|min:0',
            'difficulty' => 'integer|min:1|max:3',
            'effort' => 'integer|min:60|max:100',
            'completed' => 'boolean',
        ]);

        $assignment->update($validated);

        return response()->json($assignment);
    }

    /**
     * Remove the specified assignment from storage.
     */
    public function destroy(string $id)
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully']);
    }

    /**
     * Prioritize assignments for the authenticated user.
     */
    public function prioritize(Request $request)
    {
        $user = $request->user();

        $assignments = Assignment::where('user_id', $user->id)
            ->where('completed', false)
            ->get();

        $method = $request->input('method', $user->prioritization_method ?? 'dds');

        $scores = [];

        foreach ($assignments as $a) {
            switch ($method) {
                case 'dds':
                    $score = PrioritizationService::ddsScore($a);
                    break;
                case 'dod':
                    $score = PrioritizationService::dodScore($a);
                    break;
                case 'b2d':
                    $score = PrioritizationService::b2dScore($a);
                    break;
                case 'eoc':
                    $score = PrioritizationService::eocScore($a, $user);
                    break;
                default:
                    $score = PrioritizationService::ddsScore($a);
            }

            $a->priority_score = $score;
            $scores[] = $a;
        }

        $ordered = collect($scores)->sortByDesc('priority_score')->values();

        return response()->json($ordered);
    }
}
