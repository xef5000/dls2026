import { useState, useEffect, useCallback } from 'react'
import { articleService } from '../services/articleService'
import { useAuth } from '../contexts/AuthContext'

export const useArticles = (publishedOnly = true) => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const loadArticles = useCallback(async (reset = false) => {
    setLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset
      const { data, error } = publishedOnly
        ? await articleService.getPublishedArticles(20, currentOffset)
        : await articleService.getAllArticles(20, currentOffset)

      if (error) {
        setError(error.message)
      } else {
        if (reset) {
          setArticles(data)
          setOffset(data.length)
        } else {
          setArticles(prev => [...prev, ...data])
          setOffset(prev => prev + data.length)
        }
        setHasMore(data.length === 20)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [publishedOnly, offset])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadArticles(false)
    }
  }, [loading, hasMore, loadArticles])

  const refresh = useCallback(() => {
    setOffset(0)
    loadArticles(true)
  }, [loadArticles])

  useEffect(() => {
    loadArticles(true)
  }, [publishedOnly, loadArticles])

  return {
    articles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}

export const useArticle = (id) => {
    const [article, setArticle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

  useEffect(() => {
      if (!id) {
          // If there's no ID, we're not fetching anything.
          // So, stop loading and ensure no stale data is present.
          setArticle(null)
          setLoading(false)
          return
      }

    const loadArticle = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await articleService.getArticleById(id)
        if (error) {
          setError(error.message)
        } else {
          setArticle(data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [id])

  return { article, loading, error, setArticle }
}

export const useArticleEditor = () => {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const [canCreate, setCanCreate] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkPermissions = async () => {
            // Don't reset loading state if there's no user
            if (user) {
                try {
                    const { data: role } = await articleService.getUserRole(user.id)
                    setUserRole(role)
                    setCanCreate(["editor", "admin"].includes(role))
                } catch (error) {
                    console.error("Failed to check user permissions:", error)
                    // Set to default non-privileged state on error
                    setUserRole('user')
                    setCanCreate(false)
                } finally {
                    setLoading(false) // --- NEW: Set loading to false after check completes
                }
            } else {
                // If there's no user, we're done "loading" their permissions
                setLoading(false)
            }
        }

        checkPermissions()
    }, [user])

  const createArticle = useCallback(async (articleData) => {
    if (!user || !canCreate) {
      throw new Error('Insufficient permissions to create articles')
    }

    setSaving(true)
    try {
      const { data, error } = await articleService.createArticle({
        ...articleData,
        author_id: user.id
      })

      if (error) throw new Error(error.message)
      return data
    } finally {
      setSaving(false)
    }
  }, [user, canCreate])

  const updateArticle = useCallback(async (id, articleData) => {
    if (!user) {
      throw new Error('Must be logged in to update articles')
    }

    const canEdit = await articleService.canUserEditArticle(user.id, id)
    if (!canEdit) {
      throw new Error('Insufficient permissions to edit this article')
    }

    setSaving(true)
    try {
      const { data, error } = await articleService.updateArticle(id, articleData)
      if (error) throw new Error(error.message)
      return data
    } finally {
      setSaving(false)
    }
  }, [user])

  const deleteArticle = useCallback(async (id) => {
    if (!user) {
      throw new Error('Must be logged in to delete articles')
    }

    const canEdit = await articleService.canUserEditArticle(user.id, id)
    if (!canEdit) {
      throw new Error('Insufficient permissions to delete this article')
    }

    const { error } = await articleService.deleteArticle(id)
    if (error) throw new Error(error.message)
  }, [user])

  const togglePublishStatus = useCallback(async (id, published) => {
    if (!user) {
      throw new Error('Must be logged in to publish articles')
    }

    const canEdit = await articleService.canUserEditArticle(user.id, id)
    if (!canEdit) {
      throw new Error('Insufficient permissions to modify this article')
    }

    const { data, error } = await articleService.togglePublishStatus(id, published)
    if (error) throw new Error(error.message)
    return data
  }, [user])

    return {
        saving,
        userRole,
        canCreate,
        loading, // --- NEW: Return the loading state
        createArticle,
        updateArticle,
        deleteArticle,
        togglePublishStatus
    }
}

export const useArticleSearch = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, publishedOnly = true) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await articleService.searchArticles(query, publishedOnly)
      if (error) {
        setError(error.message)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clearResults
  }
}
