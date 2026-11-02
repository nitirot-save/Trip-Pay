import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Users, 
  Calendar, 
  Tag, 
  ChevronDown 
} from 'lucide-react';
import { Trip, Expense, ExpenseCategory } from '../types';
import { formatCurrency, getCategoryMeta } from '../utils/calculations';

interface ExpensesTabProps {
  trip: Trip;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  trip,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'food', label: 'อาหาร' },
    { key: 'stay', label: 'ที่พัก' },
    { key: 'transport', label: 'เดินทาง' },
    { key: 'cafe', label: 'คาเฟ่' },
    { key: 'activity', label: 'กิจกรรม' },
    { key: 'shopping', label: 'ช้อปปิ้ง' },
    { key: 'other', label: 'อื่นๆ' },
  ];

  const filteredExpenses = trip.expenses.filter(exp => {
    // Search query match
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category match
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;

    // Payer match
    const matchesPayer = selectedPayer === 'all' || exp.payerId === selectedPayer;

    return matchesSearch && matchesCategory && matchesPayer;
  });

  const getPayer = (payerId: string) => {
    return trip.members.find(m => m.id === payerId);
  };

  const getSplitDescription = (exp: Expense) => {
    if (exp.splitType === 'equal_all') {
      const perPerson = exp.amount / trip.members.length;
      return `หารเท่ากันทุกคน (${trip.members.length} คน) ~ คนละ ${formatCurrency(Math.round(perPerson), trip.currency)}`;
    }
    if (exp.splitType === 'equal_selected') {
      const count = exp.participantIds.length;
      const names = exp.participantIds
        .map(id => trip.members.find(m => m.id === id)?.name || id)
        .join(', ');
      const perPerson = count > 0 ? exp.amount / count : 0;
      return `หารเฉพาะ ${count} คน (${names}) ~ คนละ ${formatCurrency(Math.round(perPerson), trip.currency)}`;
    }
    if (exp.splitType === 'exact_amounts') {
      const count = exp.customAmounts ? Object.keys(exp.customAmounts).length : 0;
      return `ระบุจำนวนเงินรายคน (${count} คน)`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search, Category Filters, Payer, Add */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหารายการค่าใช้จ่าย หรือโน้ต..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Payer Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline">คนจ่าย:</label>
            <select
              value={selectedPayer}
              onChange={e => setSelectedPayer(e.target.value)}
              aria-label="กรองตามคนจ่ายเงิน"
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">คนจ่าย: ทุกคน</option>
              {trip.members.map(m => (
                <option key={m.id} value={m.id}>
                  จ่ายโดย {m.name}
                </option>
              ))}
            </select>

            {/* Add Expense Button */}
            <button
              onClick={onAddExpense}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มบิล</span>
            </button>
          </div>
        </div>

        {/* Category Pills (Interactive Filter Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">ไม่พบรายการค่าใช้จ่าย</h3>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดเพิ่มค่าใช้จ่ายรายการใหม่</p>
            <button
              onClick={onAddExpense}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มค่าใช้จ่ายแรก</span>
            </button>
          </div>
        ) : (
          filteredExpenses.map(exp => {
            const payer = getPayer(exp.payerId);
            const catMeta = getCategoryMeta(exp.category);

            return (
              <div
                key={exp.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Category Icon + Title + Metadata */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Category Badge Icon */}
                  <div className={`w-10 h-10 rounded-xl ${catMeta.bgClass} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                    <span className={`text-xs font-bold ${catMeta.colorClass}`}>
                      {catMeta.label.slice(0, 2)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {exp.title}
                    </h4>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      {/* Payer */}
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <span className={`w-2 h-2 rounded-full ${payer?.avatarColor || 'bg-slate-400'}`} />
                        <span>{payer ? payer.name : 'ไม่ระบุ'} ออกเงิน</span>
                      </span>

                      <span aria-hidden="true" className="text-slate-300">·</span>

                      {/* Date */}
                      <span className="tabular-nums">{exp.date}</span>

                      <span aria-hidden="true" className="text-slate-300">·</span>

                      {/* Category text */}
                      <span className="text-slate-600">{catMeta.label}</span>
                    </div>

                    {/* Split Details */}
                    <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{getSplitDescription(exp)}</span>
                    </div>

                    {/* Notes if any */}
                    {exp.notes && (
                      <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums font-mono">
                      {formatCurrency(exp.amount, trip.currency)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {exp.splitType === 'equal_all' && `เฉลี่ย ${trip.members.length} คน`}
                      {exp.splitType === 'equal_selected' && `หาร ${exp.participantIds.length} คน`}
                      {exp.splitType === 'exact_amounts' && 'ยอดเจาะจง'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขรายการ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
