


import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Image, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import html2canvas from 'html2canvas';

import { createClient } from '@supabase/supabase-js';
import SendReport from './sendReport';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


interface ExportFilters {
  category: string;
  stockLevel: string;
  includeOutOfStock: boolean;
  includeImages: boolean;

  selectedCategories: string[]; // ✅ agregado para checkboxes

}

const ExportPanel: React.FC = () => {
  const { state } = useInventory();   // ✅ usamos state del contexto
  const insumos = state.items ?? [];  // ✅ protegemos contra undefined
  const { toast } = useToast();

  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [toEmail, setToEmail] = useState<string>(""); // correo ingresado por el usuario

  const [filters, setFilters] = useState<ExportFilters>({
    category: 'all',
    stockLevel: 'all',
    includeOutOfStock: true,
    includeImages: false,

    selectedCategories: [] // ✅ inicializado



  });


  // ✅ categorías únicas
  const categories = Array.from(new Set(insumos.map(insumo => insumo.categoria)));

  const toggleCategory = (cat: string) => {
  setFilters(prev => ({
    ...prev,
    selectedCategories: prev.selectedCategories.includes(cat)
      ? prev.selectedCategories.filter(c => c !== cat)
      : [...prev.selectedCategories, cat]
  }));
};

  

  const getFilteredInsumos = () => {
    return insumos.filter(insumo => {

      // ✅ si no hay categorías seleccionadas, no se filtra 
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(insumo.categoria)) { 
      return false;
      }
      // if (filters.category !== 'all' && insumo.categoria !== filters.category) return false;
      if (filters.stockLevel === 'low' && insumo.stockActual > insumo.stockMinimo) return false;
      if (filters.stockLevel === 'normal' && insumo.stockActual <= insumo.stockMinimo) return false;
      if (!filters.includeOutOfStock && insumo.stockActual === 0) return false;
      return true;
    });
  };


  const uploadToSupabase = async (fileName: string, blob: Blob, contentType: string) => {
  const { error } = await supabase.storage .from('reportes') // nombre del bucket en Supabase 
  .upload(fileName, blob, { contentType, upsert: true }); 
  if (error) { toast({ title: "Error al subir archivo", description: error.message, variant: "destructive" });
  } else { toast({ title: "Archivo subido a Supabase",
  description: `Guardado como ${fileName}` });
  }
};

  const exportToPDF = async () => {
    try {
      const filteredInsumos = getFilteredInsumos();
      if (filteredInsumos.length === 0) {
        toast({ title: "Sin datos para exportar", description: "No hay insumos que coincidan con los filtros.", variant: "destructive" });
        return;
      }
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Inventario de Insumos de Limpieza', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);

      const tableData = filteredInsumos.map(insumo => [
        insumo.nombre ?? "N/A",
        insumo.categoria ?? "N/A",
        insumo.stockActual != null ? insumo.stockActual.toString() : "0",
        insumo.unidad ?? "N/A",
        insumo.stockMinimo != null ? insumo.stockMinimo.toString() : "0",
        insumo.stockActual != null && insumo.stockMinimo != null && insumo.stockActual <= insumo.stockMinimo ? "Bajo" : "Normal",
        insumo.ubicacion || "N/A",

        insumo.proveedor || "N/A" // ✅ proveedor agregado

      ]);

        autoTable(pdf, {
        head: [['Nombre','Categoría','Cantidad','Unidad','Stock Mín.','Estado','Ubicación','Proveedor']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [59,130,246], textColor: 255 },
        alternateRowStyles: { fillColor: [248,250,252] }
      });


       

      pdf.save(`inventario-${new Date().toISOString().split('T')[0]}.pdf`);

      const fileName = `inventario_${new Date().toISOString().split('T')[0].replaceAll("-", "_")}.pdf`;

      // ✅ subir a Supabase 
      const blob = pdf.output('blob'); 
      await uploadToSupabase(fileName, blob, 'application/pdf');

      toast({ title: "PDF exportado", description: `Se exportaron ${filteredInsumos.length} productos.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error al exportar PDF", description: "Ocurrió un error durante la exportación.", variant: "destructive" });
    }
  };

  const exportToImage = async () => {
    try {
      const filteredInsumos = getFilteredInsumos();
      if (filteredInsumos.length === 0) {
        toast({ title: "Sin datos para exportar", description: "No hay insumos que coincidan con los filtros.", variant: "destructive" });
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.innerHTML = `
        <h2 style="text-align:center;color:#1e40af;">Inventario de Insumos</h2>
        <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
        <p>Total de productos: ${filteredInsumos.length}</p>
        <ul>
          ${filteredInsumos.map(insumo => `<li>${insumo.nombre} - ${insumo.categoria} (${insumo.stockActual} ${insumo.unidad} ${insumo.proveedor})</li>`).join("")}
        </ul>
      `;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, { backgroundColor: 'white', scale: 2 });
      document.body.removeChild(tempDiv);

      const link = document.createElement('a');
      link.download = `inventario-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();

      const fileName = `inventario_${new Date().toISOString().split('T')[0].replaceAll("-", "_")}.pdf`;

      // ✅ subir a Supabase 
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve, 'image/png')); 
      if (blob) await uploadToSupabase(fileName, blob, 'image/png'); 
      

      toast({ title: "Imagen exportada", description: `Se exportaron ${filteredInsumos.length} productos.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error al exportar imagen", description: "Ocurrió un error durante la exportación.", variant: "destructive" });
    }
  };



     {/* const handleWhatsApp = async () => { 
     try { const fileName = `inventario_${new Date() 
     .toISOString() .split('T')[0] .replaceAll('-', '_')}.pdf`;

     // Obtener URL pública desde Supabase 
     const { data } = supabase.storage.from('reportes').getPublicUrl(fileName);
     const url = data.publicUrl;
     setPublicUrl(url);

     // Llamada al endpoint API de WhatsApp 
     const res = await fetch('/api/sendReport', { method: 'POST', headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ to: '+51999999999', mediaUrl: url, }),
     });


    let result; 
    try { result = await res.json();
    } catch { result = { success: false, error: "Respuesta vacía o no válida" };
    } if (result.success) { toast({ title: "WhatsApp enviado", description: `SID: ${result.sid}` });
    } else { 
    toast({ title: "Error al enviar WhatsApp", description: result.error, variant: "destructive" });
    }

    const result = await res.json();
    if (result.success) {
      toast({ title: "Reporte enviado por WhatsApp", description: `SID: ${result.sid}` });
    } else {
      toast({ title: "Error al enviar WhatsApp", description: result.error, variant: "destructive" });
    }
  } catch (err: any) {
    console.error(err);
    toast({ title: "Error inesperado", description: err.message, variant: "destructive" });



    }
  }; */}



 // 👉 Aquí defines la función handleEmail 

      const handleEmail = async () => {
      try { const fileName = `inventario_${new Date() 
      .toISOString() .split('T')[0] .replaceAll('-', '_')}.pdf`;
      const { data } = supabase.storage.from('reportes').getPublicUrl(fileName);
      const url = data.publicUrl; setPublicUrl(url); // Llamada a EmailJS 
      await emailjs.send( "service_p3z0oj4", // tu Service ID 
      "template_p9mb30a", // tu Template ID
      { to_email: toEmail, // 👉 correo ingresado en el input
      subject: "Reporte generado",
      message: "Adjunto tu reporte en PDF", attachment: url }, "yvuhymMR7Y5cCWH03" // tu Public Key 
      );
      toast({ title: "Reporte enviado por correo", description: "Se envió correctamente con EmailJS" });
      } catch (err: any) { console.error(err);
      toast({ title: "Error inesperado", description: err.message, variant: "destructive" });
      } 
   };

  

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Exportar Inventario</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <Label className="text-sm font-medium">Filtros de Exportación</Label>
          </div>

          {/* ✅ Checkboxes de categorías */} 
          <Label>Categorías</Label> 
          <div className="grid grid-cols-2 gap-2"> {categories.map(cat => ( 
          <div key={cat} className="flex items-center gap-2"> 
          <Checkbox checked={filters.selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} /> 
          <Label>{cat}</Label> </div> ))} 
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Categoría</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> // Todas
                  <div className="flex items-center gap-2">
          <Checkbox checked={filters.selectedCategories.length === categories.length} onCheckedChange={() => {
              if (filters.selectedCategories.length === categories.length) {
                setFilters({ ...filters, selectedCategories: [] });
              } else {
                setFilters({ ...filters, selectedCategories: categories });
              }
            }}
          />
          <Label>Seleccionar todas</Label>
        </div>
                  </SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}> // {cat}
                  <div className="flex items-center gap-2">
            <Checkbox checked={filters.selectedCategories.includes(cat)} onCheckedChange={() => {
                setFilters((prev) => {
                  const alreadySelected = prev.selectedCategories.includes(cat);
                  const newSelection = alreadySelected
                    ? prev.selectedCategories.filter((c) => c !== cat)
                    : [...prev.selectedCategories, cat];
                  return { ...prev, selectedCategories: newSelection };
                });
              }}
            />
            <Label>{cat}</Label>
          </div>
                  </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nivel de Stock</Label>
              <Select value={filters.stockLevel} onValueChange={(value) => setFilters({ ...filters, stockLevel: value })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Stock Bajo</SelectItem>
                  <SelectItem value="normal">Stock Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={filters.includeOutOfStock} onCheckedChange={(checked) => setFilters({ ...filters, includeOutOfStock: !!checked })} />
            <Label>Incluir productos sin stock</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={filters.includeImages} onCheckedChange={(checked) => setFilters({ ...filters, includeImages: !!checked })} />
            <Label>Incluir imágenes (solo PDF)</Label>
          </div>
        </div>

        <Separator />

        {/* Botones de exportación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
            <FileText className="h-4 w-4" /> Exportar PDF
          </Button>
          <Button onClick={exportToImage} variant="outline" className="flex items-center gap-2">
            <Image className="h-4 w-4" /> Exportar Imagen
          </Button>


          
      {/* Input para ingresar correo */}
      <input type="email" placeholder="Ingresa correo destinatario" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
        className="border p-2 rounded"
      />


          <Button
  onClick={handleEmail} // onClick={handleWhatsApp}
  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
>
  <Download className="h-4 w-4" /> Enviar por WhatsApp


</Button>

        


        </div>


        {/* Vista previa */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Vista Previa</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              Productos a exportar:{" "}
              <span className="font-medium">{getFilteredInsumos().length}</span>
            </p>
            <p>
              Productos con stock bajo:{" "}
              <span className="font-medium">
                {getFilteredInsumos().filter(
                  (insumo) => insumo.stockActual <= insumo.stockMinimo
                ).length}
              </span>
            </p>
            <p>
              Productos sin stock:{" "}
              <span className="font-medium">
                {getFilteredInsumos().filter(
                  (insumo) => insumo.stockActual === 0
                ).length}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;


