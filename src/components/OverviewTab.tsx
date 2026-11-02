import React, { useState } from 'react';
import { 
  ArrowRight, 
  Copy, 
  Check, 
  MessageCircle, 
  TrendingUp, 
  Wallet, 
  Users, 
  Receipt,
  Sparkles,
  CreditCard,
  ChevronRight,
  Info
} from 'lucide-react';
import { Trip, Member } from '../types';
import { 
  calculateBalances, 
  calculateSettlements, 
  formatCurrency, 
  formatLineSummary,
  getCategoryMeta 
} from '../utils/calculations';

interface OverviewTabProps {
  trip: Trip;
  onSelectMember: (member: Member) => void;
  onNavigateExpenses: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  trip,
  onSelectMember,
  onNavigateExpenses,
}) => {
  const [copiedLine, setCopiedLine] = useState(false);
  const [copiedPromptpay, setCopiedPromptpay] = useState<string | null>(null);
  const [settledTxIds, setSettledTxIds] = useState<Record<string, boolean>>({});

  const balances = calculateBalances(trip);
  const settlements = calculateSettlements(trip);
  const totalTripCost = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgCostPerPerson = trip.members.length > 0 ? totalTripCost / trip.members.length : 0;

  // Find top payer
  const topPayer = [...balances].sort((a, b) => b.totalPaid - a.totalPaid)[0];

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  trip.expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const handleCopyLine = () => {
    const text = formatLineSummary(trip);
    navigator.clipboard.writeText(text);
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 2500);
  };

  const handleCopyPromptpay = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptpay(id);
    setTimeout(() => setCopiedPromptpay(null), 2000);
  };

  const toggleSettled = (txId: string) => {
    setSettledTxIds(prev => ({ ...prev, [txId]: !prev[txId] }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Metric KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ยอดรวมทั้งทริป</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(totalTripCost, trip.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              จากทั้งหมด {trip.expenses.length} รายการ
            </div>
          </div>
        </div>

        {/* Avg Per Person */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">เฉลี่ยต่อคน</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(Math.round(avgCostPerPerson), trip.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              สมาชิก {trip.members.length} คนในทริป
            </div>
          </div>
        </div>

        {/* Top Payer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">คนสำรองจ่ายมากสุด</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {topPayer ? topPayer.member.name : '-'}
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              ออกไปแล้ว {topPayer ? formatCurrency(topPayer.totalPaid, trip.currency) : '0 ฿'}
            </div>
          </div>
        </div>

        {/* Settlement Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">รายการเคลียร์หนี้สุทธิ</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {settlements.length} <span className="text-base font-normal text-slate-500">ครั้ง</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">
              ลดทอนการโอนเงินซ้ำซ้อนแล้ว
            </div>
          </div>
        </div>
      </section>

      {/* 2. Settlement Plan: ใครต้องโอนให้ใคร (Dominant Visual Anchor) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                ใครต้องโอนให้ใคร (ตัดยอดหนี้สุทธิ)
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                {settlements.length} รายการ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              คำนวณจับคู่ผู้ที่ต้องจ่ายและผู้ที่ต้องได้รับเงินคืน เพื่อให้โอนเงินจำนวนครั้งน้อยที่สุด
            </p>
          </div>

          {/* Copy To LINE Button */}
          <button
            onClick={handleCopyLine}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap ${
              copiedLine
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {copiedLine ? (
              <>
                <Check className="w-4 h-4" />
                <span>คัดลอกสรุปแล้ว! วางลง LINE ได้เลย</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>คัดลอกสรุปยอดส่ง LINE</span>
              </>
            )}
          </button>
        </div>

        {/* Settlements List */}
        <div className="mt-5">
          {settlements.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">ทุกคนเคลียร์เงินครบถ้วนแล้ว!</p>
              <p className="text-xs text-slate-500 mt-0.5">ไม่มีหนี้ค้าง หรือทุกคนรับผิดชอบยอดเท่ากับที่จ่ายพอดี</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settlements.map((tx, idx) => {
                const isSettled = !!settledTxIds[tx.id];
                return (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSettled
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white hover:border-slate-300 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: From -> To */}
                      <div className="flex items-center gap-2 min-w-0">
                        {/* From Member Avatar */}
                        <div className={`w-8 h-8 rounded-full ${tx.fromMember.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                          {tx.fromMember.name.slice(0, 1)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {tx.fromMember.name}
                        </span>

                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                        {/* To Member Avatar */}
                        <div className={`w-8 h-8 rounded-full ${tx.toMember.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                          {tx.toMember.name.slice(0, 1)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {tx.toMember.name}
                        </span>
                      </div>

                      {/* Right: Amount */}
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-slate-900 tabular-nums">
                          {formatCurrency(tx.amount, trip.currency)}
                        </div>
                        <span className="text-[10px] text-slate-400">ยอดสุทธิ</span>
                      </div>
                    </div>

                    {/* Receiver Payment Info & Actions */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 truncate">
                        {tx.toMember.promptpay ? (
                          <>
                            <span className="text-slate-400 text-[11px]">พร้อมเพย์:</span>
                            <span className="font-mono font-medium text-slate-800">{tx.toMember.promptpay}</span>
                            <button
                              onClick={() => handleCopyPromptpay(tx.toMember.promptpay!, tx.id)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                              title="คัดลอกเบอร์พร้อมเพย์"
                            >
                              {copiedPromptpay === tx.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </>
                        ) : tx.toMember.bankAccount ? (
                          <span className="truncate">
                            <span className="text-slate-400">{tx.toMember.bankName}:</span> {tx.toMember.bankAccount}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">ไม่มีข้อมูลพร้อมเพย์</span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleSettled(tx.id)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors shrink-0 ${
                          isSettled
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isSettled ? '✓ โอนแล้ว' : 'ทำเครื่องหมายว่าโอนแล้ว'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. Member Net Balance Summary Table */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">สถานะยอดเงินรายบุคคล</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              สรุปว่าใครจ่ายออกไปเท่าไหร่ ต้องรับผิดชอบเท่าไหร่ และได้เงินคืนหรือต้องจ่ายเพิ่มเท่าไหร่
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">สมาชิก</th>
                <th className="py-3 px-3 text-right">จ่ายเงินออกไป (Paid)</th>
                <th className="py-3 px-3 text-right">ยอดรับผิดชอบ (Share)</th>
                <th className="py-3 px-3 text-right">ยอดสุทธิ (Net)</th>
                <th className="py-3 px-3 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map(b => {
                const isPositive = b.netBalance > 0.01;
                const isNegative = b.netBalance < -0.01;

                return (
                  <tr key={b.memberId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${b.member.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                          {b.member.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{b.member.name}</div>
                          {b.member.nickname && (
                            <div className="text-xs text-slate-400">({b.member.nickname})</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      {formatCurrency(b.totalPaid, trip.currency)}
                    </td>

                    {/* Total Share */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(b.totalShare, trip.currency)}
                    </td>

                    {/* Net Balance */}
                    <td className="py-3.5 px-3 text-right">
                      {isPositive ? (
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          +{formatCurrency(b.netBalance, trip.currency)}
                          <span className="text-[10px] font-normal text-emerald-700">(ได้คืน)</span>
                        </span>
                      ) : isNegative ? (
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          -{formatCurrency(Math.abs(b.netBalance), trip.currency)}
                          <span className="text-[10px] font-normal text-rose-700">(ต้องจ่ายเพิ่ม)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center font-mono tabular-nums text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          0 {trip.currency} (พอดี)
                        </span>
                      )}
                    </td>

                    {/* Details Action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onSelectMember(b.member)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <span>ดูบิล</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Category Breakdown */}
      {sortedCategories.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">สัดส่วนค่าใช้จ่ายตามหมวดหมู่</h2>
              <p className="text-xs text-slate-500 mt-0.5">แบ่งตามประเภทการใช้จ่ายในทริป</p>
            </div>
            <button
              onClick={onNavigateExpenses}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1"
            >
              <span>ดูทุกบิล ({trip.expenses.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Distribution Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden mb-6">
            {sortedCategories.map(([cat, amt]) => {
              const meta = getCategoryMeta(cat as any);
              const percentage = totalTripCost > 0 ? (amt / totalTripCost) * 100 : 0;
              return (
                <div
                  key={cat}
                  style={{ width: `${percentage}%` }}
                  className={`${meta.colorClass.replace('text-', 'bg-')} h-full transition-all`}
                  title={`${meta.label}: ${formatCurrency(amt, trip.currency)} (${percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedCategories.map(([cat, amt]) => {
              const meta = getCategoryMeta(cat as any);
              const percentage = totalTripCost > 0 ? (amt / totalTripCost) * 100 : 0;
              return (
                <div key={cat} className={`p-3 rounded-xl border ${meta.bgClass} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
                    <span className="text-[11px] font-mono text-slate-500">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatCurrency(amt, trip.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
