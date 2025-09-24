'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, MessageCircle, Send, Mic, Minus } from 'lucide-react';
import { askQuestion } from '@/lib/api';
import TypingAnimation from '@/components/TypingAnimation';

interface QAPanelProps {
  expanded: boolean;
  onExpand: () => void;
  onMinimize: () => void;
  canMinimize?: boolean;
}

interface Message {
  type: 'question' | 'answer';
  text: string;
  timestamp: string;
  isTyping?: boolean;
  id?: string;
}

const QAPanel: React.FC<QAPanelProps> = ({ expanded, onExpand, onMinimize, canMinimize = true }) => {
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  
  // Load persisted messages for the current document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentDoc = localStorage.getItem('currentDocument');
      if (currentDoc) {
        const doc = JSON.parse(currentDoc);
        setCurrentDocumentId(doc.id);
        
        // Load messages for this document
        const savedMessages = localStorage.getItem(`qa_messages_${doc.id}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          // Set default messages if none exist
          const defaultMessages = [
            {
              type: 'question' as const,
              text: 'What is the duration of the confidentiality obligation?',
              timestamp: '10:30 AM',
              id: 'default-q1'
            },
            {
              type: 'answer' as const,
              text: 'According to Section 2 of the agreement, the confidentiality obligation lasts for five (5) years from the date of disclosure.',
              timestamp: '10:30 AM',
              id: 'default-a1'
            }
          ];
          setMessages(defaultMessages);
          localStorage.setItem(`qa_messages_${doc.id}`, JSON.stringify(defaultMessages));
        }
      }
    }
  }, []);
  
  // Save messages whenever they change
  useEffect(() => {
    if (currentDocumentId && messages.length > 0) {
      localStorage.setItem(`qa_messages_${currentDocumentId}`, JSON.stringify(messages));
    }
  }, [messages, currentDocumentId]);

  const displayMessages = messages;

  const handleSendQuestion = async () => {
    if (question.trim() && currentDocumentId) {
      const questionId = `q-${Date.now()}`;
      const newQuestion: Message = {
        type: 'question',
        text: question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: questionId
      };
      
      setMessages(prev => [...prev, newQuestion]);
      setQuestion('');
      setIsLoading(true);
      
      try {
        console.log('Sending question to backend:', { documentId: currentDocumentId, question: newQuestion.text });
        const response = await askQuestion(currentDocumentId, newQuestion.text);
        
        if (response.success) {
          const answerId = `a-${Date.now()}`;
          const answerMessage: Message = {
            type: 'answer',
            text: response.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isTyping: true,
            id: answerId
          };
          
          setMessages(prev => [...prev, answerMessage]);
          setTypingMessageId(answerId);
        } else {
          throw new Error(response.error || 'Failed to get answer');
        }
      } catch (error) {
        console.error('Q&A API error:', error);
        const errorId = `error-${Date.now()}`;
        const errorMessage: Message = {
          type: 'answer',
          text: 'Sorry, I encountered an error while processing your question. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isTyping: true,
          id: errorId
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setTypingMessageId(errorId);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTypingComplete = (messageId: string) => {
    setTypingMessageId(null);
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTyping: false } : msg
    ));
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };


  return (
    <div className="h-full flex flex-col bg-white/15 dark:bg-gray-900/15 rounded-lg shadow-lg border-2 border-white/30 dark:border-gray-600/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-100/30 dark:border-gray-700/30 bg-green-50/20 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Q&A Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          {canMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Minimize panel"
            >
              <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
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
                  ? 'bg-blue-50/15 border-blue-200/25 ml-8 dark:bg-blue-900/15 dark:border-blue-800/25'
                  : 'bg-green-50/15 border-green-200/25 mr-8 dark:bg-green-900/15 dark:border-green-800/25'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {message.type === 'question' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-xs text-gray-400">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {message.type === 'answer' && message.isTyping ? (
                  <TypingAnimation 
                    text={message.text}
                    speed={25}
                    onComplete={() => message.id && handleTypingComplete(message.id)}
                    className=""
                  />
                ) : (
                  message.text
                )}
              </p>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="bg-green-50/2 border-green-100/5 mr-8 dark:bg-green-900/2 dark:border-green-800/5 p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">AI Assistant</span>
                <span className="text-xs text-gray-400">Analyzing...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing document...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Input */}
      <div className="p-3 sm:p-4 border-t-2 border-gray-100/25 dark:border-gray-700/25 bg-gray-50/10 dark:bg-gray-800/10">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Ask a question about the document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendQuestion()}
            disabled={isLoading}
            className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-200/25 dark:border-gray-600/25 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white/15 dark:bg-gray-800/15 text-gray-900 dark:text-white disabled:opacity-50"
          />
          <div className="flex gap-2 justify-end sm:justify-start">
            <button
              onClick={handleVoiceInput}
              className={`px-3 py-2.5 sm:py-2 rounded-lg transition-colors duration-200 flex items-center justify-center flex-shrink-0 hidden ${
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
              disabled={!question.trim() || isLoading}
              className="px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center dark:disabled:bg-gray-600 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAPanel;