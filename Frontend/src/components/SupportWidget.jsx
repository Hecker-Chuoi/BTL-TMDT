import React, { useEffect, useState } from 'react';
import {
  getOrCreateSupportConversation,
  readSupportConversations,
  sendSupportMessage,
  subscribeSupportConversations
} from '../utils/supportChat';

const supportLinks = {
  messenger: 'https://www.facebook.com/HeckerChuoi',
  zalo: 'https://zaloapp.com/qr/p/1kf7nxospf566'
};

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isChatOpen || !conversationId) return undefined;

    const syncMessages = (conversations = readSupportConversations()) => {
      const conversation = conversations.find(item => item.id === conversationId);
      setMessages(conversation?.messages || []);
    };

    syncMessages();
    return subscribeSupportConversations(syncMessages);
  }, [conversationId, isChatOpen]);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const openChat = () => {
    const conversation = getOrCreateSupportConversation();
    setConversationId(conversation.id);
    setMessages(conversation.messages || []);
    setIsChatOpen(true);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;

    const conversation = conversationId ? { id: conversationId } : getOrCreateSupportConversation();
    if (!conversationId) setConversationId(conversation.id);
    sendSupportMessage(conversation.id, 'customer', text);
    setMessage('');
  };

  return (
    <div className="support-widget">
      {isChatOpen && (
        <div className="support-chatbox">
          <div className="support-chatbox-header">
            <span>Chatbot</span>
            <button type="button" onClick={() => setIsChatOpen(false)} aria-label="Đóng chatbot">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="support-chatbox-messages">
            {messages.map((item, index) => (
              <div key={item.id || `${item.sender}-${index}`} className={`support-message ${item.sender === 'customer' ? 'user' : 'bot'}`}>
                {item.text}
              </div>
            ))}
          </div>
          <form className="support-chatbox-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={event => setMessage(event.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button type="submit" aria-label="Gửi tin nhắn">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}

      {isOpen && (
        <div className="support-actions">
          <a href={supportLinks.messenger} target="_blank" rel="noreferrer" className="support-action messenger">
            <i className="fab fa-facebook-messenger"></i>
            <span>Messenger</span>
          </a>
          <a href={supportLinks.zalo} target="_blank" rel="noreferrer" className="support-action zalo">
            <span className="support-zalo-mark">Z</span>
            <span>Zalo</span>
          </a>
          <button type="button" className="support-action chatbot" onClick={openChat}>
            <i className="fas fa-comments"></i>
            <span>Chatbot</span>
          </button>
        </div>
      )}

      <button type="button" className="support-toggle" onClick={toggleOpen} aria-label={isOpen ? 'Đóng hỗ trợ' : 'Mở hỗ trợ'}>
        {isOpen ? <i className="fas fa-times"></i> : '?'}
      </button>
    </div>
  );
};

export default SupportWidget;
