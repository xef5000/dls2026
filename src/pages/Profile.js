import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setUsername(user.user_metadata?.full_name || '')
    }
  }, [user])

  const handleUpdateUsername = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // First, update the auth.users table
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: username },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Next, update the public.profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: username })
      .eq('id', user.id)

    if (profileError) {
      setError(profileError.message)
    } else {
      setMessage('Username updated successfully!')
    }
    setLoading(false)
  }

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const { error } = await supabase.auth.updateUser({ email })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Email update initiated. Please check your new email for a confirmation link.')
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        setLoading(false)
        return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
            {message && <p className="text-green-500 bg-green-100 p-3 rounded mb-4">{message}</p>}

            <form onSubmit={handleUpdateUsername} className="mb-6">
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Username'}
              </Button>
            </form>

            <form onSubmit={handleUpdateEmail} className="mb-6">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Email'}
              </Button>
            </form>

            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min. 6 characters)"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Your Information</h2>
            {user && (
              <div>
                <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                <p className="mb-2"><strong>Username:</strong> {user.user_metadata?.full_name || 'Not set'}</p>
                <p className="text-sm text-gray-500"><strong>User ID:</strong> {user.id}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
