import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url: string) => {
  const [message, setMessage] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.current.onmessage = (event) => {
      setMessage(event.data);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (msg: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    }
  };

  return { message, sendMessage };
};

export default useWebSocket;
