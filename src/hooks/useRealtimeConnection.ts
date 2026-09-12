import { useEffect, useRef, useState } from 'react'

import { useAuthStore } from '../stores/authStore'

export type RealtimeStatus = 'connecting' | 'online' | 'offline'

const RECONNECT_DELAY_MS = 3000

function buildWsUrl(accessToken: string): string {
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000'
  const wsBase = apiUrl.replace(/^http/, 'ws')
  return `${wsBase}/realtime?token=${encodeURIComponent(accessToken)}`
}

export function useRealtimeConnection(onEvent?: (event: string, payload: unknown) => void): RealtimeStatus {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [status, setStatus] = useState<RealtimeStatus>('connecting')
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!accessToken) {
      setStatus('offline')
      return
    }

    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    function connect() {
      setStatus('connecting')
      socket = new WebSocket(buildWsUrl(accessToken!))

      socket.onopen = () => {
        if (!cancelled) setStatus('online')
      }
      socket.onclose = () => {
        if (cancelled) return
        setStatus('offline')
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }
      socket.onerror = () => {
        socket?.close()
      }
      socket.onmessage = (e) => {
        try {
          const { event, payload } = JSON.parse(e.data)
          onEventRef.current?.(event, payload)
        } catch {
          // ignore malformed messages
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [accessToken])

  return status
}
