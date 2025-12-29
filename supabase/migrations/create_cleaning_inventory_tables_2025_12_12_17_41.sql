-- Tabla de insumos de limpieza
CREATE TABLE IF NOT EXISTS public.insumos_limpieza_2025_12_12_17_41 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    unidad_medida VARCHAR(50) DEFAULT 'unidad',
    categoria VARCHAR(100),
    precio_unitario DECIMAL(10,2),
    stock_minimo INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de inventario actual
CREATE TABLE IF NOT EXISTS public.inventario_2025_12_12_17_41 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insumo_id UUID REFERENCES public.insumos_limpieza_2025_12_12_17_41(id) ON DELETE CASCADE,
    cantidad_actual INTEGER DEFAULT 0,
    notas TEXT,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    usuario_actualizacion TEXT
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS public.movimientos_inventario_2025_12_12_17_41 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insumo_id UUID REFERENCES public.insumos_limpieza_2025_12_12_17_41(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(20) CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste')),
    cantidad INTEGER NOT NULL,
    cantidad_anterior INTEGER,
    cantidad_nueva INTEGER,
    motivo TEXT,
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    usuario TEXT
);

-- Insertar algunos insumos de limpieza predeterminados
INSERT INTO public.insumos_limpieza_2025_12_12_17_41 (nombre, descripcion, unidad_medida, categoria) VALUES
('Detergente Líquido', 'Detergente para limpieza general', 'litros', 'Detergentes'),
('Desinfectante', 'Desinfectante multiusos', 'litros', 'Desinfectantes'),
('Escoba', 'Escoba de cerdas sintéticas', 'unidad', 'Herramientas'),
('Trapeador', 'Trapeador de microfibra', 'unidad', 'Herramientas'),
('Guantes de Limpieza', 'Guantes de látex desechables', 'pares', 'Protección'),
('Papel Higiénico', 'Rollo de papel higiénico', 'rollos', 'Papel'),
('Toallas de Papel', 'Toallas absorbentes', 'rollos', 'Papel'),
('Cloro', 'Hipoclorito de sodio', 'litros', 'Desinfectantes'),
('Jabón Líquido', 'Jabón líquido para manos', 'litros', 'Jabones'),
('Bolsas de Basura', 'Bolsas plásticas para residuos', 'unidad', 'Bolsas');

-- Crear registros de inventario inicial
INSERT INTO public.inventario_2025_12_12_17_41 (insumo_id, cantidad_actual, notas)
SELECT id, 0, 'Inventario inicial' FROM public.insumos_limpieza_2025_12_12_17_41;

-- Políticas RLS
ALTER TABLE public.insumos_limpieza_2025_12_12_17_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_2025_12_12_17_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario_2025_12_12_17_41 ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso a usuarios autenticados
CREATE POLICY "Permitir lectura insumos" ON public.insumos_limpieza_2025_12_12_17_41 FOR SELECT USING (true);
CREATE POLICY "Permitir escritura insumos" ON public.insumos_limpieza_2025_12_12_17_41 FOR ALL USING (true);

CREATE POLICY "Permitir lectura inventario" ON public.inventario_2025_12_12_17_41 FOR SELECT USING (true);
CREATE POLICY "Permitir escritura inventario" ON public.inventario_2025_12_12_17_41 FOR ALL USING (true);

CREATE POLICY "Permitir lectura movimientos" ON public.movimientos_inventario_2025_12_12_17_41 FOR SELECT USING (true);
CREATE POLICY "Permitir escritura movimientos" ON public.movimientos_inventario_2025_12_12_17_41 FOR ALL USING (true);