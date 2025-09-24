'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Brain, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Upload,
  BarChart3,
  MessageSquare,
  Sparkles
} from 'lucide-react';

// Import Satisfy font from Google Fonts
import { Satisfy } from 'next/font/google';

const satisfy = Satisfy({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap'
});

export default function HomePage() {
  const router = useRouter();

  // Scroll animation setup
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const animationType = target.dataset.animation;
          if (animationType) {
            target.classList.add(animationType);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with data-animation attribute
    const animatedElements = document.querySelectorAll('[data-animation]');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced document analysis using Google's Gemini AI to extract meaningful insights from your contracts and legal documents."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk Assessment",
      description: "Identify potential risks, compliance issues, and legal concerns before they become problems."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Processing",
      description: "Upload and analyze documents in seconds, not hours. Get immediate insights and recommendations."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Smart Q&A",
      description: "Ask questions about your documents and get intelligent, context-aware answers powered by AI."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Comprehensive Insights",
      description: "Get detailed analysis including compliance scores, risk levels, and actionable recommendations."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Multiple Formats",
      description: "Support for PDF, DOC, and DOCX files with intelligent text extraction and OCR capabilities."
    }
  ];

  const benefits = [
    "Reduce document review time by 90%",
    "Identify risks before they become costly",
    "Ensure compliance with regulations",
    "Make informed decisions faster",
    "Save thousands in legal fees"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-4 sm:px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/10 rounded-lg overflow-hidden">
              <img 
                src="/assets/documint-square-zoomed.png" 
                alt="DocuMint AI" 
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <span className="text-lg sm:text-xl font-medium text-white leading-tight hidden sm:block" style={{fontFamily: "'TT Drugs Trial', sans-serif"}}>
              DocuMint AI
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push('/docs')}
              className="px-3 sm:px-4 py-2 text-white border border-white/20 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </nav>
        <div className="px-4 sm:px-6 py-12 sm:py-20 text-center max-w-6xl mx-auto">
          {/* Wide Logo */}
          <div className="mb-8 sm:mb-12 animate-on-scroll" data-animation="animate-fade-in">
            <div className="flex justify-center mb-6 sm:mb-8">
              <img 
                src="/assets/documint-wide-transparent.png" 
                alt="DocuMint AI" 
                className="h-12 sm:h-16 md:h-20 w-auto filter brightness-0 invert cursor-pointer"
                data-cursor-logo
              />
            </div>
          </div>
          <div className="mb-8 animate-on-scroll" data-animation="animate-fade-in">
            <h1 className="text-3xl sm:text-5xl md:text-7xl text-white mb-6 sm:mb-8 leading-tight sm:leading-loose">
              <span className="font-normal">Transform</span> <span className="text-white font-bold">Legal</span> <span className="font-normal">Documents</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <div className="mt-2 sm:mt-4">
                <span className="text-white font-normal">
                  Into <span className="text-white font-bold">Intelligence</span>
                </span>
              </div>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
              DocuMint AI revolutionizes document analysis with cutting-edge artificial intelligence. 
              Upload any contract or legal document and get instant insights, risk assessments, and expert recommendations.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 animate-on-scroll px-4" data-animation="animate-slide-in-up">
            <button
              onClick={() => router.push('/upload')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Analyze Your First Document</span>
              <span className="sm:hidden">Start Analysis</span>
            </button>
            <button
              onClick={() => window.open('https://drive.google.com/file/d/1a__lcb3Ju-OXons_hp9Ldj4JiX_a0cYe/view?usp=sharing', '_blank')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
            >
              View Demo
            </button>
          </div>

          {/* Demo Preview */}
          <div className="relative animate-on-scroll px-2" data-animation="animate-scale-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 sm:p-8">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-2 sm:ml-4 text-gray-400 text-xs sm:text-sm">DocuMint AI Dashboard</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30 text-center">
                    <div className="flex justify-center mb-3">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Document Analysis</h3>
                    <p className="text-gray-300 text-sm">Real-time insights</p>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30 text-center">
                    <div className="flex justify-center mb-3">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Risk Assessment</h3>
                    <p className="text-gray-300 text-sm">Compliance check</p>
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30 text-center">
                    <div className="flex justify-center mb-3">
                      <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Smart Insights</h3>
                    <p className="text-gray-300 text-sm">AI recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-on-scroll" data-animation="animate-slide-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Our cutting-edge technology combines the power of Google's Gemini AI with 
              sophisticated document processing to deliver unparalleled insights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 group animate-on-scroll"
                data-animation="animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-blue-400 mb-3 sm:mb-4 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="px-4 sm:px-6 py-12 sm:py-20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="animate-on-scroll" data-animation="animate-slide-in-left">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8">
                  Why Choose
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    DocuMint AI?
                  </span>
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start sm:items-center gap-3">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-base sm:text-lg text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push('/upload')}
                  className="mt-6 sm:mt-8 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
                >
                  Start Analyzing Today
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="relative animate-on-scroll" data-animation="animate-slide-in-right">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/20">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-base sm:text-lg">1. Upload Document</h4>
                        <p className="text-gray-300 text-sm">Drag & drop any PDF or Word file</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-base sm:text-lg">2. AI Analysis</h4>
                        <p className="text-gray-300 text-sm">Advanced processing in seconds</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-base sm:text-lg">3. Get Insights</h4>
                        <p className="text-gray-300 text-sm">Actionable recommendations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto animate-on-scroll" data-animation="animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Document Workflow?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Join thousands of professionals who trust DocuMint AI to streamline their document analysis and make smarter decisions.
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl text-lg sm:text-xl font-bold transition-all duration-200 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white/10 overflow-hidden">
                <img 
                  src="/assets/documint-wide-transparent.png" 
                  alt="DocuMint AI" 
                  className="h-5 sm:h-6 w-auto filter brightness-0 invert"
                />
              </div>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm text-center" style={{fontFamily: "'TT Drugs Trial', sans-serif"}}>
              © 2025 DocuMint AI. Transforming documents with intelligence.
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        /* Smooth transition for page navigation */
        body {
          transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}