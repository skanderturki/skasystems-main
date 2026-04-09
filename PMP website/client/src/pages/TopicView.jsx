import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function TopicView() {
  const { chapterId, slug } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/topics/${slug}`),
      api.get(`/chapters/${chapterId}`),
    ])
      .then(([topicRes, chapterRes]) => {
        setTopic(topicRes.data.topic);
        setChapter(chapterRes.data.chapter);
      })
      .catch(() => toast.error('Failed to load topic'))
      .finally(() => setLoading(false));
  }, [slug, chapterId]);

  const handleComplete = async () => {
    try {
      await api.post(`/topics/${topic._id}/complete`);
      setTopic({ ...topic, isCompleted: true });
      toast.success('Topic marked as completed!');
    } catch {
      toast.error('Failed to mark as complete');
    }
  };

  const getAdjacentTopics = () => {
    if (!chapter?.topics) return { prev: null, next: null };
    const idx = chapter.topics.findIndex((t) => t.slug === slug);
    return {
      prev: idx > 0 ? chapter.topics[idx - 1] : null,
      next: idx < chapter.topics.length - 1 ? chapter.topics[idx + 1] : null,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Topic not found.</p>
        <Link to="/chapters" className="text-indigo-600 mt-2 inline-block">Back to chapters</Link>
      </div>
    );
  }

  const { prev, next } = getAdjacentTopics();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/chapters" className="hover:text-indigo-600">Chapters</Link>
        <span>/</span>
        <Link to="/chapters" className="hover:text-indigo-600">{chapter?.title}</Link>
        <span>/</span>
        <span className="text-gray-900">{topic.title}</span>
      </div>

      {/* Topic header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
        {topic.estimatedReadTime && (
          <p className="text-sm text-gray-500 mt-2">Estimated reading time: {topic.estimatedReadTime} min</p>
        )}
      </div>

      {/* Learning objectives */}
      {topic.content?.learningObjectives?.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide mb-3">Learning Objectives</h2>
          <ul className="space-y-2">
            {topic.content.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sections */}
      <div className="prose prose-gray max-w-none">
        {topic.content?.sections?.map((section, i) => (
          <div key={i} className="mb-8">
            {section.heading && <h2>{section.heading}</h2>}
            <ReactMarkdown>{section.body}</ReactMarkdown>
            {section.keyPoints?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 not-prose">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">Key Points</h4>
                <ul className="space-y-1">
                  {section.keyPoints.map((point, j) => (
                    <li key={j} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">&#8226;</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key terms */}
      {topic.content?.keyTerms?.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Key Terms</h2>
          <dl className="space-y-3">
            {topic.content.keyTerms.map((kt, i) => (
              <div key={i}>
                <dt className="text-sm font-semibold text-gray-900">{kt.term}</dt>
                <dd className="text-sm text-gray-600 mt-0.5">{kt.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Mark complete button */}
      <div className="flex items-center justify-center my-8">
        {topic.isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Mark as Complete
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-8">
        {prev ? (
          <Link
            to={`/chapters/${chapterId}/topics/${prev.slug}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
          >
            <ChevronLeft className="w-4 h-4" />
            {prev.title}
          </Link>
        ) : <div />}
        {next ? (
          <Link
            to={`/chapters/${chapterId}/topics/${next.slug}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
          >
            {next.title}
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
