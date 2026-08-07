import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Award, TrendingUp, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';

interface AdminStats {
  total_users: number;
  new_users_30d: number;
  total_interviews: number;
  completed_interviews: number;
  avg_score: number;
  total_certificates: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/analytics/');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform overview and management</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                <Users size={24} />
              </div>
              <span className="text-sm font-medium text-green-600">+{stats.new_users_30d} this month</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_users}</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                <Video size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completed Interviews</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.completed_interviews} <span className="text-lg text-gray-400 font-normal">/ {stats.total_interviews}</span>
            </h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Global Avg Score</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.avg_score}%</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl">
                <Award size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Certificates Issued</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_certificates}</h3>
          </Card>
        </div>
      )}

      {/* Additional admin panels for users/prompts could go here */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <p className="text-gray-500 mb-4">More detailed management panels for Users and Prompts are coming soon.</p>
      </Card>
    </div>
  );
}
