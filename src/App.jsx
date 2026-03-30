import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VisaPathwayExplorer from "./tools/visa-pathway/VisaPathway";
import CitySelector from "./tools/city-selector/CitySelector";
import AdminApp from "./admin/AdminApp";
import DemoShell from "./components/DemoShell";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/visa" element={<DemoShell><VisaPathwayExplorer /></DemoShell>} />
        <Route path="/cities" element={<DemoShell><CitySelector /></DemoShell>} />
        <Route path="/gln-tools" element={<DemoShell><CitySelector /></DemoShell>} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/gln-tools" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
