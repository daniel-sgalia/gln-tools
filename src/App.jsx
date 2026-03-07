import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VisaPathwayExplorer from "./tools/visa-pathway/VisaPathway";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/visa" element={<VisaPathwayExplorer />} />
        <Route path="*" element={<Navigate to="/visa" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
