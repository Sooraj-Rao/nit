// hooks/useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Or your backend server URL

export const useSocket = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    socket.on('receiveAlert', (data) => {
      setAlert(data);
    });

    return () => socket.off('receiveAlert');
  }, []);

  return { alert };
};
