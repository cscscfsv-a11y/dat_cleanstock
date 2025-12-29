import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { InsumoForm } from './InsumoForm'; // 👈 importamos el formulario

const InsumosManager: React.FC = () => {
  const { state, addItem, updateItem, deleteItem } = useInventory();
  const insumos = state.items;
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categorias = ['Detergentes','Desinfectantes','Herramientas','Papel y Textiles','Químicos','Equipos','Otros'];
  const unidadesMedida = ['Litros','Kilogramos','Unidades','Metros','Cajas','Paquetes'];

  const handleEdit = (insumo: any) => {
    setEditingInsumo(insumo);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este insumo?')) {
      deleteItem(id);
      toast({ title: "Éxito", description: "Insumo eliminado correctamente" });
    }
  };

  const filteredInsumos = insumos.filter(insumo => {
    const matchesSearch =
      insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || insumo.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (insumo: any) => {
    if (insumo.cantidad === 0) return { label: 'Sin Stock', color: 'bg-red-500' };
    if (insumo.cantidad <= insumo.stockMinimo) return { label: 'Stock Bajo', color: 'bg-yellow-500' };
    return { label: 'Stock OK', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Insumos</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Insumo</DialogTitle>
              <DialogDescription>Completa los campos para registrar un insumo.</DialogDescription>
            </DialogHeader>
            <InsumoForm
              categorias={categorias}
              unidadesMedida={unidadesMedida}
              onSubmit={(data) => {
                addItem(data);
                toast({ title: "Éxito", description: "Insumo agregado correctamente" });
                setIsAddDialogOpen(false);
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar insumos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Insumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsumos.map((insumo) => {
          const stockStatus = getStockStatus(insumo);
          return (
            <Card key={insumo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{insumo.nombre}</h3>
                    <p className="text-sm text-gray-600">{insumo.categoria}</p>
                  </div>
                  <Badge className={`${stockStatus.color} text-white`}>
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {insumo.descripcion && (
                  <p className="text-sm text-gray-600">{insumo.descripcion}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Stock:</span>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {insumo.stockActual} {insumo.unidad}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Mínimo:</span>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {insumo.stockMinimo} {insumo.unidad}
                    </div>
                  </div>
                </div>
                {insumo.precioUnitario > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Precio:</span> ${insumo.precioUnitario.toFixed(2)}
                  </div>
                )}
                {insumo.proveedor && (
                  <div className="text-sm">
                    <span className="font-medium">Proveedor:</span> {insumo.proveedor}
                  </div>
                )}
                {insumo.fechaVencimiento && (
                  <div className="text-sm">
                    <span className="font-medium">Vencimiento:</span>{" "}
                    {new Date(insumo.fechaVencimiento).toLocaleDateString()}
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(insumo)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(insumo.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInsumos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No se encontraron insumos</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Insumo</DialogTitle>
            <DialogDescription>Modifica los campos del insumo seleccionado y guarda los cambios.</DialogDescription>
          </DialogHeader>
          <InsumoForm
            initialData={editingInsumo}
            categorias={categorias}
            unidadesMedida={unidadesMedida}
            onSubmit={(data) => {
            updateItem({ ...editingInsumo, ...data });
            toast({ title: "Éxito", description: "Insumo actualizado correctamente" });
            setIsEditDialogOpen(false);
            setEditingInsumo(null);
            }}
            onCancel={() => setIsEditDialogOpen(false)}
        />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsumosManager;



