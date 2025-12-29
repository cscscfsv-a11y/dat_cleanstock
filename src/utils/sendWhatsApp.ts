// utils/sendWhatsApp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendWhatsAppReport = async (to: string, mediaUrl: string) => {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+12074193522', // número de Twilio sandbox
      to: `whatsapp:${to}`,          // número destino con prefijo internacional
      body: 'Aquí tienes el reporte de inventario',
      mediaUrl: [mediaUrl]           // link al PDF en Supabase Storage
    });
    console.log("Mensaje enviado:", message.sid);
    return message.sid;
  } catch (error) {
    console.error("Error enviando WhatsApp:", error);
    throw error;
  }
};
