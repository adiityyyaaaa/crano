
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  Video,
  MessageSquare,
  Bell,
  UserCircle,
  Loader2,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [teacherBookings, setTeacherBookings] = useState<any[]>([]);
  const [teacherStats, setTeacherStats] = useState({
    totalEarnings: 0,
    totalHours: 0,
    activeStudents: 0,
    upcomingClasses: 0,
    rating: 0,
    reviews: 0
  });

  const role = localStorage.getItem('userRole') || 'student';
  const userName = localStorage.getItem('userName') || 'User';

  // Fetch student bookings
  useEffect(() => {
    if (role === 'student') {
      const fetchBookings = async () => {
        try {
          const url = `/api/bookings/student/${encodeURIComponent(userName)}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              setBookings(data);
            } else {
              console.error('Expected array but got:', data);
              setBookings([]);
            }
          } else {
            console.error('Failed to fetch bookings');
            setBookings([]);
          }
        } catch (error) {
          console.error('Error fetching bookings:', error);
          setBookings([]);
        } finally {
          setLoading(false);
        }
      };

      fetchBookings();
    }
  }, [role, userName]);

  // Fetch teacher data
  useEffect(() => {
    if (role === 'teacher') {
      const fetchTeacherData = async () => {
        try {
          const userId = localStorage.getItem('userId');
          if (!userId) {
            setLoading(false);
            return;
          }

          // Fetch all teachers to find current teacher
          const teachersRes = await fetch('/api/teachers');
          if (teachersRes.ok) {
            const teachers = await teachersRes.json();
            const currentTeacher = teachers.find((t: any) => String(t.userId) === userId);

            if (currentTeacher) {
              // Fetch bookings
              const bookingsRes = await fetch(`/api/bookings/${currentTeacher._id}`);
              if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setTeacherBookings(bookingsData);
              }

              // Fetch stats
              const statsRes = await fetch(`/api/teachers/${currentTeacher._id}/stats`);
              if (statsRes.ok) {
                const statsData = await statsRes.json();
                setTeacherStats(statsData);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch teacher data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTeacherData();
    }
  }, [role]);

  // Calculate student stats
  const totalSpent = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const uniqueTeachers = new Set(bookings.map(b => b.teacherId)).size;
  const totalHours = bookings.filter(b => b.status === 'confirmed').length;

  const studentStats = [
    { label: 'Total Spent', value: `₹${totalSpent}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Teachers', value: uniqueTeachers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hours Learned', value: totalHours.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Avg Score', value: '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  const teacherStatsDisplay = [
    { label: 'Total Earnings', value: `₹${teacherStats.totalEarnings}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Students', value: teacherStats.activeStudents.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hours Taught', value: teacherStats.totalHours.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Avg Rating', value: teacherStats.rating.toFixed(1), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // ===========================================================================
  // RENDER: TEACHER VIEW
  // ===========================================================================
  if (role === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome back, {userName}</h1>
              <p className="text-slate-500 font-medium">Manage your classes and connect with your students.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm relative">
                <Bell size={24} />
                <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
              </button>
              <div className="flex items-center space-x-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <UserCircle size={28} />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-black text-slate-900 leading-tight">{userName}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Teacher</div>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {teacherStatsDisplay.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:-rotate-6 transition-transform shadow-inner`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Calendar size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Upcoming Sessions</h2>
              </div>
              <button className="text-blue-600 font-bold text-sm hover:underline">View Calendar</button>
            </div>
            <div className="divide-y divide-slate-50">
              {teacherBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No upcoming sessions</p>
                  <p className="text-sm">Your booked sessions will appear here</p>
                </div>
              ) : (
                teacherBookings.map((booking, i) => (
                  <div key={booking._id || i} className="p-8 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Video size={24} />
                      </div>
                      <div>
                        <div className="font-black text-lg text-slate-900">{booking.studentName}</div>
                        <div className="flex items-center space-x-2 text-slate-400 text-sm font-bold">
                          <span>{booking.subject}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>1-on-1</span>
                        </div>
                        <div className="text-blue-600 text-sm font-black mt-1">{booking.date} • {booking.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm shadow-lg">
                        Start Class
                      </button>
                      <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                        <MessageSquare size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {teacherBookings.length > 0 && (
              <div className="p-6 bg-slate-50/50 text-center border-t border-slate-50">
                <button className="text-blue-600 font-bold text-sm hover:underline">View All Sessions →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: STUDENT VIEW
  // ===========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-3">Your Learning Dashboard</h1>
          <p className="text-slate-500 text-lg font-medium">Track your progress and manage your sessions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {studentStats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:-rotate-6 transition-transform shadow-inner`}>
                <stat.icon size={28} />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Calendar size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Upcoming Classes</h2>
            </div>
            <Link to="/discover" className="text-blue-600 font-bold text-sm hover:underline">
              Book More Classes
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">No upcoming classes</p>
                <Link to="/discover" className="text-blue-600 font-bold text-sm hover:underline">
                  Browse Teachers →
                </Link>
              </div>
            ) : (
              bookings.map((booking, i) => (
                <div key={booking._id || i} className="p-8 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner font-black text-lg">
                      {booking.teacherName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-lg text-slate-900">{booking.teacherName}</div>
                      <div className="text-slate-500 text-sm font-medium">{booking.subject}</div>
                      <div className="text-blue-600 text-sm font-black mt-1">{booking.date} • {booking.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {booking.status}
                    </span>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-lg">
                      Join Class
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
