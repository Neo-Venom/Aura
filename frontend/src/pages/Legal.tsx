import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, HeartPulse, FileText, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { PublicLayout } from '../components/common/Layouts';
import { en } from '../copy/en';

export function Privacy() {
  return (
    <PublicLayout>
      <article className="card p-6 sm:p-12 space-y-8 max-w-4xl mx-auto" data-testid="privacy-page">
        <header className="space-y-4 border-b border-line pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink transition-colors"
            data-testid="privacy-page-home-link"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {en.legal.home}
          </Link>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-sage/30 text-sage" aria-hidden="true">
              <ShieldCheck className="h-7 w-7 text-ink" />
            </span>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl">Privacy Policy</h1>
              <p className="text-sm text-muted">Effective Date: October 1, 2026 • Version 1.0</p>
            </div>
          </div>
        </header>

        {/* Crisis Notice Banner */}
        <section aria-label="Crisis disclaimer" className="rounded-2xl border border-line bg-butter/30 p-5 text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-ink">
            <HeartPulse className="h-5 w-5 text-terracotta shrink-0" aria-hidden="true" />
            <span>Important Mental Health & Emergency Notice</span>
          </div>
          <p className="text-ink/80">
            Aura is an artificial intelligence emotional support companion designed to offer warm, empathetic space for reflection. 
            <strong> Aura is not a medical provider, diagnostic tool, or psychiatric crisis service.</strong> If you or someone you know is in immediate danger or experiencing thoughts of self-harm, please contact emergency services (such as 988 or 911 in the US/Canada, 112 in India, 999 or 116 123 in the UK) or visit our{' '}
            <Link to="/crisis" className="font-bold underline">support directory</Link>.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <Lock className="h-5 w-5 text-lavender" aria-hidden="true" />
            1. Our Commitment to Your Privacy
          </h2>
          <p>
            At Aura (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we believe that your emotional journey belongs entirely to you. We hold mental wellness data to the highest standard of confidentiality. 
            <strong> We will never sell, rent, or monetize your emotional check-ins, journal entries, or chat transcripts to third-party advertisers or data brokers.</strong>
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">2. Information We Collect</h2>
          <p>We only collect information strictly necessary to provide and personalize Aura&rsquo;s emotional support experience:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> When you register via Supabase or email, we collect your email address, optional display name, and optional country code (used solely to show relevant local crisis helplines).
            </li>
            <li>
              <strong>Self-Assessment & Weather Data:</strong> Responses to our gentle check-ins (e.g., DASS-21 dimensions and supplemental mood metrics) to calculate your Emotional Weather snapshot and track trajectory over time.
            </li>
            <li>
              <strong>Conversational Data:</strong> Messages you send and receive within chat sessions to maintain dialogue continuity.
            </li>
            <li>
              <strong>Voice & Audio:</strong> When using voice input via Web Speech API or server transcription, audio is converted into text in real time. We do not store raw microphone audio recordings on our servers.
            </li>
            <li>
              <strong>Preferences:</strong> Aesthetic settings including theme mode (light, night, system), accent palette, font size, and listening language.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">3. AI Inference & Processing</h2>
          <p>
            Aura utilizes state-of-the-art secure Language Model (LLM) providers (including Google Gemini and Groq Cloud) to generate compassionate responses. 
            Inputs passed to inference APIs are processed securely under enterprise zero-data-retention agreements where prompt data is not used to train foundation models.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-sage" aria-hidden="true" />
            4. Your Rights & Data Ownership
          </h2>
          <p>You maintain complete control of your data at all times directly within Settings:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Export Your Data:</strong> You may download a full, machine-readable JSON copy of your profile, assessments, and chat history at any moment.
            </li>
            <li>
              <strong>Delete Chats:</strong> You can wipe all conversation histories with one click.
            </li>
            <li>
              <strong>Hard Delete Account:</strong> You can permanently purge your entire account, assessments, and data from our active databases by typing DELETE in Settings.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">5. Age Requirement (18+)</h2>
          <p>
            Aura is strictly intended for individuals who are at least 18 years of age. We do not knowingly collect or solicit personal data from children under 18.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">6. Contact & Data Protection</h2>
          <p>
            If you have questions about this policy or wish to exercise data rights, you may reach our team at{' '}
            <a href="mailto:privacy@aura-app.com" className="font-semibold underline">privacy@aura-app.com</a>.
          </p>
        </section>

        <footer className="pt-6 border-t border-line flex flex-wrap justify-between items-center gap-4 text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} Aura Emotional Support. All rights reserved.</span>
          <Link to="/terms" className="font-semibold underline underline-offset-4 hover:text-ink">Read Terms of Service</Link>
        </footer>
      </article>
    </PublicLayout>
  );
}

export function Terms() {
  return (
    <PublicLayout>
      <article className="card p-6 sm:p-12 space-y-8 max-w-4xl mx-auto" data-testid="terms-page">
        <header className="space-y-4 border-b border-line pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink transition-colors"
            data-testid="terms-page-home-link"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {en.legal.home}
          </Link>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-lavender/30 text-lavender" aria-hidden="true">
              <FileText className="h-7 w-7 text-ink" />
            </span>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl">Terms of Service</h1>
              <p className="text-sm text-muted">Effective Date: October 1, 2026 • Version 1.0</p>
            </div>
          </div>
        </header>

        {/* Medical & Crisis Disclaimer */}
        <section aria-label="Medical disclaimer" className="rounded-2xl border border-line bg-butter/30 p-5 text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-ink">
            <AlertTriangle className="h-5 w-5 text-terracotta shrink-0" aria-hidden="true" />
            <span>Non-Medical, Emotional Wellness Service Disclaimer</span>
          </div>
          <p className="text-ink/80">
            AURA DOES NOT PROVIDE MEDICAL, PSYCHIATRIC, OR CLINICAL PSYCHOLOGICAL SERVICES. AURA IS AN AUTOMATED AI COMPANION INTENDED SOLELY FOR NON-EMERGENCY EMOTIONAL COMFORT, STRESS REDUCTION, AND SELF-REFLECTION.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Aura, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">2. Eligibility & Age Restriction</h2>
          <p>
            You must be at least 18 years of age to create an account or use Aura. By consenting upon onboarding, you affirm that you are at least 18 years old and legally competent to agree to these terms.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">3. Nature of the AI Service</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Conversational Companion:</strong> Responses are generated algorithmically. While Aura is designed with deep empathy and evidence-informed reflective listening techniques, it is not a human therapist.
            </li>
            <li>
              <strong>Emotional Weather Snapshot:</strong> The check-in and radar visualizer provide gentle self-reflection markers based on self-reported inputs. They do not constitute diagnostic medical evaluations.
            </li>
            <li>
              <strong>Calm Tools:</strong> Guided breathing and grounding exercises are general wellness utilities intended to support relaxation.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">4. Acceptable Use Policy</h2>
          <p>You agree to use Aura only for lawful, personal purposes. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attempt to reverse-engineer, exploit, or bypass system rate limits or safety guardrails.</li>
            <li>Use the service to generate hate speech, encourage violence, or simulate illegal activities.</li>
            <li>Use automated scripts or scrapers to access the service outside standard browser interfaces.</li>
          </ul>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Aura and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages arising from your reliance on AI-generated communications or inability to access emergency care.
          </p>
        </section>

        <section className="space-y-4 text-ink/90 leading-relaxed text-base">
          <h2 className="font-display text-2xl text-ink">6. Modifications to Service</h2>
          <p>
            We may enhance, update, or modify Aura features over time. Material updates to these terms will be reflected with an updated effective date.
          </p>
        </section>

        <footer className="pt-6 border-t border-line flex flex-wrap justify-between items-center gap-4 text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} Aura Emotional Support. All rights reserved.</span>
          <Link to="/privacy" className="font-semibold underline underline-offset-4 hover:text-ink">Read Privacy Policy</Link>
        </footer>
      </article>
    </PublicLayout>
  );
}
