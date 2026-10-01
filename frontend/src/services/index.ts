import { env } from '../lib/env';
import { httpAuthService, type AuthService } from './auth';
import { supabaseAuthService } from './supabase';
import { httpProfileService, type ProfileService } from './profile';
import { httpAssessmentService, type AssessmentService } from './assessment';
import { httpChatService, type ChatService } from './chat';
import { httpSafetyService, type SafetyService } from './safety';
import { createSttService, type SttService } from './stt';
import { mockAuthService } from './mock/auth.mock';
import { mockProfileService } from './mock/profile.mock';
import { mockAssessmentService } from './mock/assessment.mock';
import { mockChatService } from './mock/chat.mock';
import { mockSafetyService } from './mock/safety.mock';

export interface Services {
  authService: AuthService;
  profileService: ProfileService;
  assessmentService: AssessmentService;
  chatService: ChatService;
  safetyService: SafetyService;
  sttService: SttService;
}

let cached: Services | null = null;

export function getServices(): Services {
  if (cached) return cached;
  const auth = env.useMocks
    ? mockAuthService
    : env.supabaseUrl && env.supabaseAnonKey
    ? supabaseAuthService
    : httpAuthService;

  cached = env.useMocks
    ? {
        authService: mockAuthService,
        profileService: mockProfileService,
        assessmentService: mockAssessmentService,
        chatService: mockChatService,
        safetyService: mockSafetyService,
        sttService: createSttService(),
      }
    : {
        authService: auth,
        profileService: httpProfileService,
        assessmentService: httpAssessmentService,
        chatService: httpChatService,
        safetyService: httpSafetyService,
        sttService: createSttService(),
      };
  return cached;
}

export { ApiError } from './http';
