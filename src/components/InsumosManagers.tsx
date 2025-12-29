import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

interface Insumo {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  stockMinimo: number;
  stockActual: number;
  unidadMedida: string;
  precio: number;
  proveedor: string;
  fechaVencimiento?: string;
}

interface InsumoFormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  stockMinimo: number;
  stockActual: number;
  unidadMedida: string;
  precio: number;
  proveedor: string;
  fechaVencimiento: string;
}

const InsumosManager: React.FC = () => {
  const { insumos, addInsumo, updateInsumo, deleteInsumo } = useInventory();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const initialFormData: InsumoFormData = {
    nombre: '',
    descripcion: '',
    categoria: '',
    stockMinimo: 0,
    stockActual: 0,
    unidadMedida: '',
    precio: 0,
    proveedor: '',
    fechaVencimiento: ''
  };

  const [formData, setFormData] = useState<InsumoFormData>(initialFormData);

  const categorias = [
    'Detergentes',
    'Desinfectantes',
    'Herramientas',
    'Papel y Textiles',
    'Químicos',
    'Equipos',
    'Otros'
  ];

  const unidadesMedida = [
    'Litros',
    'Kilogramos',
    'Unidades',
    'Metros',
    'Cajas',
    'Paquetes'
  ];

  const handleInputChange = (field: keyof InsumoFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.categoria || !formData.unidadMedida) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const insumoData: Omit<Insumo, 'id'> = {
      ...formData,
      fechaVencimiento: formData.fechaVencimiento || undefined
    };

    if (editingInsumo) {
      updateInsumo(editingInsumo.id, insumoData);
      toast({
        title: "Éxito",
        description: "Insumo actualizado correctamente"
      });
      setIsEditDialogOpen(false);
      setEditingInsumo(null);
    } else {
      addInsumo(insumoData);
      toast({
        title: "Éxito",
        description: "Insumo agregado correctamente"
      });
      setIsAddDialogOpen(false);
    }

    setFormData(initialFormData);
  };

  const handleEdit = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setFormData({
      nombre: insumo.nombre,
      descripcion: insumo.descripcion,
      categoria: insumo.categoria,
      stockMinimo: insumo.stockMinimo,
      stockActual: insumo.stockActual,
      unidadMedida: insumo.unidadMedida,
      precio: insumo.precio,
      proveedor: insumo.proveedor,
      fechaVencimiento: insumo.fechaVencimiento || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
      deleteInsumo(id);
      toast({
        title: "Éxito",
        description: "Insumo eliminado correctamente"
      });
    }
  };

  const filteredInsumos = insumos.filter(insumo => {
    const matchesSearch = insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insumo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || insumo.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (insumo: Insumo) => {
    if (insumo.stockActual === 0) return { status: 'sin-stock', label: 'Sin Stock', color: 'bg-red-500' };
    if (insumo.stockActual <= insumo.stockMinimo) return { status: 'stock-bajo', label: 'Stock Bajo', color: 'bg-yellow-500' };
    return { status: 'stock-ok', label: 'Stock OK', color: 'bg-green-500' };
  };

  const InsumoForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Nombre del insumo"
            required
          />
        </div>
        <div>
          <Label htmlFor="categoria">Categoría *</Label>
          <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange('descripcion', e.target.value)}
          placeholder="Descripción del insumo"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="stockActual">Stock Actual</Label>
          <Input
            id="stockActual"
            type="number"
            value={formData.stockActual}
            onChange={(e) => handleInputChange('stockActual', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="stockMinimo">Stock Mínimo</Label>
          <Input
            id="stockMinimo"
            type="number"
            value={formData.stockMinimo}
            onChange={(e) => handleInputChange('stockMinimo', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
          <Select value={formData.unidadMedida} onValueChange={(value) => handleInputChange('unidadMedida', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona unidad" />
            </SelectTrigger>
            <SelectContent>
              {unidadesMedida.map(unidad => (
                <SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="precio">Precio</Label>
          <Input
            id="precio"
            type="number"
            step="0.01"
            value={formData.precio}
            onChange={(e) => handleInputChange('precio', parseFloat(e.target.value) || 0)}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="proveedor">Proveedor</Label>
          <Input
            id="proveedor"
            value={formData.proveedor}
            onChange={(e) => handleInputChange('proveedor', e.target.value)}
            placeholder="Nombre del proveedor"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
        <Input
          id="fechaVencimiento"
          type="date"
          value={formData.fechaVencimiento}
          onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData(initialFormData);
            setEditingInsumo(null);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {editingInsumo ? 'Actualizar' : 'Agregar'} Insumo
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Insumos</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Insumo</DialogTitle>
            </DialogHeader>
            <InsumoForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                      {insumo.stockActual} {insumo.unidadMedida}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Mínimo:</span>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {insumo.stockMinimo} {insumo.unidadMedida}
                    </div>
                  </div>
                </div>

                {insumo.precio > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Precio:</span> ${insumo.precio.toFixed(2)}
                  </div>
                )}

                {insumo.proveedor && (
                  <div className="text-sm">
                    <span className="font-medium">Proveedor:</span> {insumo.proveedor}
                  </div>
                )}

                {insumo.fechaVencimiento && (
                  <div className="text-sm">
                    <span className="font-medium">Vencimiento:</span> {new Date(insumo.fechaVencimiento).toLocaleDateString()}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(insumo)}
                  >
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
          </DialogHeader>
          <InsumoForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsumosManager;