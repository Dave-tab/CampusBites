import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { RiderProfile, Order } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Bike,
  Sparkles,
} from 'lucide-react';

export const RiderEarnings: React.FC = () => {
  const { currentUser } = useAuth();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('Opay');
  const [accountNumber, setAccountNumber] = useState<string>('8123456789');
  const [accountName, setAccountName] = useState<string>('Tunde Bakare');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!currentUser) return;
    const r = DataService.getRiderByUserId(currentUser.id) || DataService.getRiders()[0];
    setRider(r);
    if (r) {
      setCompletedOrders(DataService.getRiderCompletedDeliveries(r.id));
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [loadData]);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rider) return;
    const numAmount = parseFloat(withdrawAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > (rider.wallet_balance || 0)) {
      setWithdrawError(
        `Amount exceeds your wallet balance of ₦${(rider.wallet_balance || 0).toLocaleString()}.`
      );
      return;
    }

    const result = DataService.withdrawRiderEarnings({
      riderId: rider.id,
      amount: numAmount,
      bankName: selectedBank,
      accountNumber,
      accountName,
    });

    if (result.success) {
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawError(null);
      setWithdrawSuccess(result.message);
      loadData();
      setTimeout(() => setWithdrawSuccess(null), 5000);
    } else {
      setWithdrawError(result.message);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Alert Banner */}
      {withdrawSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-3 shadow-md animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{withdrawSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rider Earnings & Payout Wallet</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard ₦500 delivery fee payout credited instantly per verified OTP student handover.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setWithdrawAmount(String(rider?.wallet_balance || ''));
            setWithdrawError(null);
            setWithdrawModalOpen(true);
          }}
          disabled={(rider?.wallet_balance || 0) <= 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdraw to Bank</span>
        </Button>
      </div>

      {/* Wallet Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-6">
            <CreditCard className="w-64 h-64 text-white" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-widest text-sky-300">
                Campus Rider Cash Wallet
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                Instant Settlement Active
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">Available Wallet Balance</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                ₦{(rider?.wallet_balance || 0).toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs relative z-10 border-t border-white/10 mt-6">
            <div>
              <p className="text-slate-400">Today's Earnings</p>
              <p className="font-bold text-white text-base">₦{(rider?.today_earnings || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Lifetime Earnings</p>
              <p className="font-bold text-white text-base">₦{(rider?.total_earnings || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Payout Account</p>
              <p className="font-bold text-sky-300 truncate">Opay • 812***6789</p>
            </div>
          </div>
        </div>

        {/* Milestone Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-black text-sm text-slate-900">Rider Tier: Campus Ace</h3>
            </div>
            <p className="text-xs text-slate-500">
              You receive 100% of the standard student delivery fee on every fulfilled meal order.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Completed Trips</span>
                <span>{rider?.total_deliveries || 0} / 50 for Silver Badge</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (((rider?.total_deliveries || 0) % 50) / 50) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Service Charge Deduction</span>
            </div>
            <p>Campus riders keep full delivery fee payouts directly.</p>
          </div>
        </div>
      </div>

      {/* Completed Deliveries Settlement Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-black text-slate-900">Recent Delivery Payouts</h3>

        {completedOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No completed delivery settlements logged yet. Complete deliveries on the Radar to earn.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedOrders.map((o) => (
              <div key={o.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">
                    Order #{o.order_reference} • {o.delivery_details?.delivery_location || 'Campus Delivery'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Recipient: {o.student_name} • Handover Verified via OTP {o.delivery_otp || '****'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 text-sm">
                    +₦{(o.delivery_fee || 500).toLocaleString()}
                  </span>
                  <p className="text-[10px] text-emerald-700 font-semibold">Settled to Wallet</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setWithdrawModalOpen(false)}
          title="Withdraw Earnings to Nigerian Bank"
        >
          <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-slate-500">Available Wallet Balance:</p>
              <p className="text-2xl font-black text-slate-900 font-mono">
                ₦{(rider?.wallet_balance || 0).toLocaleString()}
              </p>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Withdrawal Amount (₦)</label>
              <Input
                type="number"
                min="100"
                max={rider?.wallet_balance || 0}
                value={withdrawAmount}
                onChange={(e) => {
                  setWithdrawAmount(e.target.value);
                  setWithdrawError(null);
                }}
                placeholder="e.g. 5000"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Destination Bank</label>
              <Select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                options={[
                  { value: 'Opay', label: 'OPay Digital Services' },
                  { value: 'Palmpay', label: 'PalmPay' },
                  { value: 'Kuda Bank', label: 'Kuda Microfinance Bank' },
                  { value: 'GTBank', label: 'Guaranty Trust Bank (GTBank)' },
                  { value: 'Access Bank', label: 'Access Bank' },
                  { value: 'Zenith Bank', label: 'Zenith Bank' },
                  { value: 'First Bank', label: 'First Bank of Nigeria' },
                  { value: 'UBA', label: 'United Bank for Africa (UBA)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Account Number</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="10 digit account number"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Account Name</label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Account holder name"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setWithdrawModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Confirm Payout
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
