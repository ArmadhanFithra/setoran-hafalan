import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DetailMahasiswa from './pages/DetailMahasiswa'; // 1. Import file baru

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* 2. Tambahkan rute dengan parameter :nim */}
        <Route path="/mahasiswa/:nim" element={<DetailMahasiswa />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;