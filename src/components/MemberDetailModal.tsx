import React from 'react';
import { X, Receipt, CheckCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Trip, Member, Expense } from '../types';
import { calculateExpenseShares, formatCurrency, getCategoryMeta } from '../utils/calculations';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  trip: Trip;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  trip,
}) => {
  if (!member) return null;

  // Expenses paid by this member
  const paidExpenses = trip.expenses.filter(e => e.payerId === member.id);
  const totalPaid = paidExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Expenses participated in by this member
  const participatedExpenses: { expense: Expense; share: number }[] = [];
  let totalShare = 0;

  for (const exp of trip.expenses) {
    const shares = calculateExpenseShares(exp, trip.members);
    const myShare = shares[member.id] || 0;
    if (myShare > 0) {
      participatedExpenses.push({ expense: exp, share: myShare });
      totalShare += myShare;
    }
  }

  const netBalance = Math.round((totalPaid - totalShare) * 100) / 100;
  const isPositive = netBalance > 0.01;
  const isNegative = netBalance < -0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${member.avatarColor} text-white flex items-center justify-center text-xl font-bold shadow-xs`}>
              {member.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs text-slate-500">
                {member.nickname ? `${member.nickname} · ` : ''}
                สรุปค่าใช้จ่ายส่วนบุคคลในทริป
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-200 p-4 text-center bg-white text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">ยอดที่จ่ายไป</span>
            <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(totalPaid, trip.currency)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ยอดที่ต้องรับผิดชอบ</span>
            <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(totalShare, trip.currency)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ยอดสุทธิ</span>
            <span className={`text-sm font-bold font-mono tabular-nums ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-600'
            }`}>
              {isPositive ? `+${formatCurrency(netBalance, trip.currency)}`
                : isNegative ? `-${formatCurrency(Math.abs(netBalance), trip.currency)}`
                : `0 ${trip.currency}`}
            </span>
          </div>
        </div>

        {/* Lists Content */}
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {/* 1. Paid expenses */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>บิลที่ {member.name} เป็นคนออกเงิน ({paidExpenses.length} รายการ)</span>
            </h4>

            {paidExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">ยังไม่มีรายการที่ออกเงิน</p>
            ) : (
              <div className="space-y-1.5">
                {paidExpenses.map(exp => {
                  const meta = getCategoryMeta(exp.category);
                  return (
                    <div key={exp.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 truncate block">{exp.title}</span>
                        <span className="text-[11px] text-slate-400">{meta.label} · {exp.date}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                        {formatCurrency(exp.amount, trip.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Participated expenses */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
              <span>บิลที่มีส่วนร่วมหาร ({participatedExpenses.length} รายการ)</span>
            </h4>

            {participatedExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">ไม่มีส่วนร่วมในบิลใดๆ</p>
            ) : (
              <div className="space-y-1.5">
                {participatedExpenses.map(({ expense: exp, share }) => (
                  <div key={exp.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-slate-800 truncate block">{exp.title}</span>
                      <span className="text-[11px] text-slate-400">
                        ยอดบิลรวม {formatCurrency(exp.amount, trip.currency)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-700 tabular-nums">
                        {formatCurrency(Math.round(share * 100) / 100, trip.currency)}
                      </span>
                      <span className="block text-[10px] text-slate-400">ส่วนของ {member.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
