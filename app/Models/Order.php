<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'invoice_no',
        'buyer_name', 'buyer_phone', 'buyer_address', 'buyer_note',
        'shipping_zone', 'shipping_cost', 'subtotal', 'total',
        'payment_method', 'payment_status', 'status',
    ];

    // Semua status pesanan yang valid, dipakai di form admin & validasi
    public const STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Contoh: INV-20260828-0007
    public static function generateInvoiceNo(): string
    {
        $today = now()->format('Ymd');
        $countToday = static::whereDate('created_at', now())->count() + 1;
        return sprintf('INV-%s-%04d', $today, $countToday);
    }
}
