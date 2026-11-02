import React from 'react';
import { 
  Receipt, 
  Users, 
  PieChart, 
  Plus, 
  RotateCcw, 
  Gitlab, 
  Github,
  Download,
  Calendar,
  MapPin,
  Share2,
  Edit2,
  Check
} from 'lucide-react';
import { Trip } from '../types';

interface NavbarProps {
  trip: Trip;
  activeTab: 'overview' | 'expenses' | 'members';
  setActiveTab: (tab: 'overview' | 'expenses' | 'members') => void;
  onOpenAddExpense: () => void;
  onResetMock: () => void;
  onOpenGitLabGuide: () => void;
  onExportJson: () => void;
  onOpenEditTrip: () => void;
  onShareTrip: () => void;
  copiedShareLink: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  trip,
  activeTab,
  setActiveTab,
  onOpenAddExpense,
  onResetMock,
  onOpenGitLabGuide,
  onExportJson,
  onOpenEditTrip,
  onShareTrip,
  copiedShareLink,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner & Quick Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand & Trip Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              ฿
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  TripSplit
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md whitespace-nowrap">
                  <Check className="w-3 h-3" />
                  <span>บันทึกแล้ว ({trip.expenses.length} บิล)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <span className="truncate font-semibold text-slate-800">{trip.title}</span>
                <button
                  onClick={onOpenEditTrip}
                  title="คลิกเพื่อแก้ไขชื่อทริป วันที่ หรือสกุลเงิน"
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                {trip.dates && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="hidden md:inline flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400 inline" />
                      {trip.dates}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>สรุป & เคลียร์หนี้</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'expenses'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>รายการค่าใช้จ่าย</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono">
                {trip.expenses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'members'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>เพื่อนในทริป</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono">
                {trip.members.length}
              </span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Share Trip Link Button */}
            <button
              onClick={onShareTrip}
              title="คัดลอกลิงก์ทริปพร้อมข้อมูลส่งให้เพื่อนเปิดได้ทันที"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap ${
                copiedShareLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์แล้ว!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">แชร์ทริปให้เพื่อน</span>
                  <span className="sm:hidden">แชร์</span>
                </>
              )}
            </button>

            {/* GitHub & GitLab Deploy Guide Button */}
            <button
              onClick={onOpenGitLabGuide}
              title="ดูวิธีรันบน GitHub Pages / GitLab Pages"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 text-slate-900" />
              <span>/</span>
              <Gitlab className="w-3.5 h-3.5 text-amber-600" />
              <span>รันบน GitHub / GitLab</span>
            </button>

            {/* Reset Mock Button */}
            <button
              onClick={onResetMock}
              title="รีเซ็ตเป็นข้อมูลตัวอย่าง (Mockup)"
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">โหลด Mockup</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={onExportJson}
              title="ดาวน์โหลดไฟล์สำรองข้อมูล JSON"
              className="hidden sm:flex items-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Primary Add Expense CTA */}
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มค่าใช้จ่าย</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>สรุป & เคลียร์หนี้</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>ค่าใช้จ่าย ({trip.expenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>เพื่อน ({trip.members.length})</span>
          </button>
          <button
            onClick={onOpenGitLabGuide}
            className="px-2 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg whitespace-nowrap"
          >
            <Gitlab className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
