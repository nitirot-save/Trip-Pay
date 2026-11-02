/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Expense, Member } from './types';
import { loadTrip, saveTrip, resetToMockTrip, exportTripToJson } from './utils/storage';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { ExpensesTab } from './components/ExpensesTab';
import { MembersTab } from './components/MembersTab';
import { ExpenseModal } from './components/ExpenseModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { TripEditModal } from './components/TripEditModal';
import { encodeTripToUrl } from './utils/storage';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [trip, setTrip] = useState<Trip>(loadTrip);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members'>('overview');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isGitLabGuideOpen, setIsGitLabGuideOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isTripEditModalOpen, setIsTripEditModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [sharedNotice, setSharedNotice] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('trip=')) {
      return '🎉 โหลดข้อมูลทริปจากลิงก์ที่แชร์มาเรียบร้อยแล้ว! บันทึกลงในเครื่องของคุณแล้ว คุณสามารถเพิ่ม/แก้บิลต่อได้เลย (ข้อมูลไม่หายแม้จะกดรีเฟรช)';
    }
    return null;
  });

  // Save to localStorage whenever trip changes
  useEffect(() => {
    saveTrip(trip);
  }, [trip]);

  // Handle Share Trip Link (encodes trip into URL hash and copies)
  const handleShareTrip = () => {
    const shareUrl = encodeTripToUrl(trip);
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // Handle Save Expense (Add or Edit)
  const handleSaveExpense = (savedExp: Expense) => {
    setTrip(prev => {
      const exists = prev.expenses.some(e => e.id === savedExp.id);
      let updatedExpenses: Expense[];
      if (exists) {
        updatedExpenses = prev.expenses.map(e => (e.id === savedExp.id ? savedExp : e));
      } else {
        updatedExpenses = [savedExp, ...prev.expenses];
      }
      const nextTrip = {
        ...prev,
        expenses: updatedExpenses,
      };
      saveTrip(nextTrip);
      return nextTrip;
    });
    setEditingExpense(null);
  };

  // Handle Delete Expense
  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('คุณต้องการลบรายการค่าใช้จ่ายนี้ใช่หรือไม่?')) {
      setTrip(prev => {
        const nextTrip = {
          ...prev,
          expenses: prev.expenses.filter(e => e.id !== expenseId),
        };
        saveTrip(nextTrip);
        return nextTrip;
      });
    }
  };

  // Handle Add Member
  const handleAddMember = (newMember: Member) => {
    setTrip(prev => {
      const nextTrip = {
        ...prev,
        members: [...prev.members, newMember],
      };
      saveTrip(nextTrip);
      return nextTrip;
    });
  };

  // Handle Update Member
  const handleUpdateMember = (updatedMember: Member) => {
    setTrip(prev => {
      const nextTrip = {
        ...prev,
        members: prev.members.map(m => (m.id === updatedMember.id ? updatedMember : m)),
      };
      saveTrip(nextTrip);
      return nextTrip;
    });
  };

  // Handle Delete Member
  const handleDeleteMember = (memberId: string) => {
    // Check if member has paid any expenses
    const hasPaid = trip.expenses.some(e => e.payerId === memberId);
    if (hasPaid) {
      alert('ไม่สามารถลบเพื่อนคนนี้ได้เนื่องจากมีรายการค่าใช้จ่ายที่คนนี้เป็นผู้จ่ายเงิน กรุณาลบหรือเปลี่ยนผู้จ่ายในบิลก่อน');
      return;
    }

    if (window.confirm('คุณต้องการลบเพื่อนคนนี้ออกจากทริปใช่หรือไม่?')) {
      setTrip(prev => {
        const nextTrip = {
          ...prev,
          members: prev.members.filter(m => m.id !== memberId),
          // Also remove from any participant lists
          expenses: prev.expenses.map(e => ({
            ...e,
            participantIds: e.participantIds.filter(id => id !== memberId),
          })),
        };
        saveTrip(nextTrip);
        return nextTrip;
      });
    }
  };

  // Handle Reset to Mock Data
  const handleConfirmReset = () => {
    const mock = resetToMockTrip();
    setTrip(mock);
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navbar */}
      <Navbar
        trip={trip}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onResetMock={() => setIsResetConfirmOpen(true)}
        onOpenGitLabGuide={() => setIsGitLabGuideOpen(true)}
        onExportJson={() => exportTripToJson(trip)}
        onOpenEditTrip={() => setIsTripEditModalOpen(true)}
        onShareTrip={handleShareTrip}
        copiedShareLink={copiedShareLink}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Shared Trip Notification Banner */}
        {sharedNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span className="font-medium">{sharedNotice}</span>
            </div>
            <button
              onClick={() => setSharedNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
            >
              เข้าใจแล้ว
            </button>
          </div>
        )}
        {activeTab === 'overview' && (
          <OverviewTab
            trip={trip}
            onSelectMember={m => setSelectedMember(m)}
            onNavigateExpenses={() => setActiveTab('expenses')}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            trip={trip}
            onAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={exp => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            trip={trip}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onSelectMember={m => setSelectedMember(m)}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TripSplit</span>
            <span aria-hidden="true">·</span>
            <span>ระบบหารค่าใช้จ่ายทริป & เคลียร์บิลสุทธิ</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGitLabGuideOpen(true)}
              className="text-slate-700 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
            >
              คู่มือ GitHub / GitLab Pages CI/CD
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>บันทึกข้อมูลใน LocalStorage อัตโนมัติ</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        trip={trip}
        editingExpense={editingExpense}
      />

      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        trip={trip}
      />

      <DeployGuideModal
        isOpen={isGitLabGuideOpen}
        onClose={() => setIsGitLabGuideOpen(false)}
      />

      <TripEditModal
        isOpen={isTripEditModalOpen}
        onClose={() => setIsTripEditModalOpen(false)}
        trip={trip}
        onSave={updated => {
          saveTrip(updated);
          setTrip(updated);
        }}
      />

      {/* Reset Mockup Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">รีเซ็ตเป็นข้อมูลตัวอย่าง (Mockup)?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              การรีเซ็ตจะเขียนทับข้อมูลปัจจุบันด้วย "ทริปเชียงใหม่-ม่อนแจ่ม 3 วัน 2 คืน" (เพื่อน 5 คน และ 7 รายการค่าใช้จ่ายตัวอย่าง) ข้อมูลที่เพิ่มไว้จะถูกแทนที่
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                ยืนยันโหลด Mockup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
