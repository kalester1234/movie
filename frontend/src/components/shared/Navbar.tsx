'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Search, Bell, Menu, X, Film, ChevronDown, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { cn } from '@/utils/helpers'
import LiveSearch from './LiveSearch'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/discover', label: 'AI Match', icon: Sparkles },
  { href: '/watchlist', label: 'My List' },
]

interface NavbarProps {
  // Authentication disabled for one-time use
}

export default function Navbar({}: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const { setUser, setWatchlist, setFavorites } = useUserStore()

  // Removed initialization effect that overwrote persisted Zustand state

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [searchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass-strong border-b border-white/5'
            : 'bg-gradient-to-b from-black/60 to-transparent border-transparent'
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold text-gradient hidden sm:block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CineNova
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-white bg-white/10'
                      : 'text-[--color-text-secondary] hover:text-white hover:bg-white/5'
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn('w-3.5 h-3.5', active ? 'text-[--color-primary]' : '')}
                    />
                  )}
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div
                  key="search-form"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="relative md:w-[400px]"
                >
                  <LiveSearch onClose={() => setSearchOpen(false)} />
                </motion.div>
              ) : (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-[--color-text-secondary] hover:text-white hover:bg-white/5 transition-all duration-200"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Notification Bell */}
            <button
              className="hidden sm:flex p-2 rounded-lg text-[--color-text-secondary] hover:text-white hover:bg-white/5 transition-all duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[--color-primary]" aria-hidden="true" />
            </button>

            {/* Removed Auth / Profile UI */}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-[--color-text-secondary] hover:text-white hover:bg-white/5 transition-all duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pt-16 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="relative glass-strong border-b border-white/5 px-6 py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                      active
                        ? 'text-white bg-white/10'
                        : 'text-[--color-text-secondary] hover:text-white hover:bg-white/5'
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
