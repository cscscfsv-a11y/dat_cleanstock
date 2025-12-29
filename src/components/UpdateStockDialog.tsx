import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Minus } from 'lucide-react';

interface UpdateStockFormData {
  insumoId: string;
  quantity: number;
  type: 'entrada' | 'salida';
  reason: string;
  notes?: string;
}

export default function UpdateStockDialog() {

  const { state, updateStock } = useInventory();
  const insumos = state.items ?? [];
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateStockFormData>({
    insumoId: '',
    quantity: 0,
    type: 'entrada',
    reason: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.insumoId || formData.quantity <= 0 || !formData.reason.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    const selectedInsumo = (insumos ?? []).find(insumo => insumo.id === formData.insumoId);
    if (!selectedInsumo) {
      toast({
        title: 'Error',
        description: 'Insumo no encontrado',
        variant: 'destructive',
      });
      return;
    }

    if (formData.type === 'salida' && selectedInsumo.cantidad < formData.quantity) {
      toast({
        title: 'Error',
        description: 'No hay suficiente stock disponible',
        variant: 'destructive',
      });
      return;
    }

    try {
      updateStock(
        formData.insumoId,
        formData.quantity,
        formData.type,
        formData.reason,
        formData.notes
      );

      toast({
        title: 'Éxito',
        description: `Stock ${formData.type === 'entrada' ? 'agregado' : 'reducido'} correctamente`,
      });

      setFormData({
        insumoId: '',
        quantity: 0,
        type: 'entrada',
        reason: '',
        notes: '',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el stock',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof UpdateStockFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedInsumo = (insumos ?? []).find(insumo => insumo.id === formData.insumoId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Package className="h-4 w-4" />
          Actualizar Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Actualizar Stock
          </DialogTitle>
          <DialogDescription>
            Completa los campos para registrar la entrada o salida de stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de insumo */}
          <div className="space-y-2">
            <Label htmlFor="insumo">Insumo *</Label>
            <Select
              value={formData.insumoId}
              onValueChange={(value) => handleInputChange('insumoId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un insumo" />
              </SelectTrigger>
              <SelectContent>
                {(insumos ?? []).map((insumo) => (
                  <SelectItem key={insumo.id} value={insumo.id}>
                    {insumo.nombre} - Stock actual: {insumo.cantidad} {insumo.unidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info del insumo seleccionado */}
          {selectedInsumo && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <p className="text-sm text-blue-800">
                <strong>Stock actual:</strong> {selectedInsumo.stockActual} {selectedInsumo.unidad}
              </p>
              {selectedInsumo.stockMinimo && selectedInsumo.stockActual <= selectedInsumo.stockMinimo && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Stock por debajo del mínimo ({selectedInsumo.stockMinimo})
                </p>
              )}
            </div>
          )}

          {/* Tipo de movimiento y cantidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Movimiento *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'entrada' | 'salida') => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      Entrada
                    </div>
                  </SelectItem>
                  <SelectItem value="salida">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Salida
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>















            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="0.01"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) => handleInputChange('reason', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el motivo" />
              </SelectTrigger>
              <SelectContent>
                {formData.type === 'entrada' ? (
                  <>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="devolucion">Devolución</SelectItem>
                    <SelectItem value="ajuste_inventario">Ajuste de Inventario</SelectItem>
                    <SelectItem value="donacion">Donación</SelectItem>
                    <SelectItem value="otro_entrada">Otro</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="uso_operacional">Uso Operacional</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="perdida">Pérdida</SelectItem>
                    <SelectItem value="vencimiento">Vencimiento</SelectItem>
                    <SelectItem value="ajuste_inventario">Ajuste de Inventario</SelectItem>
                    <SelectItem value="otro_salida">Otro</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Información adicional sobre el movimiento..."
              rows={3}
            />
          </div>

          {/* Resultado */}
          {formData.insumoId && formData.quantity > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700">
                <strong>Resultado:</strong> {selectedInsumo?.stockActual || 0} {selectedInsumo?.unidad} 
                {formData.type === 'entrada' ? ' + ' : ' - '}
                {formData.quantity} ={' '}
                <span
                  className={`font-semibold ${
                    formData.type === 'entrada'
                      ? 'text-green-600'
                      : selectedInsumo && selectedInsumo.stockActual - formData.quantity < 0
                        ? 'text-red-600'
                        : 'text-blue-600'
                  }`}
                >
                  {selectedInsumo
                    ? formData.type === 'entrada'
                      ? selectedInsumo.stockActual + formData.quantity
                      : selectedInsumo.stockActual - formData.quantity
                    : 0}{' '}
                  {selectedInsumo?.unidad}
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`gap-2 ${
                formData.type === 'entrada'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {formData.type === 'entrada' ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              {formData.type === 'entrada' ? 'Agregar Stock' : 'Reducir Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
