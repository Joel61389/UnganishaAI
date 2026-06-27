import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  Network, 
  CheckSquare, 
  TrendingUp, 
  HelpCircle,
  Coins,
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Link2,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers]         = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await axios.get('/analytics/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenUsers = () => {
    setShowUsers(true);
    fetchUsers();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 max-w-5xl mx-auto">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Aggregating platform analytics...</p>
      </div>
    );
  }

  const skillsData = {
    labels: data.top_skills.map(s => s.name),
    datasets: [{
      data: data.top_skills.map(s => s.count),
      backgroundColor: [
        'rgba(92, 122, 255, 0.65)',
        'rgba(255, 92, 71, 0.65)',
        'rgba(16, 185, 129, 0.65)',
        'rgba(245, 158, 11, 0.65)',
        'rgba(139, 92, 246, 0.65)',
      ],
      borderColor: [
        'rgba(92, 122, 255, 0.9)',
        'rgba(255, 92, 71, 0.9)',
        'rgba(16, 185, 129, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(139, 92, 246, 0.9)',
      ],
      borderWidth: 1,
    }],
  };

  const rolesData = {
    labels: data.most_requested_roles.map(r => r.name),
    datasets: [{
      label: 'Active Users',
      data: data.most_requested_roles.map(r => r.count),
      backgroundColor: 'rgba(92, 122, 255, 0.4)',
      borderColor: 'rgba(92, 122, 255, 0.85)',
      borderWidth: 1.5,
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Outfit, Inter, sans-serif', size: 11 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', font: { family: 'Outfit, Inter, sans-serif' } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', font: { family: 'Outfit, Inter, sans-serif' } } }
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: data.total_users,
      desc: 'Registered innovators',
      icon: Users,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
      clickable: true,
      onClick: handleOpenUsers
    },
    {
      title: 'Total Matches',
      value: data.total_matches,
      desc: 'Relationships mapped',
      icon: Network,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      clickable: false
    },
    {
      title: 'Introductions',
      value: data.total_introductions,
      desc: 'Warm connections made',
      icon: BarChart3,
      color: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
      clickable: false
    },
    {
      title: 'Verified Intros',
      value: data.verified_introductions,
      desc: 'Introductions marked useful',
      icon: CheckSquare,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      clickable: false
    },
    {
      title: 'Success Rate',
      value: `${data.match_success_rate}%`,
      desc: 'Introduction utility rate',
      icon: TrendingUp,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      clickable: false
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            Ecosystem Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Real-time statistics on community growth, skill distribution, and introduction success rates.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={stat.clickable ? stat.onClick : undefined}
              className={`p-4 rounded-2xl glass-card flex flex-col justify-between min-h-[120px] transition-all ${
                stat.clickable
                  ? 'cursor-pointer hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.title}</span>
                <span className={`p-1.5 rounded-lg border ${stat.color} flex items-center gap-1`}>
                  <Icon className="w-4 h-4" />
                  {stat.clickable && <ChevronRight className="w-3 h-3 opacity-60" />}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white block">{stat.value}</span>
                <span className="text-[10px] text-slate-500 leading-none">{stat.desc}</span>
                {stat.clickable && (
                  <span className="text-[9px] text-brand-400 font-semibold mt-1 block">Click to view list →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Web3 Panel */}
      <div className="p-6 rounded-2xl glass-panel-glow border-slate-800 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            Avalanche Fuji USDC Escrow Analytics
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Financial transparency report of connections facilitated through smart contracts.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Escrows</span>
            <span className="text-xl font-bold text-white block mt-1">{data.active_escrows}</span>
            <span className="text-[9px] text-slate-500">Currently locked fees</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Locked Volume</span>
            <span className="text-xl font-bold text-brand-300 block mt-1">{data.escrow_volume} USDC</span>
            <span className="text-[9px] text-slate-500">Secured connection funds</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Released Volume</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">{data.released_volume} USDC</span>
            <span className="text-[9px] text-slate-500">Successful payouts</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Refunded Volume</span>
            <span className="text-xl font-bold text-rose-400 block mt-1">{data.refunded_volume} USDC</span>
            <span className="text-[9px] text-slate-500">Returned user fees</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-panel-glow border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Top Skills Distribution</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Most common technologies and capabilities across user profiles.</p>
          </div>
          <div className="h-64 flex justify-center items-center">
            <Pie data={skillsData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } } } } }} />
          </div>
        </div>
        <div className="p-6 rounded-2xl glass-panel-glow border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active Ecosystem Roles</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Demographics break-down of the platform user base.</p>
          </div>
          <div className="h-64 flex justify-center items-center">
            <Bar data={rolesData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Explanatory footer */}
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-200">How the learning loop adapts:</p>
          <p className="mt-1">When users rate introductions positively (4-5 stars), the system saves the profile vector configurations. Over time, these configurations adjust similarity weights to emphasize skills or interests that historically yield successful matches.</p>
        </div>
      </div>

      {/* ── Registered Users Modal ─────────────────────────────────────── */}
      {showUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <Users className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registered Users</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{usersLoading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} registered on the platform`}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUsers(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 shrink-0">
              <div className="px-6 py-3 text-center">
                <span className="text-xl font-extrabold text-white block">{data.total_users}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Users</span>
              </div>
              <div className="px-6 py-3 text-center">
                <span className="text-xl font-extrabold text-violet-400 block">{data.total_matches}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Matches Made</span>
              </div>
              <div className="px-6 py-3 text-center">
                <span className="text-xl font-extrabold text-emerald-400 block">{data.total_introductions}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Introductions Sent</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-y-auto flex-1">
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-sm">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <UserCheck className="w-10 h-10 text-slate-700" />
                  <p className="text-slate-500 text-sm">No users registered yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                    <tr className="text-slate-500">
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Name / Role</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-center">Matches</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Name + Role */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{u.name}</p>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/15">
                                {u.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[160px]">{u.email}</span>
                            </div>
                            {u.phone !== 'N/A' && (
                              <div className="flex items-center gap-1 text-slate-500">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Location */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                            <span>{u.location}</span>
                          </div>
                          {u.organization !== 'N/A' && (
                            <div className="flex items-center gap-1 text-slate-500 mt-1">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">{u.organization}</span>
                            </div>
                          )}
                        </td>
                        {/* Matches */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.match_count > 0
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {u.match_count}
                          </span>
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{u.joined}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
