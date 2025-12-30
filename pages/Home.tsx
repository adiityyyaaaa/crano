
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Play, CheckCircle, ArrowRight, Shield, Youtube, Globe, Zap, Sparkles, Heart, Users, Target, BookOpen, Coffee, GraduationCap, Video, MessageSquare, Rocket, Info, ChevronDown } from 'lucide-react';
import { SUBJECTS, GRADES } from '../constants';

interface HomeProps {
  onOpenAuth?: () => void;
}

// Expanded list including niche skills to fit the vision
const ALL_SUGGESTIONS = [
  ...SUBJECTS,
  'Guitar', 'Vedic Maths', 'Public Speaking', 'Creative Writing',
  'Digital Marketing', 'Chess', 'Python Programming', 'Yoga', 'Financial Literacy'
];

const Home: React.FC<HomeProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = ALL_SUGGESTIONS.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  ).slice(0, 5);

  // Add "All Subjects" suggestion logic
  if (
    searchQuery.trim().length > 0 &&
    ['all', 'sub', 'one', 'teach', 'school', 'grade', 'class', 'std'].some(keyword =>
      searchQuery.toLowerCase().includes(keyword)
    ) &&
    !filteredSuggestions.includes('All Subjects')
  ) {
    filteredSuggestions.unshift('All Subjects');
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    // Check if user is "logged in"
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      onOpenAuth?.();
      return;
    }

    proceedToDiscover();
  };

  const proceedToDiscover = (queryOverride?: string) => {
    const params = new URLSearchParams();
    const q = queryOverride !== undefined ? queryOverride : searchQuery;
    if (q.trim()) params.append('q', q.trim());
    if (selectedGrade) params.append('grade', selectedGrade);

    // Auto-detect "All Subjects" intent if selected from suggestion or typed exactly
    if (q.toLowerCase() === 'all subjects') {
      params.append('allSubjects', 'true');
    }

    navigate(`/discover?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      onOpenAuth?.();
      return;
    }

    proceedToDiscover(suggestion);
  };

  const visionCards = [
    {
      icon: Heart,
      title: "The Human Connection",
      desc: "Every mind is unique. While massive halls focus on the average, we celebrate the individual. 1-on-1 care isn't just a luxury—it's how young minds find their spark.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Globe,
      title: "A World of Teachers",
      desc: "Geography should never limit a child's potential. We open a window to specialized teachers across the globe, bringing the perfect match directly to your home.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Shared Journeys",
      desc: "Learning is better together. Our small-group sessions (max 4) offer the warmth of community and the focus of personal attention, making elite guidance accessible.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Target,
      title: "Peace of Mind for Parents",
      desc: "We understand the struggle of finding a teacher who truly 'gets' it. Crano is the result of that search—a platform built on trust, transparency, and genuine care.",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className="relative pt-20">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8">
          <Sparkles size={16} />
          <span>A more personal way to learn</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-tight mb-8 max-w-5xl mx-auto">
          Cram Less.{' '}
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
            Understand more.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-16 max-w-3xl mx-auto leading-relaxed">
          True understanding begins with a personal connection. We bring the world's most dedicated 1-on-1 teachers to your screen.
        </p>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-slate-200 inline-flex">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'student'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Find a Teacher
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'teacher'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Be a Teacher
            </button>
          </div>
        </div>

        {activeTab === 'student' ? (
          <div className="max-w-4xl mx-auto" ref={suggestionRef}>
            {/* Search Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
              <form onSubmit={handleSearchSubmit}>
                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for a subject, a niche skill, or anything you want to learn..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {filteredSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionClick(item)}
                          className="w-full text-left px-6 py-3 hover:bg-blue-50 flex items-center space-x-3 group transition-colors"
                        >
                          <Search size={14} className="text-slate-400 group-hover:text-blue-500" />
                          <span className="font-semibold text-slate-700 group-hover:text-blue-600">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tip */}
                <div className="flex items-start gap-2 mb-6 text-xs text-slate-400 italic">
                  <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <span>
                    TIP: TYPE "ALL SUBJECTS" IF YOU ARE LOOKING FOR A GENERALIST SCHOOL TUTOR (GRADES 1-10)
                  </span>
                </div>

                {/* Grade Selector */}
                <div className="relative mb-6">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="appearance-none w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <option value="">Select Grade (Optional)</option>
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {isNaN(Number(grade)) ? grade : `Grade ${grade}`}
                      </option>
                    ))}
                  </select>
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>

                {/* Explore Button */}
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-6"
                >
                  Explore
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            {/* Subject Pills */}
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSuggestionClick(subject)}
                    className="px-6 py-3 bg-white text-slate-700 rounded-full font-semibold text-sm border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap shrink-0"
                  >
                    {subject}
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
              <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none"></div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
            <h3 className="text-3xl font-black mb-4 text-slate-900">Anyone can teach. 🚀</h3>
            <p className="text-slate-600 mb-8 text-lg">
              If you have a skill, there is someone out there waiting to learn it. Whether it's a core academic or a niche craft, your knowledge can change a life.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">We keep only</div>
                <div className="text-3xl font-black text-blue-600">7%</div>
                <div className="text-sm font-bold text-slate-500">When we find the student</div>
              </div>
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">We keep only</div>
                <div className="text-3xl font-black text-orange-600">3%</div>
                <div className="text-sm font-bold text-slate-500">When you bring them</div>
              </div>
            </div>
            <Link to="/teach" className="block w-full text-center bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all transform hover:scale-[1.02] shadow-xl">
              Start Teaching
            </Link>
          </div>
        )}
      </section>

      {/* How it Works Section */}
      < section id="how-it-works" className="py-24 bg-white scroll-mt-20" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">How Crano works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Finding the perfect teacher shouldn't be a gamble. We've simplified the journey to greatness into three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-slate-100 -z-10"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-blue-200 rotate-3">
                <Video size={36} />
              </div>
              <div className="bg-slate-900 text-white text-xs font-black px-4 py-1 rounded-full mb-4 uppercase tracking-widest">Step 1</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Watch & Discover</h3>
              <p className="text-slate-500">Don't rely on text reviews. Watch real teaching demos to see how a teacher communicates and explains complex topics.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-orange-500 text-white flex items-center justify-center mb-8 shadow-xl shadow-orange-200 -rotate-3">
                <MessageSquare size={36} />
              </div>
              <div className="bg-slate-900 text-white text-xs font-black px-4 py-1 rounded-full mb-4 uppercase tracking-widest">Step 2</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Chat & Connect</h3>
              <p className="text-slate-500">Find someone you click with. Use our integrated chat to ask questions or book a trial session to test the vibe.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-indigo-200 rotate-2">
                <Rocket size={36} />
              </div>
              <div className="bg-slate-900 text-white text-xs font-black px-4 py-1 rounded-full mb-4 uppercase tracking-widest">Step 3</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Master Your Skill</h3>
              <p className="text-slate-500">Enjoy dedicated 1-on-1 personalized attention. No scripts, no average speed—just learning at your own pace.</p>
            </div>
          </div>
        </div>
      </section >

      {/* Vision Cards */}
      < section className="py-24 bg-slate-100/30" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Designed for real learning</h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg leading-relaxed">
              We started Crano because we saw students getting lost in the noise of massive online platforms.
              <span className="block mt-2 font-bold text-slate-900 italic">We are that personal touch students and parents have been waiting for.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visionCards.map((card, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white mb-6 transform group-hover:-rotate-6 transition-transform shadow-lg`}>
                  <card.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">{card.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Features Grid */}
      < section id="features" className="py-32 bg-white relative" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">Why choose Crano?</h2>
            <p className="text-slate-500 text-lg">Meaningful learning through dedicated 1-on-1 care.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'No More Guessing',
                desc: 'Generic scripts don\'t work for everyone. Our teachers adapt their style to match yours.',
                color: 'bg-blue-600'
              },
              {
                icon: Shield,
                title: 'Verified Experts',
                desc: 'Every teacher is strictly vetted for subject mastery and communication skills. Only the best teach here.',
                color: 'bg-orange-500'
              },
              {
                icon: Coffee,
                title: 'Beyond Local Limits',
                desc: 'Don\'t settle for "near you." Learn from the best specialists in the world from your living room.',
                color: 'bg-indigo-600'
              },
              {
                icon: Star,
                title: 'Real Teaching Demos',
                desc: 'Watch real moments of teaching before you commit. We believe in transparency.',
                color: 'bg-yellow-500'
              },
              {
                icon: Youtube,
                title: 'Passion Projects',
                desc: 'Explore your teacher\'s YouTube presence and see their dedication to their craft.',
                color: 'bg-red-500'
              },
              {
                icon: Users,
                title: 'Micro-Groups',
                desc: 'Join up to 3 other students for a shared, cost-effective experience without losing the focus.',
                color: 'bg-green-500'
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 bg-slate-50/50">
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Final CTA */}
      < section className="py-32 px-6" >
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-950 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">Find your spark.</h2>
            <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
              Join a community where every student is seen as an individual and every expert is a teacher.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  if (localStorage.getItem('isLoggedIn') === 'true') {
                    navigate('/discover');
                  } else {
                    onOpenAuth?.();
                  }
                }}
                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
              >
                <span>Find a Teacher</span>
                <ArrowRight size={20} />
              </button>
              <Link to="/teach" className="bg-white/10 backdrop-blur-md border border-white/20 px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                Be a Teacher
              </Link>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
};

export default Home;
