'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Shield,
  Star,
  Clock,
  ArrowRight,
  CheckCircle,
  UserCheck,
  Zap,
  TrendingUp,
  FileText,
  Camera,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { ScoreCard } from './ScoreCard';
import { useClaimStore } from '@/store/claimStore';
import { Claim, ClaimScores, RoutingRecommendation } from '@/types/claim';

function generateDynamicInsights(claim: Claim, scores: ClaimScores): { icon: React.ReactNode; text: string }[] {
  const insights: { icon: React.ReactNode; text: string }[] = [];

  if (claim.photos.length >= 3) {
    insights.push({
      icon: <Camera className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: `${claim.photos.length} photos uploaded — sufficient documentation for faster assessment`,
    });
  } else if (claim.photos.length > 0) {
    insights.push({
      icon: <Camera className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: `${claim.photos.length} photo(s) received — additional photos may speed up processing`,
    });
  } else {
    insights.push({
      icon: <Camera className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: 'No photos uploaded — your adjuster may request photos to proceed',
    });
  }

  if (claim.description.length > 100) {
    insights.push({
      icon: <FileCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: 'Detailed incident description provided — helps expedite review',
    });
  } else {
    insights.push({
      icon: <FileCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: 'Brief description noted — your adjuster may follow up for more details',
    });
  }

  if (scores.complexity <= 4 && scores.severity <= 4) {
    insights.push({
      icon: <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: 'Claim complexity is low — eligible for expedited processing',
    });
  } else if (scores.complexity >= 7 || scores.severity >= 7) {
    insights.push({
      icon: <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: 'Claim requires specialist review — assigned to experienced adjuster',
    });
  }

  switch (claim.accidentType) {
    case 'collision':
      insights.push({
        icon: <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
        text: 'Collision claims typically resolve within 2-3 weeks with complete documentation',
      });
      break;
    case 'theft':
      insights.push({
        icon: <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
        text: 'Theft claim registered — police report will be requested if not already provided',
      });
      break;
    case 'hit_and_run':
      insights.push({
        icon: <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
        text: 'Hit-and-run claims are prioritized — your adjuster will contact you within 24 hours',
      });
      break;
    case 'weather':
      insights.push({
        icon: <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
        text: 'Weather-related damage confirmed — no additional verification typically required',
      });
      break;
    case 'vandalism':
      insights.push({
        icon: <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
        text: 'Vandalism claim noted — police report recommended for faster processing',
      });
      break;
    default:
      insights.push({
        icon: <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
        text: 'Your claim is being processed according to standard procedures',
      });
  }

  if (scores.urgency >= 7) {
    insights.push({
      icon: <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />,
      text: 'High priority flag applied — expect faster initial contact',
    });
  }

  return insights.slice(0, 4);
}

interface TriageDashboardProps {
  claimId: string;
}

