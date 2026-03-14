<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Review;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Store a new report for a review.
     */
    public function store(Request $request, $reviewId)
    {
        $review = Review::findOrFail($reviewId);

        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $report = Report::create([
            'user_id' => auth()->id(),
            'review_id' => $reviewId,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json($report, 201);
    }

    /**
     * Display a listing of reports (Admin only).
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(Report::with(['user', 'review.user'])->latest()->get());
    }

    /**
     * Update the status of a report (Admin only).
     */
    public function update(Request $request, Report $report)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,reviewed,resolved,rejected',
        ]);

        $report->update($request->only('status'));

        return response()->json($report);
    }
}
