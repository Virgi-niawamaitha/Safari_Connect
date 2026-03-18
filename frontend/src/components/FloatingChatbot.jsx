import { useCallback, useEffect, useRef, useState } from 'react';
import { requestSafe } from '../lib/api';

export default function FloatingChatbot({ role = 'user' }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [ttsSupported] = useState(() => Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance));
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [speakReplies, setSpeakReplies] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      by: 'assistant',
      text: role === 'owner'
        ? 'Hi, I can help with routes, occupancy, and schedule decisions.'
        : role === 'admin'
          ? 'Hi, I can summarize platform risk and operational insights.'
          : 'Hi, I can help you find trips, compare prices, and answer booking questions.'
    }
  ]);
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const openRef = useRef(open);
  const languageRef = useRef(language);
  const sendRef = useRef(null);
  const sendingRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  const speak = useCallback((text) => {
    if (!ttsSupported || !speakReplies || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = language === 'sw' ? 'sw-KE' : 'en-US';
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang === targetLang)
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(language === 'sw' ? 'sw' : 'en'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [language, speakReplies, ttsSupported]);

  const playAudio = useCallback((audioBase64, audioMimeType) => {
    if (!audioBase64 || !audioMimeType || !speakReplies) return false;
    try {
      const source = `data:${audioMimeType};base64,${audioBase64}`;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const player = new Audio(source);
      audioRef.current = player;
      player.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }, [speakReplies]);

  const send = useCallback(async (rawText, options = {}) => {
    const text = String(rawText || '').trim();
    if (!text || sendingRef.current) return;
    const mode = options.mode || 'chat';

    const userMsg = { id: `u-${Date.now()}`, by: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    sendingRef.current = true;
    setSending(true);

    const endpoint = mode === 'voice' ? '/ai/voice' : '/ai/chat';
    const payload = mode === 'voice'
      ? { transcript: text, language }
      : { text, language };

    const response = await requestSafe(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const aiText = response?.data?.replyText
      || response?.data?.message
      || response?.message
      || 'AI service is currently offline. Ensure backend (3215) and AI agent (4100) are both running, then try again.';
    const aiMsg = { id: `a-${Date.now()}`, by: 'assistant', text: aiText };
    setMessages((prev) => [...prev, aiMsg]);
    const played = playAudio(response?.data?.audioBase64, response?.data?.audioMimeType);
    if (!played) {
      speak(aiText);
    }
    if (!openRef.current) {
      setUnreadCount((prev) => prev + 1);
    }
    sendingRef.current = false;
    setSending(false);
  }, [language, playAudio, speak]);

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  useEffect(() => {
    if (!voiceSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = languageRef.current === 'sw' ? 'sw-KE' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setInput(transcript);
        if (sendRef.current) {
          sendRef.current(transcript, { mode: 'voice' });
        }
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [voiceSupported]);

  useEffect(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = language === 'sw' ? 'sw-KE' : 'en-US';
  }, [language]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div className="chatbot-root" aria-live="polite">
      <div className={`chatbot-panel ${open ? 'open' : 'closed'}`} role="dialog" aria-label="AI Assistant" aria-hidden={!open}>
          <div className="chatbot-header">
            <div className="chatbot-title-wrap">
              <div className="chatbot-title">AI Assistant</div>
              <div className="chatbot-sub">Safari Connect {listening ? '• Listening' : ''}</div>
            </div>
            <button className="chatbot-icon-btn" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>

          <div className="chatbot-quick-actions">
            <button className="chatbot-chip" onClick={() => send('Find me the cheapest route today under KES 1000.')}>Cheap route</button>
            <button className="chatbot-chip" onClick={() => send('Any delay risk for Nairobi to Nakuru this evening?')}>Delay check</button>
            <button className="chatbot-chip" onClick={() => send('How can I pay safely using M-Pesa?')}>Payment tip</button>
          </div>

          <div className="chatbot-controls">
            <label className="chatbot-control-label" htmlFor="chatbot-language">Language</label>
            <select
              id="chatbot-language"
              className="chatbot-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>

            <label className="chatbot-tts-toggle">
              <input
                type="checkbox"
                checked={speakReplies}
                onChange={(event) => setSpeakReplies(event.target.checked)}
              />
              <span>Speak replies</span>
            </label>
          </div>

          <div className="chatbot-messages" ref={listRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg ${msg.by === 'user' ? 'user' : 'assistant'}`}>
                {msg.text}
              </div>
            ))}
            {sending && <div className="chatbot-msg assistant">Thinking...</div>}
          </div>

          <div className="chatbot-input-wrap">
            <input
              className="chatbot-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') send(input);
              }}
              placeholder="Ask about trips, prices, risk..."
            />
            {voiceSupported && (
              <button
                className={`chatbot-voice ${listening ? 'active' : ''}`}
                onClick={toggleVoice}
                type="button"
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                title={listening ? 'Stop voice input' : 'Speak your message'}
              >
                {listening ? '■' : '🎤'}
              </button>
            )}
            <button className="chatbot-send" onClick={() => send(input)} disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
      </div>

      <button
        className="chatbot-launcher"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) setUnreadCount(0);
            return next;
          });
        }}
        aria-label="Open AI assistant"
      >
        {open ? '×' : 'AI'}
        {unreadCount > 0 && !open && <span className="chatbot-unread">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
    </div>
  );
}
