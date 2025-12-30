
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import ChatModal from '../components/ChatModal';
import {
  Star,
  Video,
  Award,
  Clock,
  Youtube,
  Calendar,
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface Teacher {
  _id: string;
  id?: string;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  price: number;
  avatar?: string;
  bio: string;
  videoUrl?: string;
  experience: string;
  youtubeSubscribers?: string;
  isVerified: boolean;
  tags: string[];
  grades?: string[];
  isAllSubjects?: boolean;
  availability?: {
    days: string[];
    hours: { start: string; end: string; };
  };
}

const TeacherProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'schedule'>('about');

  // Booking states
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const [teacherBookings, setTeacherBookings] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // CALENDAR UI HELPER & HOOKS (Moved to top to satisfy Rules of Hooks)
  // ---------------------------------------------------------------------------
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i + 1); // Start from tomorrow
      days.push(d);
    }
    return days;
  };

  const availableDays = getNextDays();

  // Helper to check if a day is available
  const isDayAvailable = (date: Date) => {
    if (!teacher?.availability?.days) return true;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return teacher.availability.days.includes(dayName);
  };

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!teacher || !selectedDate) return;

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/teachers/${teacher._id}/availability?date=${dateStr}`);

        if (response.ok) {
          const data = await response.json();
          setAvailableTimeSlots(data.availableSlots || []);
        } else {
          // Fallback to teacher's hours if endpoint fails
          if (teacher.hours && teacher.hours.length > 0) {
            // Convert hour ranges to time format
            const formattedSlots = teacher.hours.map((hourRange: string) => {
              const [start] = hourRange.split('-').map(h => parseInt(h));
              const hour = start % 12 || 12;
              const period = start < 12 ? 'AM' : 'PM';
              return `${hour.toString().padStart(2, '0')}:00 ${period}`;
            });
            setAvailableTimeSlots(formattedSlots);
          } else {
            setAvailableTimeSlots(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']);
          }
        }
      } catch (error) {
        console.error('Failed to fetch available slots:', error);
        setAvailableTimeSlots(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']);
      }
    };

    fetchAvailableSlots();
  }, [teacher, selectedDate]);

  const handleBookSession = async () => {
    if (!teacher) return;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }

    setIsBooking(true);

    try {
      const studentName = localStorage.getItem('userName') || 'Student';
      const studentEmail = localStorage.getItem('userEmail') || '';

      const bookingDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher._id || teacher.id,
          teacherName: teacher.name,
          studentName: studentName,
          studentEmail: studentEmail,
          subject: teacher.subject,
          date: bookingDate,
          time: selectedTime,
          price: teacher.price
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // Store booking details and open payment modal
      setCurrentBooking({
        bookingId: data.booking._id,
        teacherName: teacher.name,
        subject: teacher.subject,
        date: bookingDate,
        time: selectedTime,
        price: teacher.price
      });
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Booking failed', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setBookingSuccess(true);
  };

  useEffect(() => {
    const fetchTeacherAndBookings = async () => {
      try {
        const [teacherRes, bookingsRes] = await Promise.all([
          fetch(`/api/teachers/${id}`),
          fetch(`/api/bookings/${id}`)
        ]);

        if (!teacherRes.ok) throw new Error('Teacher not found');

        const teacherData = await teacherRes.json();
        setTeacher(teacherData);

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData)) {
            setTeacherBookings(bookingsData);
          } else {
            console.error('API returned non-array for bookings:', bookingsData);
            setTeacherBookings([]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Teacher not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacherAndBookings();
    } else {
      setLoading(false);
      setError('Invalid teacher ID');
    }
  }, [id]);

  // Helper to check if a slot is booked
  const isSlotBooked = (date: Date, time: string) => {
    const formattedDate = date.toISOString().split('T')[0];
    return teacherBookings.some(b => b.date === formattedDate && b.time === time);
  };

  if (loading) {
    return (
      <div className="pt-40 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-3xl font-bold">Teacher not found</h2>
        <Link to="/discover" className="text-blue-600 font-bold mt-4 block">Back to Discover</Link>
      </div>
    );
  }



  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <Link to="/discover" className="inline-flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
        <ArrowLeft size={20} />
        <span>Back to results</span>
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Col: Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`}
                alt={teacher.name}
                className="w-40 h-40 rounded-[2rem] object-cover shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`;
                }}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h1 className="text-4xl font-black text-slate-900">{teacher.name}</h1>
                <div className="flex items-center justify-center md:justify-end space-x-1 text-yellow-500">
                  <Star size={20} fill="currentColor" />
                  <span className="font-black text-xl">{teacher.rating || 0}</span>
                  <span className="text-slate-400 font-bold">({teacher.reviews || 0} reviews)</span>
                </div>
              </div>
              <p className="text-xl font-bold text-blue-600 mb-4">{teacher.subject} Specialist</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600">
                  <Award size={16} />
                  <span>{teacher.experience} Exp</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600">
                  <Clock size={16} />
                  <span>Flexible Hours</span>
                </div>
                {teacher.youtubeSubscribers && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 rounded-xl text-sm font-bold text-red-600">
                    <Youtube size={16} />
                    <span>{teacher.youtubeSubscribers} Subs</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Demo */}
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl aspect-video group cursor-pointer">
            <iframe
              src={teacher.videoUrl}
              title="Teacher Demo"
              className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
              allowFullScreen
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
              <PlayCircle size={80} className="text-white mb-4 animate-pulse" />
              <span className="text-white font-black text-2xl uppercase tracking-widest">Watch My Teaching Demo</span>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex space-x-8 border-b mb-8">
              {['about', 'reviews', 'schedule'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 font-black uppercase tracking-widest text-sm transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400'
                    }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full animate-slide-in"></div>}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="animate-fade-in space-y-6">
                <p className="text-slate-600 text-lg leading-relaxed">{teacher.bio}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2">Teaching Methodology</h4>
                    <p className="text-slate-600 text-sm">Focuses on conceptual clarity through practical examples and mental math tricks.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2">Education</h4>
                    <p className="text-slate-600 text-sm">Masters in {teacher.subject} from leading technological institutes.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                {[1, 2, 3].map(r => (
                  <div key={r} className="p-6 border-b last:border-0 border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                        <div>
                          <div className="font-bold">Student User</div>
                          <div className="text-xs text-slate-400">2 months ago</div>
                        </div>
                      </div>
                      <div className="flex text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"The best {teacher.subject} teacher I've ever had. Truly simplified complex topics!"</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">Select a Date</h3>
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                    {availableDays.map((date, i) => {
                      const isAvailable = isDayAvailable(date);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      return (
                        <button
                          key={i}
                          disabled={!isAvailable}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                            : isAvailable
                              ? 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:shadow-md'
                              : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-2xl font-black">{date.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-black text-slate-900 mb-4">Available Time Slots</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {availableTimeSlots.map((time, i) => {
                        const booked = selectedDate ? isSlotBooked(selectedDate, time) : false;
                        return (
                          <button
                            key={i}
                            disabled={booked}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${selectedTime === time
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : booked
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed decoration-slice'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                              }`}
                          >
                            {time}
                            {booked && <span className="block text-[8px] font-normal uppercase text-red-300">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Booking Card */}
        <div className="lg:col-span-1">
          {!bookingSuccess ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 sticky top-28 space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Standard Rate</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-slate-900">₹{teacher.price}</span>
                  <span className="text-slate-400 font-bold block text-xs uppercase">per 60m session</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center space-x-3 text-blue-700">
                  <Calendar size={20} className="flex-shrink-0" />
                  <span className="text-sm font-bold">Next available: Tomorrow, 10:00 AM</span>
                </div>
              </div>

              <button
                onClick={handleBookSession}
                disabled={isBooking}
                className={`w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-3 ${isBooking ? 'opacity-80 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{selectedTime ? 'Book Session' : 'Select Time Slot'}</span>
                )}
              </button>

              <button
                onClick={() => setShowChatModal(true)}
                className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                Chat with Teacher
              </button>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">You keep 100% control</p>
                <div className="flex items-center justify-center space-x-6 text-slate-300">
                  <Video size={20} />
                  <Youtube size={20} />
                  <Star size={20} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 sticky top-28 text-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Session Confirmed!</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Your class with <span className="text-slate-900 font-bold">{teacher.name}</span> is scheduled for tomorrow at 10:00 AM.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl text-left border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Booking Details</div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Subject</span>
                  <span className="text-slate-900 font-bold">{teacher.subject}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="text-slate-900 font-bold">₹{teacher.price}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={18} />
                </button>
                <button className="w-full text-blue-600 font-black text-sm flex items-center justify-center space-x-2">
                  <MessageSquare size={16} />
                  <span>Message Teacher</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          bookingDetails={currentBooking}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && teacher && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          otherUserId={String(teacher._id || teacher.id)}
          otherUserName={teacher.name}
          otherUserRole="teacher"
        />
      )}
    </div>
  );
};

export default TeacherProfile;
