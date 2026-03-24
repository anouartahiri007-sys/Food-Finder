<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Review;
use App\Models\User;
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

        // Check if user is blocked
        $user = auth()->user();
        if ($user->is_blocked) {
            return response()->json([
                'message' => 'Votre compte est bloqué pour non-respect des règles de notre site.'
            ], 403);
        }

        // Check if user already reported this review
        $existingReport = Report::where('user_id', auth()->id())
            ->where('review_id', $reviewId)
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'Vous avez déjà signalé ce commentaire.'
            ], 400);
        }

        $report = Report::create([
            'user_id' => auth()->id(),
            'review_id' => $reviewId,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
            'report_date' => now(),
        ]);

        // Check if review has been reported more than 10 times
        $reportCount = Report::where('review_id', $reviewId)->count();

        if ($reportCount >= 10) {
            // Delete the review and add to flagged list
            $reviewData = [
                'content' => $review->comment,
                'author' => $review->user->name,
                'publication_date' => $review->created_at,
                'report_date' => now(),
            ];

            // Delete the review (it will be stored in reports table for admin)
            $review->delete();

            // Update all reports for this review as resolved
            Report::where('review_id', $reviewId)->update(['status' => 'resolved']);

            return response()->json([
                'message' => 'Commentaire signalé et supprimé pour contenu inapproprié.',
                'review_deleted' => true,
            ], 200);
        }

        // Check how many reports this user has made
        $userReportCount = Report::where('user_id', auth()->id())->count();

        if ($userReportCount >= 3) {
            // Block the user
            $user->update(['is_blocked' => true]);

            return response()->json([
                'message' => 'Votre compte a été bloqué pour non-respect des règles de notre site.',
                'user_blocked' => true,
            ], 403);
        }

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
     * Get deleted reviews (Admin only).
     */
    public function deletedReviews()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get reports that have been resolved (deleted reviews)
        $deletedReviews = Report::where('status', 'resolved')
            ->with(['user', 'review.user'])
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'content' => $report->description, // Store original comment content
                    'author' => $report->review ? $report->review->user->name : 'Unknown',
                    'publication_date' => $report->review ? $report->review->created_at : null,
                    'report_date' => $report->report_date,
                    'reason' => $report->reason,
                ];
            });

        return response()->json($deletedReviews);
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
