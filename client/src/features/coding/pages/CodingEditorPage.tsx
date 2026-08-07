import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Code2, Loader2, ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CodingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get(`/coding/challenges/${id}/`)
      .then((res) => {
        setChallenge(res.data);
        setCode(res.data.starter_code?.python || '');
      })
      .catch(() => toast.error('Failed to load challenge'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (challenge?.starter_code?.[lang]) {
      setCode(challenge.starter_code[lang]);
    } else {
      setCode('');
    }
  };

  const handleRun = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post(`/coding/challenges/${id}/submit/`, {
        code,
        language
      });
      setResult(res.data);
      if (res.data.status === 'accepted') {
        toast.success('All tests passed!');
      } else {
        toast.error('Some tests failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Execution failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!challenge) return <div>Not found</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left panel: Problem description */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-hidden">
        <div className="glass-card flex-1 overflow-y-auto p-6 rounded-2xl flex flex-col">
          <Link to="/coding" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Challenges
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded text-xs font-bold uppercase" style={{
              background: challenge.difficulty === 'easy' ? '#10b98115' : challenge.difficulty === 'medium' ? '#f59e0b15' : '#ef444415',
              color: challenge.difficulty === 'easy' ? '#10b981' : challenge.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
            }}>
              {challenge.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-white/5 text-white/60 capitalize">
              {challenge.category?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{challenge.title}</h1>
          <div 
            className="prose prose-invert prose-sm max-w-none flex-1 mb-6" 
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: challenge.description.replace(/\n/g, '<br />') }}
          />
          
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold mb-3 text-indigo-400">Test Cases</h3>
            <div className="space-y-3">
              {challenge.public_test_cases?.map((tc: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-black/20 text-xs font-mono space-y-2">
                  <div><span className="text-white/40">Input:</span> <span className="text-emerald-400">{tc.input}</span></div>
                  <div><span className="text-white/40">Expected:</span> <span className="text-indigo-400">{tc.expected_output}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Editor and Terminal */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-hidden">
        {/* Editor Area */}
        <div className="glass-card flex-1 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-black/20 border outline-none text-sm rounded-lg px-3 py-1.5 focus:border-indigo-500"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <button
              onClick={handleRun}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium gradient-primary text-white hover:scale-105 transition-transform disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              {submitting ? 'Running...' : 'Run Code'}
            </button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card rounded-2xl overflow-hidden max-h-[30vh] flex flex-col"
          >
            <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Result: 
                <span className={result.status === 'accepted' ? 'text-emerald-400' : 'text-red-400'}>
                  {result.status.replace('_', ' ').toUpperCase()}
                </span>
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {result.execution_time_ms} ms</span>
                <span>{result.passed_tests} / {result.total_tests} Tests Passed</span>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4 font-mono text-sm">
              {result.status === 'compilation_error' && (
                <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 whitespace-pre-wrap">
                  {result.compile_output || result.stderr}
                </div>
              )}
              
              {result.test_results?.map((tr: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-xl border ${tr.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {tr.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    <span className="font-bold text-white">Test Case {tr.test_case}</span>
                  </div>
                  {!tr.passed && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-white/40 text-xs mb-1">Your Output:</div>
                        <div className="text-red-400 whitespace-pre-wrap">{tr.output || tr.error || 'No output'}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs mb-1">Expected:</div>
                        <div className="text-emerald-400 whitespace-pre-wrap">{tr.expected}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
