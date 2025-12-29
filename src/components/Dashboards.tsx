import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useInventory } from '@/context/InventoryContext';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { insumos } = useInventory() || { insumos: [] };

  const totalInsumos = insumos?.length ?? 0;
  const lowStockItems = insumos?.filter(i => i.cantidad <= i.stockMinimo).length ?? 0;
  const totalValue = insumos?.reduce((sum, i) => sum + (i.cantidad * i.precio), 0) ?? 0;
  const outOfStockItems = insumos?.filter(i => i.cantidad === 0).length ?? 0;

  const stats = [
    {
      title: 'Total de Insumos',
      value: totalInsumos,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Productos registrados'
    },
    {
      title: 'Stock Bajo',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Requieren reposición'
    },
    {
      title: 'Sin Stock',
      value: outOfStockItems,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Productos agotados'
    },
    {
      title: 'Valor Total',
      value: `$${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Valor del inventario'
    }
  ];

  const recentLowStock = insumos?.filter(i => i.cantidad <= i.stockMinimo).slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-2">Resumen general del inventario de limpieza</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Alertas de Stock Bajo
            </h3>
          </CardHeader>
          <CardContent>
            {recentLowStock.length > 0 ? (
              <div className="space-y-3">
                {recentLowStock.map((insumo) => (
                  <div key={insumo.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{insumo.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Stock actual: {insumo.cantidad} {insumo.unidad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-orange-600 font-medium">
                        Mínimo: {insumo.stockMinimo}
                      </p>
                      <p className="text-xs text-gray-500">{insumo.categoria}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay productos con stock bajo</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Resumen por Categoría
            </h3>
          </CardHeader>
          <CardContent>
            {(() => {
              const categoryCounts = insumos?.reduce((acc, insumo) => {
                acc[insumo.categoria] = (acc[insumo.categoria] || 0) + 1;
                return acc;
              }, {} as Record<string, number>) ?? {};

              const categories = Object.entries(categoryCounts);

              return categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.map(([categoria, count]) => (
                    <div key={categoria} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{categoria}</p>
                        <p className="text-sm text-gray-600">{count} productos</p>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${totalInsumos > 0 ? (count / totalInsumos) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay categorías disponibles</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
