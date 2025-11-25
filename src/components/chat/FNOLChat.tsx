'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { PhotoUpload } from './PhotoUpload';
import { useClaimStore } from '@/store/claimStore';
import { AccidentType, FNOLStep, ClaimPhoto } from '@/types/claim';

const ACCIDENT_TYPES: { value: AccidentType; label: string }[] = [
  { value: 'collision', label: 'Collision with another vehicle' },
  { value: 'hit_and_run', label: 'Hit and run' },
  { value: 'weather', label: 'Weather-related damage' },
  { value: 'theft', label: 'Theft or attempted theft' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'other', label: 'Other' },
];

const AI_HINTS: Record<string, string[]> = {
  collision: [
    'Pattern detected: Intersection collision - gathering additional witness info may expedite claim',
    'Similar claims in this area have 85% resolution rate within 7 days',
  ],
  theft: [
    'Alert: Theft claims require police report - will request documentation',
    'GPS data request initiated for vehicle location history',
  ],
  hit_and_run: [
    'Priority flag: Hit-and-run claims fast-tracked for investigation',
    'Checking traffic camera databases in reported area',
  ],
  weather: [
    'Weather data confirms severe conditions reported in your area on claim date',
    'Multiple weather-related claims from this region - batch processing available',
  ],
};

