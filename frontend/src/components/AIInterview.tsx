import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export const AIInterview: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai' as const, text: "Hello! Welcome to your AI mock interview session. I'll be acting as your technical recruiter today. Let's start with the first question: \n\n'Can you explain the difference between state and props in React, and when you would use one over the other?'" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = inputText;
    const newMsgs: Message[] = [...messages, { sender: 'user' as const, text: userMsg }];
    setMessages(newMsgs);
    setInputText('');
    setIsEvaluating(true);

    // Simulate AI response & evaluation
    setTimeout(() => {
      setIsEvaluating(false);
      setMessages(prev => [
        ...prev,
        { sender: 'ai' as const, text: "Thank you for your response. Based on your explanation, here is the next question:\n\n'What are the advantages of using TypeScript with React compared to vanilla JavaScript, and how do you handle type declarations for React component props?'" }
      ]);
      
      // Calculate a dynamic recommendation
      setFeedback(
        "Evaluation Score: 8.5/10\n\nStrengths: Good structural explanation of how 'props' are immutable variables passed by parents and 'state' represents internal mutable data.\n\nRecommendation: You could improve by mentioning that React uses virtual DOM diffing to re-render when state changes, and props changes trigger a re-render as well."
      );
    }, 1500);
  };

  const handleReset = () => {
    setMessages([
      { sender: 'ai' as const, text: "Session reset. Let's try again:\n\n'Can you explain the difference between state and props in React, and when you would use one over the other?'" }
    ]);
    setFeedback(null);
  };

  return (
    <div className="widget-box" style={{ gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>AI Interview Practice Simulator</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Practice technical questions and receive immediate recruiter feedback.</p>
        </div>
        <button 
          onClick={handleReset}
          className="btn-outline" 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={12} />
          <span>Reset Session</span>
        </button>
      </div>

      <div className="interview-chat-box">
        <div className="interview-messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-bubble ${msg.sender}`}
              style={{ whiteSpace: 'pre-line' }}
            >
              {msg.text}
            </div>
          ))}

          {isEvaluating && (
            <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'bounce 0.6s infinite alternate'
              }} />
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-secondary)',
                borderRadius: '50%',
                animation: 'bounce 0.6s infinite alternate 0.2s'
              }} />
              <span>Analyzing answer and grading...</span>
            </div>
          )}
        </div>

        <div className="chat-input-bar">
          <input 
            type="text" 
            className="chat-input"
            placeholder="Type your technical response here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isEvaluating}
          />
          <button 
            className="btn-primary" 
            onClick={handleSend}
            disabled={isEvaluating || !inputText.trim()}
            style={{ padding: '10px 16px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {feedback && (
        <div 
          style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.05)', 
            border: '1px solid var(--color-success)', 
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '13.5px',
            lineHeight: '1.5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: '700', marginBottom: '8px' }}>
            <Sparkles size={16} />
            <span>AI Recruiter Feedback Report</span>
          </div>
          <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{feedback}</p>
        </div>
      )}

      {/* Bounce keyframe */}
      <style>{`
        @keyframes bounce {
          to { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
