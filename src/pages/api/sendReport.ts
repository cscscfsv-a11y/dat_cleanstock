import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método no permitido" });
  }

  const { to, mediaUrl } = req.body;

  if (!to || !mediaUrl) {
    return res.status(400).json({ success: false, error: "Faltan parámetros 'to' o 'mediaUrl'" });
  }

  try {
    const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER!}`,
      to: `whatsapp:${to}`,
      mediaUrl: [mediaUrl],
    });

    return res.status(200).json({ success: true, sid: message.sid });
  } catch (error: any) {
    console.error("Error en sendReport:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
