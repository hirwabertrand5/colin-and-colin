import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getHelpArticleById, HelpArticle } from '../../services/helpService';

export default function HelpArticleView() {
  const { id } = useParams();
  const [data, setData] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        if (!id) throw new Error('Missing article id');
        const article = await getHelpArticleById(id);
        if (!mounted) return;
        setData(article);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load article');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div>
      <div className="mb-6">
        <Link to="/help" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>
      </div>

      {error && <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Loading…</div>
      ) : !data ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Not found.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-xs text-gray-500 mb-2">
            {data.category} • {data.type}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{data.title}</h1>
          <p className="text-gray-600 mb-6">{data.description}</p>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-4">
              {data.contentMd}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}