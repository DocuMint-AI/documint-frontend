import React, { useState, useRef, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  FileText, 
  Brain, 
  MessageCircle, 
  Send,
  GripVertical,
  Mic,
  Minus
} from 'lucide-react';

// Individual Panel Components
const DocumentPanel = ({ expanded, onExpand, onMinimize }) => {
  const expandedContent = [
    {
      section: "3. Term and Termination",
      content: "This Agreement shall remain in effect until terminated by either party with thirty (30) days written notice. Upon termination, all Confidential Information must be returned or destroyed at the Company's discretion."
    },
    {
      section: "4. Remedies", 
      content: "Recipient acknowledges that any breach of this Agreement would cause irreparable harm to Company, and that monetary damages would be inadequate compensation. Therefore, Company shall be entitled to seek injunctive relief and other equitable remedies."
    },
    {
      section: "5. Governing Law",
      content: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles."
    },
    {
      section: "6. Entire Agreement",
      content: "This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, negotiations and discussions."
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-blue-50/30">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Document</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onExpand}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-blue-700" /> : <Maximize2 className="w-4 h-4 text-blue-700" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Contract Agreement - NDA-2024-001</p>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              This Non-Disclosure Agreement ("Agreement") is entered into on January 15, 2024, 
              between TechCorp Solutions Inc., a Delaware corporation ("Company"), and John Smith, 
              an individual ("Recipient").
            </p>
            
            <div>
              <p className="font-semibold mb-2">1. Definition of Confidential Information</p>
              <p>
                For purposes of this Agreement, "Confidential Information" shall include all non-public, 
                proprietary or confidential information, technical data, trade secrets, know-how, 
                research, product plans, products, services, customers, customer lists, markets, 
                software, developments, inventions, processes, formulas, technology, designs, 
                drawings, engineering, hardware configuration information, marketing, finances, 
                or other business information disclosed by Company.
              </p>
            </div>
            
            <div>
              <p className="font-semibold mb-2">2. Obligations of Receiving Party</p>
              <p>
                Recipient agrees to hold and maintain the Confidential Information in strict confidence 
                for a period of five (5) years from the date of disclosure. Recipient shall not disclose 
                any Confidential Information to third parties without the prior written consent of Company. 
                Recipient shall use the same degree of care that it uses to protect its own confidential 
                information, but in no event less than reasonable care.
              </p>
            </div>
            
            {/* Show additional content when expanded */}
            {expanded && expandedContent.map((section, index) => (
              <div key={index}>
                <p className="font-semibold mb-2">{section.section}</p>
                <p>{section.content}</p>
              </div>
            ))}
            
            {!expanded && (
              <p className="text-gray-500 italic">
                [Document continues with additional clauses and terms...]
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightsPanel = ({ expanded, onExpand, onMinimize }) => {
  const baseInsights = [
    { type: 'Risk', level: 'High', text: 'Overly broad confidentiality scope may be unenforceable', color: 'red' },
    { type: 'Compliance', level: 'Medium', text: 'Missing jurisdiction clause for dispute resolution', color: 'yellow' },
    { type: 'Standard', level: 'Low', text: 'Term length aligns with industry standards', color: 'green' },
    { type: 'Suggestion', level: 'Medium', text: 'Consider adding mutual confidentiality provisions', color: 'yellow' }
  ];

  const expandedInsights = [
    ...baseInsights,
    { type: 'Legal', level: 'Medium', text: 'Definition of confidential information could be more specific', color: 'yellow' },
    { type: 'Risk', level: 'High', text: 'No carve-outs for publicly available information', color: 'red' },
    { type: 'Compliance', level: 'Low', text: 'Return/destruction clause is properly defined', color: 'green' },
    { type: 'Suggestion', level: 'Low', text: 'Consider adding exceptions for independently developed information', color: 'green' },
    { type: 'Legal', level: 'Medium', text: 'Remedy clause may be too broad - consider limiting scope', color: 'yellow' },
    { type: 'Standard', level: 'Low', text: 'Governing law clause follows Delaware standards', color: 'green' }
  ];

  const insights = expanded ? expandedInsights : baseInsights;
  
  const getColorClasses = (color, level) => {
    const colorMap = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        chip: 'bg-red-100 text-red-800',
        levelChip: level === 'High' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100 text-yellow-800',
        levelChip: level === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        chip: 'bg-green-100 text-green-800',
        levelChip: level === 'Low' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
      }
    };
    return colorMap[color];
  };
  
  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-purple-50/30">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onExpand}
            className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-purple-700" /> : <Maximize2 className="w-4 h-4 text-purple-700" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const colors = getColorClasses(insight.color, insight.level);
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.chip}`}>
                    {insight.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.levelChip}`}>
                    {insight.level}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const QAPanel = ({ expanded, onExpand, onMinimize }) => {
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
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
  const expandedMessages = [
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
      const newQuestion = {
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
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-green-50/30">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Q&A Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onExpand}
            className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-green-700" /> : <Maximize2 className="w-4 h-4 text-green-700" />}
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
                  ? 'bg-blue-50/50 border-blue-100 ml-8'
                  : 'bg-green-50/50 border-green-100 mr-8'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-600">
                  {message.type === 'question' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-xs text-gray-400">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {message.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about the document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleVoiceInput}
            className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={handleSendQuestion}
            disabled={!question.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Resizable Divider Component
const ResizableDivider = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    e.preventDefault();
    
    const handleMouseMove = (e) => {
      onResize(e.clientX);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize]);
  
  return (
    <div className="relative w-0 h-full flex items-center justify-center">
      {/* Invisible click area */}
      <div
        className="absolute w-4 h-full cursor-col-resize z-10"
        onMouseDown={handleMouseDown}
        style={{ left: '-8px' }}
      />
      
      {/* Visual divider line */}
      <div className="absolute w-px h-full bg-gray-300" style={{ left: '-0.5px' }} />
      
      {/* Drag handle */}
      <div
        className={`absolute w-6 h-8 flex items-center justify-center rounded cursor-col-resize transition-all duration-200 ${
          isDragging 
            ? 'bg-blue-500 shadow-md' 
            : 'bg-gray-300 hover:bg-blue-400 hover:shadow-sm'
        }`}
        style={{ left: '-12px' }}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className={`w-3 h-3 ${isDragging ? 'text-white' : 'text-white'}`} />
      </div>
    </div>
  );
};

// Main Component
const LegalDocumentAIInterface = () => {
  const containerRef = useRef(null);
  
  // Panel state management
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [minimizedPanel, setMinimizedPanel] = useState(null);
  const [panelWidths, setPanelWidths] = useState([33.33, 33.33, 33.34]);
  
  // Panel configurations
  const panels = [
    { id: 'document', component: DocumentPanel },
    { id: 'insights', component: InsightsPanel },
    { id: 'qa', component: QAPanel }
  ];
  
  // Handle panel expansion
  const handlePanelExpand = (panelId) => {
    setExpandedPanel(expandedPanel === panelId ? null : panelId);
    setMinimizedPanel(null);
  };

  // Handle panel minimization
  const handlePanelMinimize = (panelId) => {
    setMinimizedPanel(minimizedPanel === panelId ? null : panelId);
    setExpandedPanel(null);
  };
  
  // Handle panel resizing
  const handleResize = useCallback((dividerIndex, clientX) => {
    if (!containerRef.current || expandedPanel || minimizedPanel) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = clientX - containerRect.left;
    const percentage = (relativeX / containerWidth) * 100;
    
    setPanelWidths(prev => {
      const newWidths = [...prev];
      
      if (dividerIndex === 0) {
        const minWidth = 15;
        const maxWidth = 70;
        const constrainedPercentage = Math.max(minWidth, Math.min(maxWidth, percentage));
        
        newWidths[0] = constrainedPercentage;
        newWidths[1] = Math.max(minWidth, 100 - constrainedPercentage - newWidths[2]);
      } else if (dividerIndex === 1) {
        const minWidth = 15;
        const constrainedPercentage = Math.max(minWidth, Math.min(85, percentage));
        
        if (constrainedPercentage > newWidths[0]) {
          newWidths[1] = constrainedPercentage - newWidths[0];
          newWidths[2] = Math.max(minWidth, 100 - constrainedPercentage);
        }
      }
      
      return newWidths;
    });
  }, [expandedPanel, minimizedPanel]);

  // Get visible panels based on state
  const getVisiblePanels = () => {
    if (expandedPanel) {
      return panels.filter(panel => panel.id === expandedPanel);
    }
    if (minimizedPanel) {
      return panels.filter(panel => panel.id !== minimizedPanel);
    }
    return panels;
  };

  const visiblePanels = getVisiblePanels();
  const minimizedPanelData = minimizedPanel ? panels.find(p => p.id === minimizedPanel) : null;

  return (
    <div className="h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Legal Document AI Assistant
        </h1>
        <p className="text-gray-600">
          Analyze contracts, get insights, and ask questions powered by AI
        </p>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top panels area */}
        <div
          ref={containerRef}
          className="flex-1 flex bg-gray-100/50 p-4 gap-1"
        >
          {visiblePanels.map((panel, index) => {
            const Component = panel.component;
            const isExpanded = expandedPanel === panel.id;
            
            // Calculate width for visible panels
            let width;
            if (isExpanded) {
              width = '100%';
            } else if (minimizedPanel) {
              // When one panel is minimized, share space between remaining two
              width = '50%';
            } else {
              width = `${panelWidths[panels.findIndex(p => p.id === panel.id)]}%`;
            }
            
            return (
              <React.Fragment key={panel.id}>
                {/* Panel */}
                <div
                  className="transition-all duration-300 ease-in-out"
                  style={{
                    width,
                    minWidth: isExpanded ? '100%' : '200px',
                    maxWidth: isExpanded ? '100%' : '70%'
                  }}
                >
                  <Component
                    expanded={isExpanded}
                    onExpand={() => handlePanelExpand(panel.id)}
                    onMinimize={() => handlePanelMinimize(panel.id)}
                  />
                </div>
                
                {/* Resizable Divider */}
                {index < visiblePanels.length - 1 && !expandedPanel && !minimizedPanel && (
                  <ResizableDivider
                    onResize={(clientX) => handleResize(index, clientX)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Minimized panel at bottom */}
        {minimizedPanelData && (
          <div className="h-16 bg-white border-t border-gray-200 shadow-sm">
            <div className="h-full flex items-center justify-between px-6 py-2">
              <div className="flex items-center gap-3">
                {minimizedPanelData.id === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                {minimizedPanelData.id === 'insights' && <Brain className="w-5 h-5 text-purple-600" />}
                {minimizedPanelData.id === 'qa' && <MessageCircle className="w-5 h-5 text-green-600" />}
                <span className="font-medium text-gray-700">
                  {minimizedPanelData.id === 'document' && 'Document'}
                  {minimizedPanelData.id === 'insights' && 'AI Insights'}
                  {minimizedPanelData.id === 'qa' && 'Q&A Assistant'}
                </span>
                <span className="text-sm text-gray-500">(minimized)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePanelExpand(minimizedPanelData.id)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Expand panel"
                >
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setMinimizedPanel(null)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Restore panel"
                >
                  <Minimize2 className="w-4 h-4 text-gray-600 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDocumentAIInterface;