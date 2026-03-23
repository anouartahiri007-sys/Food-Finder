<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($restaurantId)
    {
        $reviews = Review::where('restaurant_id', $restaurantId)
            ->with('user:id,name,profile_photo')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(ReviewResource::collection($reviews));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReviewRequest $request, $restaurantId)
    {
        // Check if user is blocked
        $user = auth()->user();
        if ($user->is_blocked) {
            return response()->json([
                'message' => 'Votre compte est bloqué. Vous ne pouvez pas publier d\'avis.'
            ], 403);
        }

        $validated = $request->validated();

        Restaurant::findOrFail($restaurantId); // Ensure exists

        $review = Review::create([
            'user_id' => auth()->id(),
            'restaurant_id' => $restaurantId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'photos' => $validated['photos'] ?? null,
        ]);

        // Update restaurant average rating
        $restaurant = Restaurant::find($restaurantId);
        $avgRating = $restaurant->reviews()->avg('rating');
        $restaurant->update(['rating' => round($avgRating, 1)]);

        return response()->json(new ReviewResource($review->load('user')), 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $review = Review::findOrFail($id);
        
        // Check ownership, admin, or restaurant owner
        $user = $request->user();
        $isOwner = false;
        
        // Check if user is the owner of the restaurant
        if ($user->role === 'owner') {
            $restaurant = Restaurant::find($review->restaurant_id);
            if ($restaurant && $restaurant->user_id === $user->id) {
                $isOwner = true;
            }
        }
        
        if ($review->user_id !== $user->id && $user->role !== 'admin' && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $restaurantId = $review->restaurant_id;
        $review->delete();

        // Update restaurant average rating
        $restaurant = Restaurant::find($restaurantId);
        $avgRating = $restaurant->reviews()->avg('rating');
        $restaurant->update(['rating' => $avgRating ? round($avgRating, 1) : null]);

        return response()->json(['message' => 'Review deleted']);
    }

    /**
     * Generate dynamic reviews for a restaurant (for demo purposes).
     */
    public function generateDynamicReviews($restaurantId)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $restaurant = Restaurant::findOrFail($restaurantId);
        
        // Sample data for dynamic reviews
        $names = [
            'Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Pierre Laurent', 
            'Claire Moreau', 'Lucas Girard', 'Emma Rousseau', 'Hugo Lefebvre',
            'Camille Chevalier', 'Thomas Fournier', 'Julie Lambert', 'Antoine Mercier',
            'Chloé Rousseau', 'Nicolas Blanc', 'Laura Gros', 'Mathieu Andre',
            'Pauline Roux', 'Alexandre Simon', 'Manon Laurent', 'Gabriel Bernard'
        ];
        
        $comments = [
            'Excellent restaurant ! La cuisine est savoureuse et le service impeccable. Je recommande fortement.',
            'Une expérience culinaire inoubliable. Les plats sont préparés avec soin et les saveurs sont parfaitement équilibrées.',
            'Très bon rapport qualité-prix. Le personnel est accueillant et l\'ambiance est chaleureuse.',
            'Déçu par la qualité des plats. Le service était lent et l\'addition salée.',
            'Un endroit parfait pour un dîner en amoureux. L\'ambiance est romantique et la nourriture délicieuse.',
            'Les meilleurs plats que j\'ai goûtés depuis longtemps. Le chef fait un travail remarquable.',
            'Accueil chaleureux et professionnel. Les portions sont généreuses et les goûts sont au rendez-vous.',
            'Restaurant à éviter. La nourriture était froide et le service laisse à désirer.',
            'Une découverte formidable ! Je reviendrai certainlyment pour essayer d\'autres plats du menu.',
            'Très satisfaite de cette visite. Le chef propose une cuisine créative et savoureuse.',
            'Le cadre est magnifique et la nourriture l\'est tout autant. Un vrai plaisir pour les papilles.',
            'Service excellent et plats délicieux. Je recommande ce restaurant à tous mes proches.',
            'Décevant pour le prix demandé. Les portions sont petites et les saveurs manquent de caractère.',
            'Une adresse à garder absolument ! La qualité est au rendez-vous et les prix sont razonables.',
            'Ambiance cozy et plats raffinés. C\'était une excellente soirée.',
            'Le personnel était très attentionné. Les plats étaient présentés avec soin.',
            'Une cuisine traditionnelle parfaitement exécutée. On sent la qualité des produits.',
            'Pas mal, mais rien d\'extraordinaire. Il y a mieux dans le coin pour le même prix.',
            'J\'ai été bluffé par la créativité du menu. Chaque plat était une surprise.',
            'Un restaurant qui mérite sa réputation. Les réservations sont indispensables.'
        ];

        $ratings = [1, 2, 3, 4, 5];
        
        // Generate 5-10 random reviews
        $numReviews = rand(5, 10);
        $generatedReviews = [];
        
        $usedNames = [];
        $usedComments = [];
        
        for ($i = 0; $i < $numReviews; $i++) {
            // Pick unique name
            do {
                $name = $names[array_rand($names)];
            } while (in_array($name, $usedNames));
            $usedNames[] = $name;
            
            // Pick unique comment
            do {
                $comment = $comments[array_rand($comments)];
            } while (in_array($comment, $usedComments));
            $usedComments[] = $comment;
            
            $rating = $ratings[array_rand($ratings)];
            
            // Create a fake user for the review
            $fakeUser = \App\Models\User::firstOrCreate(
                ['email' => strtolower(str_replace(' ', '.', $name)) . '@example.com'],
                [
                    'name' => $name,
                    'password' => bcrypt('password123'),
                    'role' => 'user',
                    'is_blocked' => false,
                ]
            );
            
            // Create the review
            $review = Review::create([
                'user_id' => $fakeUser->id,
                'restaurant_id' => $restaurantId,
                'rating' => $rating,
                'comment' => $comment,
                'photos' => null,
            ]);
            
            $generatedReviews[] = new ReviewResource($review->load('user'));
        }
        
        // Update restaurant average rating
        $avgRating = $restaurant->reviews()->avg('rating');
        $restaurant->update(['rating' => round($avgRating, 1)]);

        return response()->json([
            'message' => 'Avis dynamiques générés avec succès',
            'reviews' => $generatedReviews
        ], 201);
    }
}
