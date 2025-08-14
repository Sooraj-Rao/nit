import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatBox = ({ alertId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [typingStatus, setTypingStatus] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!alertId) return;

    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/${alertId}`);
        const data = await res.json();
        const formatted = data.map((msg) => ({
          sender: msg.sender.name,
          message: msg.message,
          timestamp: msg.createdAt,
        }));
        setMessages(formatted);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchMessages();

    socket.emit('joinRoom', { alertId });

    socket.on('receiveMessage', ({ message, sender, timestamp }) => {
      setMessages((prev) => [...prev, { message, sender, timestamp }]);
    });

    socket.on('typing', ({ sender }) => {
      if (sender !== currentUser?.name) {
        setTypingStatus(`${sender} is typing...`);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingStatus('');
        }, 2000);
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
    };
  }, [alertId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim()) return;

    socket.emit('sendMessage', {
      alertId,
      message: newMsg,
      sender: currentUser?._id,
    });

    setNewMsg('');
  };

  const handleTyping = () => {
    socket.emit('typing', {
      alertId,
      sender: currentUser?.name,
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-box border rounded p-4 mt-4 bg-white shadow w-full max-w-xl mx-auto">
      <div className="messages h-64 overflow-y-auto px-2 space-y-2">
        {messages.map((msg, idx) => {
          const isSender = msg.sender === currentUser?.name;
          return (
            <div key={idx} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-xs ${
                  isSender
                    ? 'bg-blue-500 text-white self-end'
                    : 'bg-gray-200 text-gray-800 self-start'
                }`}
              >
                <div className="text-xs font-medium">{msg.sender}</div>
                <div className="text-sm">{msg.message}</div>
                <div className="text-[10px] text-right mt-1">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingStatus && (
        <div className="text-sm text-gray-500 mt-1 pl-2">{typingStatus}</div>
      )}

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          placeholder="Type your message..."
          value={newMsg}
          onChange={(e) => {
            setNewMsg(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
