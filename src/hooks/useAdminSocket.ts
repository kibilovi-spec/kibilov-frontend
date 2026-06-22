'use client';
import { useEffect, useRef } from 'react';

type OrderEvent = {
  id: string;
  total: number;
  customer: string;
  items: number;
  ts: string;
};

export function useAdminSocket(onNewOrder?: (order: OrderEvent) => void) {
  const cbRef = useRef(onNewOrder);
  cbRef.current = onNewOrder;

  useEffect(() => {
    let socket: any = null;
    const connect = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://kibilov.ge', {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
        });
        socket.on('connect', () => socket.emit('join-admin'));
        socket.on('new-order', (data: OrderEvent) => {
          if (cbRef.current) cbRef.current(data);
        });
      } catch(e) {}
    };
    connect();
    return () => { if (socket) socket.disconnect(); };
  }, []);
}
