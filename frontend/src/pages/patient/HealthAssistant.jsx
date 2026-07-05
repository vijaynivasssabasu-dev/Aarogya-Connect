import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import { Bot, Send, User, Sparkles, FolderHeart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HealthAssistant() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I\'m your AI Health Assistant. I have analyzed your unified medical records and scanning histories across all partner hospitals.\n\nAsk me anything about your diagnoses, prescriptions, symptoms, or general medical queries.\n\n*Note: I provide general health guidelines. Please consult your physician for clinical diagnoses.*',
  }]);
  const [records, setRecords] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Pre-fetch records to bind context
    api.get('/medical-records/my')
      .then(({ data }) => setRecords(data.records || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const conversationHistory = messages.filter(m => m.role !== 'system');
      const { data } = await api.post('/health-assistant/chat', {
        message: userMessage,
        conversationHistory,
        patientRecords: records // Pass lifetime records into LLM context!
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Health Assistant</h1>
            <p className="text-xs text-gray-500">Personalized Copilot • Powered by Claude</p>
          </div>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-100">
            <FolderHeart className="w-4 h-4 text-purple-600" />
            <span>Integrated Profile: {records.length} lifetime record(s) analyzed</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-md' : 'bg-gray-100 text-gray-800 rounded-tl-md'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-primary-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-gray-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your diagnostics, vitals, or allergies..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary !px-4">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
