import { supabase } from './supabase'

// Article service for managing articles
export const articleService = {
  // Get all published articles (public access)
  async getPublishedArticles(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('articles_with_author')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data: data || [], error }
  },

  // Get all articles (for authenticated users)
  async getAllArticles(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('articles_with_author')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data: data || [], error }
  },

  // Get articles by author
  async getArticlesByAuthor(authorId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('articles_with_author')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data: data || [], error }
  },

  // Get single article by ID
  async getArticleById(id) {
    const { data, error } = await supabase
      .from('articles_with_author')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Create new article
  async createArticle(articleData) {
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt || this.generateExcerpt(articleData.content),
        author_id: articleData.author_id,
        published: articleData.published || false
      }])
      .select(`
        *,
        profiles:author_id (
          id,
          email,
          full_name
        )
      `)

    return { data: data?.[0], error }
  },

  // Update article
  async updateArticle(id, articleData) {
    const updateData = {
      ...articleData,
      updated_at: new Date().toISOString()
    }

    // Generate excerpt if content changed and no excerpt provided
    if (articleData.content && !articleData.excerpt) {
      updateData.excerpt = this.generateExcerpt(articleData.content)
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        profiles:author_id (
          id,
          email,
          full_name
        )
      `)

    return { data: data?.[0], error }
  },

  // Delete article
  async deleteArticle(id) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    return { error }
  },

  // Publish/unpublish article
  async togglePublishStatus(id, published) {
    const { data, error } = await supabase
      .from('articles')
      .update({ 
        published,
        published_at: published ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()

    return { data: data?.[0], error }
  },

  // Search articles
  async searchArticles(query, publishedOnly = true) {
    let queryBuilder = supabase
      .from('articles_with_author')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      queryBuilder = queryBuilder.eq('published', true)
    }

    const { data, error } = await queryBuilder

    return { data: data || [], error }
  },

  // Get user's role and permissions
  async getUserRole(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    return { data: data?.role || 'user', error }
  },

  // Check if user can create articles
  async canUserCreateArticles(userId) {
    const { data: role } = await this.getUserRole(userId)
    return ['editor', 'admin'].includes(role)
  },

  // Check if user can edit article
  async canUserEditArticle(userId, articleId) {
    const { data: role } = await this.getUserRole(userId)
    
    if (role === 'admin') return true
    
    const { data: article } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single()

    return article?.author_id === userId
  },

  // Generate excerpt from content (markdown-aware)
  generateExcerpt(content, maxLength = 200) {
    // Remove markdown formatting for excerpt
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText
  },

  // Get article statistics
  async getArticleStats() {
    const { data: totalArticles } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })

    const { data: publishedArticles } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('published', true)

    const { data: recentArticles } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return {
      total: totalArticles?.length || 0,
      published: publishedArticles?.length || 0,
      recent: recentArticles?.length || 0
    }
  }
}
