import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Users, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../hooks/useChat'
import Layout from '../components/layout/Layout'

const Message = ({ message, currentUserId, onDelete }) => {
  const isOwn = message.user_id === currentUserId
  const userName = message.profiles?.full_name || message.profiles?.first_name || message.profiles?.email || 'Anonymous'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-xs lg:max-w-md`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${
          isOwn 
            ? 'from-primary-500 to-secondary-500' 
            : 'from-gray-400 to-gray-600'
        } flex items-center justify-center text-white text-xs font-medium`}>
          {initials}
        </div>

        {/* Message bubble */}
        <div className={`relative px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
        } shadow-sm`}>
          {/* User name (only for others' messages) */}
          {!isOwn && (
            <p className="text-xs text-gray-500 mb-1 font-medium">{userName}</p>
          )}
          
          {/* Message content */}
          <p className="text-sm break-words">{message.content}</p>
          
          {/* Timestamp and actions */}
          <div className={`flex items-center justify-between mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            <span className="text-xs">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {isOwn && (
              <button
                onClick={() => onDelete(message.id)}
                className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                title="Delete message"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Message tail */}
          <div className={`absolute top-3 ${
            isOwn 
              ? '-right-1 border-l-8 border-l-primary-500 border-t-4 border-b-4 border-t-transparent border-b-transparent' 
              : '-left-1 border-r-8 border-r-white border-t-4 border-b-4 border-t-transparent border-b-transparent'
          }`} />
        </div>
      </div>
    </motion.div>
  )
}

const LoadingSpinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
)

const Chat = () => {
  const { user } = useAuth()
  const { messages, loading, sending, hasMore, loadingMore, sendMessage, deleteMessage, loadMoreMessages } = useChat()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, shouldScrollToBottom])

  // Handle scroll for infinite loading
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    // Check if user scrolled to top
    if (container.scrollTop === 0 && hasMore && !loadingMore) {
      const oldScrollHeight = container.scrollHeight
      loadMoreMessages().then(() => {
        // Maintain scroll position after loading more messages
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - oldScrollHeight
        }, 100)
      })
    }

    // Check if user is near bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    setShouldScrollToBottom(isNearBottom)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    const result = await sendMessage(newMessage)
    if (result.success) {
      setNewMessage('')
      setShouldScrollToBottom(true)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-t-xl shadow-lg p-4 border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Live Chat</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Connect with other students
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="bg-white/60 backdrop-blur-sm border-x border-white/20 p-4 h-96 overflow-y-auto"
        >
          {/* Load more indicator */}
          {loadingMore && <LoadingSpinner />}
          
          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                currentUserId={user?.id}
                onDelete={handleDeleteMessage}
              />
            ))}
          </AnimatePresence>
          
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSendMessage}
          className="bg-white/80 backdrop-blur-sm rounded-b-xl shadow-lg p-4 border border-white/20"
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              disabled={sending}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </Layout>
  )
}

export default Chat
