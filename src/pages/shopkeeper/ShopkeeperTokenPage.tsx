import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode, Search, CheckCircle2, XCircle, User, ShoppingBag,
  Clock, AlertTriangle, ScanLine, Camera, CameraOff,
} from 'lucide-react';
import { getOrdersByShop, getOrderById, updateOrderStatus, redeemOrderByQr } from '../../services/orderService';
import { getShopByShopkeeper } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import type { Order, Shop } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/common/Badges';

type QRResult =
  | Order
  | 'not_found'
  | 'wrong_shop'
  | 'already_redeemed'
  | 'invalid_qr'
  | 'completed_success'
  | null;

const QR_SCANNER_ID = 'shopkeeper-qr-reader';

export function ShopkeeperTokenPage() {
  const { user } = useAuth();

  // Shared state
  const [activeTab, setActiveTab] = useState<'token' | 'qr'>('token');
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopOrders, setShopOrders] = useState<Order[]>([]);

  // Token tab state
  const [token, setToken] = useState('');
  const [tokenResult, setTokenResult] = useState<Order | 'not_found' | null>(null);

  // QR tab state
  const [scanning, setScanning] = useState(false);
  const [qrStatus, setQrStatus] = useState<QRResult>(null);
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [completing, setCompleting] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanProcessingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load shopkeeper's assigned shop and orders
  useEffect(() => {
    if (!user) return;
    getShopByShopkeeper(user.id).then((s) => {
      if (s) {
        setShop(s);
        getOrdersByShop(s.id).then(setShopOrders);
      }
    });
  }, [user]);

  // AudioContext helper: initialized/resumed on user click gesture
  const initAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch((err) => {
          console.warn('Failed to resume AudioContext:', err);
        });
      }
    } catch (err) {
      console.warn('Failed to initialize AudioContext:', err);
    }
  }, []);

  const playBeep = useCallback((type: 'success' | 'error') => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) {
        console.warn('AudioContext not initialized yet.');
        return;
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch((err) => console.warn('AudioContext resume failed:', err));
      }

      const now = ctx.currentTime;

      if (type === 'success') {
        // Double beep (~880Hz then ~1320Hz, ~250ms total)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now + 0.1);
        gain2.gain.setValueAtTime(0.15, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.25);
      } else {
        // Lower-pitched error beep (~220Hz -> 150Hz, ~200ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (err) {
      console.warn('Failed to play audio beep:', err);
    }
  }, []);

  // Cleanup scanner & AudioContext on unmount
  useEffect(() => {
    return () => {
      stopScanner();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch((err) => console.warn('Failed to close AudioContext:', err));
        audioCtxRef.current = null;
      }
    };
  }, []);

  // --- Token tab logic (unchanged) ---
  async function verifyToken() {
    setTokenResult(null);
    if (!token.trim()) return;
    const order = shopOrders.find(
      (o) => o.token.toLowerCase() === token.trim().toLowerCase()
    );
    setTokenResult(order ?? 'not_found');
  }

  async function markTokenOrderCompleted() {
    if (!tokenResult || tokenResult === 'not_found') return;
    await updateOrderStatus(tokenResult.id, 'completed');
    setTokenResult({ ...tokenResult, status: 'completed' });
  }

  // --- QR tab logic ---
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
    setScanning(false);
    scanProcessingRef.current = false;
  }, []);

  const startScanner = useCallback(async () => {
    initAudio();
    setQrStatus(null);
    setScannedOrder(null);
    scanProcessingRef.current = false;

    const scanner = new Html5Qrcode(QR_SCANNER_ID, { verbose: false });
    scannerRef.current = scanner;
    setScanning(true);

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (scanProcessingRef.current) return;
          scanProcessingRef.current = true;

          playBeep('success');

          await stopScanner();
          await handleQrScan(decodedText);
        },
        () => { /* ignore scan errors */ }
      );
    } catch (err) {
      await stopScanner();
      console.error('Camera start failed:', err);
      playBeep('error');
      setQrStatus('invalid_qr');
    }
  }, [initAudio, playBeep, stopScanner]);

  async function handleQrScan(rawText: string) {
    setQrStatus(null);
    setScannedOrder(null);

    let orderId = '';
    try {
      const payload = JSON.parse(rawText.trim());
      orderId = payload?.orderId || '';
    } catch {
      // not valid JSON
    }

    if (!orderId) {
      playBeep('error');
      setQrStatus('invalid_qr');
      return;
    }

    // Fetch the full order regardless of shop
    const order = await getOrderById(orderId);

    if (!order) {
      playBeep('error');
      setQrStatus('not_found');
      return;
    }

    if (shop && order.shopId !== shop.id) {
      playBeep('error');
      setQrStatus('wrong_shop');
      return;
    }

    if (order.status === 'completed') {
      playBeep('error');
      setQrStatus('already_redeemed');
      return;
    }

    // Order valid and belongs to this shop — show details, wait for Complete button
    setScannedOrder(order);
    setQrStatus(order);
  }

  async function handleCompleteOrder() {
    if (!scannedOrder || !shop) return;
    setCompleting(true);
    try {
      const updated = await redeemOrderByQr(scannedOrder.id, shop.id);
      if (updated) {
        setScannedOrder(updated);
        setQrStatus('completed_success');
      } else {
        // was already redeemed by the time we clicked
        setQrStatus('already_redeemed');
      }
    } catch (err) {
      console.error('Redeem failed:', err);
    } finally {
      setCompleting(false);
    }
  }

  function resetQrTab() {
    setQrStatus(null);
    setScannedOrder(null);
    scanProcessingRef.current = false;
  }

  function switchTab(tab: 'token' | 'qr') {
    stopScanner();
    setActiveTab(tab);
    setTokenResult(null);
    setQrStatus(null);
    setScannedOrder(null);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Verification & QR Scanner</h1>
          {shop && (
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
              Assigned: {shop.name}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1">Verify student orders by token number or QR code scan</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => switchTab('token')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-all ${
            activeTab === 'token'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className="h-4 w-4" /> Token Lookup
        </button>
        <button
          onClick={() => switchTab('qr')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-all ${
            activeTab === 'qr'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ScanLine className="h-4 w-4" /> Scan QR Code
        </button>
      </div>

      {/* ===== TOKEN TAB ===== */}
      {activeTab === 'token' && (
        <>
          <Card className="p-6">
            <div className="space-y-3">
              <Label htmlFor="token">Token Number</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. FH-001"
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && verifyToken()}
                  />
                </div>
                <Button onClick={verifyToken}>
                  <QrCode className="h-4 w-4 mr-1" /> Verify Token
                </Button>
              </div>
            </div>
          </Card>

          {tokenResult === 'not_found' && (
            <Card className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <XCircle className="h-7 w-7" />
              </div>
              <p className="font-semibold text-red-600">Order Not Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                No order found with token &ldquo;{token}&rdquo; for your shop.
              </p>
            </Card>
          )}

          {tokenResult && tokenResult !== 'not_found' && (
            <OrderDetailsCard
              order={tokenResult}
              shopName={shop?.name}
              onComplete={markTokenOrderCompleted}
            />
          )}
        </>
      )}

      {/* ===== QR TAB ===== */}
      {activeTab === 'qr' && (
        <>
          <Card className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Point your camera at the student&apos;s QR code to scan and verify the order.
              </p>
              {!scanning && qrStatus === null && (
                <Button onClick={startScanner} className="w-full">
                  <Camera className="h-4 w-4 mr-2" /> Open Camera & Scan
                </Button>
              )}
              {scanning && (
                <Button variant="outline" onClick={stopScanner} className="w-full">
                  <CameraOff className="h-4 w-4 mr-2" /> Stop Camera
                </Button>
              )}
            </div>

            {/* Camera viewfinder */}
            <div
              id={QR_SCANNER_ID}
              className={`w-full rounded-lg overflow-hidden ${scanning ? 'block' : 'hidden'}`}
              style={{ minHeight: scanning ? '300px' : '0' }}
            />
          </Card>

          {/* QR scan results */}
          {qrStatus === 'invalid_qr' && (
            <Card className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <p className="font-semibold text-yellow-700">Invalid QR Code</p>
              <p className="text-sm text-muted-foreground mt-1">This QR code is not a valid FoodHub order QR.</p>
              <Button variant="outline" className="mt-4" onClick={resetQrTab}>Try Again</Button>
            </Card>
          )}

          {qrStatus === 'not_found' && (
            <Card className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <XCircle className="h-7 w-7" />
              </div>
              <p className="font-semibold text-red-600">Order Not Found</p>
              <p className="text-sm text-muted-foreground mt-1">No order exists for this QR code.</p>
              <Button variant="outline" className="mt-4" onClick={resetQrTab}>Scan Again</Button>
            </Card>
          )}

          {qrStatus === 'wrong_shop' && (
            <Card className="p-6 text-center border-red-300 bg-red-50">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-200 text-red-700">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <p className="font-bold text-red-700 text-base">This order does not belong to your shop.</p>
              <p className="text-xs text-red-600 mt-1">You cannot mark this order as completed.</p>
              <Button variant="outline" className="mt-4" onClick={resetQrTab}>Scan Again</Button>
            </Card>
          )}

          {qrStatus === 'already_redeemed' && (
            <Card className="p-6 text-center border-orange-300 bg-orange-50">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-200 text-orange-700">
                <XCircle className="h-7 w-7" />
              </div>
              <p className="font-bold text-orange-700 text-base">Token already redeemed or invalid</p>
              <p className="text-xs text-orange-600 mt-1">This order has already been marked as completed.</p>
              <Button variant="outline" className="mt-4" onClick={resetQrTab}>Scan Again</Button>
            </Card>
          )}

          {qrStatus === 'completed_success' && (
            <Card className="p-6 text-center border-green-300 bg-green-50">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-200 text-green-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="font-bold text-green-700 text-base">Order completed successfully</p>
              <p className="text-xs text-green-600 mt-1">The order has been marked as completed.</p>
              <Button variant="outline" className="mt-4" onClick={resetQrTab}>Scan Another</Button>
            </Card>
          )}

          {scannedOrder && qrStatus !== 'completed_success' && typeof qrStatus !== 'string' && qrStatus !== null && (
            <OrderDetailsCard
              order={scannedOrder}
              shopName={shop?.name}
              onComplete={handleCompleteOrder}
              completing={completing}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---- Shared order detail card ----
function OrderDetailsCard({
  order,
  shopName,
  onComplete,
  completing = false,
}: {
  order: Order;
  shopName?: string;
  onComplete: () => void;
  completing?: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-green-600">Valid Order{shopName ? ` — ${shopName}` : ''}</p>
          <p className="text-sm text-muted-foreground">Order details verified successfully</p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-medium">#{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground font-mono text-xs">Token</span>
          <span className="font-bold text-primary text-base">{order.token}</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Customer</span>
          <span className="font-medium">{order.userName}</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> Items</span>
          <span className="font-medium">{order.items.length} items</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Pickup</span>
          <span className="font-medium">{order.estimatedPickupTime}</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold">₹{order.totalAmount}</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-muted-foreground">Payment</span>
          <span className="font-semibold text-green-600 capitalize">{order.paymentStatus}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order Status</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {order.items.map((it, i) => (
          <span key={i} className="text-xs bg-muted rounded-full px-2 py-0.5">
            {it.quantity}× {it.name}
          </span>
        ))}
      </div>

      {order.status !== 'completed' && (
        <Button className="w-full mt-4" onClick={onComplete} disabled={completing}>
          {completing ? 'Completing…' : 'Complete Order'}
        </Button>
      )}
      {order.status === 'completed' && (
        <p className="text-center text-sm text-green-600 font-medium mt-4">Order already completed</p>
      )}
    </Card>
  );
}
