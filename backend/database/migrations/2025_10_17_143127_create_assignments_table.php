<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('description')->nullable();
    $table->date('due_date')->nullable();
    $table->integer('points')->default(0);
    $table->decimal('weight', 5, 2)->default(0);
    $table->tinyInteger('difficulty')->default(1)->comment('1=Easy, 2=Medium, 3=Hard');
    $table->integer('effort')->default(60); // renamed from estimated_effort
    $table->boolean('completed')->default(false);
    $table->timestamps();
});


        // Optional: add a database-level CHECK constraint (MySQL 8+)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE assignments 
                ADD CONSTRAINT chk_difficulty_range CHECK (difficulty BETWEEN 1 AND 3),
                ADD CONSTRAINT chk_effort_range CHECK (effort BETWEEN 60 AND 100)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
