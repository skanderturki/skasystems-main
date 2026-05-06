import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const MAX_VIOLATIONS = 3;
const FORBIDDEN_KEYS = new Set(['t', 'n', 'w', 'p']); // Ctrl/Cmd + these
const VIOLATION_DEBOUNCE_MS = 500;

const VIOLATION_LABELS = {
  'tab-hidden': 'You switched tabs or minimized the window',
  'window-blur': 'You clicked outside the exam window',
  'fullscreen-exit': 'You exited fullscreen mode',
  'blocked-key': 'You pressed a forbidden keyboard shortcut',
};

function PreExamModal({ onAccept, onCancel, timeLimit }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-7 h-7 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Proctored Exam — Read Carefully</h1>
        </div>

        <p className="text-gray-700 mb-4">
          This is a monitored certification exam. Please prepare your environment <em>before</em>{' '}
          starting:
        </p>

        <ul className="space-y-2 mb-6 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-bold text-purple-700">1.</span>
            <span>
              <strong>Silence your phone</strong> and turn off notifications. An incoming call or
              message that steals focus will be counted as a violation.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-purple-700">2.</span>
            <span>
              <strong>Close all other browser tabs and applications.</strong> Switching to another
              tab, app, or window during the exam will be detected and counted.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-purple-700">3.</span>
            <span>
              The exam will run in <strong>fullscreen</strong>. Do not press <kbd>Esc</kbd> — exiting
              fullscreen will be counted as a violation.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-purple-700">4.</span>
            <span>
              Right-click, copy, paste, and shortcuts like Ctrl+T are blocked. Don&apos;t try to
              bypass them — attempts are logged.
            </span>
          </li>
          {timeLimit && (
            <li className="flex gap-2">
              <span className="font-bold text-purple-700">5.</span>
              <span>
                You have <strong>{timeLimit} minutes</strong>. Read each question carefully — there
                is no benefit to rushing.
              </span>
            </li>
          )}
        </ul>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <strong className="text-red-800">Consequences</strong>
          </div>
          <p className="text-sm text-red-800">
            After <strong>{MAX_VIOLATIONS} violations</strong>, the exam will be auto-submitted, your
            account will be <strong>suspended</strong>, and any certificates you currently hold will
            be <strong>revoked</strong>.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 text-sm"
          >
            I understand — start the exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamTake() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [violations, setViolations] = useState([]);
  const lastViolationAtRef = useRef(0);
  const containerRef = useRef(null);

  // Refs that the static event handlers can read mutably.
  const violationsRef = useRef([]);
  const startedRef = useRef(false);
  const submittingRef = useRef(false);
  const answersRef = useRef({});
  const attemptIdRef = useRef(null);

  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);
  useEffect(() => {
    startedRef.current = started;
  }, [started]);
  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  // ── Load attempt ────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .post('/exams/start', { examId })
      .then((res) => {
        setQuestions(res.data.questions);
        setAttemptId(res.data.attemptId);
        if (res.data.timeLimit) {
          setTimeLimit(res.data.timeLimit);
          setTimeLeft(res.data.timeLimit * 60);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to start exam');
        navigate('/exams');
      })
      .finally(() => setLoading(false));
  }, [examId]);

  // ── Submit (handles both manual and auto-submit) ─────────────────────────
  const doSubmit = useCallback(
    async ({ silent = false, cheating = false } = {}) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);

      try {
        const res = await api.post('/exams/submit', {
          attemptId: attemptIdRef.current,
          answers: Object.entries(answersRef.current).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          })),
          violations: violationsRef.current,
        });
        // Best-effort exit fullscreen before navigating away
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
        navigate(`/exams/result/${res.data.attemptId}`);
      } catch (err) {
        if (err.response?.status === 403 && err.response?.data?.banned) {
          toast.error(err.response.data.message, { duration: 10000 });
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
          setTimeout(() => {
            window.location.href = '/login';
          }, 4000);
          return;
        }
        if (!silent) toast.error(err.response?.data?.message || 'Failed to submit exam');
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [navigate]
  );

  // ── Violation tracking ───────────────────────────────────────────────────
  const recordViolation = useCallback(
    (type) => {
      if (!startedRef.current || submittingRef.current) return;
      const now = Date.now();
      // Debounce — visibility, blur and fullscreen-exit often fire together.
      if (now - lastViolationAtRef.current < VIOLATION_DEBOUNCE_MS) return;
      lastViolationAtRef.current = now;

      const newList = [...violationsRef.current, { type, at: new Date().toISOString() }];
      violationsRef.current = newList;
      setViolations(newList);

      const remaining = Math.max(0, MAX_VIOLATIONS - newList.length);
      const label = VIOLATION_LABELS[type] || 'Proctoring violation';
      if (newList.length >= MAX_VIOLATIONS) {
        toast.error(`${label}. Auto-submitting…`, { duration: 6000 });
        doSubmit({ silent: false, cheating: true });
      } else {
        toast.error(`${label}. ${remaining} warning${remaining === 1 ? '' : 's'} remaining.`, {
          duration: 5000,
        });
      }
    },
    [doSubmit]
  );

  // ── Wire all event listeners once started ────────────────────────────────
  useEffect(() => {
    if (!started) return;

    const onVisibility = () => {
      if (document.hidden) recordViolation('tab-hidden');
    };
    const onBlur = () => recordViolation('window-blur');
    const onFsChange = () => {
      if (!document.fullscreenElement) recordViolation('fullscreen-exit');
    };
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && FORBIDDEN_KEYS.has(e.key.toLowerCase())) {
        e.preventDefault();
        recordViolation('blocked-key');
      }
      if (e.key === 'F11') {
        e.preventDefault();
        recordViolation('blocked-key');
      }
    };
    const onContextMenu = (e) => e.preventDefault();
    const onCopyCutPaste = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopyCutPaste);
    document.addEventListener('cut', onCopyCutPaste);
    document.addEventListener('paste', onCopyCutPaste);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopyCutPaste);
      document.removeEventListener('cut', onCopyCutPaste);
      document.removeEventListener('paste', onCopyCutPaste);
    };
  }, [started, recordViolation]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || timeLeft === null) return;
    if (timeLeft <= 0) {
      doSubmit({ silent: true });
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, doSubmit]);

  // ── Begin: enter fullscreen, start ───────────────────────────────────────
  const beginExam = async () => {
    try {
      const target = containerRef.current || document.documentElement;
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch {
      // Browser refused (Safari, permissions). The exam still runs; non-fullscreen
      // counts as a violation as soon as visibility/blur fires anyway.
    }
    setStarted(true);
  };

  const cancelExam = () => {
    navigate('/exams');
  };

  // ── Manual submit ────────────────────────────────────────────────────────
  const handleSubmitClick = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    const msg =
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit anyway?`
        : 'Are you sure you want to submit your exam?';
    if (!window.confirm(msg)) return;
    doSubmit();
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId, label) => {
    setAnswers({ ...answers, [questionId]: label });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!started) {
    return <PreExamModal onAccept={beginExam} onCancel={cancelExam} timeLimit={timeLimit} />;
  }

  const currentQ = questions[currentIdx];

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto select-none">
      {/* Proctoring banner */}
      <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-purple-900">
          <ShieldAlert className="w-4 h-4" />
          <span>Proctored exam in progress — do not switch tabs or exit fullscreen.</span>
        </div>
        <span
          className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            violations.length === 0 && 'bg-emerald-100 text-emerald-700',
            violations.length > 0 && violations.length < MAX_VIOLATIONS && 'bg-amber-100 text-amber-800',
            violations.length >= MAX_VIOLATIONS && 'bg-red-100 text-red-700'
          )}
        >
          Warnings: {violations.length} / {MAX_VIOLATIONS}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Certification Exam</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Question {currentIdx + 1} of {questions.length}
          </span>
          {timeLeft !== null && (
            <div
              className={clsx(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono font-medium',
                timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              )}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
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
                    i === currentIdx && 'bg-purple-600 text-white',
                    i !== currentIdx && answers[q._id] && 'bg-purple-100 text-purple-700',
                    i !== currentIdx &&
                      !answers[q._id] &&
                      'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {Object.keys(answers).length} of {questions.length} answered
              </p>
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
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span
                    className={clsx(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full mr-3 text-sm font-medium',
                      answers[currentQ._id] === opt.label
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
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
                onClick={handleSubmitClick}
                disabled={submitting}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                className="flex items-center gap-1 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
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
