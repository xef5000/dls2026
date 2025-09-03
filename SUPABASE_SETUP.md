# Supabase Setup Guide

This guide will help you set up Supabase for the DLS 2026 application with authentication and live chat functionality.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project

## Database Setup

### 1. Create the profiles table

```sql
-- Create profiles table (if not exists)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create the messages table

```sql
-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 4. Create RLS Policies

```sql
-- Policies for messages
CREATE POLICY "Messages are viewable by authenticated users" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 5. Create indexes for performance

```sql
-- Create indexes for better performance
CREATE INDEX messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX messages_user_id_idx ON messages(user_id);
```

### 6. Create automatic profile creation function

```sql
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Environment Variables

Create a `.env` file in your project root with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Real-time Setup

The real-time functionality for chat is automatically enabled with Supabase. The application will:

1. Subscribe to the `messages` table for real-time updates
2. Automatically receive new messages as they're sent
3. Handle connection management and reconnection

## Authentication Setup

Supabase authentication is configured to:

1. Allow email/password signup and login
2. Support password reset via email
3. Maintain sessions across browser refreshes
4. Automatically create user profiles on signup

## Testing the Setup

1. Start your React application: `npm start`
2. Navigate to the signup page and create an account
3. Verify that a profile is created in the `profiles` table
4. Test the chat functionality by sending messages
5. Open multiple browser windows to test real-time messaging

## Troubleshooting

### Common Issues

1. **RLS Policies**: Make sure all RLS policies are correctly set up
2. **Environment Variables**: Verify your Supabase URL and anon key are correct
3. **Real-time**: Check that real-time is enabled in your Supabase project settings
4. **CORS**: Ensure your domain is added to the allowed origins in Supabase

### Debugging

- Check the browser console for any authentication or database errors
- Use the Supabase dashboard to monitor real-time connections
- Verify that the database tables have the correct structure and policies

## Security Notes

- Never expose your service role key in client-side code
- Use RLS policies to secure your data
- Regularly review and update your security policies
- Consider implementing rate limiting for chat messages
