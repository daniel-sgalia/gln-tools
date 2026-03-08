import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VisaPathwayExplorer from "./tools/visa-pathway/VisaPathway";
import CitySelector from "./tools/city-selector/CitySelector";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/visa" element={<VisaPathwayExplorer />} />
        <Route path="/cities" element={<CitySelector />} />
        <Route path="/GLN" element={<CitySelector />} />
        <Route path="*" element={<Navigate to="/GLN" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
