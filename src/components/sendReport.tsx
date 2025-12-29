import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

interface SendReportProps {
  publicUrl: string;   // URL pública del archivo (ej. PDF en Supabase)
  to: string;          // destinatario (correo)
}

export default function SendReport({ publicUrl, to }: SendReportProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleEmail = async () => {
    try {
      const result = await emailjs.send(
        "service_p3z0oj4",   // tu Service ID
        "template_p9mb30a",  // tu Template ID
        {
          to_email: to,
          subject: "Reporte generado",
          message: "Adjunto tu reporte en PDF",
          attachment: publicUrl   // puedes pasar la URL del PDF
        },
        "yvuhymMR7Y5cCWH03" // tu Public Key
      );

      setStatus("Reporte enviado correctamente con EmailJS");
    } catch (error: any) {
      setStatus(`Error al enviar: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleEmail}>Enviar Reporte</button>
      {status && <p>{status}</p>}
    </div>
  );
}
