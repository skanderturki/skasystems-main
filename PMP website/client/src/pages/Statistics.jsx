import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Users,
  UserCheck,
  ClipboardCheck,
  FileText,
  Award,
  TrendingUp,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import api from '../api/axiosInstance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const kpiCards = [
  { key: 'users', label: 'Registered Students', icon: Users, color: 'text-blue-500', suffix: '' },
  { key: 'verifiedUsers', label: 'Verified Accounts', icon: UserCheck, color: 'text-emerald-500', suffix: '' },
  { key: 'practiceAttempts', label: 'Practice Attempts', icon: ClipboardCheck, color: 'text-green-500', suffix: '' },
  { key: 'examAttempts', label: 'Exam Attempts', icon: FileText, color: 'text-purple-500', suffix: '' },
  { key: 'certificates', label: 'Certificates Issued', icon: Award, color: 'text-amber-500', suffix: '' },
  { key: 'passRate', label: 'Exam Pass Rate', icon: TrendingUp, color: 'text-indigo-500', suffix: '%' },
  { key: 'topics', label: 'Topics Available', icon: BookOpen, color: 'text-sky-500', suffix: '' },
  { key: 'questions', label: 'Question Bank', icon: HelpCircle, color: 'text-rose-500', suffix: '' },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

export default function Statistics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/stats/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load statistics'));
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
        <p className="font-medium">Could not load statistics</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-500 text-sm">Loading statistics…</div>
    );
  }

  const registrationsChart = {
    labels: data.registrations.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: 'Registrations',
        data: data.registrations.map((d) => d.count),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const chapterChart = {
    labels: data.practiceByChapter.map((p) => p.label),
    datasets: [
      {
        label: 'Attempts',
        data: data.practiceByChapter.map((p) => p.attempts),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const scoreBucketLabels = data.examScoreBuckets.map((b) => b.range);
  const scoreBucketCounts = data.examScoreBuckets.map((b) => b.count);
  const hasExamData = scoreBucketCounts.some((c) => c > 0);
  const scoreChart = {
    labels: scoreBucketLabels,
    datasets: [
      {
        data: scoreBucketCounts,
        backgroundColor: [
          'rgba(239, 68, 68, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(234, 179, 8, 0.75)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(79, 70, 229, 0.75)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>
        <p className="text-gray-600 mt-1">
          Aggregate usage across all learners — updates in real time.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(({ key, label, icon: Icon, color, suffix }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.totals[key]?.toLocaleString() ?? 0}
              {suffix}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Registrations — last 30 days
          </h2>
          <p className="text-sm text-gray-500 mb-4">New student accounts per day</p>
          <div className="h-64">
            <Line data={registrationsChart} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Exam score distribution
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            How exam attempts land across score bands (pass mark: 80%)
          </p>
          <div className="h-64 flex items-center justify-center">
            {hasExamData ? (
              <Doughnut
                data={scoreChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            ) : (
              <p className="text-sm text-gray-400">No exam attempts yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Practice attempts per exam
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Which chapter practice tests learners are using most
        </p>
        <div className="h-80">
          {data.practiceByChapter.length > 0 ? (
            <Bar data={chapterChart} options={chartOptions} />
          ) : (
            <p className="text-sm text-gray-400">No practice attempts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
