# Supabase Articles System Setup

This guide covers the database schema updates needed for the article system with role-based permissions.

## Database Schema Updates

### 1. Update profiles table to include user roles

```sql
-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';

-- Add constraint to ensure valid roles
ALTER TABLE profiles ADD CONSTRAINT valid_roles 
  CHECK (role IN ('user', 'editor', 'admin'));

-- Update existing users to have 'user' role (if needed)
UPDATE profiles SET role = 'user' WHERE role IS NULL;
```

### 2. Create articles table

```sql
-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);
```

### 3. Create article tags table (optional for future expansion)

```sql
-- Create tags table for future use
CREATE TABLE article_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for article-tag relationships
CREATE TABLE article_tag_relations (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

### 4. Enable Row Level Security

```sql
-- Enable RLS on articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tag_relations ENABLE ROW LEVEL SECURITY;
```

### 5. Create RLS Policies for Articles

```sql
-- Policy: Anyone can view published articles
CREATE POLICY "Published articles are viewable by everyone" ON articles
  FOR SELECT USING (published = true);

-- Policy: Authenticated users can view all articles (including unpublished)
CREATE POLICY "All articles viewable by authenticated users" ON articles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only editors and admins can create articles
CREATE POLICY "Editors and admins can create articles" ON articles
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('editor', 'admin')
    )
  );

-- Policy: Authors can update their own articles, admins can update any
CREATE POLICY "Authors can update own articles, admins can update any" ON articles
  FOR UPDATE USING (
    author_id = auth.uid() OR 
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy: Authors can delete their own articles, admins can delete any
CREATE POLICY "Authors can delete own articles, admins can delete any" ON articles
  FOR DELETE USING (
    author_id = auth.uid() OR 
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

### 6. Create indexes for performance

```sql
-- Create indexes for better performance
CREATE INDEX articles_published_created_at_idx ON articles(published, created_at DESC);
CREATE INDEX articles_author_id_idx ON articles(author_id);
CREATE INDEX articles_published_at_idx ON articles(published_at DESC) WHERE published = true;
```

### 7. Create functions for article management

```sql
-- Function to automatically set published_at when article is published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If article is being published for the first time
  IF NEW.published = true AND (OLD.published = false OR OLD.published IS NULL) THEN
    NEW.published_at = NOW();
  END IF;
  
  -- If article is being unpublished
  IF NEW.published = false AND OLD.published = true THEN
    NEW.published_at = NULL;
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for published_at
CREATE TRIGGER set_article_published_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Create trigger for updated_at on insert
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_article_updated_at
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

### 8. Create view for articles with author information

```sql
-- Create view that includes author information
CREATE VIEW articles_with_author AS
SELECT 
  a.*,
  p.full_name as author_name,
  p.email as author_email
FROM articles a
LEFT JOIN profiles p ON a.author_id = p.id;
```

## User Role Management

### Assigning Roles

To assign roles to users, update the profiles table:

```sql
-- Make a user an editor
UPDATE profiles 
SET role = 'editor' 
WHERE email = 'user@example.com';

-- Make a user an admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- View all users and their roles
SELECT email, full_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

### Role Hierarchy

- **user**: Default role, can read published articles
- **editor**: Can create, edit, and publish articles
- **admin**: Can manage all articles and user roles

## Security Notes

1. **RLS Policies**: Ensure all policies are properly configured
2. **Role Validation**: The role column has a constraint to prevent invalid roles
3. **Author Verification**: Only article authors and admins can modify articles
4. **Published State**: Unpublished articles are only visible to authenticated users

## Testing the Setup

1. Create test users with different roles
2. Test article creation with editor role
3. Verify that regular users cannot create articles
4. Test article visibility based on published status
5. Verify that authors can only edit their own articles

## Backup Considerations

Before applying these changes to production:

1. Backup your existing database
2. Test the migration on a staging environment
3. Verify all existing functionality still works
4. Test the new article system thoroughly
