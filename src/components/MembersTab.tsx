import React, { useState } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Copy, 
  Check, 
  CreditCard, 
  Smartphone, 
  Wallet,
  AlertCircle
} from 'lucide-react';
import { Trip, Member } from '../types';
import { calculateBalances, formatCurrency } from '../utils/calculations';

interface MembersTabProps {
  trip: Trip;
  onAddMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onSelectMember: (member: Member) => void;
}

const AVATAR_COLORS = [
  'bg-indigo-600',
  'bg-rose-500',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-sky-600',
  'bg-purple-600',
  'bg-teal-600',
  'bg-pink-600',
  'bg-slate-700',
];

export const MembersTab: React.FC<MembersTabProps> = ({
  trip,
  onAddMember,
  onDeleteMember,
  onSelectMember,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [promptpay, setPromptpay] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const balances = calculateBalances(trip);
  const balanceMap = new Map(balances.map(b => [b.memberId, b]));

  const handleCopyPromptpay = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อเพื่อน');
      return;
    }

    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      avatarColor: selectedColor,
      promptpay: promptpay.trim() || undefined,
      bankName: bankName.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
    };

    onAddMember(newMember);
    setName('');
    setNickname('');
    setPromptpay('');
    setBankName('');
    setBankAccount('');
    setIsAdding(false);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">เพื่อนร่วมทริป ({trip.members.length} คน)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการรายชื่อเพื่อน บัญชีพร้อมเพย์ และดูยอดรวมการออกเงินของแต่ละคน
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAdding ? 'ปิดฟอร์ม' : 'เพิ่มเพื่อนใหม่'}</span>
        </button>
      </div>

      {/* Add Member Form (Accordion) */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>เพิ่มเพื่อนร่วมทริปใหม่</span>
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อ (ใช้แสดงในระบบ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น แบงค์, พลอย, นนท์"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อเล่น หรือชื่อภาษาอังกฤษ
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="เช่น Bank, Ploy"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เบอร์พร้อมเพย์ (PromptPay)
              </label>
              <input
                type="text"
                value={promptpay}
                onChange={e => setPromptpay(e.target.value)}
                placeholder="081-xxx-xxxx หรือเลขบัตร"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ธนาคาร
              </label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลขที่บัญชีธนาคาร
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="xxx-x-xxxxx-x"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                สีประจำตัว (Avatar)
              </label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full ${color} transition-transform ${
                      selectedColor === color ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              บันทึกเพื่อน
            </button>
          </div>
        </form>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trip.members.map(member => {
          const balance = balanceMap.get(member.id);
          const isPositive = balance && balance.netBalance > 0.01;
          const isNegative = balance && balance.netBalance < -0.01;

          return (
            <div
              key={member.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${member.avatarColor} text-white flex items-center justify-center text-lg font-bold shadow-xs`}>
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{member.name}</h4>
                      {member.nickname && (
                        <span className="text-xs text-slate-400">({member.nickname})</span>
                      )}
                    </div>
                  </div>

                  {trip.members.length > 2 && (
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบเพื่อนคนนี้ออกจากทริป"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">จ่ายออกไป:</span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {formatCurrency(balance?.totalPaid || 0, trip.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">สถานะสุทธิ:</span>
                    <span className={`font-mono font-bold tabular-nums ${
                      isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {balance ? (
                        isPositive ? `+${formatCurrency(balance.netBalance, trip.currency)} (ได้คืน)`
                        : isNegative ? `-${formatCurrency(Math.abs(balance.netBalance), trip.currency)} (ต้องจ่าย)`
                        : `0 ${trip.currency}`
                      ) : '0 ฿'}
                    </span>
                  </div>
                </div>

                {/* PromptPay & Bank Info */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Smartphone className="w-3 h-3 text-slate-400" />
                      พร้อมเพย์:
                    </span>
                    {member.promptpay ? (
                      <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                        <span>{member.promptpay}</span>
                        <button
                          onClick={() => handleCopyPromptpay(member.promptpay!, member.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                          title="คัดลอกเบอร์พร้อมเพย์"
                        >
                          {copiedId === member.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">ไม่ได้ระบุ</span>
                    )}
                  </div>

                  {member.bankAccount && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{member.bankName || 'ธนาคาร'}:</span>
                      <span className="font-mono">{member.bankAccount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* View details */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectMember(member)}
                  className="w-full py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center"
                >
                  ดูบิลที่ {member.name} มีส่วนร่วม
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
