import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ClipboardCheck, FileText, Award, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../api/axiosInstance';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/progress/dashboard').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const quickActions = [
    { to: '/chapters', label: 'Continue Learning', icon: BookOpen, color: 'bg-blue-500', description: 'Resume your course material' },
    { to: '/practice', label: 'Practice Test', icon: ClipboardCheck, color: 'bg-green-500', description: 'Take a practice quiz' },
    { to: '/exams', label: 'Take Exam', icon: FileText, color: 'bg-purple-500', description: 'Start a certification exam' },
    { to: '/certificates', label: 'View Certificates', icon: Award, color: 'bg-amber-500', description: 'See your achievements' },
  ];

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">Continue your project management learning journey.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Topics Completed</span>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.topicsCompleted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">of {stats?.totalTopics || 0} topics</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Practice Tests</span>
            <ClipboardCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.practiceTests || 0}</p>
          <p className="text-xs text-gray-500 mt-1">tests taken</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Avg. Score</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.avgScore || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">practice test average</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Certificates</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.certificates || 0}</p>
          <p className="text-xs text-gray-500 mt-1">earned</p>
        </div>
      </div>

      {/* Course Progress */}
      {stats?.courseProgress !== undefined && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-sm font-medium text-indigo-600">{stats.courseProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.courseProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(({ to, label, icon: Icon, color, description }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
              Go <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
