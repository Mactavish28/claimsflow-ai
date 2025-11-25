'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Bell,
  User,
  Car,
  MapPin,
  Calendar,
  ArrowLeft,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useClaimStore } from '@/store/claimStore';
import { Claim, ClaimStatus } from '@/types/claim';
import { format } from 'date-fns';

interface ClaimStatusPortalProps {
  claimId: string;
}

const STATUS_STEPS: { status: ClaimStatus; label: string; description: string }[] = [
  {
    status: 'fnol_complete',
    label: 'Claim Submitted',
    description: 'Your claim has been received',
  },
  {
    status: 'triage',
    label: 'Triage & Analysis',
    description: 'AI analyzing claim details',
  },
  {
    status: 'assigned',
    label: 'Adjuster Assigned',
    description: 'Claim assigned to specialist',
  },
  {
    status: 'investigation',
    label: 'Investigation',
    description: 'Gathering evidence and documentation',
  },
  {
    status: 'assessment',
    label: 'Damage Assessment',
    description: 'Evaluating repair costs',
  },
  {
    status: 'settlement',
    label: 'Settlement',
    description: 'Processing payment',
  },
  {
    status: 'closed',
    label: 'Closed',
    description: 'Claim resolved',
  },
];

export function ClaimStatusPortal({ claimId }: ClaimStatusPortalProps) {
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const { getClaim, updateClaim } = useClaimStore();

  useEffect(() => {
    const fetchedClaim = getClaim(claimId);
    if (fetchedClaim) {
      setClaim(fetchedClaim);
      // Mark notifications as read
      updateClaim(claimId, {
        notifications: fetchedClaim.notifications.map((n) => ({ ...n, read: true })),
      });
    }
    setLoading(false);
  }, [claimId, getClaim, updateClaim]);

  const getCurrentStepIndex = () => {
    if (!claim) return 0;
    const index = STATUS_STEPS.findIndex((step) => step.status === claim.status);
    return index === -1 ? 0 : index;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim Not Found</h2>
        <p className="text-gray-500 mb-4">
          The claim you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const unreadNotifications = claim.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Claim Status</h1>
              <p className="text-sm text-gray-500">
                #{claimId.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-6">Claim Progress</h2>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
            <div
              className="absolute left-4 top-4 w-0.5 bg-blue-600 transition-all duration-500"
              style={{
                height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="space-y-6">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-blue-600'
                          : isCurrent
                          ? 'bg-blue-600 ring-4 ring-blue-100'
                          : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 pb-6">
                      <p
                        className={`font-medium ${
                          isPending ? 'text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      {isCurrent && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Claim Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-600" />
              Vehicle Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Make/Model</span>
                <span className="text-gray-900">
                  {claim.vehicleInfo.make} {claim.vehicleInfo.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Year</span>
                <span className="text-gray-900">{claim.vehicleInfo.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Plate</span>
                <span className="text-gray-900">{claim.vehicleInfo.licensePlate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              Incident Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900 capitalize">
                  {claim.accidentType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900">
                  {format(new Date(claim.accidentDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900 truncate max-w-[180px]">
                  {claim.accidentLocation}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Adjuster */}
        {claim.assignedAdjuster && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              Your Claims Adjuster
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{claim.assignedAdjuster}</p>
                  <p className="text-sm text-gray-500">Claims Specialist</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                Contact
              </button>
            </div>
          </div>
        )}

        {/* Estimated Timeline */}
        {claim.estimatedCompletion && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <div>
                <p className="text-sm text-green-100">Estimated Resolution</p>
                <p className="font-semibold">
                  {format(new Date(claim.estimatedCompletion), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-600" />
            Recent Updates
          </h3>
          <div className="space-y-3">
            {claim.notifications.slice(-5).reverse().map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'status_update'
                      ? 'bg-blue-500'
                      : notification.type === 'assignment'
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push(`/triage/${claimId}`)}
            className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">View Triage Details</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/')}
            className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">File New Claim</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
