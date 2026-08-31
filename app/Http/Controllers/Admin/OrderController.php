<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /admin/orders
     * Route group-nya sudah dipasangi middleware ['auth','admin'] di routes/web.php.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items'])->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(15)->withQueryString();

        return view('admin.orders.index', [
            'orders' => $orders,
            'statuses' => Order::STATUSES,
            'activeStatus' => $request->query('status', 'all'),
        ]);
    }

    /**
     * PATCH /admin/orders/{order}/status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', Order::STATUSES)],
        ]);

        $order->update(['status' => $data['status']]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'status' => $order->status]);
        }

        return back()->with('statusUpdated', $order->invoice_no);
    }

    /**
     * GET /admin/orders/new-count
     * Dipanggil berkala (polling) oleh JS di dashboard untuk indikator
     * "ada pesanan baru" tanpa perlu setup websocket/Pusher.
     * Untuk realtime penuh, endpoint ini bisa diganti event broadcast
     * (Laravel Reverb/Pusher) — lihat catatan di README.
     */
    public function newCount(Request $request)
    {
        $since = $request->query('since');
        $count = Order::when($since, fn ($q) => $q->where('created_at', '>', $since))
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'count' => $count,
            'server_time' => now()->toIso8601String(),
        ]);
    }
}
