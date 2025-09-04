import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image,
  Eye,
  Edit3,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

const ToolbarButton = ({ icon: Icon, title, onClick, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md transition-colors ${
      active 
        ? 'bg-primary-100 text-primary-700' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <Icon className="h-4 w-4" />
  </button>
)

const MarkdownEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Write your article content here...',
  height = '400px',
  showToolbar = true 
}) => {
  const [activeTab, setActiveTab] = useState('edit')
  const [textareaRef, setTextareaRef] = useState(null)

  const insertText = (before, after = '', placeholder = '') => {
    if (!textareaRef) return

    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length + after.length
      textareaRef.setSelectionRange(newCursorPos, newCursorPos)
      textareaRef.focus()
    }, 0)
  }

  const toolbarActions = [
    {
      icon: Heading1,
      title: 'Heading 1',
      action: () => insertText('# ', '', 'Heading 1')
    },
    {
      icon: Heading2,
      title: 'Heading 2',
      action: () => insertText('## ', '', 'Heading 2')
    },
    {
      icon: Heading3,
      title: 'Heading 3',
      action: () => insertText('### ', '', 'Heading 3')
    },
    { separator: true },
    {
      icon: Bold,
      title: 'Bold',
      action: () => insertText('**', '**', 'bold text')
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => insertText('*', '*', 'italic text')
    },
    {
      icon: Code,
      title: 'Inline Code',
      action: () => insertText('`', '`', 'code')
    },
    { separator: true },
    {
      icon: Link,
      title: 'Link',
      action: () => insertText('[', '](https://example.com)', 'link text')
    },
    {
      icon: Image,
      title: 'Image',
      action: () => insertText('![', '](https://example.com/image.jpg)', 'alt text')
    },
    { separator: true },
    {
      icon: List,
      title: 'Bullet List',
      action: () => insertText('- ', '', 'list item')
    },
    {
      icon: ListOrdered,
      title: 'Numbered List',
      action: () => insertText('1. ', '', 'list item')
    },
    {
      icon: Quote,
      title: 'Quote',
      action: () => insertText('> ', '', 'quote')
    }
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'edit'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      {/* Toolbar */}
      {showToolbar && activeTab === 'edit' && (
        <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
          {toolbarActions.map((action, index) => (
            action.separator ? (
              <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
            ) : (
              <ToolbarButton
                key={index}
                icon={action.icon}
                title={action.title}
                onClick={action.action}
              />
            )
          ))}
        </div>
      )}

      {/* Content Area */}
      <div style={{ height }}>
        {activeTab === 'edit' ? (
          <textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 border-0 resize-none focus:outline-none focus:ring-0 font-mono text-sm"
            style={{ minHeight: height }}
          />
        ) : (
          <div className="h-full overflow-auto">
            <div className="p-4 prose prose-sm max-w-none">
              {value.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    // Custom components for better styling
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-gray-900 mb-3 mt-5 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4 first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-1">
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children }) => (
                      inline ? (
                        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-gray-100 text-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                          {children}
                        </code>
                      )
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
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
                        className="max-w-full h-auto rounded-lg shadow-sm mb-4"
                      />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border border-gray-300">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-300 px-4 py-2">
                        {children}
                      </td>
                    )
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-500 italic">
                  Nothing to preview yet. Start writing in the Edit tab!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor
