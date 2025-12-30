
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Lock,
  Mail,
  Info,
  Calendar,
  Clock,
  Check,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react';
import { GRADES } from '../constants';

const DAYS_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOURS_OPTIONS = [
  '0-1', '1-2', '2-3', '3-4', '4-5', '5-6',
  '6-7', '7-8', '8-9', '9-10', '10-11', '11-12',
  '12-13', '13-14', '14-15', '15-16', '16-17', '17-18',
  '18-19', '19-20', '20-21', '21-22', '22-23', '23-0'
];

const Teach: React.FC = () => {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    subject2: '',
    subject3: '',
    bio: '',
    videoUrl: '',
    exp: '',
    rate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isSignInMode ? '/api/auth/login' : '/api/auth/register';
    const payload = isSignInMode
      ? { email: formData.email, password: formData.password }
      : {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'teacher',
        subject: formData.subject,
        bio: formData.bio,
        videoUrl: formData.videoUrl,
        experience: formData.exp,
        price: formData.rate,
        grades: selectedGrades,
        days: selectedDays,
        hours: selectedHours
      };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', 'teacher');
      localStorage.setItem('userName', data.user?.name || formData.name);
      localStorage.setItem('userEmail', data.user?.email || formData.email);
      localStorage.setItem('userId', data.user?.id || '');
      setFormSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleHour = (hour: string) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const handleScrollToOnboard = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('onboard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-24 relative overflow-hidden bg-slate-50 min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-orange-400/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[100px]"></div>
      </div>

      <section className="px-6 py-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8">
          <Sparkles size={16} />
          <span>Join the Teaching Revolution</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-8 max-w-4xl mx-auto">
          Your Knowledge is a <br />
          <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
            Global Superpower.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          At Crano, anyone who can teach, can teach. Your passion, your schedule.
        </p>
        <button
          onClick={handleScrollToOnboard}
          className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all transform hover:scale-105 shadow-2xl inline-flex items-center space-x-3"
        >
          <span>Get Started Now</span>
          <ArrowRight size={24} />
        </button>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">
            Fair pricing. No hidden fees.
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 text-center backdrop-blur-sm">
              <div className="text-7xl md:text-8xl font-black text-blue-400 mb-6">7%</div>
              <p className="text-slate-300 text-lg leading-relaxed">
                Platform fee when we match you with a student.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 text-center backdrop-blur-sm">
              <div className="text-7xl md:text-8xl font-black text-orange-400 mb-6">3%</div>
              <p className="text-slate-300 text-lg leading-relaxed">
                Partner fee when you bring your own audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="onboard" className="py-20 scroll-mt-32">
        <div className="max-w-4xl mx-auto px-6">
          {!formSubmitted ? (
            <div className="bg-white p-8 md:p-16 rounded-[3.5rem] shadow-xl border border-slate-100 animate-slide-up">
              <div className="flex justify-center mb-16">
                <div className="bg-slate-50 p-1.5 rounded-2xl flex border border-slate-100 w-full max-w-[320px]">
                  <button
                    onClick={() => { setIsSignInMode(false); setError(null); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isSignInMode ? 'bg-white shadow-md text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Register
                  </button>
                  <button
                    onClick={() => { setIsSignInMode(true); setError(null); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isSignInMode ? 'bg-white shadow-md text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-center space-x-3 text-red-600 font-bold animate-in fade-in slide-in-from-top-4">
                  <AlertCircle size={22} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Basic Info */}
                {!isSignInMode && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. Sameer Verma"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sameer@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 pr-12 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Lock size={12} className="text-slate-400" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300"
                  />
                </div>

                {!isSignInMode && (
                  <>
                    {/* Subject Inputs */}
                    <div className="pt-6 border-t border-slate-100 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Subject / Skill (Required)</label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="e.g. Quantum Physics"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300"
                        />
                        <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">
                          <Info size={14} className="text-orange-500 mt-0.5 shrink-0" />
                          <span className="italic">Enter "All Subjects" if you provide comprehensive tutoring for all core school subjects (Grades 1-10)</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject 2 (Optional)</label>
                          <input
                            type="text"
                            value={formData.subject2}
                            onChange={(e) => setFormData({ ...formData, subject2: e.target.value })}
                            placeholder="e.g. Mental Math"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject 3 (Optional)</label>
                          <input
                            type="text"
                            value={formData.subject3}
                            onChange={(e) => setFormData({ ...formData, subject3: e.target.value })}
                            placeholder="e.g. Coding"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="pt-6 border-t border-slate-100 space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FileText size={12} className="text-slate-400" /> Bio & Qualifications
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell students about your teaching style, achievements, and qualifications. Why should they choose you?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300 resize-none"
                      ></textarea>
                    </div>

                    {/* YouTube Video URL */}
                    <div className="pt-6 border-t border-slate-100 space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">YouTube Intro Video (Optional)</label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-300"
                      />
                      <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">
                        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <span className="italic">Add a YouTube video introducing yourself to help students get to know you better</span>
                      </div>
                    </div>

                    {/* Grades Selection */}
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Grades You Teach (Optional)</label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'All'].map((grade) => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => toggleGrade(grade)}
                            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${selectedGrades.includes(grade)
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                              : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-300'
                              }`}
                          >
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Days Available */}
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Calendar size={12} className="text-slate-400" /> Days Available
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS_OPTIONS.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${selectedDays.includes(day)
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                              : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-300'
                              }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hours Available */}
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" /> Hours Available (24H Format)
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {HOURS_OPTIONS.map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => toggleHour(hour)}
                            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${selectedHours.includes(hour)
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                              : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-300'
                              }`}
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Exp and Rate */}
                    <div className="pt-6 border-t border-slate-100 grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exp (Years)</label>
                        <input
                          type="number"
                          required
                          value={formData.exp}
                          onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                          placeholder="5"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hourly Rate (₹)</label>
                        <input
                          type="number"
                          required
                          value={formData.rate}
                          onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                          placeholder="500"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all flex items-center justify-center space-x-3 shadow-lg active:scale-[0.98] ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{isSignInMode ? 'Sign In' : 'Complete Registration'}</span>
                        <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-[3.5rem] shadow-xl border border-slate-100 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check size={56} strokeWidth={3} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4">{isSignInMode ? 'Welcome Back!' : "You're all set!"}</h3>
              <p className="text-slate-600 mb-10 text-lg">Your teacher profile is ready to shine. Let's go to your command center.</p>
              <button
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all flex items-center justify-center space-x-2"
                onClick={() => navigate('/discover')}
              >
                <span>Go to Teacher Search</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Teach;
