import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, DollarSign, Check } from 'lucide-react';
import { Trip } from '../types';

interface TripEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onSave: (updatedTrip: Trip) => void;
}

export const TripEditModal: React.FC<TripEditModalProps> = ({
  isOpen,
  onClose,
  trip,
  onSave,
}) => {
  const [title, setTitle] = useState(trip.title);
  const [dates, setDates] = useState(trip.dates);
  const [location, setLocation] = useState(trip.location);
  const [currency, setCurrency] = useState(trip.currency);

  useEffect(() => {
    setTitle(trip.title);
    setDates(trip.dates);
    setLocation(trip.location);
    setCurrency(trip.currency);
  }, [trip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...trip,
      title: title.trim(),
      dates: dates.trim(),
      location: location.trim(),
      currency: currency.trim() || '฿',
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลทริป</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อทริป <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="เช่น ทริปเชียงใหม่, ทริปญี่ปุ่น 2026"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ช่วงเวลา (วันที่)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dates}
                  onChange={e => setDates(e.target.value)}
                  placeholder="เช่น 24 - 26 ต.ค. 2026"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานที่
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="เช่น เชียงใหม่, หัวหิน"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สัญลักษณ์สกุลเงิน
            </label>
            <div className="flex items-center gap-2">
              {['฿', '$', '¥', '€', '₩'].map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                    currency === curr
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                placeholder="ระบุเอง"
                className="w-20 px-2.5 py-1.5 text-xs text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              บันทึกข้อมูลทริป
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
