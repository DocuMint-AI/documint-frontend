'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isTextCursor, setIsTextCursor] = useState(false)
  const [isHeadingHover, setIsHeadingHover] = useState(false)
  const [isLogoHover, setIsLogoHover] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check for text inputs
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[contenteditable="true"]')
      ) {
        setIsTextCursor(true)
        setIsHovering(false)
        setIsHeadingHover(false)
        setIsLogoHover(false)
        return
      }
      
      // Check for logo elements (with data-cursor-logo attribute)
      if (
        target.hasAttribute('data-cursor-logo') ||
        target.closest('[data-cursor-logo]')
      ) {
        setIsLogoHover(true)
        setIsHovering(false)
        setIsHeadingHover(false)
        setIsTextCursor(false)
        return
      }
      
      // Check for headings (h1, h2, h3, h4, h5, h6)
      if (
        target.tagName === 'H1' ||
        target.tagName === 'H2' ||
        target.tagName === 'H3' ||
        target.tagName === 'H4' ||
        target.tagName === 'H5' ||
        target.tagName === 'H6' ||
        target.closest('h1') ||
        target.closest('h2') ||
        target.closest('h3') ||
        target.closest('h4') ||
        target.closest('h5') ||
        target.closest('h6')
      ) {
        setIsHeadingHover(true)
        setIsHovering(false)
        setIsTextCursor(false)
        setIsLogoHover(false)
        return
      }
      
      // Check for clickable elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('role') === 'button' ||
        target.onclick ||
        target.getAttribute('tabindex') === '0'
      ) {
        setIsHovering(true)
        setIsTextCursor(false)
        setIsHeadingHover(false)
        setIsLogoHover(false)
      } else {
        setIsHovering(false)
        setIsTextCursor(false)
        setIsHeadingHover(false)
        setIsLogoHover(false)
      }
    }

    // Check if reduced motion is preferred
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Check if it's a touch device
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return
    }

    document.addEventListener('mousemove', updatePosition)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', handleMouseOver)

    // Initialize cursor position
    setIsVisible(true)

    return () => {
      document.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  // Don't render on touch devices or if reduced motion is preferred
  if (
    typeof window !== 'undefined' &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
     window.matchMedia('(hover: none) and (pointer: coarse)').matches)
  ) {
    return null
  }

  if (!isVisible) return null

  return (
    <div
      className={`custom-cursor ${isHovering ? 'hover' : ''} ${isClicking ? 'click' : ''} ${isTextCursor ? 'text' : ''} ${isHeadingHover || isLogoHover ? 'heading' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      aria-hidden="true"
    />
  )
}