import Header from "@/components/Header"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      <Header hidePillNav />

      <main className="mx-auto max-w-3xl w-full px-4 pt-28 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">NIL Card Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: March 31, 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">

          <section className="space-y-3">
            <p>
              This Privacy Notice for NIL-Card (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) describes how and why we might access, collect, store, use, and/or share your personal information when you use our services, including when you visit nil-card.com, use NIL-Card to create a professional virtual NIL Card, or engage with us in other related ways.
            </p>
            <p>
              Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. Contact us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white">Summary of Key Points</h2>
            <ul className="space-y-2 text-zinc-400">
              <li><span className="text-zinc-300 font-medium">What personal information do we process?</span> We collect information depending on how you interact with our Services, your choices, and the features you use.</li>
              <li><span className="text-zinc-300 font-medium">Do we process sensitive information?</span> We may process sensitive information (such as student data) when necessary with your consent or as permitted by law.</li>
              <li><span className="text-zinc-300 font-medium">Do we collect information from third parties?</span> We may collect limited data from public databases, marketing partners, and social media platforms.</li>
              <li><span className="text-zinc-300 font-medium">How do we process your information?</span> To provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</li>
              <li><span className="text-zinc-300 font-medium">Do we sell your information?</span> No. We do not sell, trade, or share your personal information with third parties for their marketing purposes.</li>
              <li><span className="text-zinc-300 font-medium">What are your rights?</span> Depending on your location, you may have rights regarding your personal information. See Section 8 and 10 for details.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-1 text-violet-400 pl-2">
              <li>What Information Do We Collect?</li>
              <li>How Do We Process Your Information?</li>
              <li>When and With Whom Do We Share Your Personal Information?</li>
              <li>Do We Use Cookies and Other Tracking Technologies?</li>
              <li>Do We Offer AI-Based Products?</li>
              <li>How Long Do We Keep Your Information?</li>
              <li>How Do We Keep Your Information Safe?</li>
              <li>What Are Your Privacy Rights?</li>
              <li>Controls for Do-Not-Track Features</li>
              <li>Do United States Residents Have Specific Privacy Rights?</li>
              <li>Do We Make Updates to This Notice?</li>
              <li>How Can You Contact Us About This Notice?</li>
              <li>How Can You Review, Update, or Delete the Data We Collect?</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. What Information Do We Collect?</h2>
            <p className="font-medium text-white">Personal information you disclose to us</p>
            <p>
              We collect personal information that you voluntarily provide when you register on the Services, express an interest in obtaining information about us, participate in activities on the Services, or otherwise contact us.
            </p>
            <p>The personal information we collect may include:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Usernames</li>
              <li>Passwords</li>
              <li>Contact preferences</li>
              <li>Contact or authentication data</li>
              <li>Social media statistics</li>
            </ul>
            <p>
              <span className="text-zinc-300 font-medium">Sensitive Information.</span> When necessary, with your consent or as otherwise permitted by applicable law, we process sensitive information including student data. All personal information you provide must be true, complete, and accurate.
            </p>
            <p className="font-medium text-white">Google API</p>
            <p>
              Our use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
            </p>
            <p className="font-medium text-white">Information collected from other sources</p>
            <p>
              We may obtain limited information about you from public databases, joint marketing partners, affiliate programs, and other third parties. This may include email addresses, social media profiles, and social media URLs for purposes of relevant marketing and service improvement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. How Do We Process Your Information?</h2>
            <p>We process your personal information for the following reasons:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li><span className="text-zinc-300">Account creation and authentication</span> — to create and manage your account and keep it in working order</li>
              <li><span className="text-zinc-300">Feedback</span> — to request feedback and contact you about your use of our Services</li>
              <li><span className="text-zinc-300">Security</span> — to keep our Services safe and secure, including fraud monitoring and prevention</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. When and With Whom Do We Share Your Personal Information?</h2>
            <p>We may share your personal information in the following situations:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li><span className="text-zinc-300 font-medium">Business Transfers.</span> We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
              <li><span className="text-zinc-300 font-medium">Affiliates.</span> We may share your information with our affiliates, requiring them to honor this Privacy Notice. Affiliates include our parent company and any subsidiaries or joint venture partners.</li>
            </ul>
            <p>
              We have not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve months and will not do so in the future.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Do We Use Cookies and Other Tracking Technologies?</h2>
            <p>
              We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some tracking technologies help us maintain security, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
            </p>
            <p>
              We also permit third parties and service providers to use online tracking technologies for analytics purposes. To the extent these technologies are deemed a &quot;sale&quot; or &quot;sharing&quot; under applicable US state laws, you can opt out by submitting a request as described in Section 10.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Do We Offer AI-Based Products?</h2>
            <p>
              As part of our Services, we may offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (&quot;AI Products&quot;). We provide these through third-party service providers including Anthropic. Your input, output, and personal information may be shared with and processed by these AI Service Providers as outlined in Section 3.
            </p>
            <p>
              You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider. Our AI Products are designed for text analysis functions. All personal information processed using our AI Products is handled in line with this Privacy Notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. How Long Do We Keep Your Information?</h2>
            <p>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required by law. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Personal information (Category B) — as long as you have an account with us</li>
              <li>Sensitive personal information (Category L, account login) — as long as you have an account with us</li>
            </ul>
            <p>
              When we have no ongoing legitimate business need to process your personal information, we will delete or anonymize it. If deletion is not immediately possible (e.g., data stored in backup archives), we will securely isolate it from further processing until deletion is possible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">7. How Do We Keep Your Information Safe?</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure. We cannot promise that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security.
            </p>
            <p>
              Transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">8. What Are Your Privacy Rights?</h2>
            <p>
              <span className="text-zinc-300 font-medium">Withdrawing your consent.</span> If we rely on your consent to process your personal information, you have the right to withdraw consent at any time by contacting us. This will not affect the lawfulness of processing before withdrawal.
            </p>
            <p className="font-medium text-white">Account Information</p>
            <p>You may review or change your account information or terminate your account at any time by:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Logging in to your account settings and updating your user account</li>
              <li>Contacting us using the contact information provided below</li>
            </ul>
            <p>
              Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. We may retain some information in our files to prevent fraud, troubleshoot problems, assist with investigations, or comply with legal requirements.
            </p>
            <p>
              Questions about your privacy rights? Email us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">9. Controls for Do-Not-Track Features</h2>
            <p>
              Most web browsers and some mobile operating systems include a Do-Not-Track (&quot;DNT&quot;) feature you can activate to signal your preference not to have browsing data monitored and collected. No uniform technology standard for recognizing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or other mechanisms that automatically communicate your choice not to be tracked.
            </p>
            <p>
              California law requires us to disclose how we respond to DNT signals. Because there is not an industry or legal standard for recognizing DNT signals, we do not respond to them at this time. If a standard is adopted in the future, we will update this Privacy Notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">10. Do United States Residents Have Specific Privacy Rights?</h2>
            <p>
              If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have additional rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Right to know whether or not we are processing your personal data</li>
              <li>Right to access your personal data</li>
              <li>Right to correct inaccuracies in your personal data</li>
              <li>Right to request deletion of your personal data</li>
              <li>Right to obtain a copy of the personal data you previously shared with us</li>
              <li>Right to non-discrimination for exercising your rights</li>
              <li>Right to opt out of targeted advertising, sale of personal data, or profiling</li>
            </ul>
            <p>
              <span className="text-zinc-300 font-medium">How to Exercise Your Rights.</span> To exercise these rights, email us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
              . We will consider and act upon your request in accordance with applicable data protection laws. We will need to verify your identity before processing your request.
            </p>
            <p>
              <span className="text-zinc-300 font-medium">Appeals.</span> If we decline your request, you may appeal our decision by emailing us. If your appeal is denied, you may submit a complaint to your state attorney general.
            </p>
            <p>
              <span className="text-zinc-300 font-medium">California &quot;Shine The Light&quot; Law.</span> California residents may request information once per year, free of charge, about personal information (if any) we disclosed to third parties for direct marketing purposes. Submit such requests in writing using the contact details in Section 12.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">11. Do We Make Updates to This Notice?</h2>
            <p>
              Yes, we will update this notice as necessary to stay compliant with relevant laws. The updated version will be indicated by an updated &quot;Last updated&quot; date at the top of this Privacy Notice. If we make material changes, we may notify you by prominently posting a notice or by directly sending you a notification. We encourage you to review this Privacy Notice frequently.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">12. How Can You Contact Us About This Notice?</h2>
            <p>
              If you have questions or comments about this notice, you may email us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>{" "}
              or contact us by post at:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 text-zinc-400">
              <p className="text-white font-medium">NIL-Card</p>
              <p>2552 Vestry Ave</p>
              <p>Cincinnati, OH 45219</p>
              <p>United States</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">13. How Can You Review, Update, or Delete the Data We Collect?</h2>
            <p>
              You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law.
            </p>
            <p>
              To request to review, update, or delete your personal information, contact us at{" "}
              <a href="mailto:theo.colosimo@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                theo.colosimo@gmail.com
              </a>
              . For terms governing your use of the Platform, see our{" "}
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
