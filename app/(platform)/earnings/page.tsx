'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';

interface EarningRecord {
  _id: string;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
}

export default function AddEarningsPage() {
  const router = useRouter();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState<EarningRecord[]>([]);
  const [newAmount, setNewAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/profile/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTotalEarnings(data.totalEarnings);
        setEarningsHistory(data.history.sort((a: EarningRecord, b: EarningRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEarning = async () => {
    const amount = parseFloat(newAmount);
    
    if (!amount || amount <= 0) {
      alert('Введіть коректну суму');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/profile/earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTotalEarnings(data.totalEarnings);
        setEarningsHistory(data.history.sort((a: EarningRecord, b: EarningRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        setNewAmount('');
      }
    } catch (error) {
      console.error('Failed to add earning:', error);
      alert('Помилка при додаванні доходу');
    }
  };

  const handleDeleteEarning = async (earningId: string) => {
    if (!confirm('Видалити цей запис?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/profile/earnings/${earningId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTotalEarnings(data.totalEarnings);
        setEarningsHistory(data.history.sort((a: EarningRecord, b: EarningRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to delete earning:', error);
      alert('Помилка при видаленні');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] ">
      {/* Header */}
      <div className="bg-white pb-4">
        <div className="px-4 pt-14">
          {/* Header buttons */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-black/10 backdrop-blur-md rounded-[32px]"
            >
              <X className="w-5 h-5 text-black" />
              <span className="text-sm font-medium text-black">Закрити</span>
            </button>
           
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-black mb-3">
            Додавання доходу
          </h1>

          {/* Total earnings card */}
          <div className="bg-[#F2F2F2] rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full px-3 py-1.5">
                  <span className="text-xs font-bold text-black">Мій дохід</span>
                </div>
              </div>
              <span className="text-sm font-bold text-black">$ {totalEarnings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings history */}
      <div className="px-4 mt-4">
        <div className="space-y-0">
          {earningsHistory.map((earning) => (
            <div
              key={earning._id}
              className="bg-[#F2F2F2] border-b border-[#E7E7E7] py-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{formatDate(earning.date)}</p>
                  <p className="text-sm font-bold text-black">$ {earning.amount}</p>
                </div>
                <button
                  onClick={() => handleDeleteEarning(earning._id)}
                  className="w-10 h-10 bg-white rounded-[13px] flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}

          {earningsHistory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Історія доходів порожня</p>
              <p className="text-xs text-gray-400 mt-1">Додайте свій перший дохід нижче</p>
            </div>
          )}
        </div>
      </div>

      {/* Add earning form - fixed at bottom */}
      <div className="fixed bottom-[100px] left-0 right-0 bg-gradient-to-t from-[#F2F2F2]/70 to-transparent pt-5 pb-5 px-4">
        <div className="max-w-md mx-auto space-y-2.5">
          {/* Input */}
          <div className="bg-white rounded-3xl px-4 py-2.5 flex items-center justify-between">
            <input
              type="number"
              placeholder="Введіть дохід"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="flex-1 text-sm text-black placeholder:text-gray-500 outline-none bg-transparent"
            />
            <span className="text-sm text-gray-400">$</span>
          </div>

          {/* Button */}
          <button
            onClick={handleAddEarning}
            disabled={!newAmount}
            className="w-full bg-[#2466FF] text-white rounded-[36px] py-4 px-5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1557ee] transition-colors"
          >
            Додати
          </button>
        </div>
      </div>
    </div>
  );
}
