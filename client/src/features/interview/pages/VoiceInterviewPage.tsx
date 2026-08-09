import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, StopCircle, Brain, Volume2, Loader2, Play } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { CurrentQuestion } from '@/types';

export default function VoiceInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // STT MediaRecorder setup
  const sttRecorderRef = useRef<MediaRecorder | null>(null);
  const sttChunksRef = useRef<Blob[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    let mounted = true;
    let localStream: MediaStream | null = null;

    // Load Interview
    api.get(`/interviews/${id}/`).then((res) => {
      if (!mounted) return;
      const interview = res.data;
      if (interview.status === 'completed') {
        navigate(`/interviews/${id}/results`);
        return;
      }
      
      const unanswered = interview.questions?.find((q: any) => !q.answer);
      if (unanswered) {
        setCurrentQuestion({
          id: unanswered.id,
          text: unanswered.question_text,
          number: unanswered.order,
          total: interview.total_questions,
        });
        setMessages([{ role: 'ai', content: unanswered.question_text }]);
        // Don't auto-speak on load to prevent browser blocks, wait for user interaction
      }
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    // Initialize Media Streams - audio only (no camera needed)
    if (navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((mediaStream) => {
          if (!mounted) {
            mediaStream.getTracks().forEach(track => track.stop());
            return;
          }
          localStream = mediaStream;
          streamRef.current = mediaStream;
        })
        .catch((err) => {
          console.error("Media access denied:", err);
          if (mounted) toast.error("Microphone access is required for voice interview.");
        });
    } else {
      if (mounted) {
        toast.error("Microphone requires HTTPS on mobile devices.", {
          description: "Browsers block microphone access over plain http:// on IP addresses. Use localtunnel or HTTPS.",
          duration: 8000
        });
      }
    }

    return () => {
      mounted = false;
      synthRef.current.cancel();
      if (sttRecorderRef.current && sttRecorderRef.current.state !== 'inactive') {
        sttRecorderRef.current.stop();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, navigate]);

  const speakText = (text: string) => {
    if (!text) return;
    
    // Stop any existing audio stream
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = text.replace(/[*_#`~]/g, '').trim();

    try {
      const ttsUrl = `/api/interviews/tts/?text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(ttsUrl);
      audioRef.current = audio;
      
      setIsAiSpeaking(true);
      
      audio.onended = () => {
        setIsAiSpeaking(false);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        console.warn("Backend MP3 stream error, resorting to Web Speech API...");
        fallbackSpeechSynth(cleanText);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio element play error:", err);
          fallbackSpeechSynth(cleanText);
        });
      }
    } catch (e) {
      console.error(e);
      fallbackSpeechSynth(cleanText);
    }
  };

  const fallbackSpeechSynth = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsAiSpeaking(false);
      return;
    }

    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      if (synth.paused) synth.resume();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        
        const voices = synth.getVoices();
        if (voices && voices.length > 0) {
          const preferredVoice = voices.find(v => 
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Microsoft'))
          ) || voices.find(v => v.lang.startsWith('en'));
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.rate = 0.95;
        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        utterance.onerror = () => setIsAiSpeaking(false);

        synth.speak(utterance);
      }, 50);
    } catch {
      setIsAiSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (sttRecorderRef.current && sttRecorderRef.current.state === 'recording') {
        sttRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // If AI is speaking, stop it
      if (isAiSpeaking) {
        synthRef.current.cancel();
        setIsAiSpeaking(false);
      }

      setTranscript(''); // Clear previous transcript
      
      if (streamRef.current) {
        try {
          const recorder = new MediaRecorder(streamRef.current);
          sttChunksRef.current = [];
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) sttChunksRef.current.push(e.data);
          };
          
          recorder.onstop = async () => {
            setLoading(true);
            const blob = new Blob(sttChunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'speech.webm');
            
            try {
              const res = await api.post('/interviews/transcribe/', formData, {
                 headers: { 'Content-Type': 'multipart/form-data' }
              });
              setTranscript(res.data.text || "Could not transcribe audio.");
            } catch (err) {
              console.error(err);
              toast.error("Failed to transcribe audio with Groq.");
            } finally {
              setLoading(false);
            }
          };
          
          sttRecorderRef.current = recorder;
          recorder.start();
          setIsRecording(true);
        } catch (e) {
          toast.error("Could not start speech recognition.");
        }
      } else {
        toast.error("Microphone not connected.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      toast.error('No speech detected');
      return;
    }

    if (isRecording) {
      if (sttRecorderRef.current && sttRecorderRef.current.state === 'recording') {
        sttRecorderRef.current.stop();
      }
      setIsRecording(false);
    }

    const answerText = transcript;
    setTranscript('');
    setMessages(prev => [...prev, { role: 'user', content: answerText }]);
    setLoading(true);

    try {
      const res = await api.post(`/interviews/${id}/answer/`, { answer_text: answerText });
      
      // Show score toast
      // Intermediate score recorded silently for final results page

      if (res.data.is_complete) {
        // Stop audio tracks
        if (sttRecorderRef.current && sttRecorderRef.current.state !== 'inactive') {
          sttRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        toast.success('Interview completed!');
        setTimeout(() => navigate(`/interviews/${id}/results`), 2000);
      } else {
        const nextQ = res.data.current_question;
        setCurrentQuestion(nextQ);
        setMessages(prev => [...prev, { role: 'ai', content: nextQ.text }]);
        speakText(nextQ.text);
      }
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    setLoading(true);
    try {
      if (sttRecorderRef.current && sttRecorderRef.current.state !== 'inactive') {
        sttRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      await api.post(`/interviews/${id}/end/`);
      navigate(`/interviews/${id}/results`);
    } catch {
      toast.error('Failed to end interview');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Volume2 className="w-6 h-6 text-indigo-400" /> Voice Interview
          </h1>
          {currentQuestion && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Question {currentQuestion.number} of {currentQuestion.total}
            </p>
          )}
        </div>
        
        <button
          onClick={endInterview}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <StopCircle className="w-4 h-4" /> End Session
        </button>
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
        
        {/* Visualizer Ring */}
        <div className="relative flex items-center justify-center mb-12">
          {isAiSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute w-48 h-48 rounded-full border-2 border-indigo-500/30"
            />
          )}
          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute w-48 h-48 rounded-full border-2 border-emerald-500/30"
            />
          )}
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl z-10 transition-colors duration-500
            ${isAiSpeaking ? 'gradient-primary' : isRecording ? 'bg-emerald-500' : 'glass-card'}`}
          >
            {loading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isAiSpeaking ? (
              <Brain className="w-12 h-12 text-white" />
            ) : isRecording ? (
              <Mic className="w-12 h-12 text-white" />
            ) : (
              <MicOff className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
            )}
          </div>
        </div>

        {/* Text Display */}
        <div className="w-full max-w-2xl text-center space-y-6">
          <AnimatePresence mode="wait">
            {messages[messages.length - 1]?.role === 'ai' ? (
              <motion.div
                key="ai-msg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-xl md:text-2xl font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  "{messages[messages.length - 1].content}"
                </p>
                <button
                  onClick={() => {
                    if (isAiSpeaking) {
                      window.speechSynthesis?.cancel();
                      setIsAiSpeaking(false);
                    } else {
                      speakText(messages[messages.length - 1].content);
                    }
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2 mx-auto transition-colors"
                >
                  {isAiSpeaking ? (
                    <>
                      <StopCircle className="w-4 h-4 text-red-400" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" /> Play Audio
                    </>
                  )}
                </button>
              </motion.div>
            ) : transcript || messages[messages.length - 1]?.role === 'user' ? (
              <motion.div
                key="user-msg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-lg leading-relaxed text-emerald-400">
                  {transcript || messages[messages.length - 1].content}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <button
          onClick={toggleRecording}
          disabled={loading || isAiSpeaking}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100
            ${isRecording ? 'bg-red-500 text-white shadow-red-500/25' : 'bg-indigo-500 text-white shadow-indigo-500/25'}`}
        >
          {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {isRecording ? 'Tap to stop recording' : 'Tap to start speaking'}
        </p>

        {transcript && !isRecording && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white gradient-primary mt-4
              transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
