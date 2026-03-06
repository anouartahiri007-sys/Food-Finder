<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Restaurateur
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('cuisine_type');
            $table->string('price_range'); // e.g., $, $$, $$$, $$$$
            $table->json('dietary_options')->nullable(); // e.g., ['halal', 'vegan', 'gluten-free']
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
