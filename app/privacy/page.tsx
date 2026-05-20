import Header from "@/components/Header"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      <Header hidePillNav />

      <main className="mx-auto max-w-3xl w-full px-4 pt-28 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: May 20, 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Overview</h2>
            <p>
              NIL-Card ("the Platform", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use nil-card.com.
            </p>
            <p>
              By using the Platform, you agree to the collection and use of information as described in this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p>We collect information you provide directly when you:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Create an account (name, email address, password)</li>
              <li>Build your athlete profile (sport, school, graduation year, bio, social handles, statistics)</li>
              <li>Upload a profile photo</li>
              <li>Connect a social media account (Instagram, TikTok)</li>
              <li>Submit a brand inquiry form</li>
            </ul>
            <p className="mt-2">
              We also collect certain information automatically when you use the Platform, including your IP address, browser type, pages visited, and referring URLs. This is used solely for platform analytics and security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Create and manage your account</li>
              <li>Display your profile card to visitors and potential brand partners</li>
              <li>Send transactional emails (account verification, password reset)</li>
              <li>Forward brand inquiry submissions to our team</li>
              <li>Monitor platform usage and improve our services</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. How Your Profile Is Shared</h2>
            <p>
              Your athlete profile card is publicly visible by default. This means any visitor to nil-card.com can view your name, sport, school, social statistics, and other profile information you choose to include.
            </p>
            <p>
              If you do not want your profile to be publicly visible, do not create one or contact us to deactivate your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Social Media API Data</h2>
            <p>
              When you connect your Instagram or TikTok account to the Platform, we request access to your public metrics (follower count, engagement rate, average views) via the platform&apos;s official API.
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>We do not store your social media passwords</li>
              <li>Access tokens are stored securely in our database and used only to retrieve your metrics</li>
              <li>You can disconnect your social accounts at any time from your profile settings</li>
              <li>Tokens expire after 60 days and must be reauthorized to continue pulling data</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, a cloud database provider that implements industry-standard encryption at rest and in transit. Profile photos are stored in a secure Supabase storage bucket.
            </p>
            <p>
              While we take reasonable measures to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">7. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain your login session and remember your preferences. We do not use cookies for advertising or third-party tracking purposes. You can control cookie behavior through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">8. Third-Party Services</h2>
            <p>We use the following third-party services to operate the Platform:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li><span className="text-zinc-300 font-medium">Supabase</span> — authentication, database, and file storage</li>
              <li><span className="text-zinc-300 font-medium">Vercel</span> — hosting and deployment</li>
              <li><span className="text-zinc-300 font-medium">Resend</span> — transactional email delivery</li>
              <li><span className="text-zinc-300 font-medium">Meta (Instagram Graph API)</span> — social media metrics</li>
              <li><span className="text-zinc-300 font-medium">TikTok API</span> — social media metrics</li>
            </ul>
            <p className="mt-2">
              Each of these services has its own privacy policy governing how they handle data. We encourage you to review them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">9. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Disconnect connected social media accounts at any time</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">10. Children&apos;s Privacy</h2>
            <p>
              The Platform is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of material changes by updating the "Last updated" date at the top of this page. Continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">12. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
            </p>
            <p>
              For terms governing your use of the Platform, see our{" "}
              <Link href="/terms" className="text-violet-400 hover:text-violet-300 transition-colors">
                Terms of Service
              </Link>
              .
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}
