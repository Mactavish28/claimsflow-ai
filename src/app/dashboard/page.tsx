'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Activity,
  Shield,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useClaimStore } from '@/store/claimStore';
import { Claim, ClaimStatus } from '@/types/claim';
import { format } from 'date-fns';

const STATUS_LABELS: Record<ClaimStatus, { label: string; color: string }> = {
  fnol_in_progress: { label: 'FNOL In Progress', color: 'bg-gray-100 text-gray-700' },
  fnol_complete: { label: 'Pending Triage', color: 'bg-yellow-100 text-yellow-700' },
  triage: { label: 'In Triage', color: 'bg-blue-100 text-blue-700' },
  assigned: { label: 'Assigned', color: 'bg-purple-100 text-purple-700' },
  investigation: { label: 'Investigation', color: 'bg-orange-100 text-orange-700' },
  assessment: { label: 'Assessment', color: 'bg-cyan-100 text-cyan-700' },
  settlement: { label: 'Settlement', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600' },
};

const ADJUSTER_TYPE_LABELS: Record<string, string> = {
  junior: 'Junior Adjuster',
  senior: 'Senior Adjuster',
  specialist: 'Specialist',
  siu: 'SIU Team',
};

export default function DashboardPage() {
  const router = useRouter();
  const { claims } = useClaimStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'closed'>('all');

  const filteredClaims = claims.filter((claim) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['fnol_complete', 'triage'].includes(claim.status);
    if (filter === 'active') return ['assigned', 'investigation', 'assessment', 'settlement'].includes(claim.status);
    if (filter === 'closed') return claim.status === 'closed';
    return true;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter((c) => ['fnol_complete', 'triage'].includes(c.status)).length,
    active: claims.filter((c) => ['assigned', 'investigation', 'assessment', 'settlement'].includes(c.status)).length,
    highRisk: claims.filter((c) => c.scores && c.scores.fraudRisk > 50).length,
  };

  const getFraudRiskLevel = (score: number) => {
    if (score > 60) return { label: 'High', color: 'text-red-600 bg-red-50' };
    if (score > 30) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Low', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Adjuster Dashboard</h1>
                <p className="text-sm text-gray-500">Claims management & triage overview</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Claim
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Activity className="w-4 h-4" />
              Total Claims
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-yellow-600 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Pending Triage
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
              <Users className="w-4 h-4" />
              Active Claims
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
              <Shield className="w-4 h-4" />
              High Risk
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.highRisk}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Claims Queue</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Claims</option>
                <option value="pending">Pending Triage</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No claims found</p>
              <button
                onClick={() => router.push('/')}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                File a new claim to get started
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/status/${claim.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-gray-900">
                          #{claim.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[claim.status].color}`}>
                          {STATUS_LABELS[claim.status].label}
                        </span>
                        {claim.scores && claim.scores.fraudRisk > 50 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Risk
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{claim.customerName}</span>
                        <span>•</span>
                        <span>{claim.vehicleInfo.year} {claim.vehicleInfo.make} {claim.vehicleInfo.model}</span>
                        <span>•</span>
                        <span className="capitalize">{claim.accidentType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {claim.scores && (
                        <div className="hidden md:flex items-center gap-4 text-xs">
                          <div className="text-center">
                            <p className="text-gray-400">Complexity</p>
                            <p className="font-semibold text-gray-700">{claim.scores.complexity}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Severity</p>
                            <p className="font-semibold text-gray-700">{claim.scores.severity}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Fraud Risk</p>
                            <p className={`font-semibold px-2 py-0.5 rounded ${getFraudRiskLevel(claim.scores.fraudRisk).color}`}>
                              {claim.scores.fraudRisk}%
                            </p>
                          </div>
                        </div>
                      )}

                      {claim.routing && (
                        <div className="hidden lg:block text-right text-xs">
                          <p className="text-gray-400">Routed To</p>
                          <p className="font-medium text-gray-700">
                            {ADJUSTER_TYPE_LABELS[claim.routing.adjusterType]}
                          </p>
                        </div>
                      )}

                      <div className="text-right text-xs">
                        <p className="text-gray-400">Filed</p>
                        <p className="text-gray-600">{format(new Date(claim.createdAt), 'MMM d, h:mm a')}</p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

