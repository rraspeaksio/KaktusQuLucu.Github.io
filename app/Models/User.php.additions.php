<?php
/**
 * INI BUKAN FILE BARU — ini potongan yang perlu ditambahkan
 * ke app/Models/User.php bawaan Laravel yang sudah ada di project Anda.
 * Lihat README.md bagian "Integrasi" untuk detail penempatannya.
 */

// 1) Tambahkan 'role' ke $fillable:
protected $fillable = [
    'name',
    'email',
    'password',
    'role', // <-- tambahan
];

// 2) Tambahkan relasi ke Order (opsional tapi berguna, mis. untuk halaman "Pesanan Saya"):
use App\Models\Order;
use Illuminate\Database\Eloquent\Relations\HasMany;

public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

// 3) Helper cek role admin, dipakai di middleware & Blade:
public function isAdmin(): bool
{
    return $this->role === 'admin';
}
