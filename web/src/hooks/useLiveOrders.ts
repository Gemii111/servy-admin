import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectOrdersFeed } from '../services/websocket';
import { env } from '../config/env';

/**
 * Subscribe to /ws/orders and refresh orders/dashboard queries on updates.
 */
export function useLiveOrders(enabled = true): void {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !env.enableLiveWebSocket) return;

    wsRef.current = connectOrdersFeed(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, queryClient]);
}
