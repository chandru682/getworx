import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  Check, 
  CheckCheck, 
  Mic, 
  User, 
  Users, 
  Briefcase, 
  Image,
  Play
} from 'lucide-react';
import type { MessageThread } from './types';

interface MessagesTabProps {
  threads: MessageThread[];
  onSendMessage: (threadId: string, text: string) => void;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  threads,
  onSendMessage,
  activeThreadId,
  setActiveThreadId
}) => {
  const [filterType, setFilterType] = useState<'candidate' | 'employer' | 'internal'>('candidate');
  const [inputText, setInputText] = useState('');

  const filteredThreads = threads.filter(t => t.type === filterType);
  const activeThread = threads.find(t => t.id === activeThreadId) || filteredThreads[0];

  useEffect(() => {
    if (activeThread && !activeThreadId) {
      setActiveThreadId(activeThread.id);
    }
  }, [activeThread, activeThreadId, setActiveThreadId]);

  // AI suggested completions database
  const aiSuggestionsMap: { [key: string]: string[] } = {
    'thread-1': [ // Alex Morgan (Candidate)
      'Hi Alex, it will be a code design discussion focusing on patterns rather than live coding.',
      'Hi Alex, please prepare your screen share. The link is valid 10 mins prior.',
      'Hi Alex, we can reschedule if that slot is no longer convenient.'
    ],
    'thread-2': [ // Robert Lee (CTO)
      'Working on the offer draft. Will share the document for signature in 30 mins.',
      'Perfect, I will schedule the onboarding call for Monday.',
      'Verified the salary budget; fits inside the approved parameters.'
    ],
    'thread-3': [ // HR Operations Group (Internal)
      'Awesome work, Rahul. The parsed fields match formatting parameters.',
      'Will verify the vector database configuration by tomorrow morning.',
      'Let us set up a meeting to align on compliance checks.'
    ]
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeThread) return;
    onSendMessage(activeThread.id, inputText);
    setInputText('');
  };

  const handleApplyAiSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <div className="messages-workspace font-sans">
      
      <div className="messages-split-layout">
        
        {/* Left Column: Thread Lists & Category Toggles */}
        <div className="messages-threads-col">
          <div className="threads-header-tabs">
            <button className={`category-tab ${filterType === 'candidate' ? 'active' : ''}`} onClick={() => { setFilterType('candidate'); setActiveThreadId(null); }}>
              <User size={14} /> Candidates
            </button>
            <button className={`category-tab ${filterType === 'employer' ? 'active' : ''}`} onClick={() => { setFilterType('employer'); setActiveThreadId(null); }}>
              <Briefcase size={14} /> Managers
            </button>
            <button className={`category-tab ${filterType === 'internal' ? 'active' : ''}`} onClick={() => { setFilterType('internal'); setActiveThreadId(null); }}>
              <Users size={14} /> Internal
            </button>
          </div>

          <div className="threads-list-scroll scroll-y">
            {filteredThreads.length > 0 ? (
              filteredThreads.map(thread => {
                const isActive = activeThread?.id === thread.id;
                return (
                  <div 
                    key={thread.id} 
                    className={`thread-item-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveThreadId(thread.id)}
                  >
                    <img src={thread.avatar} alt={thread.name} className="avatar-md" />
                    <div className="thread-meta">
                      <div className="title-row">
                        <h4>{thread.name}</h4>
                        <span className="time">{thread.time}</span>
                      </div>
                      <p className="excerpt">{thread.lastMessage}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="unread-dot-count">{thread.unreadCount}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-threads-state">
                <p>No chat history available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Screen & AI Drawer */}
        <div className="chat-window-col">
          {activeThread ? (
            <div className="chat-interface-wrapper">
              
              {/* Header profile info */}
              <div className="chat-header">
                <div className="chat-prof-details">
                  <img src={activeThread.avatar} alt={activeThread.name} className="avatar-md" />
                  <div>
                    <h3>{activeThread.name}</h3>
                    <span className="status-indicator online">Active now</span>
                  </div>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="chat-messages-feed scroll-y">
                {activeThread.messages.map(msg => {
                  const isRecruiter = msg.sender === 'recruiter';
                  return (
                    <div key={msg.id} className={`message-bubble-row ${isRecruiter ? 'sent' : 'received'}`}>
                      {!isRecruiter && <img src={activeThread.avatar} alt={msg.senderName} className="avatar-xs" />}
                      <div className="message-content-wrapper">
                        <div className="message-header">
                          <span className="sender-name">{msg.senderName}</span>
                          <span className="time">{msg.time}</span>
                        </div>
                        <div className="bubble">
                          {msg.text && <p>{msg.text}</p>}
                          
                          {/* Voice Note player widget */}
                          {msg.voiceNoteUrl && (
                            <div className="voice-note-player">
                              <button className="play-vn-btn"><Play size={12} fill="currentColor" /></button>
                              <div className="visualizer-mock">
                                <span style={{ height: '14px' }}></span>
                                <span style={{ height: '22px' }}></span>
                                <span style={{ height: '8px' }}></span>
                                <span style={{ height: '18px' }}></span>
                                <span style={{ height: '12px' }}></span>
                              </div>
                              <span className="vn-duration">0:14</span>
                            </div>
                          )}

                          {/* File Attachment details */}
                          {msg.attachment && (
                            <div className="attachment-bubble-card">
                              <Paperclip size={14} />
                              <div className="info">
                                <span className="name">{msg.attachment.name}</span>
                                <span className="size">{msg.attachment.size}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Read status */}
                        {isRecruiter && (
                          <div className="read-status">
                            {msg.read ? <CheckCheck size={12} className="purple-txt" /> : <Check size={12} />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI suggested quick replies section */}
              {aiSuggestionsMap[activeThread.id] && (
                <div className="ai-reply-suggestions-band">
                  <div className="title-row">
                    <Sparkles size={14} className="ai-icon" />
                    <span>AI Suggested Replies:</span>
                  </div>
                  <div className="suggestions-scroll scroll-x">
                    {aiSuggestionsMap[activeThread.id].map((suggest, index) => (
                      <button 
                        key={index} 
                        className="suggestion-pill-btn font-sans" 
                        onClick={() => handleApplyAiSuggestion(suggest)}
                      >
                        {suggest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Field Toolbar */}
              <div className="chat-input-toolbar">
                <button className="tool-btn"><Paperclip size={16} /></button>
                <button className="tool-btn"><Image size={16} /></button>
                <button className="tool-btn"><Mic size={16} /></button>
                
                <input 
                  type="text" 
                  placeholder="Type a message or select an AI suggestion..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="font-sans"
                />

                <button className="btn-send-msg" onClick={handleSend}>
                  <Send size={14} />
                </button>
              </div>

            </div>
          ) : (
            <div className="empty-chat-state">
              <Sparkles size={48} />
              <h3>Select a thread to start chatting</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
