import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function PracticeTest() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    api.post('/practice/start', { examId })
      .then((res) => {
        setQuestions(res.data.questions);
        setAttemptId(res.data.attemptId);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to start practice test');
        navigate('/practice');
      })
      .finally(() => setLoading(false));
  }, [examId]);

  const selectAnswer = (questionId, label) => {
    setAnswers({ ...answers, [questionId]: label });
  };

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`);
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await api.post('/practice/submit', {
        attemptId,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
        timeTaken,
      });
      navigate(`/practice/result/${res.data.attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Practice Test</h1>
        <span className="text-sm text-gray-500">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Question navigator */}
        <div className="hidden md:block w-48 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(i)}
                  className={clsx(
                    'w-8 h-8 rounded text-xs font-medium transition-colors',
                    i === currentIdx && 'bg-indigo-600 text-white',
                    i !== currentIdx && answers[q._id] && 'bg-green-100 text-green-700',
                    i !== currentIdx && !answers[q._id] && 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">{Object.keys(answers).length} of {questions.length} answered</p>
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <p className="text-lg text-gray-900 font-medium mb-6">{currentQ.questionText}</p>
            <div className="space-y-3">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => selectAnswer(currentQ._id, opt.label)}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-lg border-2 transition-colors',
                    answers[currentQ._id] === opt.label
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className={clsx(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full mr-3 text-sm font-medium',
                    answers[currentQ._id] === opt.label
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {opt.label}
                  </span>
                  <span className="text-sm text-gray-800">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentIdx === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                className="flex items-center gap-1 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
