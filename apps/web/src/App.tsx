import { BrowserRouter, Routes, Route } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">ELEVaiT</h1>
        <p className="text-xl opacity-80">Elevator Monitoring Platform</p>
        <p className="text-sm opacity-60 mt-2">Phase 1 Foundation - Ready for development</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
