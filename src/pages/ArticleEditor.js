import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useArticle, useArticleEditor } from '../hooks/useArticles'
import Layout from '../components/layout/Layout'
import MarkdownEditor from '../components/MarkdownEditor'

const ArticleEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(id)
  
  const { article, loading: articleLoading } = useArticle(isEditing ? id : null)
    const { canCreate, createArticle, updateArticle, saving, loading: permissionsLoading } = useArticleEditor()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  })
  const [errors, setErrors] = useState({})

  // Load article data for editing
    useEffect(() => {
        if (isEditing && article) {
            setFormData({
                title: article.title || '',
                content: article.content || '',
                published: article.published || false
            })
        }
    }, [isEditing, article])

  // Check permissions
    useEffect(() => {
        // Wait until we have a definitive answer on permissions
        if (permissionsLoading) {
            return
        }

        if (!user) {
            navigate('/login')
            return
        }

        // Now this check will only run AFTER permissions have been loaded
        if (!canCreate && !isEditing) {
            console.log("Redirecting: User cannot create articles.");
            navigate('/articles')
            return
        }

        // For editing, check if user can edit this specific article
        if (isEditing && article && user.id !== article.author_id && user.role !== 'admin') {
            navigate('/articles')
            return
        }
    }, [user, canCreate, isEditing, article, navigate, permissionsLoading])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (isEditing) {
        await updateArticle(id, formData)
        navigate(`/articles/${id}`)
      } else {
        const newArticle = await createArticle(formData)
        navigate(`/articles/${newArticle.id}`)
      }
    } catch (error) {
      console.error('Error saving article:', error)
      setErrors({ submit: error.message })
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (articleLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (isEditing && !article) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Articles</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h1>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Article Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a compelling title for your article..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Content *
            </label>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => handleInputChange('content', value)}
              placeholder="Write your article content here using Markdown formatting..."
              height="500px"
            />
            {errors.content && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.content}</span>
              </div>
            )}
          </div>

          {/* Publishing Options */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h3>
            
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleInputChange('published', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-1">
                  {formData.published ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {formData.published ? 'Published' : 'Save as Draft'}
                  </span>
                </div>
              </label>
            </div>
            
            <p className="mt-2 text-sm text-gray-600">
              {formData.published 
                ? 'This article will be visible to all users immediately.'
                : 'Save as draft to continue working on it later. Only you can see drafts.'
              }
            </p>
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/articles"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>
                {saving 
                  ? 'Saving...' 
                  : isEditing 
                    ? 'Update Article' 
                    : formData.published 
                      ? 'Publish Article' 
                      : 'Save Draft'
                }
              </span>
            </button>
          </div>
        </motion.form>
      </div>
    </Layout>
  )
}

export default ArticleEditor
