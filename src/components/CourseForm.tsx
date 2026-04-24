import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { Course } from '../services/api';

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => Promise<void>;
  initialData?: Course;
  userId: string;
}

export default function CourseForm({ isOpen, onClose, onSubmit, initialData, userId }: CourseFormProps) {
  const [name, setName] = useState('');
  const [day, setDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDay(initialData.day);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    } else {
      setName('');
      setDay('Monday');
      setStartTime('08:00');
      setEndTime('09:00');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        name,
        day,
        startTime,
        endTime,
        userId
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100"
      >
        <div className="bg-white px-6 py-4 border-b border-emerald-50 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">
            {initialData ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs font-semibold uppercase tracking-tight leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">Course Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science 101"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">Day of Week</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-[38px]"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-md hover:bg-emerald-700 active:transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-md shadow-emerald-500/10"
          >
            {loading ? 'Processing...' : initialData ? 'Update Schedule' : 'Save Course'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
