import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import api from '../api/axiosInstance';

export default function PracticeResult() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/practice/${attemptId}`)
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
    <div className="max-w-3xl mx-auto">
      <Link to="/practice" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Practice Tests
      </Link>

      {/* Score summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Test Results</h1>
        <div className={`text-5xl font-bold mt-4 ${attempt.score >= 80 ? 'text-green-600' : attempt.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
          {attempt.score}%
        </div>
        <p className="text-gray-600 mt-2">
          {attempt.correctCount} out of {attempt.totalQuestions} correct
        </p>
        {attempt.timeTaken && (
          <p className="text-sm text-gray-500 mt-1">
            Time: {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
          </p>
        )}
      </div>

      {/* Question review */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h2>
      <div className="space-y-4">
        {attempt.questions?.map((q, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              {q.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                  {q.questionText}
                </p>
              </div>
            </div>

            <div className="ml-8 space-y-2">
              {q.options?.map((opt) => {
                const isSelected = opt.label === q.selectedOption;
                const isCorrect = opt.isCorrect;
                return (
                  <div
                    key={opt.label}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isCorrect
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : isSelected
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="font-medium mr-2">{opt.label}.</span>
                    {opt.text}
                    {isCorrect && <span className="ml-2 text-green-600 font-medium">(Correct)</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-red-600 font-medium">(Your answer)</span>}
                  </div>
                );
              })}
            </div>

            {q.explanation && (
              <div className="ml-8 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Explanation:</span> {q.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
