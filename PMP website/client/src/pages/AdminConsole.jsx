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
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Issued</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Cert #</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
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
                    <td className="px-4 py-3 text-gray-700">{fmtDuration(cert.timeTaken)}</td>
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
                      {a.passed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Failed
                        </span>
                      )}
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

function UsersTab() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('all');
  const [hasRevoked, setHasRevoked] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pageCount: 0 });
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      role: role || undefined,
      status: status === 'all' ? undefined : status,
      hasRevoked: hasRevoked || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, role, status, hasRevoked, page]
  );

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Verified</th>
                <th className="text-left px-4 py-3 font-medium">Certs</th>
                <th className="text-left px-4 py-3 font-medium">Revoked</th>
                <th className="text-left px-4 py-3 font-medium">Last Login</th>
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
                    No users match the current filter.
                  </td>
                </tr>
              ) : (
                data.items.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
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

export default function AdminConsole() {
  const [tab, setTab] = useState('certificates');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-gray-600 mt-1">
          Search, filter, and manage certificates, exam attempts, and users.
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {[
            { key: 'certificates', label: 'Certificates' },
            { key: 'attempts', label: 'Exam Attempts' },
            { key: 'users', label: 'Users' },
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
    </div>
  );
}
