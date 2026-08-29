import type { Payment } from '../types';

export async function processPayment(data: {
  orderId: string;
  method: 'upi' | 'card' | 'cashless';
  amount: number;
}): Promise<Payment> {
  await delay(1200);
  const payment: Payment = {
    id: `pay_${data.orderId}`,
    orderId: data.orderId,
    method: data.method,
    amount: data.amount,
    status: 'success',
    createdAt: new Date().toISOString(),
  };
  return payment;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
