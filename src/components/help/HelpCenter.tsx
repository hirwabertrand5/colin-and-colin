import { useState } from 'react';
import { Search, BookOpen, Video, FileText, MessageCircle, ExternalLink, ChevronRight } from 'lucide-react';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: FileText },
    { id: 'cases', label: 'Case Management', icon: FileText },
    { id: 'tasks', label: 'Tasks & Workflows', icon: FileText },
    { id: 'billing', label: 'Billing & Invoices', icon: FileText },
  ];

  const helpArticles = [
    {
      id: '1',
      category: 'getting-started',
      title: 'Introduction to Colin Case Platform',
      description: 'Learn how to navigate your dashboard and user options.',
      icon: BookOpen,
      type: 'Guide',
    },
    {
      id: '2',
      category: 'cases',
      title: 'Creating a New Matter',
      description: 'How to create a new case and assign a supervising partner',
      icon: FileText,
      type: 'Tutorial',
    },
    {
      id: '3',
      category: 'cases',
      title: 'Managing Case Documents',
      description: 'Best practices for uploading pleadings and correspondences',
      icon: FileText,
      type: 'Guide',
    },
    {
      id: '4',
      category: 'tasks',
      title: 'Assigning and Tracking Tasks',
      description: 'Delegate responsibilities to your legal team effectively',
      icon: FileText,
      type: 'Tutorial',
    },
    {
      id: '5',
      category: 'tasks',
      title: 'Approvals, Reviews & Unlocks',
      description: 'Understand how to review, approve or override steps firm-wide',
      icon: FileText,
      type: 'Guide',
    },
    {
      id: '6',
      category: 'billing',
      title: 'Generating Invoices',
      description: 'How to create and share RWF-based invoices with clients',
      icon: FileText,
      type: 'Tutorial',
    },
    {
      id: '7',
      category: 'billing',
      title: 'Tracking Time & Payments',
      description: 'Ensure billable hours are logged and paid on time',
      icon: FileText,
      type: 'Guide',
    },
  ];

  const videoTutorials = [
    { id: '1', title: 'Platform Walkthrough (5 min)', thumbnail: '▶️' },
    { id: '2', title: 'Case Creation Demo (8 min)', thumbnail: '📂' },
    { id: '3', title: 'Invoice Maker Brief (6 min)', thumbnail: '💰' },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the Login page, click "Forgot Password", and follow reset instructions via email.',
    },
    {
      question: 'Can I assign a task to more than one user?',
      answer: 'No, but you can duplicate tasks for each assigned individual (example: pleadings or hearings).',
    },
    {
      question: 'How do I export a file or case report?',
      answer: 'Use the "Export" button in the Reports section, after filtering your report accordingly.',
    },
    {
      question: 'What file types are allowed?',
      answer: 'You can upload PDF, DOC, DOCX, XLSX, JPG, PNG formats.',
    },
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Page Header */}
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

      {/* Quick Actions */}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Topics</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => {
                const Icon = article.icon;
                return (
                  <button
                    key={article.id}
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
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <div key={index} className="p-5">
                  <p className="text-sm font-medium text-gray-900 mb-2">{faq.question}</p>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
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