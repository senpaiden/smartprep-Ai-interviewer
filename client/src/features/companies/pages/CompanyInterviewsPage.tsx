import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Play, ArrowRight, BrainCircuit, Code, MessageSquare, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';

interface InterviewSet {
  id: string;
  title: string;
  round_type: string;
  difficulty: string;
  questions: string[];
}

interface Company {
  id: string;
  name: string;
  logo_url: string;
  industry: string;
  description: string;
  interview_sets: InterviewSet[];
}

const RoundIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'technical': return <BrainCircuit className="text-blue-500" size={18} />;
    case 'coding': return <Code className="text-purple-500" size={18} />;
    case 'behavioral': return <MessageSquare className="text-green-500" size={18} />;
    default: return <Briefcase className="text-gray-500" size={18} />;
  }
};

export default function CompanyInterviewsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await api.get('/interviews/companies/');
        setCompanies(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error(err);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const startSet = async (setId: string, companyName: string, roundType: string) => {
    try {
      const { data } = await api.post('/interviews/start/', {
        interview_type: 'company_specific',
        difficulty: 'medium',
        duration_minutes: 30,
        total_questions: 5,
        language: 'English',
        tech_stack: [],
        company: companyName
      });
      navigate(`/interviews/${data.interview.id}/voice`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} />
            Company Interviews
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Practice with real interview questions from top tech companies.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..." 
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading companies...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filtered.map(company => (
            <Card key={company.id} className="p-0 overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 p-2 overflow-hidden border border-gray-100">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Building2 className="text-gray-400" size={24} />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Interview Sets</h3>
                {company.interview_sets.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No interview sets available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.interview_sets.map(set => (
                      <div key={set.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                            <RoundIcon type={set.round_type} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{set.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{set.questions.length} questions • {set.difficulty}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => startSet(set.id, company.name, set.round_type)}
                          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Start <ArrowRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
