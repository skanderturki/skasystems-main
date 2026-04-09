import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import api from '../api/axiosInstance';

export default function ChapterList() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chapters')
      .then((res) => setChapters(res.data.chapters))
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
        <h1 className="text-2xl font-bold text-gray-900">Course Content</h1>
        <p className="text-gray-600 mt-1">Browse all chapters and topics in the curriculum.</p>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter, idx) => {
          const completedCount = chapter.completedTopics || 0;
          const totalCount = chapter.topicCount || 0;
          const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={chapter._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-indigo-600">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">{chapter.title}</h2>
                    <p className="text-gray-600 text-sm mt-1">{chapter.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {totalCount} topics
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {completedCount} completed
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Topic links */}
                    {chapter.topics && chapter.topics.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {chapter.topics.map((topic, tIdx) => (
                          <Link
                            key={topic._id}
                            to={`/chapters/${chapter._id}/topics/${topic.slug}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              topic.isCompleted
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {topic.isCompleted ? <CheckCircle className="w-4 h-4" /> : tIdx + 1}
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                              {topic.title}
                            </span>
                            {topic.estimatedReadTime && (
                              <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {topic.estimatedReadTime} min
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {chapters.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No chapters available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
