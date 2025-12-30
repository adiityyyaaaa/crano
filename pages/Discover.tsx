import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Star, Play, Video, ArrowRight, GraduationCap, Info, ChevronDown, Loader2 } from 'lucide-react';
import { SUBJECTS, GRADES } from '../constants';

interface Teacher {
  _id: string; // MongoDB _id
  id?: string; // fallback
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
}

const Discover: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGrade, setSelectedGrade] = useState(searchParams.get('grade') || '');
  const [wantAllSubjects, setWantAllSubjects] = useState(searchParams.get('allSubjects') === 'true');
  const [activeTab, setActiveTab] = useState<'find' | 'teach'>('find');

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new Event('open-auth-modal'));
      }, 50);
    }
  }, [navigate]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedGrade(searchParams.get('grade') || '');
    setWantAllSubjects(searchParams.get('allSubjects') === 'true');
  }, [location.search]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        if (response.ok) {
          const data = await response.json();
          setTeachers(data);
        } else {
          console.error('Failed to fetch teachers');
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = searchQuery.trim() === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesGrade = selectedGrade === '' || (t.grades && t.grades.includes(selectedGrade));
    const matchesAllSubjects = !wantAllSubjects || t.isAllSubjects === true;

    return matchesSearch && matchesGrade && matchesAllSubjects;
  });

  const handleExplore = () => {
    console.log('Exploring with:', { searchQuery, selectedGrade, wantAllSubjects });
  };

  const handleSubjectClick = (subject: string) => {
    setSearchQuery(subject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tab Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-slate-200 inline-flex">
            <button
              onClick={() => setActiveTab('find')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'find'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Find a Teacher
            </button>
            <button
              onClick={() => setActiveTab('teach')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'teach'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Be a Teacher
            </button>
          </div>
        </div>

        {activeTab === 'find' ? (
          <>
            {/* Search Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
              {/* Search Bar with Grade Selector */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a subject, a niche skill, or"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Grade Selector */}
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="appearance-none pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors min-w-[220px]"
                  >
                    <option value="">Select Grade (Optional)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                    <option value="college">College</option>
                  </select>
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>

                {/* Explore Button */}
                <button
                  onClick={handleExplore}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  Explore
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2 mb-6 text-xs text-slate-400 italic">
                <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <span>
                  TIP: TYPE "ALL SUBJECTS" IF YOU ARE LOOKING FOR A GENERALIST SCHOOL TUTOR (GRADES 1-10)
                </span>
              </div>
            </div>

            {/* Subject Pills */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick(subject)}
                  className="px-6 py-3 bg-white text-slate-700 rounded-full font-semibold text-sm border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
              </div>
            )}

            {/* Teacher Cards */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher._id || teacher.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`}
                        alt={teacher.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                      <div className="absolute top-4 left-4 flex space-x-2">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center space-x-1 shadow-lg">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span>{teacher.rating || 0} ({teacher.reviews || 0})</span>
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-2xl transform scale-50 group-hover:scale-100 transition-transform">
                          <Play size={32} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{teacher.name}</h3>
                          <p className="text-blue-600 font-bold">{teacher.subject}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900">₹{teacher.price}</span>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">/ session</p>
                        </div>
                      </div>

                      <p className="text-slate-500 line-clamp-2 text-sm mb-6 flex-1">
                        {teacher.bio}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {teacher.grades && teacher.grades.length > 0 && (
                          <span className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center space-x-1">
                            <GraduationCap size={10} />
                            <span>
                              {teacher.grades.includes('College')
                                ? 'College & University'
                                : `Gr ${Math.min(...teacher.grades.filter(g => !isNaN(Number(g))).map(Number))}-${Math.max(...teacher.grades.filter(g => !isNaN(Number(g))).map(Number))}`}
                            </span>
                          </span>
                        )}
                        {teacher.tags && teacher.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Video size={16} />
                          <span className="text-xs font-bold">Demo Available</span>
                        </div>
                        <Link
                          to={`/teacher/${teacher._id || teacher.id}`}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center space-x-2 group/btn"
                        >
                          <span>View Profile</span>
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredTeachers.length === 0 && (
              <div className="text-center py-32 bg-slate-100/50 rounded-[3rem] border border-dashed border-slate-300">
                <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-slate-400" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No teachers found</h3>
                <p className="text-slate-500">Try adjusting your search query or removing filters.</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to Teach?</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Join our community of educators and start sharing your knowledge with students worldwide.
            </p>
            <button
              onClick={() => navigate('/teach')}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Get Started as a Teacher
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
