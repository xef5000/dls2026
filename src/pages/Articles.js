import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Eye, 
  Edit,
  FileText,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useArticles, useArticleEditor, useArticleSearch } from '../hooks/useArticles'
import Layout from '../components/layout/Layout'

const ArticleCard = ({ article, canEdit = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            to={`/articles/${article.id}`}
            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
          >
            {article.title}
          </Link>
          
          {article.excerpt && (
            <p className="text-gray-600 mt-2 line-clamp-3">
              {article.excerpt}
            </p>
          )}
        </div>
        
        {canEdit && (
          <Link
            to={`/articles/${article.id}/edit`}
            className="ml-4 p-2 text-gray-400 hover:text-primary-600 transition-colors"
            title="Edit article"
          >
            <Edit className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{article.author_name || article.author_email}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.published_at || article.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!article.published && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Draft
            </span>
          )}
          
          <Link
            to={`/articles/${article.id}`}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Read</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

const LoadingSpinner = () => (
  <div className="flex justify-center py-8">
    <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
)

const Articles = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDrafts, setShowDrafts] = useState(false)
  
  const { articles, loading, error, hasMore, loadMore } = useArticles(!showDrafts)
  const { canCreate } = useArticleEditor()
  const { results: searchResults, loading: searching, search, clearResults } = useArticleSearch()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      search(searchQuery, !showDrafts)
    } else {
      clearResults()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    clearResults()
  }

  const displayArticles = searchQuery.trim() ? searchResults : articles
  const isSearching = searchQuery.trim() && searching

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Articles</h1>
            <p className="text-xl text-gray-600">
              Discover insights and updates from our community
            </p>
          </div>

          {canCreate && (
            <Link
              to="/articles/new"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>New Article</span>
            </Link>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {user && (
            <div className="mt-4 flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDrafts}
                  onChange={(e) => setShowDrafts(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show unpublished articles</span>
              </label>
            </div>
          )}
        </motion.div>

        {/* Articles List */}
        <div className="space-y-6">
          {(loading || isSearching) && <LoadingSpinner />}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              Error loading articles: {error}
            </div>
          )}

          {!loading && !isSearching && displayArticles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms or clear the search to see all articles.'
                  : 'Be the first to share your insights with the community!'
                }
              </p>
              {canCreate && !searchQuery && (
                <Link
                  to="/articles/new"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Write First Article</span>
                </Link>
              )}
            </motion.div>
          )}

          {displayArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              canEdit={user && (user.id === article.author_id || user.role === 'admin')}
            />
          ))}

          {/* Load More Button */}
          {!searchQuery && hasMore && !loading && (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Clock className="h-5 w-5" />
                <span>Load More Articles</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Articles
