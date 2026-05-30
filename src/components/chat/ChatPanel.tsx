import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, MessageSquare, Minimize2 } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface Message {
  id: number
  content: string
  senderId: number
  sender: { id: number; nom: string; prenom: string; avatar?: string }
  createdAt: string
  read: boolean
}

interface ChatPanelProps {
  conversationId: number
  otherUser: { id: number; nom: string; prenom: string; avatar?: string }
  requestTitle?: string
  onClose: () => void
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatPanel({ conversationId, otherUser, requestTitle, onClose, position = 'bottom-right' }: ChatPanelProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [unread, setUnread] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    // Load history
    api.get<Message[]>(`/chat/${conversationId}/messages`)
      .then(msgs => { setMessages(msgs); setTimeout(scrollToBottom, 100) })
      .catch(() => {})

    // Socket connection
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join_conversation', conversationId)
    })

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg])
      if (minimized && msg.senderId !== user?.id) {
        setUnread(u => u + 1)
      }
      setTimeout(scrollToBottom, 50)
    })

    socket.on('user_typing', ({ isTyping }: { userId: number; isTyping: boolean }) => {
      setOtherTyping(isTyping)
    })

    return () => {
      socket.emit('leave_conversation', conversationId)
      socket.disconnect()
    }
  }, [conversationId, token])

  useEffect(() => {
    if (!minimized) {
      setUnread(0)
      setTimeout(scrollToBottom, 100)
    }
  }, [minimized])

  function sendMessage() {
    if (!input.trim() || !socketRef.current) return
    socketRef.current.emit('send_message', { conversationId, content: input.trim() })
    setInput('')
    stopTyping()
  }

  function startTyping() {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socketRef.current?.emit('typing', { conversationId, isTyping: true })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(stopTyping, 2500)
  }

  function stopTyping() {
    isTypingRef.current = false
    socketRef.current?.emit('typing', { conversationId, isTyping: false })
    if (typingTimeoutRef.current) { clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = null }
  }

  const positionCls = position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'

  return (
    <div className={cn('fixed z-50 flex flex-col shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700', positionCls,
      minimized ? 'h-14 w-72' : 'h-[440px] w-80'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 dark:bg-slate-800 rounded-t-2xl cursor-pointer"
        onClick={() => setMinimized(v => !v)}>
        <div className="flex items-center gap-2.5">
          <UserAvatar nom={otherUser.nom} prenom={otherUser.prenom} avatar={otherUser.avatar} size="sm" className="ring-2 ring-white/20" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{otherUser.prenom} {otherUser.nom}</p>
            {!minimized && otherTyping && <p className="text-xs text-orange-300">est en train d'écrire...</p>}
            {!minimized && !otherTyping && requestTitle && <p className="text-xs text-slate-400 truncate">{requestTitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {minimized && unread > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>
          )}
          <button onClick={(e) => { e.stopPropagation(); setMinimized(v => !v) }} className="text-slate-400 hover:text-white transition-colors">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose() }} className="text-slate-400 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white dark:bg-slate-900">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <MessageSquare className="w-8 h-8 opacity-40" />
                <p className="text-xs">Aucun message. Commencez la conversation.</p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.senderId === user?.id
              return (
                <div key={msg.id} className={cn('flex items-end gap-1.5', isMe ? 'justify-end' : 'justify-start')}>
                  {!isMe && (
                    <UserAvatar nom={msg.sender.nom || ''} prenom={msg.sender.prenom || ''} avatar={msg.sender.avatar} size="xs" />
                  )}
                  <div className={cn(
                    'max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug break-words',
                    isMe
                      ? 'bg-orange-600 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                  )}>
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {otherTyping && (
              <div className="flex items-end gap-1.5 justify-start">
                <UserAvatar nom={otherUser.nom} prenom={otherUser.prenom} avatar={otherUser.avatar} size="xs" />
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl flex gap-2">
            <input
              value={input}
              onChange={e => { setInput(e.target.value); startTyping() }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              onBlur={stopTyping}
              placeholder="Message..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
