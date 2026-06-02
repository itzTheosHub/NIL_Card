import Header from "@/components/Header"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      <Header hidePillNav />

      <main className="mx-auto max-w-3xl w-full px-4 pt-28 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">NIL-Card Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: May 20, 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NIL-Card (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) at nil-card.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. What NIL-Card Does</h2>
            <p>
              NIL-Card is a platform that allows college athletes to create digital profile cards showcasing their social media reach, athletic background, and partnership availability. Businesses and brands can browse athlete profiles and reach out to explore Name, Image, and Likeness (NIL) partnership opportunities.
            </p>
            <p>
              NIL-Card facilitates discovery and connection between athletes and brands. We do not negotiate, broker, execute, or guarantee any NIL deals, contracts, or payments between parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Eligibility</h2>
            <p>You must be at least 13 years of age to use the Platform. By creating an account, you confirm that:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>You are at least 13 years old</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>The information you provide is accurate and truthful</li>
              <li>You will keep your account information up to date</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. NIL Compliance</h2>
            <p>
              NIL laws and regulations vary by state, institution, and athletic conference. It is your sole responsibility as an athlete to ensure that any NIL activity conducted through or facilitated by this Platform complies with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Your university or college&apos;s NIL policies</li>
              <li>Your athletic conference&apos;s rules and guidelines</li>
              <li>Applicable federal, state, and local laws</li>
              <li>NCAA or NAIA rules as applicable to your institution</li>
            </ul>
            <p>
              NIL-Card is not responsible for any disciplinary action, loss of eligibility, or legal consequences arising from an athlete&apos;s NIL activities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at theo.colosimo@gmail.com if you suspect unauthorized access to your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in any activity that harms the Platform or its users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. User Content</h2>
            <p>
              You retain ownership of the content you submit to the Platform, including profile photos, bios, social media handles, and statistics. By submitting content, you grant NIL-Card a non-exclusive, royalty-free license to display and distribute that content as part of the Platform&apos;s normal operation.
            </p>
            <p>
              You are solely responsible for ensuring that any content you submit does not violate the intellectual property rights, privacy rights, or any other rights of third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Scrape, crawl, or systematically extract data from the Platform</li>
              <li>Use the Platform to send unsolicited communications or spam</li>
              <li>Interfere with or disrupt the integrity or performance of the Platform</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">8. Social Media Data</h2>
            <p>
              Athletes may connect their social media accounts (including Instagram and TikTok) to the Platform to automatically populate their profile statistics. By connecting a social media account, you authorize NIL-Card to access publicly available metrics such as follower counts and engagement rates through the respective platform&apos;s official API.
            </p>
            <p>
              We do not store your social media passwords. Access tokens are stored securely and used solely to retrieve your profile metrics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">9. Intellectual Property</h2>
            <p>
              The NIL-Card name, logo, design, and all associated content are the intellectual property of NIL-Card. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">10. Disclaimers</h2>
            <p>
              The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
            <p>
              We do not verify the accuracy of athlete statistics or brand information submitted by users. All profile data is self-reported unless explicitly marked as verified.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">11. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, NIL-Card shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of profits, data, or goodwill.
            </p>
            <p>
              Our total liability to you for any claim arising from these Terms or your use of the Platform shall not exceed the amount you paid to us in the twelve months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">12. Privacy</h2>
            <p>
              Your use of the Platform is also governed by our{" "}
              <Link href="/nil-card-privacy-policy" className="text-violet-400 hover:text-violet-300 transition-colors">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">13. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify users of material changes by updating the &quot;Last updated&quot; date at the top of this page. Continued use of the Platform after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Ohio, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">15. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}
