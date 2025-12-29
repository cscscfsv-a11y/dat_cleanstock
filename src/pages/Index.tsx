import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import InsumosManager from "@/components/InsumosManager";
import InventoryList from "@/components/InventoryList";
import ExportPanel from "@/components/ExportPanel";

type Tab = "dashboard" | "inventory" | "manage" | "reports" | "export";

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryList />;
      case "manage":
        return <InsumosManager />;
      case "reports":
        return <div>Reportes aquí</div>;
      case "export":
        return <ExportPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
