<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Check if column exists before adding to avoid errors on migrate:fresh if migration was modified
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'social_login_provider')) {
                $table->string('social_login_provider')->nullable()->after('password');
                $table->string('social_login_id')->nullable()->after('social_login_provider');
            }
            
            // Adjust role column to include admin if not already there or to match plan
            $table->enum('role_new', ['user', 'restaurateur', 'admin'])->default('user')->after('role');
        });

        // Migrate roles (simple mapping)
        // Schema::table('users', function (Blueprint $table) {
        //     DB::statement("UPDATE users SET role_new = 'user' WHERE role = 'customer'");
        //     DB::statement("UPDATE users SET role_new = 'restaurateur' WHERE role = 'owner'");
        // });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->renameColumn('role_new', 'role');
        });

        Schema::table('restaurants', function (Blueprint $table) {
            if (!Schema::hasColumn('restaurants', 'average_price')) {
                $table->decimal('average_price', 8, 2)->nullable()->after('price_range');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'phone', 'social_login_provider', 'social_login_id']);
            $table->string('role_old')->default('customer');
        });
        // We probably don't need to restore everything exactly in down for a dev migration
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->renameColumn('role_old', 'role');
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn('average_price');
        });
    }
};