export function FNOLChat() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showAccidentTypes, setShowAccidentTypes] = useState(false);
  const [claimComplete, setClaimComplete] = useState(false);
  const [completedClaimId, setCompletedClaimId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    currentSession,
    startFNOLSession,
    addMessage,
    updateCollectedData,
    setCurrentStep,
    completeFNOL,
  } = useClaimStore();

  useEffect(() => {
    if (!currentSession) {
      startFNOLSession();
    }
  }, [currentSession, startFNOLSession]);

  useEffect(() => {
    if (currentSession && currentSession.messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `Hello! I'm your ClaimsFlow AI assistant, and I'm here to help you report your vehicle insurance claim quickly and easily.

I'll guide you through the process step by step. First, I need to verify your policy.

Could you please provide your policy number? It should be on your insurance card or in your policy documents.`,
        });
        setCurrentStep('policy_verification');
      }, 500);
    }
  }, [currentSession, addMessage, setCurrentStep]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, showPhotoUpload]);

  const simulateTyping = async (callback: () => void, delay = 1500) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, delay));
    setIsTyping(false);
    callback();
  };

  const handleSend = async () => {
    if (!input.trim() || !currentSession) return;

    const userMessage = input.trim();
    setInput('');

    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Process based on current step
    switch (currentSession.currentStep) {
      case 'policy_verification':
        await handlePolicyVerification(userMessage);
        break;
      case 'accident_type':
        // Handled by button selection
        break;
      case 'accident_details':
        await handleAccidentDetails(userMessage);
        break;
      case 'location':
        await handleLocation(userMessage);
        break;
      case 'damage_description':
        await handleDamageDescription(userMessage);
        break;
      case 'additional_info':
        await handleAdditionalInfo(userMessage);
        break;
      case 'review':
        await handleReview(userMessage);
        break;
      default:
        await simulateTyping(() => {
          addMessage({
            role: 'assistant',
            content: "I'm processing your response. Please wait a moment.",
          });
        });
    }
  };

  const handlePolicyVerification = async (policyNumber: string) => {
    // Simulate policy lookup
    updateCollectedData({
      policyNumber: policyNumber.toUpperCase(),
      customerName: 'John Smith',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        vin: '1HGBH41JXMN109186',
        licensePlate: 'ABC-1234',
      },
    });

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `Thank you! I found your policy.

**Policy Holder:** John Smith
**Vehicle:** 2022 Toyota Camry
**Policy Status:** Active

Now, please tell me what type of incident occurred:`,
      });
      setShowAccidentTypes(true);
      setCurrentStep('accident_type');
    });
  };

  const handleAccidentTypeSelect = async (type: AccidentType) => {
    setShowAccidentTypes(false);
    const typeLabel = ACCIDENT_TYPES.find((t) => t.value === type)?.label;

    addMessage({
      role: 'user',
      content: typeLabel || type,
    });

    updateCollectedData({ accidentType: type });

    // Add AI hint
    const hints = AI_HINTS[type];
    if (hints) {
      addMessage({
        role: 'system',
        content: hints[Math.floor(Math.random() * hints.length)],
        metadata: {
          aiHint: 'Pattern Recognition',
        },
      });
    }

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `I understand you're reporting a ${typeLabel?.toLowerCase()}.

When did this incident occur? Please provide the date and approximate time.`,
      });
      setCurrentStep('accident_details');
    }, 2000);
  };

  const handleAccidentDetails = async (details: string) => {
    updateCollectedData({ accidentDate: new Date() });

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `Got it. Now, where did the incident take place?

Please provide the address or describe the location (intersection, parking lot, highway, etc.)`,
      });
      setCurrentStep('location');
    });
  };

  const handleLocation = async (location: string) => {
    updateCollectedData({ accidentLocation: location });

    // Simulate location enrichment
    addMessage({
      role: 'system',
      content: `Location identified: ${location}. Weather conditions at time of incident: Clear skies, 72°F. No traffic incidents reported in area.`,
      metadata: {
        aiHint: 'Location Enrichment',
      },
    });

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `Thank you. Now please describe the damage to your vehicle in detail.

What parts of the vehicle were affected? How severe does the damage appear?`,
      });
      setCurrentStep('damage_description');
    }, 1800);
  };

  const handleDamageDescription = async (description: string) => {
    updateCollectedData({ description });

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `I've recorded the damage description.

Now I'd like you to upload photos of the damage. This will help our team assess your claim more quickly and accurately.`,
      });
      setShowPhotoUpload(true);
      setCurrentStep('photo_upload');
    });
  };

  const handlePhotosUploaded = async (photos: ClaimPhoto[]) => {
    setShowPhotoUpload(false);
    updateCollectedData({ photos });

    addMessage({
      role: 'user',
      content: `Uploaded ${photos.length} photo(s)`,
    });

    if (photos.length > 0) {
      addMessage({
        role: 'system',
        content: `AI Image Analysis Complete: ${photos.map((p) => p.aiAnalysis).join('. ')}`,
        metadata: {
          aiHint: 'Damage Detection',
        },
      });
    }

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `${
          photos.length > 0
            ? "Excellent! I've analyzed the photos you uploaded."
            : "No problem, you can upload photos later through the claims portal."
        }

Is there any additional information you'd like to add? For example:
- Were there any injuries?
- Were there other vehicles or parties involved?
- Is there a police report number?

Type "none" if there's nothing to add.`,
      });
      setCurrentStep('additional_info');
    });
  };

  const handleAdditionalInfo = async (info: string) => {
    const collectedData = currentSession?.collectedData;

    await simulateTyping(() => {
      addMessage({
        role: 'assistant',
        content: `Thank you for providing all the information. Here's a summary of your claim:

**Claim Summary**
━━━━━━━━━━━━━━━━━━
**Policy:** ${collectedData?.policyNumber}
**Vehicle:** ${collectedData?.vehicleInfo?.year} ${collectedData?.vehicleInfo?.make} ${collectedData?.vehicleInfo?.model}
**Incident Type:** ${ACCIDENT_TYPES.find((t) => t.value === collectedData?.accidentType)?.label}
**Location:** ${collectedData?.accidentLocation}
**Description:** ${collectedData?.description}
**Photos:** ${collectedData?.photos?.length || 0} uploaded

Does everything look correct? Type "yes" to submit or "no" to make changes.`,
      });
      setCurrentStep('review');
    });
  };

  const handleReview = async (response: string) => {
    if (response.toLowerCase().includes('yes')) {
      await simulateTyping(() => {
        const claim = completeFNOL();
        if (claim) {
          setCompletedClaimId(claim.id);
          addMessage({
            role: 'assistant',
            content: `Your claim has been successfully submitted!

**Claim ID:** ${claim.id.slice(0, 8).toUpperCase()}

What happens next:
1. Our AI will analyze your claim and calculate priority scores
2. Your claim will be assigned to the most suitable adjuster
3. You'll receive updates via email and through our portal

You can track your claim status anytime through the Claims Portal.`,
          });
          setClaimComplete(true);
        }
      });
    } else {
      await simulateTyping(() => {
        addMessage({
          role: 'assistant',
          content:
            'No problem! What would you like to change? Please describe the correction needed.',
        });
      });
    }
  };

  const handleViewTriage = () => {
    if (completedClaimId) {
      router.push(`/triage/${completedClaimId}`);
    }
  };

  const handleViewStatus = () => {
    if (completedClaimId) {
      router.push(`/status/${completedClaimId}`);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">ClaimsFlow AI</h1>
        <p className="text-sm text-gray-500">Intelligent FNOL Assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {currentSession.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        {showAccidentTypes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select incident type:
            </p>
            <div className="space-y-2">
              {ACCIDENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAccidentTypeSelect(type.value)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {showPhotoUpload && (
          <PhotoUpload
            onPhotosUploaded={handlePhotosUploaded}
            onSkip={() => handlePhotosUploaded([])}
          />
        )}

        {claimComplete && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Claim Submitted Successfully!</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewTriage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Triage Analysis
              </button>
              <button
                onClick={handleViewStatus}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Track Claim Status
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!claimComplete && !showAccidentTypes && !showPhotoUpload && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
