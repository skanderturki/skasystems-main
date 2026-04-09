import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/axiosInstance';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/exams/available'),
      api.get('/exams/history'),
    ])
      .then(([examsRes, historyRes]) => {
        setExams(examsRes.data.exams);
        setHistory(historyRes.data.attempts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        {exams.map((exam) => (
          <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
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
            <Link
              to={`/exams/take/${exam._id}`}
              className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
            >
              Start Exam
            </Link>
          </div>
        ))}
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
    </div>
  );
}
