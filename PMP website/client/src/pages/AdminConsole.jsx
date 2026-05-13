import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Download,
  Shield,
  ShieldOff,
  ExternalLink,
  FileSpreadsheet,
  UserX,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Mail,
  X,
  CheckSquare,
  Square,
  Eye,
  Key,
  RefreshCw,
  Copy,
  FileText,
} from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');
const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : '—');
const fmtDuration = (sec) => {
  if (!sec && sec !== 0) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};
const fullName = (it) => {
  const name = [it.firstName, it.lastName].filter(Boolean).join(' ');
  return name || it.recipientName || '—';
};

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function FilterBar({
  search,
  setSearch,
  from,
  setFrom,
  to,
  setTo,
  examTitle,
  setExamTitle,
  examTitles,
  status,
  setStatus,
  statusOptions,
  onExport,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, certificate number…"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Exam</label>
          <select
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All exams</option>
            {examTitles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onExport}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableTh({ label, col, sortBy, sortDir, onSort }) {
  const active = sortBy === col;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="text-left px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 uppercase text-xs font-medium ${
          active ? 'text-indigo-700' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {label}
        <Icon className="w-3 h-3" />
      </button>
    </th>
  );
}

function Pagination({ page, pageCount, total, onPage }) {
  if (pageCount <= 1) {
    return (
      <div className="text-xs text-gray-500 text-right py-3">
        {total} {total === 1 ? 'record' : 'records'}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-gray-500 text-xs">
        {total} records · page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
        >
          Prev
        </button>
        <button
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function CertificatesTab() {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('issuedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [data, setData] = useState({ items: [], total: 0, pageCount: 0, examTitles: [] });
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const knownTitles = useRef([]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      from: from || undefined,
      to: to || undefined,
      examTitle: examTitle || undefined,
      status: status === 'all' ? undefined : status,
      sortBy,
      sortDir,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, from, to, examTitle, status, sortBy, sortDir, page]
  );

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/certificates', { params })
      .then((res) => {
        setData(res.data);
        if (res.data.examTitles?.length) knownTitles.current = res.data.examTitles;
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, from, to, examTitle, status]);

  const toggleRevoked = async (cert) => {
    const action = cert.isRevoked ? 'reactivate' : 'revoke';
    if (!window.confirm(`Are you sure you want to ${action} ${cert.certificateNumber}?`)) return;
    try {
      await api.patch(`/admin/certificates/${cert._id}/${action}`);
      setData((d) => ({
        ...d,
        items: d.items.map((it) =>
          it._id === cert._id ? { ...it, isRevoked: !it.isRevoked } : it
        ),
      }));
      toast.success(action === 'revoke' ? 'Certificate revoked' : 'Certificate reactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const onExport = () => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    window.open(`/api/admin/certificates.csv?${qs}`, '_blank');
  };

  return (
    <div>
      <FilterBar
        search={search}
        setSearch={setSearch}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        examTitle={examTitle}
        setExamTitle={setExamTitle}
        examTitles={data.examTitles.length ? data.examTitles : knownTitles.current}
        status={status}
        setStatus={setStatus}
        statusOptions={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'revoked', label: 'Revoked' },
        ]}
        onExport={onExport}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Recipient</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Exam</th>
                <SortableTh
                  label="Score"
                  col="score"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortableTh
                  label="Issued"
                  col="issuedAt"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortableTh
                  label="Duration"
                  col="timeTaken"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <th className="text-left px-4 py-3 font-medium">Cert #</th>
                <SortableTh
                  label="Status"
                  col="isRevoked"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    No certificates match the current filter.
                  </td>
                </tr>
              ) : (
                data.items.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{fullName(cert)}</td>
                    <td className="px-4 py-3 text-gray-600">{cert.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{cert.examTitle}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{cert.score}%</td>
                    <td className="px-4 py-3 text-gray-700">{fmtDate(cert.issuedAt)}</td>
                    <td
                      className={`px-4 py-3 ${
                        cert.timeTaken != null && cert.timeTaken < 1200
                          ? 'text-red-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {fmtDuration(cert.timeTaken)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {cert.certificateNumber}
                    </td>
                    <td className="px-4 py-3">
                      {cert.isRevoked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/verify/${cert.verificationToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-indigo-600 rounded"
                          title="Open public verify URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => toggleRevoked(cert)}
                          className={`p-1.5 rounded ${
                            cert.isRevoked
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={cert.isRevoked ? 'Reactivate' : 'Revoke'}
                        >
                          {cert.isRevoked ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <ShieldOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          <Pagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}

function ExamAttemptsTab() {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pageCount: 0, examTitles: [] });
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const knownTitles = useRef([]);

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      from: from || undefined,
      to: to || undefined,
      examTitle: examTitle || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, from, to, examTitle, status, page]
  );

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/exam-attempts', { params })
      .then((res) => {
        setData(res.data);
        if (res.data.examTitles?.length) knownTitles.current = res.data.examTitles;
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, from, to, examTitle, status]);

  const onExport = () => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    window.open(`/api/admin/exam-attempts.csv?${qs}`, '_blank');
  };

  return (
    <div>
      <FilterBar
        search={search}
        setSearch={setSearch}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        examTitle={examTitle}
        setExamTitle={setExamTitle}
        examTitles={data.examTitles.length ? data.examTitles : knownTitles.current}
        status={status}
        setStatus={setStatus}
        statusOptions={[
          { value: 'all', label: 'All' },
          { value: 'passed', label: 'Passed' },
          { value: 'failed', label: 'Failed' },
        ]}
        onExport={onExport}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Student</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Exam</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Result</th>
                <th className="text-left px-4 py-3 font-medium">Started</th>
                <th className="text-left px-4 py-3 font-medium">Completed</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    No attempts match the current filter.
                  </td>
                </tr>
              ) : (
                data.items.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{fullName(a)}</td>
                    <td className="px-4 py-3 text-gray-600">{a.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{a.examTitle}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {a.score}%
                      <span className="text-gray-400 text-xs ml-1">
                        ({a.correctCount}/{a.totalQuestions})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {a.passed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Failed
                          </span>
                        )}
                        {a.cheatingFlagged && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            title="Auto-flagged: too many proctoring violations during the exam"
                          >
                            Cheating
                          </span>
                        )}
                        {a.fastFinishFlagged && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                            title="Auto-flagged for admin review: completed in under 20 minutes"
                          >
                            Fast-finish
                          </span>
                        )}
                        {a.mode === 'instructor-led' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                            title="Taken under instructor supervision (20-minute rule and cooldown were skipped)"
                          >
                            Instructor-led
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{fmtDateTime(a.startedAt)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {fmtDateTime(a.completedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{fmtDuration(a.timeTaken)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          <Pagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}

function BulkEmailModal({ open, onClose, selectedCount, previewUser, onSend }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!open) return null;

  const renderedPreviewBody = (body || '')
    .replace(/\{\{\s*firstName\s*\}\}/g, previewUser?.firstName || '[firstName]')
    .replace(/\{\{\s*lastName\s*\}\}/g, previewUser?.lastName || '[lastName]');

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    if (!window.confirm(`Send this email to ${selectedCount} student${selectedCount === 1 ? '' : 's'}?`)) {
      return;
    }
    setSending(true);
    try {
      await onSend({ subject: subject.trim(), body });
      setSubject('');
      setBody('');
      setShowPreview(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" /> Send bulk email
          </h2>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            Sending to <strong>{selectedCount}</strong> selected student
            {selectedCount === 1 ? '' : 's'}. Each recipient gets their own email.
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A brief subject line"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder={'Hi {{firstName}},\n\nWrite your message here.\n\nBest regards,\nThe PMP Learn team'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              disabled={sending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use <code className="bg-gray-100 px-1 rounded">{'{{firstName}}'}</code> and{' '}
              <code className="bg-gray-100 px-1 rounded">{'{{lastName}}'}</code> for personalization.
              Line breaks are preserved.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            disabled={!body.trim()}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>

          {showPreview && (
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-2">
                Preview as it will appear to{' '}
                <strong>{previewUser?.firstName || '[firstName]'}</strong>:
              </p>
              <div className="bg-white border border-gray-200 rounded p-4 text-sm whitespace-pre-wrap">
                <p className="text-xs text-gray-500 mb-2">Subject: {subject || '(empty)'}</p>
                <hr className="my-2" />
                {renderedPreviewBody}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {sending ? 'Sending…' : `Send to ${selectedCount}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('all');
  const [hasRevoked, setHasRevoked] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [data, setData] = useState({ items: [], total: 0, pageCount: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      role: role || undefined,
      status: status === 'all' ? undefined : status,
      hasRevoked: hasRevoked || undefined,
      from: from || undefined,
      to: to || undefined,
      sortBy,
      sortDir,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, role, status, hasRevoked, from, to, sortBy, sortDir, page]
  );

  // ── Selection helpers ───────────────────────────────────────────────────
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePageSelect = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = data.items.map((u) => u._id);
      const allOnPage = pageIds.length > 0 && pageIds.every((id) => next.has(id));
      if (allOnPage) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const addIdsToSelection = (ids) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  // ── Quick-filter presets ────────────────────────────────────────────────
  const presetBanned = async () => {
    setStatus('banned');
    setRole('');
    setHasRevoked('');
    try {
      const res = await api.get('/admin/user-ids', {
        params: { status: 'banned' },
      });
      addIdsToSelection(res.data.ids || []);
      toast.success(`Selected ${res.data.ids?.length || 0} banned user(s)`);
      if (res.data.capped) toast(`Selection capped at the bulk maximum.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch matching users');
    }
  };

  const presetRevoked = async () => {
    setHasRevoked('true');
    setStatus('all');
    setRole('');
    try {
      const res = await api.get('/admin/user-ids', {
        params: { hasRevoked: 'true' },
      });
      addIdsToSelection(res.data.ids || []);
      toast.success(`Selected ${res.data.ids?.length || 0} user(s) with revoked certs`);
      if (res.data.capped) toast(`Selection capped at the bulk maximum.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch matching users');
    }
  };

  const presetDateRange = async () => {
    if (!from && !to) {
      toast.error('Set a From and/or To date first');
      return;
    }
    try {
      const res = await api.get('/admin/user-ids', {
        params: { from: from || undefined, to: to || undefined },
      });
      addIdsToSelection(res.data.ids || []);
      toast.success(`Selected ${res.data.ids?.length || 0} user(s) in date range`);
      if (res.data.capped) toast(`Selection capped at the bulk maximum.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch matching users');
    }
  };

  const sendBulkEmail = async ({ subject, body }) => {
    try {
      const res = await api.post('/admin/bulk-email', {
        userIds: Array.from(selectedIds),
        subject,
        body,
      });
      const { sent, failed, eligible } = res.data;
      if (failed?.length) {
        toast.error(
          `Sent ${sent} / ${eligible}. ${failed.length} failed. Check logs for details.`,
          { duration: 8000 }
        );
        console.warn('[bulk-email] failed recipients:', failed);
      } else {
        toast.success(`Sent ${sent} email${sent === 1 ? '' : 's'}.`);
      }
      setBulkEmailOpen(false);
      clearSelection();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const previewUser = useMemo(() => {
    // Use the first selected user we can find on the current page for preview.
    return data.items.find((u) => selectedIds.has(u._id)) || null;
  }, [data.items, selectedIds]);

  const reload = () => {
    setLoading(true);
    return api
      .get('/admin/users', { params })
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status, hasRevoked]);

  const toggleBan = async (user) => {
    const action = user.isActive ? 'ban' : 'unban';
    const verb = user.isActive ? 'BAN' : 'UNBAN';
    if (!window.confirm(`${verb} ${user.email}?\n\nThis will ${user.isActive ? 'block their next request and prevent any future login.' : 'restore their access.'}`)) {
      return;
    }
    try {
      const res = await api.patch(`/admin/users/${user._id}/${action}`);
      setData((d) => ({
        ...d,
        items: d.items.map((u) =>
          u._id === user._id ? { ...u, isActive: res.data.user.isActive } : u
        ),
      }));
      toast.success(action === 'ban' ? 'User banned' : 'User unbanned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const onExport = () => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    window.open(`/api/admin/users.csv?${qs}`, '_blank');
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Has revoked cert</label>
            <select
              value={hasRevoked}
              onChange={(e) => setHasRevoked(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Registered from</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Registered to</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={onExport}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Quick select:</span>
          <button
            onClick={presetBanned}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100"
          >
            All banned
          </button>
          <button
            onClick={presetRevoked}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100"
          >
            All with revoked cert
          </button>
          <button
            onClick={presetDateRange}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            All in date range
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
          <span className="text-sm text-indigo-900">
            <strong>{selectedIds.size}</strong> selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-xs text-gray-700 hover:bg-white rounded"
            >
              Clear
            </button>
            <button
              onClick={() => setBulkEmailOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Mail className="w-4 h-4" /> Email {selectedIds.size} selected
            </button>
          </div>
        </div>
      )}

      <BulkEmailModal
        open={bulkEmailOpen}
        onClose={() => setBulkEmailOpen(false)}
        selectedCount={selectedIds.size}
        previewUser={previewUser}
        onSend={sendBulkEmail}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button
                    type="button"
                    onClick={togglePageSelect}
                    className="text-gray-500 hover:text-indigo-600"
                    title="Select/deselect current page"
                  >
                    {data.items.length > 0 &&
                    data.items.every((u) => selectedIds.has(u._id)) ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <SortableTh
                  label="Status"
                  col="isActive"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <th className="text-left px-4 py-3 font-medium">Verified</th>
                <th className="text-left px-4 py-3 font-medium">Certs</th>
                <SortableTh
                  label="Revoked"
                  col="revokedCertificateCount"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortableTh
                  label="Last Attempt"
                  col="lastAttemptDuration"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <th className="text-left px-4 py-3 font-medium">Last Login</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && data.items.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                    No users match the current filter.
                  </td>
                </tr>
              ) : (
                data.items.map((u) => (
                  <tr
                    key={u._id}
                    className={
                      'hover:bg-gray-50' +
                      (selectedIds.has(u._id) ? ' bg-indigo-50/40' : '')
                    }
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(u._id)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        {selectedIds.has(u._id) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          Admin
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Student</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Banned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {u.isVerified ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{u.certificateCount || 0}</td>
                    <td className="px-4 py-3">
                      {u.revokedCertificateCount > 0 ? (
                        <span className="text-red-600 font-medium">
                          {u.revokedCertificateCount}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.lastAttemptDuration != null ? (
                        <div className="flex flex-col">
                          <span
                            className={
                              u.lastAttemptDuration < 1200
                                ? 'text-red-600 font-medium'
                                : 'text-gray-700'
                            }
                          >
                            {fmtDuration(u.lastAttemptDuration)}
                          </span>
                          {u.lastAttemptAt && (
                            <span className="text-xs text-gray-400">
                              {fmtDate(u.lastAttemptAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {fmtDateTime(u.lastLogin)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <button
                          onClick={() => toggleBan(u)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            u.isActive
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={u.isActive ? 'Ban user' : 'Unban user'}
                        >
                          {u.isActive ? (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Ban
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Unban
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          <Pagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}

function ExamsTab() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState({}); // examId -> bool

  const reload = () =>
    api
      .get('/admin/exams')
      .then((res) => setExams(res.data.exams))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  const regenerate = async (exam) => {
    if (!window.confirm(`Generate a new password for "${exam.title}"? Any password you previously shared will stop working.`)) {
      return;
    }
    try {
      const res = await api.post(`/admin/exams/${exam._id}/regenerate-password`);
      setExams((list) =>
        list.map((e) => (e._id === exam._id ? { ...e, password: res.data.exam.password } : e))
      );
      setReveal((r) => ({ ...r, [exam._id]: true }));
      toast.success('New password generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not regenerate password');
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const formal = exams.filter((e) => e.examType === 'formal');
  const practice = exams.filter((e) => e.examType === 'practice');

  if (loading) {
    return <div className="text-sm text-gray-500">Loading exams…</div>;
  }

  return (
    <div className="space-y-8">
      {formal.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Formal certification exams
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Each exam can be taken in <strong>standard mode</strong> (full anti-cheat — 20-minute
            minimum, 15-day cooldown, 3-violation proctoring) or in{' '}
            <strong>instructor-led mode</strong> (cooldown and 20-minute rule skipped; password
            required). Set or rotate the password below, then share or type it on the student's
            machine.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {formal.map((e) => (
              <div key={e._id} className="p-4 flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0 min-w-[200px]">
                  <p className="font-medium text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-500">
                    {e.questionCount} questions · Pass {e.passingScore}% ·{' '}
                    {e.timeLimit ? `${e.timeLimit} min` : 'No time limit'}
                    {e.maxAttempts ? ` · Max ${e.maxAttempts} attempts` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {e.password ? (
                    <>
                      <span className="font-mono text-lg font-semibold tracking-widest bg-gray-50 border border-gray-200 rounded px-3 py-1 text-gray-900">
                        {reveal[e._id] ? e.password : '•'.repeat(e.password.length)}
                      </span>
                      <button
                        onClick={() => setReveal((r) => ({ ...r, [e._id]: !r[e._id] }))}
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-50"
                        title={reveal[e._id] ? 'Hide' : 'Reveal'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copy(e.password)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-50"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      No instructor password — standard mode only
                    </span>
                  )}
                  <button
                    onClick={() => regenerate(e)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> {e.password ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {practice.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Practice tests
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {practice.map((e) => (
              <div key={e._id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-500">
                    {e.questionCount} questions · {e.chapters?.length || 0} chapter(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function AdminConsole() {
  const [tab, setTab] = useState('certificates');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-gray-600 mt-1">
          Search, filter, and manage certificates, exam attempts, users, and exams.
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {[
            { key: 'certificates', label: 'Certificates' },
            { key: 'attempts', label: 'Exam Attempts' },
            { key: 'users', label: 'Users' },
            { key: 'exams', label: 'Exams' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'certificates' && <CertificatesTab />}
      {tab === 'attempts' && <ExamAttemptsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'exams' && <ExamsTab />}
    </div>
  );
}
