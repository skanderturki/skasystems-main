import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, XCircle, ArrowLeft, Download } from 'lucide-react';
import api from '../api/axiosInstance';

export default function ExamResult() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/exams/${attemptId}`)
      .then((res) => setAttempt(res.data.attempt))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!attempt) return <p className="text-center py-20 text-gray-500">Attempt not found.</p>;

  return (
    <div className="max-w-lg mx-auto text-center">
      <Link to="/exams" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-10">
        {attempt.passed ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Congratulations!</h1>
            <p className="text-gray-600 mb-4">You passed the exam!</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Not Passed</h1>
            <p className="text-gray-600 mb-4">You need at least 80% to pass.</p>
          </>
        )}

        <div className={`text-5xl font-bold mt-4 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
          {attempt.score}%
        </div>
        <p className="text-gray-600 mt-2">
          {attempt.correctCount} out of {attempt.totalQuestions} correct
        </p>

        {attempt.passed && attempt.certificate && (
          <div className="mt-8">
            <a
              href={`/api/certificates/${attempt.certificate}/download`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </a>
          </div>
        )}

        {!attempt.passed && (
          <div className="mt-8">
            <Link
              to="/practice"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Practice more before retrying
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
