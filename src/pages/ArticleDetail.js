import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Share2,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useArticle, useArticleEditor } from '../hooks/useArticles'
import Layout from '../components/layout/Layout'

const LoadingSpinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
)

const ArticleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { article, loading, error } = useArticle(id)
  const { togglePublishStatus, deleteArticle } = useArticleEditor()
  const [actionLoading, setActionLoading] = useState(false)

  const canEdit = user && article && (user.id === article.author_id || user.role === 'admin')

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleTogglePublish = async () => {
    if (!article) return
    
    setActionLoading(true)
    try {
      await togglePublishStatus(article.id, !article.published)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error toggling publish status:', error)
      alert('Failed to update article status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!article) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this article? This action cannot be undone.'
    )
    
    if (!confirmed) return

    setActionLoading(true)
    try {
      await deleteArticle(article.id)
      navigate('/articles')
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article')
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Article URL copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Articles</span>
          </Link>
        </div>
      </Layout>
    )
  }

  // Check if user can view unpublished article
  const canView = article.published || (user && (user.id === article.author_id || user.role === 'admin'))
  
  if (!canView) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Available</h1>
          <p className="text-gray-600 mb-6">
            This article is not published yet.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Articles</span>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Articles</span>
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{article.author_name || article.author_email}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                </div>

                {article.updated_at !== article.created_at && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {formatDate(article.updated_at)}</span>
                  </div>
                )}
              </div>

              {!article.published && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    <EyeOff className="h-4 w-4 mr-1" />
                    Draft
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Share article"
              >
                <Share2 className="h-5 w-5" />
              </button>

              {canEdit && (
                <>
                  <Link
                    to={`/articles/${article.id}/edit`}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    title="Edit article"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={handleTogglePublish}
                    disabled={actionLoading}
                    className="p-2 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
                    title={article.published ? 'Unpublish article' : 'Publish article'}
                  >
                    {article.published ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete article"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20"
        >
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-5 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2 text-lg">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-6 text-gray-700 space-y-2 text-lg">
                    {children}
                  </ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-300 pl-6 italic text-gray-600 mb-6 text-lg">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => (
                  inline ? (
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-base font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-100 text-gray-800 p-4 rounded text-base font-mono overflow-x-auto">
                      {children}
                    </code>
                  )
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-primary-600 hover:text-primary-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img 
                    src={src} 
                    alt={alt} 
                    className="max-w-full h-auto rounded-lg shadow-lg mb-6"
                  />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-300">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 px-4 py-3 bg-gray-50 font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-4 py-3">
                    {children}
                  </td>
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default ArticleDetail
