import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VisaPathwayExplorer from "./tools/visa-pathway/VisaPathway";
import CitySelector from "./tools/city-selector/CitySelector";
import AdminApp from "./admin/AdminApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/visa" element={<VisaPathwayExplorer />} />
        <Route path="/cities" element={<CitySelector />} />
        <Route path="/gln-tools" element={<CitySelector />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/gln-tools" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
