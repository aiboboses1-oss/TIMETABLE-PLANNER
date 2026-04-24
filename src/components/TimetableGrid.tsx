import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Course } from '../services/api';

interface TimetableGridProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

export default function TimetableGrid({ courses, onEdit, onDelete }: TimetableGridProps) {
  const getTimeFraction = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <div className="min-w-[800px] grid grid-cols-[80px_repeat(5,1fr)] h-full">
          {/* Header */}
          <div className="p-3 bg-emerald-50/50 border-b border-r border-emerald-100 text-[10px] font-bold text-slate-400 uppercase text-center sticky top-0 z-20">
            Time
          </div>
          {DAYS.map((day) => (
            <div 
              key={day} 
              className="p-3 bg-emerald-50/50 border-b border-r border-emerald-100 text-[10px] font-bold text-emerald-800 uppercase text-center sticky top-0 z-20"
            >
              {day}
            </div>
          ))}

          {/* Time scale */}
          <div className="col-start-1 col-span-1 row-start-2 border-r border-emerald-50 divide-y divide-emerald-50">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] flex items-center justify-center text-[10px] font-medium text-slate-400"
              >
                {hour}:00 {hour >= 12 ? 'PM' : 'AM'}
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          {DAYS.map((_day, colIndex) => (
            <div 
              key={colIndex} 
              style={{ gridColumnStart: colIndex + 2 }} 
              className="relative border-r border-emerald-50 divide-y divide-emerald-50"
            >
               {HOURS.map((hour) => (
                <div key={hour} className="h-[60px]" />
              ))}
            </div>
          ))}

          {/* Course Blocks overlay */}
          <div className="contents pointer-events-none">
            {DAYS.map((day, dayIndex) => {
              const dayCourses = courses.filter((c) => c.day === day);
              return (
                <div 
                  key={day} 
                  style={{ gridColumnStart: dayIndex + 2, gridRowStart: 2 }} 
                  className="relative pointer-events-auto h-full"
                >
                  {dayCourses.map((course) => {
                    const start = getTimeFraction(course.startTime);
                    const end = getTimeFraction(course.endTime);
                    const top = (start - 8) * 60;
                    const height = (end - start) * 60;

                    return (
                      <div
                        key={course.id}
                        className="absolute left-1 right-1 rounded-md border-l-4 border-emerald-500 bg-emerald-100 p-2 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden"
                        style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[10px] font-bold text-emerald-900 leading-tight truncate">
                            {course.name}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-0.5 rounded shadow-sm">
                            <button
                              onClick={() => onEdit(course)}
                              className="p-0.5 hover:bg-emerald-200 rounded text-emerald-600 transition-colors"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => onDelete(course.id!)}
                              className="p-0.5 hover:bg-red-100 rounded text-red-500 transition-colors"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[9px] text-emerald-700 font-medium">
                          {course.startTime} - {course.endTime}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
