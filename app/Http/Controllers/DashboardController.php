<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Monthly sales
        $monthlySalesRaw = Transaction::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(grand_total) as total')
        )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        // \Log::info('Monthly Sales Raw:', $monthlySalesRaw->toArray());

        $monthlySales = $monthlySalesRaw->mapWithKeys(function ($item) {
            return [date('F', mktime(0, 0, 0, $item->month, 1)) => $item->total];
        })->toArray();

        // Monthly transaction counts
        $monthlyTransactionCountsRaw = Transaction::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        // \Log::info('Monthly Transaction Counts Raw:', $monthlyTransactionCountsRaw->toArray());

        $monthlyTransactionCounts = $monthlyTransactionCountsRaw->mapWithKeys(function ($item) {
            return [date('F', mktime(0, 0, 0, $item->month, 1)) => $item->count];
        })->toArray();

        // Daily sales
        $dailySalesRaw = Transaction::select(
            DB::raw('DAY(created_at) as day'),
            DB::raw('SUM(grand_total) as total')
        )
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('DAY(created_at)'))
            ->orderBy('day')
            ->get();

        // \Log::info('Daily Sales Raw:', $dailySalesRaw->toArray());

        $dailySales = $dailySalesRaw->mapWithKeys(function ($item) {
            return [$item->day => $item->total];
        })->toArray();

        // Daily transaction counts
        $dailyTransactionCountsRaw = Transaction::select(
            DB::raw('DAY(created_at) as day'),
            DB::raw('COUNT(*) as count')
        )
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('DAY(created_at)'))
            ->orderBy('day')
            ->get();

        // \Log::info('Daily Transaction Counts Raw:', $dailyTransactionCountsRaw->toArray());

        $dailyTransactionCounts = $dailyTransactionCountsRaw->mapWithKeys(function ($item) {
            return [$item->day => $item->count];
        })->toArray();

        return Inertia::render('Dashboard/Index', [
            'kategoriCount' => Category::count(),
            'produkCount' => Product::count(),
            'transaksiCount' => Transaction::count(),
            'penggunaCount' => User::count(),
            'monthlySales' => $monthlySales,
            'monthlyTransactionCounts' => $monthlyTransactionCounts,
            'dailySales' => $dailySales,
            'dailyTransactionCounts' => $dailyTransactionCounts,
        ]);
    }
}
