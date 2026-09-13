import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";
import { z } from "zod";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const emailSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is invalid!").max(100, "Full name is too long!"),
  email: z.string().trim().email({ message: "Email is invalid!" }).max(254, "Email is too long!"),
  message: z.string().trim().min(10, "Message is too short!").max(5000, "Message is too long!"),
  website: z.string().max(500).optional(),
});

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = emailSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Please provide a valid name, email, and message." }, { status: 400 });
    }

    if (parsed.data.website) {
      return Response.json({ success: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const recipient = process.env.CONTACT_RECIPIENT_EMAIL;
    if (!apiKey || !from || !recipient) {
      console.error("Contact email configuration is incomplete.");
      return Response.json({ error: "Email service is not configured." }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const { data: resendData, error: resendError } = await resend.emails.send({
      from,
      to: [recipient],
      replyTo: parsed.data.email,
      subject: `Portfolio contact from ${parsed.data.fullName}`,
      react: EmailTemplate({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        message: parsed.data.message,
        submittedAt: new Date(),
      }) as React.ReactElement,
    });

    if (resendError) {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json(resendData);
  } catch (error) {
    console.error("Contact email request failed.", error);
    return Response.json({ error: "Unable to send your message right now." }, { status: 500 });
  }
}
