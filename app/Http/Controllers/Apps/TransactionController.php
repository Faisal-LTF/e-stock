<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class TransactionController extends Controller
{
    /**
     * index
     *
     * @return void
     */
    public function index()
    {
        //get cart
        $carts = Cart::with('product')->where('cashier_id', auth()->user()->id)->latest()->get();

        //get all customers
        $customers = Customer::latest()->get();

        $carts_total = 0;
        foreach ($carts as $cart) {
            $carts_total += $cart->price * $cart->qty;
        }

        return Inertia::render('Dashboard/Transactions/Index', [
            'carts' => $carts,
            'carts_total' => $carts_total,
            'customers' => $customers
        ]);
    }

    /**
     * searchProduct
     *
     * @param  mixed $request
     * @return void
     */
    public function searchProduct(Request $request)
    {
        //find product by barcode
        $product = Product::where('barcode', $request->barcode)->first();

        if ($product) {
            return response()->json([
                'success' => true,
                'data' => $product
            ]);
        }

        return response()->json([
            'success' => false,
            'data' => null
        ]);
    }

    /**
     * addToCart
     *
     * @param  mixed $request
     * @return void
     */
    public function addToCart(Request $request)
    {
        // Cari produk berdasarkan ID yang diberikan
        $product = Product::whereId($request->product_id)->first();

        // Jika produk tidak ditemukan, redirect dengan pesan error
        if (!$product) {
            return redirect()->back()->with('error', 'Product not found.');
        }

        // Cek stok produk
        if ($product->stock < $request->qty) {
            return redirect()->back()->with('error', 'Out of Stock Product!.');
        }

        // Cek keranjang
        $cart = Cart::with('product')
            ->where('product_id', $request->product_id)
            ->where('cashier_id', auth()->user()->id)
            ->first();

        if ($cart) {
            // Tambah kuantitas
            $cart->qty += $request->qty;

            //  Tetapkan ulang harga satuan jika perlu (opsional, atau bisa diabaikan kalau tidak berubah)
            $cart->price = $cart->product->sell_price;

            $cart->save();
        } else {
            // Tambahkan item baru ke keranjang
            Cart::create([
                'cashier_id' => auth()->user()->id,
                'product_id' => $request->product_id,
                'qty' => $request->qty,
                'price' => $request->sell_price, //  hanya harga satuan!
            ]);
        }

        return redirect()->route('transactions.index')->with('success', 'Product Added Successfully!.');
    }

    /**
     * destroyCart
     *
     * @param  mixed $request
     * @return void
     */
    public function destroyCart($cart_id)
    {
        $cart = Cart::with('product')->whereId($cart_id)->first();

        if ($cart) {
            $cart->delete();
            return back();
        } else {
            return back()->withErrors(['message' => 'Cart not found']);
        }
    }

    /**
     * store
     *
     * @param  mixed $request
     * @return void
     */
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'required|numeric',
            'discount_type' => 'required|string|in:rupiah,percentage',
            'tax_percentage' => 'required|numeric',
            'tax_amount' => 'required|numeric',
            'grand_total' => 'required|numeric',
            'cash' => 'required|numeric',
            'change' => 'required|numeric',
        ]);

        // Hitung total belanja dari keranjang
        $carts = Cart::where('cashier_id', auth()->user()->id)->get();
        $carts_total = 0;
        foreach ($carts as $cart) {
            $carts_total += $cart->price * $cart->qty;
        }

        // Hitung diskon
        $discount_value = 0;
        if ($request->discount_type === 'percentage') {
            $discount_value = ($request->discount / 100) * $carts_total;
        } else {
            $discount_value = $request->discount;
        }

        // Hitung pajak
        $taxable_amount = $carts_total - $discount_value;
        $tax_value = ($request->tax_percentage / 100) * $taxable_amount;

        // Generate nomor invoice
        $length = 10;
        $random = '';
        for ($i = 0; $i < $length; $i++) {
            $random .= rand(0, 1) ? rand(0, 9) : chr(rand(ord('a'), ord('z')));
        }
        $invoice = 'AMA-' . Str::upper($random);

        // Insert transaksi
        $transaction = Transaction::create([
            'cashier_id' => auth()->user()->id,
            'customer_id' => $request->customer_id,
            'invoice' => $invoice,
            'cash' => $request->cash,
            'change' => $request->change,
            'discount' => $discount_value,
            'discount_type' => $request->discount_type,
            'discount_percentage' => $request->discount_type === 'percentage' ? $request->discount : null,
            'tax_percentage' => $request->tax_percentage,
            'tax_amount' => $tax_value,
            'grand_total' => $request->grand_total,
        ]);

        // Insert detail transaksi
        foreach ($carts as $cart) {
            // Insert detail transaksi
            $transaction->details()->create([
                'transaction_id' => $transaction->id,
                'product_id' => $cart->product_id,
                'qty' => $cart->qty,
                'price' => $cart->price,
            ]);

            // Hitung keuntungan
            $total_buy_price = $cart->product->buy_price * $cart->qty;
            $total_sell_price = $cart->product->sell_price * $cart->qty;
            $profits = $total_sell_price - $total_buy_price;

            // Insert keuntungan
            $transaction->profits()->create([
                'transaction_id' => $transaction->id,
                'total' => $profits,
            ]);

            // Update stok produk
            $product = Product::find($cart->product_id);
            $product->stock = $product->stock - $cart->qty;
            $product->save();
        }

        // Hapus keranjang
        Cart::where('cashier_id', auth()->user()->id)->delete();

        // Return JSON response with invoice number
        return response()->json(['success' => true, 'invoice' => $transaction->invoice]);
    }

    /**
     * print
     *
     * @param  mixed $invoice
     * @return void
     */
    public function print($invoice)
    {
        //get transaction
        $transaction = Transaction::with('details.product', 'cashier', 'customer')
            ->where('invoice', $invoice)
            ->firstOrFail();

        $store = [
            'name' => 'ATTAVAL MENARA ABADI',
            'address' => ' Jl. Terantang kelurahan bitahan kecamatan lokpaikat',
            'phone' => '083141835652',
            'rec' => 'Mandiri | 0310021455012 | Salabiah',
        ];

        return Inertia::render('Dashboard/Transactions/Print', [
            'transaction' => $transaction,
            'store' => $store,
        ]);
    }

    public function history()
    {
        $query = Transaction::with(['customer', 'cashier']);

        // Cek jika user bukan super-admin dengan memeriksa relasi role
        // Asumsi: menggunakan pivot table 'model_has_roles' dari package Spatie Laravel Permission
        $user = auth()->user();
        $isSuperAdmin = DB::table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('model_has_roles.model_id', $user->id)
            ->where('roles.name', 'super-admin')
            ->exists();

        // Jika bukan super-admin, filter berdasarkan cashier_id
        if (!$isSuperAdmin) {
            $query->where('cashier_id', auth()->id());
        }

        // Get transactions with pagination
        $transactions = $query->latest()->paginate(7); // Changed from get() to paginate(7)

        return Inertia::render('Dashboard/Transactions-history/Index', [
            'transactions' => $transactions
        ]);
    }
}
