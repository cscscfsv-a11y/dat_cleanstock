import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InsumoFormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  stockMinimo: number;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  proveedor: string;
  fechaVencimiento: string;
}

interface InsumoFormProps {
  initialData?: InsumoFormData;
  categorias: string[];
  unidadesMedida: string[];
  onSubmit: (data: InsumoFormData) => void;
  onCancel: () => void;
}

export const InsumoForm: React.FC<InsumoFormProps> = ({
  initialData,
  categorias,
  unidadesMedida,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<InsumoFormData>(
    initialData || {
      nombre: "",
      descripcion: "",
      categoria: "",
      stockMinimo: 0,
      cantidad: 0,
      unidad: "",
      precioUnitario: 0,
      proveedor: "",
      fechaVencimiento: ""
    }
  );

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (field: keyof InsumoFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nombre</Label>
        <Input value={formData.nombre} onChange={(e) => handleInputChange("nombre", e.target.value)} required />
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea value={formData.descripcion} onChange={(e) => handleInputChange("descripcion", e.target.value)} />
      </div>
      <div>
        <Label>Categoría</Label>
        <Select value={formData.categoria} onValueChange={(val) => handleInputChange("categoria", val)}>
          <SelectTrigger><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
          <SelectContent>
            {categorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Stock mínimo</Label>
          <Input type="number" value={formData.stockMinimo} onChange={(e) => handleInputChange("stockMinimo", Number(e.target.value))} />
        </div>
        <div>
          <Label>Cantidad</Label>
          <Input type="number" value={formData.cantidad} onChange={(e) => handleInputChange("cantidad", Number(e.target.value))} />
        </div>
      </div>
      <div>
        <Label>Unidad</Label>
        <Select value={formData.unidad} onValueChange={(val) => handleInputChange("unidad", val)}>
          <SelectTrigger><SelectValue placeholder="Selecciona unidad" /></SelectTrigger>
          <SelectContent>
            {unidadesMedida.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Precio Unitario</Label>
        <Input type="number" value={formData.precioUnitario} onChange={(e) => handleInputChange("precioUnitario", Number(e.target.value))} />
      </div>
      <div>
        <Label>Proveedor</Label>
        <Input value={formData.proveedor} onChange={(e) => handleInputChange("proveedor", e.target.value)} />
      </div>
      <div>
        <Label>Fecha de Vencimiento</Label>
        <Input type="date" value={formData.fechavencimiento} onChange={(e) => handleInputChange("fechavencimiento", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initialData ? "Actualizar" : "Agregar"} Insumo</Button>
      </div>
    </form>
  );
};

