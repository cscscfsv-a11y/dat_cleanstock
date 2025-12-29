// pages/api/sendReport.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendWhatsAppReport } from '@/utils/sendWhatsApp';
import twilio from 'twilio'; 

const client = twilio( process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN! );



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Método no permitido" });
  }

  const { to, mediaUrl } = req.body;

  try {
    const message = await sendWhatsAppReport(to, mediaUrl);
    return res.status(200).json({ success: true, sid: message.sid });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
