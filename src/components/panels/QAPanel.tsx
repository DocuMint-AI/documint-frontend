'use client';

import React, { useState } from 'react';
import { Maximize2, Minimize2, MessageCircle, Send, Mic, Minus } from 'lucide-react';

interface QAPanelProps {
  expanded: boolean;
  onExpand: () => void;
  onMinimize: () => void;
}

interface Message {
  type: 'question' | 'answer';
  text: string;
  timestamp: string;
}

const QAPanel: React.FC<QAPanelProps> = ({ expanded, onExpand, onMinimize }) => {
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'question',
      text: 'What is the duration of the confidentiality obligation?',
      timestamp: '10:30 AM'
    },
    {
      type: 'answer',
      text: 'According to Section 2 of the agreement, the confidentiality obligation lasts for five (5) years from the date of disclosure.',
      timestamp: '10:30 AM'
    }
  ]);

  // Additional messages for expanded view
  const expandedMessages: Message[] = [
    ...messages,
    {
      type: 'question',
      text: 'What happens if there is a breach of confidentiality?',
      timestamp: '10:32 AM'
    },
    {
      type: 'answer',
      text: 'Section 4 states that any breach would cause irreparable harm, and the Company can seek injunctive relief and other equitable remedies beyond monetary damages.',
      timestamp: '10:32 AM'
    },
    {
      type: 'question',
      text: 'Is there a termination clause?',
      timestamp: '10:35 AM'
    },
    {
      type: 'answer',
      text: 'Yes, Section 3 allows either party to terminate with 30 days written notice. Upon termination, all confidential information must be returned or destroyed.',
      timestamp: '10:35 AM'
    }
  ];

  const displayMessages = expanded ? expandedMessages : messages;

  const handleSendQuestion = () => {
    if (question.trim()) {
      const newQuestion: Message = {
        type: 'question',
        text: question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newQuestion]);
      setQuestion('');
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'answer',
          text: 'I\'ll analyze the document to provide you with a comprehensive answer to your question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-600 bg-green-50/30 dark:bg-green-900/30">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Q&A Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onExpand}
            className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-green-700 dark:text-green-300" /> : <Maximize2 className="w-4 h-4 text-green-700 dark:text-green-300" />}
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-3">
          {displayMessages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                message.type === 'question'
                  ? 'bg-blue-50/50 border-blue-100 ml-8 dark:bg-blue-900/20 dark:border-blue-800'
                  : 'bg-green-50/50 border-green-100 mr-8 dark:bg-green-900/20 dark:border-green-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {message.type === 'question' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-xs text-gray-400">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {message.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about the document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleVoiceInput}
            className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={handleSendQuestion}
            disabled={!question.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center dark:disabled:bg-gray-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QAPanel;