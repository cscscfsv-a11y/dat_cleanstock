import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  categoria: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AddInsumoDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [nombreDialog, setNombreDialog] = useState(false);
  const { addItem } = useInventory();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      nombre: '',
      categoria: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    await addItem({ id: Date.now().toString(), ...data });
    toast({ title: 'Insumo agregado', description: 'Guardado correctamente.' });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Insumo
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[600px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Insumo</DialogTitle>
          <DialogDescription>Completa la información.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Nombre bloqueado */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      placeholder="Haz clic para ingresar nombre"
                      onClick={() => setNombreDialog(true)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ventana flotante para Nombre */}
            <Dialog open={nombreDialog} onOpenChange={setNombreDialog}>
              <DialogContent
                className="sm:max-w-[400px]"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>Ingresar Nombre</DialogTitle>
                  <DialogDescription>Escribe el nombre del insumo.</DialogDescription>
                </DialogHeader>
                <Textarea
                  autoFocus
                  value={form.getValues('nombre')}
                  onChange={(e) => form.setValue('nombre', e.target.value)}
                  placeholder="Ej: Detergente multiusos"
                />
                <DialogFooter>
                  <Button onClick={() => setNombreDialog(false)}>Aceptar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Otro campo normal */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Químicos" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 text-white">
                Agregar Insumo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInsumoDialog;
