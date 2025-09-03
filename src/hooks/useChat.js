import { useState, useEffect, useCallback, useRef } from 'react'
import { chatService } from '../services/chatService'
import { useAuth } from '../contexts/AuthContext'

export const useChat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const channelRef = useRef(null)
  const offsetRef = useRef(0)

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await chatService.getMessages(25, 0)
      if (error) {
        console.error('Error loading messages:', error)
      } else {
        setMessages(data || [])
        offsetRef.current = data?.length || 0
        setHasMore(data?.length === 25)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const { data, error } = await chatService.getMessages(25, offsetRef.current)
      if (error) {
        console.error('Error loading more messages:', error)
      } else {
        if (data && data.length > 0) {
          setMessages(prev => [...data, ...prev])
          offsetRef.current += data.length
          setHasMore(data.length === 25)
        } else {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore])

  // Send a message
  const sendMessage = useCallback(async (content) => {
    if (!user || !content.trim() || sending) return

    setSending(true)
    try {
      const { data, error } = await chatService.sendMessage(content, user.id)
      if (error) {
        console.error('Error sending message:', error)
        return { success: false, error }
      }
      // Message will be added via real-time subscription
        if (data) {
            setMessages(prev => [...prev, data])
        }

      return { success: true, data }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error }
    } finally {
      setSending(false)
    }
  }, [user, sending])

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    if (!user) return

    try {
      const { error } = await chatService.deleteMessage(messageId, user.id)
      if (error) {
        console.error('Error deleting message:', error)
        return { success: false, error }
      }
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { success: false, error }
    }
  }, [user])

  // Handle new message from real-time subscription
  const handleNewMessage = useCallback((newMessage) => {
    setMessages(prev => {
      // Check if message already exists (avoid duplicates)
      const exists = prev.some(msg => msg.id === newMessage.id)
      if (exists) return prev
      
      // Add new message to the end
      return [...prev, newMessage]
    })
  }, [])

    const handleDeletedMessage = useCallback((deletedMessageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessageId))
    }, [])

  // Subscribe to real-time updates
    useEffect(() => {
        if (!user) return

        // 2. Pass BOTH handlers to the subscription service
        channelRef.current = chatService.subscribeToMessages(
            handleNewMessage,
            handleDeletedMessage
        )

        return () => {
            if (channelRef.current) {
                chatService.unsubscribeFromMessages(channelRef.current)
            }
        }
        // 3. Add the new handler to the dependency array
    }, [user, handleNewMessage, handleDeletedMessage])

  // Load initial messages when component mounts
  useEffect(() => {
    if (user) {
      loadInitialMessages()
    }
  }, [user, loadInitialMessages])

  return {
    messages,
    loading,
    sending,
    hasMore,
    loadingMore,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    refresh: loadInitialMessages
  }
}
