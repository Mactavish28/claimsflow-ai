import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Claim, FNOLSession, ChatMessage, ClaimScores, RoutingRecommendation, ClaimNotification } from '@/types/claim';
import { v4 as uuidv4 } from 'uuid';

interface ClaimStore {
  claims: Claim[];
  currentSession: FNOLSession | null;

  // FNOL Actions
  startFNOLSession: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateCollectedData: (data: Partial<Claim>) => void;
  setCurrentStep: (step: FNOLSession['currentStep']) => void;
  completeFNOL: () => Claim | null;

  // Claim Actions
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  getClaim: (id: string) => Claim | undefined;

  // Triage Actions
  calculateScores: (claimId: string) => ClaimScores;
  generateRouting: (claimId: string, scores: ClaimScores) => RoutingRecommendation;

  // Notification Actions
  addNotification: (claimId: string, notification: Omit<ClaimNotification, 'id' | 'timestamp'>) => void;
}

export const useClaimStore = create<ClaimStore>()(
  persist(
    (set, get) => ({
      claims: [],
      currentSession: null,

      startFNOLSession: () => {
        const session: FNOLSession = {
          id: uuidv4(),
          messages: [],
          collectedData: {},
          currentStep: 'greeting',
          isComplete: false,
        };
        set({ currentSession: session });
      },

      addMessage: (message) => {
        set((state) => {
          if (!state.currentSession) return state;
          const newMessage: ChatMessage = {
            ...message,
            id: uuidv4(),
            timestamp: new Date(),
          };
          return {
            currentSession: {
              ...state.currentSession,
              messages: [...state.currentSession.messages, newMessage],
            },
          };
        });
      },

      updateCollectedData: (data) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              collectedData: {
                ...state.currentSession.collectedData,
                ...data,
              },
            },
          };
        });
      },

      setCurrentStep: (step) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              currentStep: step,
            },
          };
        });
      },

      completeFNOL: () => {
        const state = get();
        if (!state.currentSession) return null;

        const collectedData = state.currentSession.collectedData;
        const claim: Claim = {
          id: uuidv4(),
          policyNumber: collectedData.policyNumber || 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          customerName: collectedData.customerName || 'John Doe',
          customerEmail: collectedData.customerEmail || 'john.doe@email.com',
          customerPhone: collectedData.customerPhone || '(555) 123-4567',
          vehicleInfo: collectedData.vehicleInfo || {
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            vin: '1HGBH41JXMN109186',
            licensePlate: 'ABC-1234',
          },
          accidentType: collectedData.accidentType || 'collision',
          accidentDate: collectedData.accidentDate || new Date(),
          accidentLocation: collectedData.accidentLocation || 'Unknown',
          description: collectedData.description || 'No description provided',
          photos: collectedData.photos || [],
          status: 'fnol_complete',
          notifications: [
            {
              id: uuidv4(),
              timestamp: new Date(),
              type: 'status_update',
              message: 'Your claim has been successfully submitted. A claims adjuster will be assigned shortly.',
              read: false,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          claims: [...state.claims, claim],
          currentSession: {
            ...state.currentSession!,
            isComplete: true,
          },
        }));

        return claim;
      },

      addClaim: (claim) => {
        set((state) => ({
          claims: [...state.claims, claim],
        }));
      },

      updateClaim: (id, updates) => {
        set((state) => ({
          claims: state.claims.map((claim) =>
            claim.id === id
              ? { ...claim, ...updates, updatedAt: new Date() }
              : claim
          ),
        }));
      },

      getClaim: (id) => {
        return get().claims.find((claim) => claim.id === id);
      },

      calculateScores: (claimId) => {
        const claim = get().getClaim(claimId);
        if (!claim) {
          return {
            complexity: 5,
            severity: 5,
            fraudRisk: 20,
            customerValue: 50,
            urgency: 5,
          };
        }

        // Mock AI scoring logic
        let complexity = 3;
        let severity = 3;
        let fraudRisk = 15;
        let urgency = 4;

        // Adjust based on accident type
        switch (claim.accidentType) {
          case 'collision':
            complexity += 2;
            severity += 2;
            break;
          case 'theft':
            complexity += 3;
            fraudRisk += 25;
            urgency += 2;
            break;
          case 'hit_and_run':
            complexity += 4;
            fraudRisk += 15;
            urgency += 3;
            break;
          case 'weather':
            complexity += 1;
            severity += 1;
            break;
          case 'vandalism':
            complexity += 2;
            fraudRisk += 10;
            break;
        }

        // Adjust based on photos
        if (claim.photos.length === 0) {
          fraudRisk += 20;
          complexity += 1;
        }

        // Adjust based on description length
        if (claim.description.length < 50) {
          complexity += 1;
          fraudRisk += 5;
        }

        // Random variation for demo
        complexity = Math.min(10, Math.max(1, complexity + Math.floor(Math.random() * 2)));
        severity = Math.min(10, Math.max(1, severity + Math.floor(Math.random() * 3)));
        fraudRisk = Math.min(100, Math.max(1, fraudRisk + Math.floor(Math.random() * 10)));
        urgency = Math.min(10, Math.max(1, urgency + Math.floor(Math.random() * 2)));

        const scores: ClaimScores = {
          complexity,
          severity,
          fraudRisk,
          customerValue: 50 + Math.floor(Math.random() * 40),
          urgency,
        };

        get().updateClaim(claimId, { scores });
        return scores;
      },

      generateRouting: (claimId, scores) => {
        let adjusterType: RoutingRecommendation['adjusterType'] = 'junior';
        let reason = '';
        let stpEligible = false;
        let estimatedResolutionDays = 14;

        if (scores.fraudRisk > 60) {
          adjusterType = 'siu';
          reason = 'High fraud risk score requires Special Investigation Unit review';
          estimatedResolutionDays = 30;
        } else if (scores.complexity >= 7 || scores.severity >= 7) {
          adjusterType = 'specialist';
          reason = 'High complexity/severity requires specialist expertise';
          estimatedResolutionDays = 21;
        } else if (scores.complexity >= 4) {
          adjusterType = 'senior';
          reason = 'Moderate complexity suitable for senior adjuster';
          estimatedResolutionDays = 14;
        } else if (scores.complexity < 4 && scores.severity < 4 && scores.fraudRisk < 25) {
          adjusterType = 'junior';
          stpEligible = true;
          reason = 'Low complexity claim eligible for straight-through processing';
          estimatedResolutionDays = 5;
        } else {
          adjusterType = 'junior';
          reason = 'Standard claim suitable for junior adjuster';
          estimatedResolutionDays = 10;
        }

        const routing: RoutingRecommendation = {
          adjusterType,
          reason,
          stpEligible,
          estimatedResolutionDays,
        };

        get().updateClaim(claimId, { routing, status: 'triage' });
        return routing;
      },

      addNotification: (claimId, notification) => {
        const claim = get().getClaim(claimId);
        if (!claim) return;

        const newNotification: ClaimNotification = {
          ...notification,
          id: uuidv4(),
          timestamp: new Date(),
        };

        get().updateClaim(claimId, {
          notifications: [...claim.notifications, newNotification],
        });
      },
    }),
    {
      name: 'claimsflow-storage',
    }
  )
);
