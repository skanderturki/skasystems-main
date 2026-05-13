import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertTriangle, Lock, X } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

function PasswordPromptModal({ exam, onCancel, onSubmit }) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(password.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" /> Instructor password
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{exam.title}</strong> requires a password set by your instructor. Ask them to
          provide it or to enter it for you.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-mono tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            autoComplete="off"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Verifying…' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promptExam, setPromptExam] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/exams/available'), api.get('/exams/history')])
      .then(([examsRes, historyRes]) => {
        setExams(examsRes.data.exams);
        setHistory(historyRes.data.attempts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startExam = (exam) => {
    if (exam.examType === 'instructor-led') {
      setPromptExam(exam);
    } else {
      navigate(`/exams/take/${exam._id}`);
    }
  };

  const handlePasswordSubmit = async (password) => {
    // Probe the server with the password — if it's wrong we want a clean
    // error here rather than hitting the exam page first.
    try {
      // The actual /exams/start happens in ExamTake. We forward the password
      // via location.state so it's not in the URL.
      navigate(`/exams/take/${promptExam._id}`, { state: { examPassword: password } });
      setPromptExam(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not verify password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Certification Exams</h1>
        <p className="text-gray-600 mt-1">Pass with 80% or higher to earn your certificate.</p>
      </div>

      {/* Important notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Important:</p>
          <ul className="mt-1 space-y-1">
            <li>You need at least 80% to pass and receive a certificate.</li>
            <li>No per-question feedback is provided after the exam.</li>
            <li>Exams are timed. Make sure you have enough time before starting.</li>
          </ul>
        </div>
      </div>

      {/* Available exams */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {exams.map((exam) => {
          const isInstructorLed = exam.examType === 'instructor-led';
          return (
            <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isInstructorLed ? 'bg-indigo-100' : 'bg-purple-100'
                  }`}
                >
                  <FileText
                    className={`w-5 h-5 ${
                      isInstructorLed ? 'text-indigo-600' : 'text-purple-600'
                    }`}
                  />
                </div>
                {isInstructorLed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    <Lock className="w-3 h-3" /> Instructor-led
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span>{exam.questionCount} questions</span>
                <span>Pass: {exam.passingScore}%</span>
                {exam.timeLimit && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exam.timeLimit} min
                  </span>
                )}
              </div>
              <button
                onClick={() => startExam(exam)}
                className={`block w-full text-center text-white py-2 rounded-lg font-medium transition-colors text-sm ${
                  isInstructorLed
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isInstructorLed ? 'Enter password to start' : 'Start Exam'}
              </button>
            </div>
          );
        })}
        {exams.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10">No exams available yet.</p>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam History</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{attempt.examTitle}</td>
                    <td className="px-6 py-4 text-sm font-medium">{attempt.score}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/exams/result/${attempt._id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {promptExam && (
        <PasswordPromptModal
          exam={promptExam}
          onCancel={() => setPromptExam(null)}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
}
