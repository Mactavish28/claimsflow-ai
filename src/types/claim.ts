export type AccidentType = 'collision' | 'theft' | 'weather' | 'vandalism' | 'hit_and_run' | 'other';

export type ClaimStatus =
  | 'fnol_in_progress'
  | 'fnol_complete'
  | 'triage'
  | 'assigned'
  | 'investigation'
  | 'assessment'
  | 'settlement'
  | 'closed';

export interface ClaimScores {
  complexity: number;      // 1-10
  severity: number;        // 1-10
  fraudRisk: number;       // 1-100
  customerValue: number;   // 1-100
  urgency: number;         // 1-10
}

export interface RoutingRecommendation {
  adjusterType: 'junior' | 'senior' | 'specialist' | 'siu';
  reason: string;
  stpEligible: boolean;
  estimatedResolutionDays: number;
}

export interface ClaimPhoto {
  id: string;
  url: string;
  category: 'front' | 'rear' | 'left' | 'right' | 'interior' | 'damage' | 'document';
  timestamp: Date;
  aiAnalysis?: string;
}

export interface ClaimNotification {
  id: string;
  timestamp: Date;
  type: 'status_update' | 'document_request' | 'assignment' | 'payment';
  message: string;
  read: boolean;
}

export interface Claim {
  id: string;
  policyNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
  };
  accidentType: AccidentType;
  accidentDate: Date;
  accidentLocation: string;
  description: string;
  photos: ClaimPhoto[];
  status: ClaimStatus;
  scores?: ClaimScores;
  routing?: RoutingRecommendation;
  notifications: ClaimNotification[];
  createdAt: Date;
  updatedAt: Date;
  assignedAdjuster?: string;
  estimatedCompletion?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    fieldCaptured?: string;
    aiHint?: string;
    photos?: string[];
  };
}

export interface FNOLSession {
  id: string;
  messages: ChatMessage[];
  collectedData: Partial<Claim>;
  currentStep: FNOLStep;
  isComplete: boolean;
}

export type FNOLStep =
  | 'greeting'
  | 'policy_verification'
  | 'accident_type'
  | 'accident_details'
  | 'location'
  | 'damage_description'
  | 'photo_upload'
  | 'additional_info'
  | 'review'
  | 'complete';
