import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  RefreshCw,
  Trash2,
  Zap,
  BookOpen,
  Award,
  Code2,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ user, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello ${user ? user.name : 'UGI Student'}! I am Campus Study AI, your academic companion for UGI engineering subjects and AKTU exam preparation.

Missed a class or need a concept explained? Ask me about:
• Step-by-step matrix row operations & Cayley-Hamilton
• AKTU recurring questions & section marking breakdown
• Data Structures algorithms & C code traces
• Exam revision strategies`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'exam_specialist' | 'code_mentor'>('tutor');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Adjust model recommendation based on role
  const handleRoleChange = (role: 'tutor' | 'exam_specialist' | 'code_mentor') => {
    setSelectedRole(role);
    if (role === 'exam_specialist') {
      setSelectedModel('gemini-4-argon');
    } else if (role === 'code_mentor') {
      setSelectedModel('gemini-3.8-flash');
    } else {
      setSelectedModel('gemini-3.8-flash');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (customText || inputPrompt).trim();
    if (!promptToSend || isLoading) return;

    setErrorMsg('');
    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Send conversation history to server-side Gemini endpoint
      const payloadMessages = updatedHistory.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage({
        messages: payloadMessages,
        role: selectedRole,
        model: selectedModel,
      });

      const assistantMessage: Message = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: res.model || selectedModel,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Chat history cleared. How can I assist your study session today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:items-end p-2 sm:p-6 bg-charcoal/40 backdrop-blur-xs">
      <div className="bg-warm-white w-full max-w-lg h-[90vh] sm:h-[620px] rounded-2xl border border-[#E8D9B8] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="bg-[#FAF4E5] border-b border-[#E8D9B8] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bloodstone text-warm-white flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-serif font-bold text-bloodstone leading-tight">
                  Campus Study AI
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-vanilla text-bloodstone border border-vanilla-dark">
                  {selectedModel}
                </span>
              </div>
              <p className="text-[10px] text-charcoal/70">
                UGI Academic Syllabus & AKTU Exam Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 text-charcoal/60 hover:text-bloodstone rounded-lg hover:bg-vanilla/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-charcoal/60 hover:text-bloodstone rounded-lg hover:bg-vanilla/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Role Switcher & Model Controls */}
        <div className="bg-warm-white border-b border-[#E8D9B8]/70 px-4 py-2 flex items-center justify-between gap-2 text-xs shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleRoleChange('tutor')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedRole === 'tutor'
                  ? 'bg-bloodstone text-warm-white'
                  : 'bg-[#FAF4E5] text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Academic Tutor
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('exam_specialist')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedRole === 'exam_specialist'
                  ? 'bg-bloodstone text-warm-white'
                  : 'bg-[#FAF4E5] text-charcoal/70 hover:text-charcoal'
              }`}
            >
              AKTU PYQ Specialist
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('code_mentor')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedRole === 'code_mentor'
                  ? 'bg-bloodstone text-warm-white'
                  : 'bg-[#FAF4E5] text-charcoal/70 hover:text-charcoal'
              }`}
            >
              C / Coding Mentor
            </button>
          </div>

          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="text-[10px] font-mono bg-[#FAF4E5] border border-[#E8D9B8] rounded px-1.5 py-1 text-charcoal focus:ring-1 focus:ring-bloodstone shrink-0"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            <option value="gemini-4-argon">gemini-4-argon (Complex STEM)</option>
          </select>
        </div>

        {/* Scrollable Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-vanilla text-bloodstone flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 shadow-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-bloodstone text-warm-white rounded-br-xs'
                    : 'bg-[#FAF4E5]/80 text-charcoal border border-[#E8D9B8] rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>
                <div
                  className={`text-[9px] flex items-center justify-between gap-2 pt-1 border-t ${
                    msg.role === 'user'
                      ? 'text-warm-white/70 border-warm-white/20'
                      : 'text-charcoal/50 border-[#E8D9B8]/60'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span className="font-mono">{msg.modelUsed}</span>}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-bloodstone/10 text-bloodstone flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-vanilla text-bloodstone flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FAF4E5] p-3 rounded-2xl rounded-bl-xs border border-[#E8D9B8] text-xs text-charcoal/70 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-bloodstone" />
                <span>Consulting Gemini ({selectedModel})...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-bloodstone/10 border border-bloodstone/20 rounded-xl text-xs text-bloodstone">
              {errorMsg}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 bg-[#FAF4E5]/50 border-t border-[#E8D9B8]/60 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none shrink-0">
          {[
            'Explain Gauss-Jordan Inverse step-by-step',
            'AKTU 2024 high repeat questions for Maths-I',
            'How does AVL tree rotation work?',
            'C matrix multiplication algorithm',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(undefined, prompt)}
              className="px-2 py-0.5 rounded bg-warm-white hover:bg-vanilla border border-[#E8D9B8] text-charcoal/75 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-[#FAF4E5] border-t border-[#E8D9B8] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Ask a question about your subject, chapter, or exam..."
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 bg-warm-white border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-xs text-charcoal placeholder:text-charcoal/40"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 bg-bloodstone hover:bg-bloodstone-hover text-warm-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
