import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Video, FileText, MessageCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { getHelpCategories, listHelpArticles, listHelpFaqs, HelpCategory, HelpArticleListItem, HelpFaq } from '../../services/helpService';
import usePageTitle from '../../hooks/usePageTitle';
export default function HelpCenter() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [categories, setCategories] = useState<HelpCategory[]>([{ id: 'all', label: 'All Topics' }]);
  const [articles, setArticles] = useState<HelpArticleListItem[]>([]);
  const [faqs, setFaqs] = useState<HelpFaq[]>([]);

  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [error, setError] = useState('');

  // Videos placeholders (keep as you requested)
  const videoTutorials = [
    { id: '1', title: 'Platform Walkthrough (5 min)', thumbnail: '▶️' },
    { id: '2', title: 'Case Creation Demo (8 min)', thumbnail: '📂' },
    { id: '3', title: 'Invoice Maker Brief (6 min)', thumbnail: '💰' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const cats = await getHelpCategories();
        setCategories(cats);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingArticles(true);
        setError('');
        const data = await listHelpArticles({
          category: selectedCategory,
          q: searchTerm.trim(),
        });
        if (!mounted) return;
        setArticles(data);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load help content');
        setArticles([]);
      } finally {
        if (!mounted) return;
        setLoadingArticles(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingFaqs(true);
        const data = await listHelpFaqs();
        if (!mounted) return;
        setFaqs(data);
      } catch {
        if (!mounted) return;
        setFaqs([]);
      } finally {
        if (!mounted) return;
        setLoadingFaqs(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredArticles = useMemo(() => articles, [articles]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Help Center</h1>
        <p className="text-gray-600">Everything you need to use the platform productively</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for tutorials, how-tos, or quick help..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Quick Actions (kept as UI placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Video Tutorials</p>
            <p className="text-xs text-gray-500">Step-by-step visual demos</p>
          </div>
        </button>

        <button className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Ask Support</p>
            <p className="text-xs text-gray-500">Talk directly to our team</p>
          </div>
        </button>

        <button className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">User Manual</p>
            <p className="text-xs text-gray-500">Printable full guide (PDF)</p>
          </div>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Topics</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                // keep same icon for now
                const Icon = BookOpen;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full flex items-center px-3 py-2 rounded text-sm transition
                      ${selectedCategory === category.id
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'}
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Help Articles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Articles</h2>

            {loadingArticles ? (
              <div className="text-gray-500">Loading articles…</div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-gray-500">No articles found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => {
                  const Icon = article.type === 'Tutorial' ? FileText : BookOpen;
                  return (
                    <button
                      key={article._id}
                      onClick={() => navigate(`/help/articles/${article._id}`)}
                      className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{article.title}</p>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {article.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{article.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videoTutorials.map((video) => (
                <button
                  key={video.id}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3 text-3xl">
                    {video.thumbnail}
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">{video.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>

            {loadingFaqs ? (
              <div className="text-gray-500">Loading FAQs…</div>
            ) : faqs.length === 0 ? (
              <div className="text-gray-500">No FAQs available.</div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <div key={faq._id} className="p-5">
                    <p className="text-sm font-medium text-gray-900 mb-2">{faq.question}</p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact (UI placeholder) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Our Rwandan support team is available to help you Monday to Friday.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Submit a Ticket
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Knowledge Base
              </button>
            </div>
            <hr className="my-3" />
            <div className="text-sm text-gray-500 space-y-1">
              <p>Email: support@colinandcolin.com</p>
              <p>Phone: +250 788 300 401</p>
              <p>Office Hours: Monday – Friday, 8:00 AM – 6:00 PM CAT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}