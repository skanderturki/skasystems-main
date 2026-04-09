import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Clock, BarChart3 } from 'lucide-react';
import api from '../api/axiosInstance';

export default function PracticeList() {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/practice/available'),
      api.get('/practice/history'),
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
        <h1 className="text-2xl font-bold text-gray-900">Practice Tests</h1>
        <p className="text-gray-600 mt-1">Test your knowledge and get detailed feedback.</p>
      </div>

      {/* Available tests */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Tests</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {exams.map((exam) => (
          <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardCheck className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
              <span>{exam.questionCount} questions</span>
              {exam.timeLimit && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exam.timeLimit} min
                </span>
              )}
            </div>
            <Link
              to={`/practice/take/${exam._id}`}
              className="block w-full text-center bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              Start Practice
            </Link>
          </div>
        ))}
        {exams.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10">No practice tests available yet.</p>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attempts</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Test</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{attempt.examTitle}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${attempt.score >= 80 ? 'text-green-600' : attempt.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/practice/result/${attempt._id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                        Review
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
