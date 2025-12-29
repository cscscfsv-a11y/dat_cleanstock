

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { toast } from "@/components/ui/use-toast";

export interface InventoryItem {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  stockMinimo: number;
  proveedor: string;
  fechaVencimiento?: string;
  ubicacion: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}

interface InventoryState {
  items: InventoryItem[];
  movements: StockMovement[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'nombre' | 'cantidad' | 'fechaCreacion' | 'fechaVencimiento';
  sortOrder: 'asc' | 'desc';
}

type InventoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: InventoryItem[] }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'UPDATE_STOCK'; payload: { id: string; cantidad: number; motivo: string } }
  | { type: 'ADD_MOVEMENT'; payload: StockMovement }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_SORT'; payload: { sortBy: InventoryState['sortBy']; sortOrder: InventoryState['sortOrder'] } };



const initialState: InventoryState = {
  items: [],
  movements: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  sortBy: 'nombre',
  sortOrder: 'asc'
};




function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload], error: null };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...action.payload, fechaActualizacion: new Date().toISOString().split('T')[0] }
            : item
        ),
        error: null
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload), error: null };
    case 'UPDATE_STOCK':
      const { id, cantidad, motivo } = action.payload;
      const movement: StockMovement = {
        id: Date.now().toString(),
        itemId: id,
        tipo: cantidad > 0 ? 'entrada' : cantidad < 0 ? 'salida' : 'ajuste',
        cantidad: Math.abs(cantidad),
        motivo,
        fecha: new Date().toISOString(),
        usuario: 'Usuario Actual'
      };
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id
            ? { ...item, stockActual: Math.max(0, item.stockActual + cantidad), fechaActualizacion: new Date().toISOString().split('T')[0] }
            : item
        ),
        movements: [movement, ...state.movements],
        error: null
      };
    case 'ADD_MOVEMENT':
      return { ...state, movements: [action.payload, ...state.movements] };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    default:
      return state;
  }
}


interface InventoryContextType {
  state: InventoryState;
  addItem: (item: Omit<InventoryItem, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStock: (id: string, cantidad: number, motivo: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSorting: (sortBy: InventoryState['sortBy'], sortOrder: InventoryState['sortOrder']) => void;
  getFilteredItems: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getExpiringItems: (days?: number) => InventoryItem[];
  getCategories: () => string[];
  getTotalValue: () => number;
  getItemById: (id: string) => InventoryItem | undefined;
}
















const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // ✅ Cargar insumos desde Supabase
  useEffect(() => {
    const fetchItems = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.from('insumos').select('*');
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else {
        const items = (data ?? []).map((row: any) => ({
          id: row.id,
          nombre: row.nombre,
          categoria: row.categoria,
          stockActual: row.stockactual,
          unidad: row.unidadmedida,
          precioUnitario: row.precio,
          stockMinimo: row.stockminimo,
          proveedor: row.proveedor,
          fechaVencimiento: row.fechaVencimiento,
          ubicacion: 'Almacén principal',
          descripcion: row.descripcion,
          fechaCreacion: new Date().toISOString().split('T')[0],
          fechaActualizacion: new Date().toISOString().split('T')[0],
        }));
        dispatch({ type: 'SET_ITEMS', payload: items });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    fetchItems();
  }, []);


  const addItem = async (itemData: Omit<InventoryItem, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const { data, error } = await supabase.from('insumos').insert({
      nombre: itemData.nombre,
      categoria: itemData.categoria,
      stockactual: itemData.cantidad,
      unidadmedida: itemData.unidad,
      precio: itemData.precioUnitario,
      stockminimo: itemData.stockMinimo,
      proveedor: itemData.proveedor,
      fechavencimiento: itemData.fechaVencimiento,
      descripcion: itemData.descripcion
    }).select();
    if (!error && data) {
      const newItem = {
        ...itemData,
        id: data[0].id,
        fechaCreacion: new Date().toISOString().split('T')[0],
        fechaActualizacion: new Date().toISOString().split('T')[0]
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    }
  };

  const updateItem = async (item: InventoryItem) => {
    await supabase.from('insumos').update({
      nombre: item.nombre,
      categoria: item.categoria,
      stockactual: item.cantidad,
      unidadmedida: item.unidad,
      precio: item.precioUnitario,
      stockminimo: item.stockMinimo,
      proveedor: item.proveedor,
      fechaVencimiento: item.fechaVencimiento,
      descripcion: item.descripcion
    }).eq('id', item.id);
    dispatch({ type: 'UPDATE_ITEM', payload: item });
  };

  const deleteItem = async (id: string) => {
    await supabase.from('insumos').delete().eq('id', id);
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  const updateStock = async (id: string, change: number, motivo: string) => {
  // 1. Buscar insumo actual en el estado
  const current = state.items.find(i => i.id === id);
  if (!current) throw new Error("Insumo no encontrado");

  // 2. Calcular nueva cantidad
  const newCantidad = Math.max(0, current.stockActual + change);

  // 3. Actualizar stock en tabla "insumos"
  const { error: updateError } = await supabase
    .from("insumos")
    .update({
      stockactual: newCantidad, // 👈 nombre exacto de la columna
    })
    .eq("id", id);

  if (updateError) {
    dispatch({ type: "SET_ERROR", payload: updateError.message });
    return;
  }








  // 4. Registrar movimiento en tabla de historial
  const { error: movementError } = await supabase
    .from("movimientos_inventario_2025_12_12_18_00")
    .insert({
      producto_id: id,
      tipo_movimiento: change > 0 ? "entrada" : change < 0 ? "salida" : "ajuste",
      cantidad: Math.abs(change),
      precio_unitario: current.precioUnitario, // 👈 guardamos el precio del insumo
      motivo,
      referencia: null, // puedes pasar algún código de referencia si lo necesitas
      usuario_id: "00000000-0000-0000-0000-000000000000", // 👈 UUID real del usuario si lo tienes
      fecha_movimiento: new Date().toISOString(),
    });

  if (movementError) {
    dispatch({ type: "SET_ERROR", payload: movementError.message });
    return;
  }

  // 5. Actualizar también en el contexto local
  dispatch({ type: "UPDATE_STOCK", payload: { id, cantidad: change, motivo } });



  

  // const updateStock = async (id: string, cantidad: number, motivo: string) => {
    // await supabase.from('insumos').update({
      // stockactual: supabase.raw(`stockActual + ${row.stockactual}`)
    // }).eq('id', id

    // );

    // if (error) {
      // dispatch({ type: 'SET_ERROR', payload: error.message });
      // return;
    // }

    // ✅ Actualizar también en el contexto local
    // dispatch({ type: 'UPDATE_STOCK', payload: { id, cantidad , motivo } });
  };


  const clearHistory = async () => {
  try {
    const { error } = await supabase
      .from("movimientos_inventario_2025_12_12_18_00") // 👈 tu tabla de historial
      .delete()
      .eq( 'usuario_id', "00000000-0000-0000-0000-000000000000" ); // elimina todos los registros

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo borrar el historial.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Historial borrado",
        description: "Todos los movimientos fueron eliminados correctamente.",
        duration: 3000,
      });
    }
  } catch {
    toast({
      title: "Error",
      description: "Ocurrió un problema al borrar el historial.",
      variant: "destructive",
    });
  }
};



  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  const setSelectedCategory = (category: string) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  const setSorting = (sortBy: InventoryState['sortBy'], sortOrder: InventoryState['sortOrder']) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  };

