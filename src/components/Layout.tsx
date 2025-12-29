import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Package, BarChart3, FileDown, ClipboardList } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const navigationItems = [
    { id: "dashboard", label: "Panel Principal", icon: Home, description: "Vista general del inventario" },
    { id: "inventory", label: "Inventario", icon: Package, description: "Lista completa de insumos" },
    { id: "manage", label: "Gestionar Insumos", icon: ClipboardList, description: "Agregar y editar productos" },
    { id: "reports", label: "Reportes", icon: BarChart3, description: "Análisis y estadísticas" },
    { id: "export", label: "Exportar Datos", icon: FileDown, description: "Descargar información" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-green-50">
      <div className="p-6 border-b border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">CleanStock</h2>
            <p className="text-sm text-gray-600">Gestión de Inventario</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white hover:shadow-md"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
              <div className="flex-1">
                <div className={cn("font-medium", isActive ? "text-white" : "text-gray-800")}>
                  {item.label}
                </div>
                <div className={cn("text-xs", isActive ? "text-blue-100" : "text-gray-500")}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-200">
        <div className="flex items-center space-x-3 px-4 py-3 bg-white rounded-lg shadow-sm">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">Administrador</div>
            <div className="text-xs text-gray-500">Sistema de Inventario</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white shadow-sm border-b border-blue-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-800">CleanStock</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {navigationItems.find((item) => item.id === activeTab)?.label}
            </div>
          </div>
        </header>
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-80 bg-white shadow-lg border-r border-blue-200">
            <SidebarContent />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {!isMobile && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {navigationItems.find((item) => item.id === activeTab)?.label}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {navigationItems.find((item) => item.id === activeTab)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Última actualización: {new Date().toLocaleDateString("es-ES")}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
