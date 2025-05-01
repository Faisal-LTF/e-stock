<?php

use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::group(['prefix' => 'dashboard', 'middleware' => ['auth']], function () {
    Route::get('/', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    // roles route
    Route::resource('/roles', RoleController::class)->except(['create', 'edit', 'show']);
    // users route
    Route::resource('/users', UserController::class)->except('show');

    Route::resource('categories', CategoryController::class);
    Route::resource('products', ProductController::class);
    Route::resource('customers', CustomerController::class);
    //route transaction
    Route::get('/transactions', [\App\Http\Controllers\Apps\TransactionController::class, 'index'])->name('transactions.index');

    //route transaction searchProduct
    Route::post('/transactions/searchProduct', [\App\Http\Controllers\Apps\TransactionController::class, 'searchProduct'])->name('transactions.searchProduct');

    //route transaction addToCart
    Route::post('/transactions/addToCart', [\App\Http\Controllers\Apps\TransactionController::class, 'addToCart'])->name('transactions.addToCart');

    //route transaction destroyCart
    Route::delete('/transactions/{cart_id}/destroyCart', [\App\Http\Controllers\Apps\TransactionController::class, 'destroyCart'])->name('transactions.destroyCart');

    //route transaction store
    Route::post('/transactions/store', [\App\Http\Controllers\Apps\TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transactions/{invoice}/print', [\App\Http\Controllers\Apps\TransactionController::class, 'print'])->name('transactions.print');

    //route transaction histori store
    // Route::get('/transactions-histori', [\App\Http\Controllers\Apps\TransactionController::class, 'history'])->name('transactions.history');
    Route::get('/transactions-histori', [\App\Http\Controllers\Apps\TransactionController::class, 'history'])->name('transactions-histori.index');



    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
