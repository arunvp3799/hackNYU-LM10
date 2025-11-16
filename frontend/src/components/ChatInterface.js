import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

function ChatInterface({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your Health Insurance Inc. assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('appointment') || input.includes('schedule') || input.includes('book')) {
      return 'I\'d be happy to help you schedule an appointment. I have the following times available with your primary care provider:\n\n1. Tuesday, Nov 19 at 10:00 AM\n2. Wednesday, Nov 20 at 2:30 PM\n3. Thursday, Nov 21 at 9:15 AM\n\nWhich time works best for you?';
    } else if (input.includes('cancel')) {
      return 'I can help you cancel your appointment. Let me pull up your upcoming appointments... You have an appointment scheduled for Nov 19 at 10:00 AM with Dr. Sarah Johnson. Would you like to cancel this appointment?';
    } else if (input.includes('insurance') || input.includes('coverage') || input.includes('benefits')) {
      return 'I can help you understand your insurance benefits. What specific coverage information would you like to know about? For example:\n• Deductibles and copays\n• Prescription coverage\n• Specialist visits\n• Emergency services';
    } else if (input.includes('doctor') || input.includes('pcp') || input.includes('provider')) {
      return 'I can help you find a doctor or change your primary care provider. Based on your location in Brooklyn, NY, I can show you nearby doctors accepting new patients. Would you like me to search for providers in your area?';
    } else if (input.includes('prescription') || input.includes('medication') || input.includes('refill')) {
      return 'I can help with prescription refills. To assist you better, please provide:\n• Medication name\n• Pharmacy location\n• Any questions about your prescription';
    } else if (input.includes('claim')) {
      return 'I can help you check the status of your claims or submit a new claim. Would you like to:\n1. Check existing claim status\n2. Submit a new claim\n3. Understand your claim details';
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return 'Hello! How can I assist you with your healthcare needs today?';
    } else if (input.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    } else {
      return 'I\'m here to help with:\n• Scheduling appointments\n• Insurance benefits and coverage\n• Finding doctors and specialists\n• Prescription refills\n• Claims information\n\nWhat can I help you with today?';
    }
  };

  const quickActions = [
    '📅 Book appointment',
    '🏥 Find a doctor',
    '💊 Refill prescription',
    '📋 Check benefits'
  ];

  const handleQuickAction = (action) => {
    setInputValue(action.substring(2).trim()); // Remove emoji
  };

  if (!isOpen) return null;

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">🤖</div>
          <div className="chat-header-info">
            <h3>Healthcare Assistant</h3>
            <span className="status-indicator">● Online</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.type === 'bot' && (
              <div className="message-avatar">🤖</div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                {message.text}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.type === 'user' && (
              <div className="message-avatar user-avatar">👤</div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action-btn"
            onClick={() => handleQuickAction(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="send-button" disabled={!inputValue.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
