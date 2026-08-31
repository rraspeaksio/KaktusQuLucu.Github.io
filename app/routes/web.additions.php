<?php
/**
 * INI BUKAN FILE PENGGANTI routes/web.php Anda.
 * Tambahkan blok-blok di bawah ini ke routes/web.php yang sudah ada.
 */

use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CheckoutController;
use Illuminate\Support\Facades\Route;

// ---------- Auth (guest only) ----------
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// ---------- Checkout (wajib login) ----------
// Middleware 'auth' bawaan Laravel otomatis redirect ke route('login')
// kalau belum login, DAN menyimpan URL tujuan supaya setelah login
// user diarahkan balik ke sini (lihat redirect()->intended() di AuthController).
Route::post('/checkout', [CheckoutController::class, 'store'])
    ->middleware('auth')
    ->name('checkout.store');

// ---------- Dashboard Admin (wajib login + role admin) ----------
Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
        Route::get('/orders/new-count', [AdminOrderController::class, 'newCount'])->name('orders.newCount');
    });
