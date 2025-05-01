<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Index', [
            'kategoriCount' => \App\Models\Category::count(),
            'produkCount' => \App\Models\Product::count(),
            'transaksiCount' => \App\Models\Transaction::count(),
            'penggunaCount' => \App\Models\User::count(),
        ]);
    }
}
