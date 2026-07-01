import { useState, useEffect } from 'react';

// Helper component for live countdown
export default function CountdownTimer({ order }) {
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (!order.prep_time_minutes || !['Preparing', 'Served'].includes(order.status)) return;

    const calculateRemaining = () => {
      // If it's already served, just show Ready
      if (order.status === 'Served') return 'READY';

      // Use preparedAt if available, fallback to createdAt
      const startedAt = new Date(order.preparedAt || order.createdAt || Date.now());
      const endTime = startedAt.getTime() + order.prep_time_minutes * 60000;
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

      if (diffSeconds <= 0) return '00:00';

      const m = Math.floor(diffSeconds / 60);
      const s = diffSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Set initial
    setTimeLeftStr(calculateRemaining());

    // Update every 1 second
    const interval = setInterval(() => {
      setTimeLeftStr(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  return (
    <div className="bg-indigo-950/80 border border-indigo-400/30 px-3 py-1.5 rounded-xl text-sm font-black text-indigo-300 shadow-inner min-w-[70px] text-center font-mono">
      {timeLeftStr}
    </div>
  );
}
