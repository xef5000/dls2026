import { useCallback, useRef } from 'react'

export const useInfiniteScroll = (loadMore, hasMore, loading) => {
  const observer = useRef()
  
  const lastElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadMore])

  return lastElementRef
}

export const useScrollToTop = (containerRef, loadMore, hasMore, loading) => {
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || loading || !hasMore) return

    // Check if user scrolled to top (with small threshold)
    if (container.scrollTop <= 10) {
      const oldScrollHeight = container.scrollHeight
      const oldScrollTop = container.scrollTop
      
      loadMore().then(() => {
        // Maintain scroll position after loading more content
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight
          const heightDifference = newScrollHeight - oldScrollHeight
          container.scrollTop = oldScrollTop + heightDifference
        })
      })
    }
  }, [containerRef, loadMore, hasMore, loading])

  return handleScroll
}
