import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, businessName, contactName, businessType, city, lookingFor } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const isFullForm = !!businessName

        if (isFullForm) {
            // Validate required fields for full form
            if (!contactName || !businessType || !city) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
            }

            await resend.emails.send({
                from: "onboarding@resend.dev",
                replyTo: email,
                to: "theo.colosimo@gmail.com",
                subject: `New Brand Inquiry — ${businessName}`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
                        <h2 style="color: #18181b; margin-bottom: 24px;">New Brand Inquiry</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #71717a; font-size: 14px; width: 140px;">Business Name</td>
                                <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${businessName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Contact Name</td>
                                <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${contactName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Email</td>
                                <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Business Type</td>
                                <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${businessType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">City</td>
                                <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${city}</td>
                            </tr>
                            ${lookingFor ? `
                            <tr>
                                <td style="padding: 8px 0; color: #71717a; font-size: 14px; vertical-align: top;">Looking For</td>
                                <td style="padding: 8px 0; color: #18181b; font-size: 14px;">${lookingFor}</td>
                            </tr>
                            ` : ""}
                        </table>
                    </div>
                `,
            })
        } else {
            // Hero email-only capture
            await resend.emails.send({
                from: "onboarding@resend.dev",
                replyTo: email,
                to: "theo.colosimo@gmail.com",
                subject: `New Brand Interest — ${email}`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
                        <h2 style="color: #18181b; margin-bottom: 16px;">New Brand Interest</h2>
                        <p style="color: #71717a; font-size: 14px; margin-bottom: 4px;">A business signed up for early access from the hero form:</p>
                        <p style="color: #18181b; font-size: 16px; font-weight: 600;">${email}</p>
                    </div>
                `,
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }
}
