<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index()
    {
        return response()->json(Category::all());
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        // Only admin should be able to create categories in a real app
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $category = Category::create($request->all());

        return response()->json($category, 201);
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
