import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Edit3
} from 'lucide-react';
import UpdateStockDialog from '@/components/UpdateStockDialog';

import { Trash2 } from "lucide-react";

interface StockUpdateData {
  insumoId: string;
  quantity: number;
  type: 'add' | 'subtract' | 'set';
  reason?: string;
}

const InventoryList: React.FC = () => {
  const { state, updateStock } = useInventory();
  const insumos = state.items;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumo, setSelectedInsumo] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const { clearHistory } = useInventory();

  // ✅ Filtro de búsqueda
  const filteredInsumos = insumos.filter(insumo =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return 'out';
    if (current <= minimum) return 'low';
    return 'good';
  };

  const getStockBadge = (current: number, minimum: number) => {
    const status = getStockStatus(current, minimum);
    switch (status) {
      case 'out':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Sin Stock
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3" />
            Stock Bajo
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Stock OK
          </Badge>
        );
    }
  };

  let pendingChange = 0; 
  let toastTimer: NodeJS.Timeout | null = null;


  const handleQuickUpdate = async (insumoId: string, type: 'add' | 'subtract', amount: number = 1) => {
    
  pendingChange += type === 'add' ? amount : -amount;
 // si ya hay un timer corriendo, lo reiniciamos 
   if (toastTimer) clearTimeout(toastTimer); // esperar un corto tiempo (ej. 500ms) antes de mostrar el toast 
   toastTimer = setTimeout(async () => {
   
   try { await updateStock(insumoId, pendingChange, `Ajuste rápido acumulado`);

   const unidades = Math.abs(pendingChange);
   const accion = pendingChange > 0 ? "agregaron" : "quitaron";

   toast({ title: "Stock actualizado",
   description: `Se ${accion} ${unidades} unidades correctamente.`,
        duration: 3000, // ⏱ se muestra 3 segundos y se cierra solo
      });
    // resetear acumulador 
   pendingChange = 0; toastTimer = null;
   } catch { toast({ title: "Error",
   description: "No se pudo actualizar el stock. Inténtalo de nuevo.",
   variant: "destructive", });
   pendingChange = 0; toastTimer = null; } }, 500); // ⏱ medio segundo de espera para acumular pulsaciones 

 };

  const handleUpdateStock = (insumoId: string) => {
    setSelectedInsumo(insumoId);
    setIsUpdateDialogOpen(true);
  };

  const handleStockUpdate = async (data: StockUpdateData) => {
    try {
      let changeAmount = data.quantity;
      if (data.type === 'subtract') {
        changeAmount = -data.quantity;
      } else if (data.type === 'set') {
        const currentInsumo = insumos.find(i => i.id === data.insumoId);
        if (currentInsumo) {
          changeAmount = data.quantity - currentInsumo.stockActual;
        }
      }
      await updateStock(data.insumoId, changeAmount, data.reason || 'Actualización manual');
      toast({ title: "Stock actualizado", description: "El stock se ha actualizado correctamente.", duration: 3000, // ⏱ aviso transitorio
});
      setIsUpdateDialogOpen(false);
      setSelectedInsumo(null);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario Actual</h2>
          <p className="text-gray-600">Gestiona las cantidades de tus insumos de limpieza</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <span>{filteredInsumos.length} productos</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nombre o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />

      </div>

      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="destructive" onClick={clearHistory} // sin insumo.id, porque es global 
        > <Trash2 className="w-4 h-4 mr-1" /> Borrar historial 
        </Button>
        </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsumos.map((insumo) => {
          const stockStatus = getStockStatus(insumo.stockActual, insumo.stockMinimo);
          return (
            <Card key={insumo.id} className={cn(
              "transition-all duration-200 hover:shadow-md",
              stockStatus === 'out' && "border-red-200 bg-red-50",
              stockStatus === 'low' && "border-yellow-200 bg-yellow-50"
            )}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{insumo.nombre}</h3>
                    <p className="text-sm text-gray-600 capitalize">{insumo.categoria}</p>
                  </div>
                  {getStockBadge(insumo.stockActual, insumo.stockMinimo)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stock Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Stock Actual</p>
                    <p className="text-2xl font-bold text-blue-600">{insumo.stockActual}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stock Mínimo</p>
                    <p className="text-lg font-semibold text-gray-900">{insumo.stockMinimo}</p>
                  </div>
                </div>
                {/* Unit */}
                <div className="text-sm">
                  <p className="text-gray-600">Unidad: <span className="font-medium">{insumo.unidad}</span></p>
                </div>
                {/* Quick Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleQuickUpdate(insumo.id, 'subtract')} disabled={insumo.stockActual === 0} className="h-8 w-8 p-0">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleQuickUpdate(insumo.id, 'add')} className="h-8 w-8 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button size="sm" variant="default" onClick={() => handleUpdateStock(insumo.id)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                    <Edit3 className="w-3 h-3" /> Actualizar
                  </Button>
                </div>
                {/* Stock Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>0</span>
                    <span>Mín: {insumo.stockMinimo}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        stockStatus === 'out' && "bg-red-500",
                        stockStatus === 'low' && "bg-yellow-500",
                        stockStatus === 'good' && "bg-green-500"
                      )}
                      style={{
                        width: `${Math.min((insumo.stockActual / (insumo.stockMinimo * 2)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInsumos.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos en el inventario'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Agrega algunos insumos para comenzar a gestionar tu inventario'
            }
          </p>
        </div>
      )}

      {/* Update Stock Dialog */}
      {selectedInsumo && (
        <UpdateStockDialog
          isOpen={isUpdateDialogOpen}
          onClose={() => {
            setIsUpdateDialogOpen(false);
            setSelectedInsumo(null);
          }}
          insumo={insumos.find(i => i.id === selectedInsumo)!}
          onUpdate={handleStockUpdate}
        />
      )}
    </div>
  );
};

export default InventoryList;
