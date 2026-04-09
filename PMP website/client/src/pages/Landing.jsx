import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, ClipboardCheck, Award, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    description: 'Comprehensive topic summaries covering all project management domains from PMBOK and industry standards.',
  },
  {
    icon: ClipboardCheck,
    title: 'Practice Tests',
    description: 'Test your knowledge with practice quizzes and get detailed feedback on every question.',
  },
  {
    icon: Award,
    title: 'Certification',
    description: 'Pass formal exams and earn verified certificates with QR code authentication.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">PMP Learn</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Master Software<br />Project Management
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Learn project management fundamentals, practice with quizzes, take certification exams,
          and earn verified certificates — all in one platform.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
          >
            Start Learning <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to succeed
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white p-8 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-100">
        &copy; {new Date().getFullYear()} PMP Learn. Software Project Management Learning Platform.
      </footer>
    </div>
  );
}
