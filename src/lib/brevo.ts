/**
 * Utility for sending transactional emails via Brevo (Sendinblue) REST API.
 */

interface SendEmailParams {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  sender?: { email: string; name: string };
}

export async function sendEmail({
  to,
  subject,
  htmlContent,
  sender = { email: "reclutamiento@clinicaavaria.cl", name: "Clínica Avaria | Reclutamiento" }
}: SendEmailParams) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY environment variable. E-mail will not be sent.");
    return false;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to,
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Brevo API Error:", errorData);
      return false;
    }

    const data = await res.json();
    return true; // Successfully queued for sending
  } catch (error) {
    console.error("Fetch error sending email via Brevo:", error);
    return false;
  }
}