  const getFilteredItems = (): InventoryItem[] => {
    let filtered = [...state.items];
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.nombre.toLowerCase().includes(searchLower) ||
        item.categoria.toLowerCase().includes(searchLower) ||
        item.proveedor.toLowerCase().includes(searchLower) ||
        item.descripcion?.toLowerCase().includes(searchLower)
      );
    }
    if (state.selectedCategory) {
      filtered = filtered.filter(item => item.categoria === state.selectedCategory);
    }
    filtered.sort((a, b) => {
      let aValue: any = a[state.sortBy];
      let bValue: any = b[state.sortBy];
      if (state.sortBy === 'fechaCreacion' || state.sortBy === 'fechaVencimiento') {
        aValue = new Date(aValue || '').getTime();
        bValue = new Date(bValue || '').getTime();
      }
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      return state.sortOrder === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
    return filtered;
  };

  const getLowStockItems = (): InventoryItem[] => {
    return state.items.filter(item => item.cantidad <= item.stockMinimo);
  };

  const getExpiringItems = (days: number = 30): InventoryItem[] => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return state.items.filter(item => {
      if (!item.fechaVencimiento) return false;
      const expiryDate = new Date(item.fechaVencimiento);
      return expiryDate <= futureDate && expiryDate >= new Date();
    });
  };

  const getCategories = (): string[] => {
    const categories = [...new Set(state.items.map(item => item.categoria))];
    return categories.sort();
  };

  const getTotalValue = (): number => {
    return state.items.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0);
  };

  const getItemById = (id: string): InventoryItem | undefined => {
    return state.items.find(item => item.id === id);
  };

  const contextValue: InventoryContextType = {
    state,
    addItem,
    updateItem,
    deleteItem,
    updateStock,
    setSearchTerm,
    setSelectedCategory,
    setSorting,
    getFilteredItems,
    getLowStockItems,
    getExpiringItems,
    getCategories,
    getTotalValue,
    getItemById,

    clearHistory // 👈 agrega aquí también

  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>

  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory debe ser usado dentro de un InventoryProvider');
  }
  return context;
}

























