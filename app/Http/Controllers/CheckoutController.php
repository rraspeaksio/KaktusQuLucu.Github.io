<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Endpoint: POST /checkout
     * Route ini WAJIB dipasang middleware 'auth' (lihat routes/web.php),
     * jadi kalau request sampai ke sini, $request->user() pasti sudah ada.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.variant' => ['nullable', 'string', 'max:255'],
            'items.*.price' => ['required', 'integer', 'min:0'],
            'items.*.qty' => ['required', 'integer', 'min:1'],

            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_phone' => ['required', 'string', 'max:30'],
            'buyer_address' => ['required', 'string'],
            'buyer_note' => ['nullable', 'string'],

            'shipping_zone' => ['nullable', 'string', 'max:100'],
            'shipping_cost' => ['required', 'integer', 'min:0'],

            'payment_method' => ['required', 'in:bank,ewallet,qris,cod'],
        ]);

        $order = DB::transaction(function () use ($data, $request) {
            $subtotal = collect($data['items'])->sum(fn ($i) => $i['price'] * $i['qty']);

            $order = Order::create([
                'user_id' => $request->user()->id, // <-- pesanan terikat ke user yang login
                'invoice_no' => Order::generateInvoiceNo(),
                'buyer_name' => $data['buyer_name'],
                'buyer_phone' => $data['buyer_phone'],
                'buyer_address' => $data['buyer_address'],
                'buyer_note' => $data['buyer_note'] ?? null,
                'shipping_zone' => $data['shipping_zone'] ?? null,
                'shipping_cost' => $data['shipping_cost'],
                'subtotal' => $subtotal,
                'total' => $subtotal + $data['shipping_cost'],
                'payment_method' => $data['payment_method'],
                'payment_status' => 'unpaid',
                'status' => 'pending',
            ]);

            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_name' => $item['name'],
                    'variant' => $item['variant'] ?? null,
                    'price' => $item['price'],
                    'qty' => $item['qty'],
                    'line_total' => $item['price'] * $item['qty'],
                ]);
            }

            return $order;
        });

        // Diminta lewat fetch/AJAX dari script.js, jadi balasannya JSON.
        // Frontend akan pakai invoice_no ini untuk membuka WhatsApp seperti alur lama.
        return response()->json([
            'success' => true,
            'invoice_no' => $order->invoice_no,
            'order_id' => $order->id,
        ]);
    }
}
