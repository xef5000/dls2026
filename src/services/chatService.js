import { supabase } from './supabase'

// Chat service for real-time messaging
export const chatService = {
  // Get messages with pagination (for infinite scroll)
  async getMessages(limit = 25, offset = 0) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          id,
          email,
          first_name,
          last_name,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching messages:', error)
      return { data: [], error }
    }

    // Reverse the array to show oldest first
    return { data: data.reverse(), error: null }
  },

  // Send a new message
  async sendMessage(content, userId) {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          content: content.trim().slice(0, 1000),
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          id,
          email,
          first_name,
          last_name,
          full_name
        )
      `)

    return { data: data?.[0], error }
  },

  // Subscribe to real-time message updates
  subscribeToMessages(callback, onDeleteMessage) {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Fetch the complete message with user profile
          const { data, error } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles:user_id (
                id,
                email,
                first_name,
                last_name,
                full_name
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            callback(data)
          }
        }
      )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'messages'
            },
            (payload) => {
                onDeleteMessage(payload.old.id)
            }
        )
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Realtime channel SUBSCRIBED')
            }

            if (status === 'CHANNEL_ERROR') {
                console.error('❌ Realtime channel error:', err)
            }

            if (status === 'TIMED_OUT') {
                console.warn('⌛ Realtime channel connection timed out')
            }
        })

    return channel
  },

  // Unsubscribe from real-time updates
  unsubscribeFromMessages(channel) {
    if (channel) {
      supabase.removeChannel(channel)
    }
  },

  // Delete a message (only by the sender)
  async deleteMessage(messageId, userId) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId)

    return { error }
  },

  // Get user profile information
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, full_name')
      .eq('id', userId)
      .single()

    return { data, error }
  }
}
