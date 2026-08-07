import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import type { LeaderboardUser } from '@/types';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard/')
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={24} className="text-yellow-500" />;
    if (index === 1) return <Medal size={24} className="text-gray-400" />;
    if (index === 2) return <Medal size={24} className="text-amber-700" />;
    return <span className="font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Trophy size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Global Leaderboard</h1>
          <p className="text-muted-foreground mt-1">See how you stack up against top candidates</p>
        </div>
      </motion.div>

      <Card className="p-0 overflow-hidden border border-border bg-card shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading rankings...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No rankings available yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((user, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={user.id} 
                className="flex items-center justify-between p-4 md:p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-8 flex justify-center items-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-background shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Award size={14} /> {user.interviews_done} Interviews Completed
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{user.avg_score}</span>
                    <span className="text-sm text-indigo-500 ml-1 font-medium">avg score</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
