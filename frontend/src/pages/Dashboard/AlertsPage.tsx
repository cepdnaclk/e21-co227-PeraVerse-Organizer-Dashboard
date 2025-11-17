import React from "react";
import AlertWidget from "../Dashboard/components/AlertWidget";

const AlertsPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Alerts</h2>
      <AlertWidget />
    </div>
  );
};

export default AlertsPage;