import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Users, DollarSign, Calculator } from 'lucide-react';
import { Trip, Expense, Member, SplitType, ExpenseCategory } from '../types';
import { formatCurrency, getCategoryMeta } from '../utils/calculations';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  trip: Trip;
  editingExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip,
  editingExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payerId, setPayerId] = useState<string>(trip.members[0]?.id || '');
  const [splitType, setSplitType] = useState<SplitType>('equal_all');
  const [participantIds, setParticipantIds] = useState<string[]>(trip.members.map(m => m.id));
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmountStr(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setPayerId(editingExpense.payerId);
      setSplitType(editingExpense.splitType);
      setParticipantIds(editingExpense.participantIds || trip.members.map(m => m.id));
      setNotes(editingExpense.notes || '');

      const formattedCustom: Record<string, string> = {};
      if (editingExpense.customAmounts) {
        for (const [mid, amt] of Object.entries(editingExpense.customAmounts)) {
          formattedCustom[mid] = amt.toString();
        }
      }
      setCustomAmounts(formattedCustom);
    } else {
      // Default new expense
      setTitle('');
      setAmountStr('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setPayerId(trip.members[0]?.id || '');
      setSplitType('equal_all');
      setParticipantIds(trip.members.map(m => m.id));
      setCustomAmounts({});
      setNotes('');
    }
    setErrorMsg(null);
  }, [editingExpense, isOpen, trip.members]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;

  // Toggle participant checkbox for 'equal_selected'
  const toggleParticipant = (memberId: string) => {
    setParticipantIds(prev => {
      if (prev.includes(memberId)) {
        // Prevent unselecting all
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAllParticipants = () => {
    setParticipantIds(trip.members.map(m => m.id));
  };

  // Custom amount changes
  const handleCustomAmountChange = (memberId: string, value: string) => {
    setCustomAmounts(prev => ({
      ...prev,
      [memberId]: value,
    }));
  };

  // Sum of custom amounts
  const customTotal = Object.values(customAmounts).reduce((sum, val) => {
    const num = parseFloat(val) || 0;
    return sum + num;
  }, 0);

  const customDiff = Math.round((numericAmount - customTotal) * 100) / 100;

  // Auto split remaining to members
  const autoDistributeRemaining = () => {
    if (numericAmount <= 0) return;
    const perPerson = Math.round((numericAmount / trip.members.length) * 100) / 100;
    const newCustom: Record<string, string> = {};
    trip.members.forEach(m => {
      newCustom[m.id] = perPerson.toString();
    });
    setCustomAmounts(newCustom);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('กรุณากรอกชื่อรายการค่าใช้จ่าย');
      return;
    }
    if (numericAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!payerId) {
      setErrorMsg('กรุณาเลือกคนจ่ายเงิน');
      return;
    }

    if (splitType === 'equal_selected' && participantIds.length === 0) {
      setErrorMsg('กรุณาเลือกคนร่วมหารอย่างน้อย 1 คน');
      return;
    }

    if (splitType === 'exact_amounts') {
      if (Math.abs(customDiff) > 0.05) {
        setErrorMsg(`ยอดรวมรายคน (${customTotal.toLocaleString('th-TH')} บ.) ยังไม่ตรงกับยอดบิล (${numericAmount.toLocaleString('th-TH')} บ.) ขาด/เกิน ${Math.abs(customDiff)} บ.`);
        return;
      }
    }

    const parsedCustomAmounts: Record<string, number> = {};
    if (splitType === 'exact_amounts') {
      trip.members.forEach(m => {
        parsedCustomAmounts[m.id] = parseFloat(customAmounts[m.id]) || 0;
      });
    }

    const expenseData: Expense = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      title: title.trim(),
      amount: numericAmount,
      category,
      date,
      payerId,
      splitType,
      participantIds: splitType === 'equal_all' ? trip.members.map(m => m.id) : participantIds,
      customAmounts: splitType === 'exact_amounts' ? parsedCustomAmounts : undefined,
      notes: notes.trim() || undefined,
    };

    onSave(expenseData);
    onClose();
  };

  const categories: ExpenseCategory[] = [
    'food',
    'stay',
    'transport',
    'cafe',
    'activity',
    'shopping',
    'other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {editingExpense ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่ายใหม่'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อรายการค่าใช้จ่าย <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="เช่น ค่าที่พักพูลวิลล่า, ค่าชาบูมื้อค่ำ"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                จำนวนเงิน ({trip.currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-3.5 pr-8 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {trip.currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* 2. Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ค่าใช้จ่าย
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-xs">
              {categories.map(cat => {
                const meta = getCategoryMeta(cat);
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Who Paid (Payer) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ใครเป็นคนจ่ายเงินออกไปก่อน? (Payer) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {trip.members.map(member => {
                const isSelected = payerId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPayerId(member.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${member.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                      {member.name.slice(0, 1)}
                    </div>
                    <span className="text-xs font-semibold truncate">{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Split Mode (รูปแบบการหาร - Core Requirement) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              รูปแบบการหารค่าใช้จ่าย (Split Method) <span className="text-rose-500">*</span>
            </label>

            {/* Split Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs mb-3">
              <button
                type="button"
                onClick={() => setSplitType('equal_all')}
                className={`py-2 px-2 rounded-lg font-semibold transition-all text-center ${
                  splitType === 'equal_all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                หารทุกคนเท่ากัน
              </button>
              <button
                type="button"
                onClick={() => setSplitType('equal_selected')}
                className={`py-2 px-2 rounded-lg font-semibold transition-all text-center ${
                  splitType === 'equal_selected'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เลือกคนหาร
              </button>
              <button
                type="button"
                onClick={() => setSplitType('exact_amounts')}
                className={`py-2 px-2 rounded-lg font-semibold transition-all text-center ${
                  splitType === 'exact_amounts'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ระบุยอดรายคน
              </button>
            </div>

            {/* Mode A: Equal All */}
            {splitType === 'equal_all' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>หารทุกคน ({trip.members.length} คน)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {numericAmount > 0 
                    ? `~${formatCurrency(Math.round((numericAmount / trip.members.length) * 100) / 100, trip.currency)} / คน`
                    : '0 ฿'}
                </span>
              </div>
            )}

            {/* Mode B: Equal Selected */}
            {splitType === 'equal_selected' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>ติ๊กเลือกเฉพาะคนที่ร่วมหารในบิลนี้:</span>
                  <button
                    type="button"
                    onClick={handleSelectAllParticipants}
                    className="text-slate-700 hover:underline font-medium"
                  >
                    เลือกทุกคน
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {trip.members.map(member => {
                    const isChecked = participantIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleParticipant(member.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full ${member.avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                            {member.name.slice(0, 1)}
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between text-slate-700">
                  <span>เลือก {participantIds.length} คน</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {participantIds.length > 0 && numericAmount > 0
                      ? `~${formatCurrency(Math.round((numericAmount / participantIds.length) * 100) / 100, trip.currency)} / คน`
                      : '0 ฿'}
                  </span>
                </div>
              </div>
            )}

            {/* Mode C: Exact Amounts */}
            {splitType === 'exact_amounts' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">กรอกจำนวนเงินที่แต่ละคนต้องจ่าย:</span>
                  <button
                    type="button"
                    onClick={autoDistributeRemaining}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>เฉลี่ยทุกคนเท่ากัน</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {trip.members.map(member => (
                    <div key={member.id} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className={`w-6 h-6 rounded-full ${member.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                        {member.name.slice(0, 1)}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 w-24 truncate">
                        {member.name}
                      </span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={customAmounts[member.id] || ''}
                          onChange={e => handleCustomAmountChange(member.id, e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-2.5 pr-6 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                          {trip.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Status of Exact Split */}
                <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-mono ${
                  Math.abs(customDiff) < 0.01
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  <span>รวมที่กรอก: {customTotal.toLocaleString('th-TH')} {trip.currency}</span>
                  <span>
                    {Math.abs(customDiff) < 0.01 
                      ? '✓ ครบพอดี' 
                      : customDiff > 0 
                        ? `ยังขาด ${customDiff.toLocaleString('th-TH')} ${trip.currency}` 
                        : `เกินมา ${Math.abs(customDiff).toLocaleString('th-TH')} ${trip.currency}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="เช่น จองล่วงหน้า 3 วัน, ซื้อที่ร้านของฝากกาดหลวง"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingExpense ? 'บันทึกการแก้ไข' : 'เพิ่มค่าใช้จ่าย'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
