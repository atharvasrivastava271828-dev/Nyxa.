'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseTaskButtonProps {
  task: {
    id: string;
    title: string;
    price: number;
    provider_id: string;
  };
}

export default function PurchaseTaskButton({ task }: PurchaseTaskButtonProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    if (id) setUserId(id);
  }, []);

  const handlePurchaseTask = async () => {
    if (!userId) {
      alert('Please log in to purchase this task.');
      router.push('/login');
      return;
    }

    if (userId === task.provider_id) {
      alert('You cannot purchase your own task offering.');
      return;
    }

    const platformFee = task.price * 0.10;
    const totalAmount = task.price + platformFee;

    const confirmPayment = confirm(
      `Purchase "${task.title}"?\n\n` +
      `Task Price: $${task.price.toFixed(2)}\n` +
      `Platform Fee (10%): $${platformFee.toFixed(2)}\n` +
      `Total Charged: $${totalAmount.toFixed(2)}\n\n` +
      `Funds will be held in Escrow until delivery is confirmed.`
    );

    if (!confirmPayment) return;

    setLoading(true);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          buyerUserId: userId,
          sellerUserId: task.provider_id,
          amount: task.price
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order initialization failed.');
      }

      alert(
        `Order placed! 🎉\n\n` +
        `Your order for "${task.title}" has been recorded.\n` +
        `Order ID: ${data.order.id}\n\n` +
        `Payment will be processed via Razorpay. Track your order in the Dashboard.`
      );
      router.push('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchaseTask}
      disabled={loading}
      className="nyxa-btn nyxa-btn-primary"
    >
      {loading ? 'Processing...' : 'Purchase & Execute'}
    </button>
  );
}
