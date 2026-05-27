import { Resend } from "resend";
import { env } from "./env";

let _resend: Resend | null = null;

function resend(): Resend {
  if (!_resend) _resend = new Resend(env.resendKey);
  return _resend;
}

interface SendArgs {
  subject: string;
  html: string;
}

export async function sendEmail({ subject, html }: SendArgs): Promise<string> {
  if (!env.resendKey) throw new Error("RESEND_API_KEY not set");
  if (!env.recipient) throw new Error("RECIPIENT_EMAIL not set");
  const { data, error } = await resend().emails.send({
    from: env.resendFrom,
    to: [env.recipient],
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data?.id ?? "(no id)";
}
