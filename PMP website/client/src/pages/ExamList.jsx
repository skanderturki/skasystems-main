import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertTriangle, Lock, X, GraduationCap } from 'lucide-react';
import api from '../api/axiosInstance';

function StartExamModal({ exam, onCancel, onStart }) {
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState('');

  const handleInstructorMode = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    onStart({ mode: 'instructor-led', password: password.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Start exam</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-1">{exam.title}</p>
        <p className="text-xs text-gray-500 mb-5">
          {exam.questionCount} questions ·{' '}
          {exam.timeLimit ? `${exam.timeLimit} min` : 'No time limit'}
        </p>

        <button
          onClick={() => onStart({ mode: 'standard' })}
          className="w-full text-left bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 mb-3 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span className="font-semibold text-sm">Take exam now</span>
          </div>
          <p className="text-xs text-purple-100">
            Standard online attempt. Cooldown and proctoring rules apply.
          </p>
        </button>

        {exam.hasPassword && !showPasswordField && (
          <button
            onClick={() => setShowPasswordField(true)}
            className="w-full text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg p-4 transition-colors border border-indigo-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4" />
              <span className="font-semibold text-sm">I have an instructor with me</span>
            </div>
            <p className="text-xs text-indigo-700">
              Your instructor will enter or share a password. Cooldown rule is skipped.
            </p>
          </button>
        )}

        {!exam.hasPassword && (
          <p className="text-center text-xs text-gray-400 italic">
            Instructor-led mode is not available for this exam.
          </p>
        )}

        {showPasswordField && (
          <form onSubmit={handleInstructorMode} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <label className="block text-xs font-medium text-indigo-900 mb-2">
              Instructor password
            </label>
            <input
              type="text"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-center font-mono tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              placeholder="••••••••"
              autoComplete="off"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordField(false);
                  setPassword('');
                }}
                className="text-xs text-indigo-700 hover:text-indigo-900"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!password.trim()}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Start instructor-led
              </button>
            </div>
          </form>
        )}
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

  const handleStart = ({ mode, password }) => {
    navigate(`/exams/take/${promptExam._id}`, {
      state: { examMode: mode, examPassword: password },
    });
    setPromptExam(null);
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

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {exams.map((exam) => (
          <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
              <span>{exam.questionCount} questions</span>
              <span>Pass: {exam.passingScore}%</span>
              {exam.timeLimit && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exam.timeLimit} min
                </span>
              )}
              {exam.hasPassword && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  <Lock className="w-3 h-3" /> Instructor mode available
                </span>
              )}
            </div>
            <button
              onClick={() => setPromptExam(exam)}
              className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
            >
              Start Exam
            </button>
          </div>
        ))}
        {exams.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10">No exams available yet.</p>
        )}
      </div>

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
        <StartExamModal
          exam={promptExam}
          onCancel={() => setPromptExam(null)}
          onStart={handleStart}
        />
      )}
    </div>
  );
}
