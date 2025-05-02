<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        // Cek jika user bukan super-admin dengan memeriksa relasi role
        $user = Auth::user();
        $isSuperAdmin = DB::table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('model_has_roles.model_id', $user->id)
            ->where('roles.name', 'super-admin')
            ->exists();

        // Base query untuk transaksi
        $transactionQuery = Transaction::query();
        if (!$isSuperAdmin) {
            $transactionQuery->where('cashier_id', Auth::id());
        }

        // Monthly sales
        $monthlySalesRaw = $transactionQuery->select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(grand_total) as total')
        )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('MONTH(created_at)'), 'asc')
            ->get();

        $monthlySales = $monthlySalesRaw->mapWithKeys(function ($item) {
            return [date('F', mktime(0, 0, 0, $item->month, 1)) => $item->total];
        })->toArray();

        // Monthly transaction counts
        $monthlyTransactionCountsRaw = $transactionQuery->select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('MONTH(created_at)'), 'asc')
            ->get();

        $monthlyTransactionCounts = $monthlyTransactionCountsRaw->mapWithKeys(function ($item) {
            return [date('F', mktime(0, 0, 0, $item->month, 1)) => $item->count];
        })->toArray();

        // Daily sales
        $dailySalesRaw = $transactionQuery->select(
            DB::raw('DAY(created_at) as day'),
            DB::raw('SUM(grand_total) as total')
        )
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('DAY(created_at)'))
            ->orderBy(DB::raw('DAY(created_at)'), 'asc')
            ->get();

        $dailySales = $dailySalesRaw->mapWithKeys(function ($item) {
            return [$item->day => $item->total];
        })->toArray();

        // Daily transaction counts
        $dailyTransactionCountsRaw = $transactionQuery->select(
            DB::raw('DAY(created_at) as day'),
            DB::raw('COUNT(*) as count')
        )
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('DAY(created_at)'))
            ->orderBy(DB::raw('DAY(created_at)'), 'asc')
            ->get();

        $dailyTransactionCounts = $dailyTransactionCountsRaw->mapWithKeys(function ($item) {
            return [$item->day => $item->count];
        })->toArray();

        // Total transaksi berdasarkan role
        $transaksiCount = $isSuperAdmin ? Transaction::count() : $transactionQuery->count();

        return Inertia::render('Dashboard/Index', [
            'kategoriCount' => Category::count(),
            'produkCount' => Product::count(),
            'transaksiCount' => $transaksiCount,
            'penggunaCount' => User::count(),
            'monthlySales' => $monthlySales,
            'monthlyTransactionCounts' => $monthlyTransactionCounts,
            'dailySales' => $dailySales,
            'dailyTransactionCounts' => $dailyTransactionCounts,
        ]);
    }
}