export function TriageDashboard({ claimId }: TriageDashboardProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [scores, setScores] = useState<ClaimScores | null>(null);
  const [routing, setRouting] = useState<RoutingRecommendation | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);

  const { getClaim, calculateScores, generateRouting, updateClaim, addNotification } =
    useClaimStore();

  useEffect(() => {
    const fetchedClaim = getClaim(claimId);
    if (fetchedClaim) {
      setClaim(fetchedClaim);

      // Simulate AI analysis process
      const analyzeProcess = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const calculatedScores = calculateScores(claimId);
        setScores(calculatedScores);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const generatedRouting = generateRouting(claimId, calculatedScores);
        setRouting(generatedRouting);

        // Add notification
        addNotification(claimId, {
          type: 'status_update',
          message: `Claim triaged successfully. Routed to ${generatedRouting.adjusterType} adjuster.`,
          read: false,
        });

        setIsAnalyzing(false);
      };

      if (!fetchedClaim.scores) {
        analyzeProcess();
      } else {
        setScores(fetchedClaim.scores);
        setRouting(fetchedClaim.routing || null);
        setIsAnalyzing(false);
      }
    }
  }, [claimId, getClaim, calculateScores, generateRouting, addNotification]);

  const handleAssign = () => {
    if (!claim) return;

    const adjusterNames: Record<string, string> = {
      junior: 'Alex Thompson',
      senior: 'Sarah Mitchell',
      specialist: 'Dr. Michael Chen',
      siu: 'James Rodriguez (SIU)',
    };

    updateClaim(claimId, {
      status: 'assigned',
      assignedAdjuster: adjusterNames[routing?.adjusterType || 'junior'],
      estimatedCompletion: new Date(
        Date.now() + (routing?.estimatedResolutionDays || 14) * 24 * 60 * 60 * 1000
      ),
    });

    addNotification(claimId, {
      type: 'assignment',
      message: `Your claim has been assigned to ${adjusterNames[routing?.adjusterType || 'junior']}.`,
      read: false,
    });

    router.push(`/status/${claimId}`);
  };

  if (!claim) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Claim not found</p>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AI Analyzing Claim
          </h2>
          <p className="text-gray-500">
            Calculating scores and determining optimal routing...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Triage & Assignment
              </h1>
              <p className="text-sm text-gray-500">
                Claim #{claimId.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  routing?.stpEligible
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {routing?.stpEligible ? 'STP Eligible' : 'Standard Processing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Claim Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Claim Summary
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Policy Holder:</span>
              <span className="ml-2 text-gray-900">{claim.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500">Vehicle:</span>
              <span className="ml-2 text-gray-900">
                {claim.vehicleInfo.year} {claim.vehicleInfo.make}{' '}
                {claim.vehicleInfo.model}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Incident Type:</span>
              <span className="ml-2 text-gray-900 capitalize">
                {claim.accidentType.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="ml-2 text-gray-900">{claim.accidentLocation}</span>
            </div>
          </div>
        </div>

        {/* Score Cards */}
        {scores && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ScoreCard
              title="Complexity Score"
              score={scores.complexity}
              maxScore={10}
              icon={<Activity className="w-4 h-4 text-purple-600" />}
              description="Predicted investigation difficulty based on claim characteristics"
              colorClass="bg-purple-100"
            />
            <ScoreCard
              title="Severity Score"
              score={scores.severity}
              maxScore={10}
              icon={<AlertTriangle className="w-4 h-4 text-orange-600" />}
              description="Estimated financial exposure and reserve recommendation"
              colorClass="bg-orange-100"
            />
            <ScoreCard
              title="Fraud Risk Score"
              score={scores.fraudRisk}
              maxScore={100}
              icon={<Shield className="w-4 h-4 text-red-600" />}
              description="Probability of fraudulent activity requiring SIU review"
              colorClass="bg-red-100"
            />
            <ScoreCard
              title="Customer Value"
              score={scores.customerValue}
              maxScore={100}
              icon={<Star className="w-4 h-4 text-yellow-600" />}
              description="Lifetime value, retention risk, policy portfolio"
              colorClass="bg-yellow-100"
            />
            <ScoreCard
              title="Urgency Score"
              score={scores.urgency}
              maxScore={10}
              icon={<Clock className="w-4 h-4 text-blue-600" />}
              description="Time-sensitivity based on customer situation"
              colorClass="bg-blue-100"
            />
          </div>
        )}

        {/* Routing Recommendation */}
        {routing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              AI Routing Recommendation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Assigned To</span>
                </div>
                <p className="font-semibold text-gray-900 capitalize">
                  {routing.adjusterType === 'siu'
                    ? 'Special Investigation Unit'
                    : `${routing.adjusterType} Adjuster`}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Est. Resolution</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {routing.estimatedResolutionDays} days
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Processing Type</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {routing.stpEligible ? 'Straight-Through' : 'Standard'}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Routing Rationale</p>
                  <p className="text-sm text-blue-700 mt-1">{routing.reason}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleAssign}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              Confirm Assignment & View Status
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Insights */}
        {scores && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">Claim Analysis Summary</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              {generateDynamicInsights(claim, scores).map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  {insight.icon}
                  {insight.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
