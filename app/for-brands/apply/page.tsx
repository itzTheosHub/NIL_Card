"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, ArrowLeft } from "lucide-react"
import ForBrandsHeader from "@/components/ForBrandsHeader"

const BUSINESS_TYPES = [
  "Restaurant",
  "Gym & Fitness",
  "Retail & Clothing",
  "Supplement Store",
  "Salon & Barbershop",
  "Sports & Recreation",
  "Other",
]

const BUDGET_RANGES = [
  "$50–$100",
  "$100–$500",
  "$500–$1,000",
  "$1,000–$2,500",
  "$2,500+",
]

const DELIVERABLES = [
  "Instagram Post",
  "Instagram Story",
  "Instagram Reel",
  "TikTok Video",
  "Tweet",
  "YouTube Video",
  "Product Review or Unboxing",
  "Social Media Takeover",
  "Event Appearance",
  "Brand Ambassador",
]

export default function ForBrandsApplyPage() {
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    businessType: "",
    city: "",
    budget: "",
    lookingFor: "",
  })
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([])
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleDeliverable(d: string) {
    setSelectedDeliverables((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormStatus("loading")
    try {
      const res = await fetch("/api/brand-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, deliverables: selectedDeliverables }),
      })
      if (!res.ok) throw new Error()
      setFormStatus("success")
    } catch {
      setFormStatus("error")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      <ForBrandsHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-32 pb-20">
        <div className="w-full max-w-xl">
          {/* Back link */}
          <Link
            href="/for-brands"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to For Brands
          </Link>

          {formStatus === "success" ? (
            <div className="bg-zinc-900 border border-violet-500/20 shadow-[0_0_40px_rgba(124,58,237,0.08)] rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">You&apos;re on the list.</h2>
              <p className="text-sm text-white/40 max-w-sm">
                We&apos;ll review your brief and reach out with curated athlete matches within 24 hours.
              </p>
              <Link
                href="/for-brands"
                className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                ← Back to For Brands
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Tell us what you need.</h1>
                <p className="mt-3 text-white/40 leading-relaxed">
                  We&apos;ll hand-pick athletes that match your business and handle the intro. Every match is curated by hand.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-zinc-900 border border-violet-500/20 shadow-[0_0_40px_rgba(124,58,237,0.08)] rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/60">Business name</label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => updateForm("businessName", e.target.value)}
                    className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    placeholder="e.g. Iron & Oak Gym"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/60">Your name</label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) => updateForm("contactName", e.target.value)}
                    className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    placeholder="e.g. Jane Smith"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/60">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    placeholder="you@business.com"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/60">Business type</label>
                    <div className="relative">
                      <select
                        required
                        value={form.businessType}
                        onChange={(e) => updateForm("businessType", e.target.value)}
                        className="w-full appearance-none rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                      >
                        <option value="" disabled className="text-white/30">Select type</option>
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-zinc-800 text-white">{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/60">City</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                      placeholder="e.g. Cincinnati, OH"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/60">Budget per athlete</label>
                  <div className="relative">
                    <select
                      required
                      value={form.budget}
                      onChange={(e) => updateForm("budget", e.target.value)}
                      className="w-full appearance-none rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    >
                      <option value="" disabled>Select a range</option>
                      {BUDGET_RANGES.map((range) => (
                        <option key={range} value={range} className="bg-zinc-800 text-white">{range}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/60">
                    Deliverables you want{" "}
                    <span className="text-white/20">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERABLES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDeliverable(d)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedDeliverables.includes(d)
                            ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/60">
                    Anything else?{" "}
                    <span className="text-white/20">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.lookingFor}
                    onChange={(e) => updateForm("lookingFor", e.target.value)}
                    className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                    placeholder="Sport preference, audience size, campaign vibe — anything helps."
                  />
                </div>

                {formStatus === "error" && (
                  <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  {formStatus === "loading" ? "Submitting..." : "Find My Athlete →"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
