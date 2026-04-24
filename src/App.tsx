import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Calendar, Clock, BookOpen, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { Course, courseApi, authApi } from './services/api';
import CourseForm from './components/CourseForm';
import TimetableGrid from './components/TimetableGrid';
import { motion, AnimatePresence } from 'motion/react';

interface LocalUser {
  id: string;
  fullName: string;
  ugNumber: string;
}

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    ugNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Fetch courses when user changes
  useEffect(() => {
    if (user) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    try {
      const data = await courseApi.getAllCourses(user.id);
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleAddCourse = async (courseData: Course) => {
    if (editingCourse?.id) {
      await courseApi.updateCourse(editingCourse.id, courseData);
    } else {
      await courseApi.addCourse(courseData);
    }
    setEditingCourse(undefined);
    setIsFormOpen(false);
    fetchCourses();
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.deleteCourse(id);
        fetchCourses();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const { fullName, ugNumber, password, confirmPassword } = formData;

    if (!ugNumber.trim() || !password) {
      setAuthError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (authMode === 'register') {
        if (!fullName.trim()) {
          setAuthError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setAuthError('Passwords do not match');
          setLoading(false);
          return;
        }
        await authApi.register(fullName, ugNumber, password);
        const loginData = await authApi.login(ugNumber, password);
        saveSession(loginData);
      } else {
        const loginData = await authApi.login(ugNumber, password);
        saveSession(loginData);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (data: { token: string; user: LocalUser }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    // Clear form
    setFormData({
      fullName: '',
      ugNumber: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6 border border-emerald-100"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 uppercase tracking-tight">Student Timetable</h1>
            <p className="text-sm text-gray-500">
              {authMode === 'login' ? 'Welcome back! Please login.' : 'Register your account to start planning.'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            {authMode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 ml-1">Full Name</label>
                <input 
                  type="text"
                  placeholder="Nuradden Lawal Liman"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 ml-1">UG Number</label>
              <input 
                type="text"
                placeholder="UG24/COMS/1001"
                value={formData.ugNumber}
                onChange={(e) => setFormData({...formData, ugNumber: e.target.value.toUpperCase()})}
                className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all text-sm font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 ml-1">Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all text-sm"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 ml-1">Confirm Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>
            )}

            {authError && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{authError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {authMode === 'login' ? 'Login' : 'Register Now'}
                </>
              )}
            </button>
          </form>
          
          <div className="pt-2 border-t border-emerald-50 flex flex-col gap-2">
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              {authMode === 'login' ? "Don't have an account? Register here" : "Already have an account? Login here"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="h-16 bg-white border-b border-emerald-100 px-8 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl uppercase">
            {user.ugNumber.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-emerald-900 leading-tight tracking-tight uppercase">Planner</h1>
            <p className="text-[10px] text-emerald-600 font-mono font-bold tracking-tight uppercase">{user.fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6 max-w-[1400px] mx-auto w-full">
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <section className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 mb-4 opacity-60">Control Panel</h2>
            <button
              onClick={() => {
                setEditingCourse(undefined);
                setIsFormOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </section>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 leading-none">{courses.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Scheduled Modules</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <UserIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate font-mono uppercase">{user.ugNumber}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Student ID</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Timetable Grid */}
        <section className="flex-1 min-h-[500px] flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {courses.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden"
              >
                <TimetableGrid 
                  courses={courses} 
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 bg-white rounded-xl border-2 border-dashed border-emerald-100 flex items-center justify-center p-12 text-center"
              >
                <div className="max-w-xs space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <Calendar className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Empty Timetable</h3>
                    <p className="text-xs text-slate-400 mt-1">Start adding your academic sessions to visualize your week.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <CourseForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingCourse(undefined);
        }}
        onSubmit={handleAddCourse}
        initialData={editingCourse}
        userId={user.id}
      />

      <footer className="h-10 px-8 border-t border-emerald-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          <span>{user.fullName}</span>
          <span className="hidden sm:inline">•</span>
          <span className="font-mono">{user.ugNumber}</span>
        </div>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Architecture READY FOR LOCAL EXPORT</p>
      </footer>
    </div>
  );
}
