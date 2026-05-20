"use client"

import { useState } from "react"
import { X, CheckCircle } from "lucide-react"

type contactProps = {
    email: string,
    name: string
}

const inputClasses = "w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors text-sm"

export default function ContactSection({ email, name }: contactProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [senderEmail, setEmail] = useState("")
    const [sending, setSending] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    async function handleSend() {
        setSending(true)
        await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senderEmail, subject, message })
        })
        setSending(false)
        setIsOpen(false)
        setSubject("")
        setMessage("")
        setEmail("")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    return (
        <div>
            <div className="mt-6">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold transition-all hover:shadow-[0_0_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 duration-300"
                >
                    Contact for Partnerships
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div
                            className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 space-y-4"
                            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">Contact {name}</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <input
                                className={inputClasses}
                                value={senderEmail}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                type="email"
                            />
                            <input
                                className={inputClasses}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Subject"
                            />
                            <textarea
                                className={`${inputClasses} resize-none`}
                                value={message}
                                rows={4}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Your message..."
                            />

                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold transition-all hover:shadow-[0_0_16px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? "Sending..." : "Send Message"}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full text-center text-sm text-zinc-500 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Success toast */}
            {showSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900 border border-emerald-500/30 rounded-full px-5 py-3 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-white text-sm font-medium">Message sent successfully!</span>
                </div>
            )}
        </div>
    )
}
