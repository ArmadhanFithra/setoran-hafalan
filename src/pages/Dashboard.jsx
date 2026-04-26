import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, LogOut, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // States
  const [dosenData, setDosenData] = useState(null);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('TOKEN');
    localStorage.removeItem('KC_REFRESH_TOKEN');
    localStorage.removeItem('KC_TOKEN_ID');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('TOKEN');
    
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('https://api.tif.uin-suska.ac.id/setoran-dev/v1/dosen/pa-saya', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (result.response) {
          setDosenData(result.data);
          setMahasiswaList(result.data.info_mahasiswa_pa.daftar_mahasiswa);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, handleLogout]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-emerald-600 bg-slate-50 font-medium">Memuat Data Dashboard...</div>;
  }

  const avatarInitial = dosenData?.nama ? dosenData.nama.charAt(0).toUpperCase() : 'D';
  const totalMahasiswa = mahasiswaList.length;

  const filteredMahasiswa = mahasiswaList.filter((mhs) => {
    const query = searchQuery.toLowerCase();
    return (
      mhs.nama.toLowerCase().includes(query) || 
      mhs.nim.toLowerCase().includes(query)
    );
  });

  return (
    // Mengubah layout utama menjadi vertikal (flex-col)
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER / NAVBAR ATAS */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <BookOpen size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Havalin</h1>
            <p className="text-xs text-emerald-600 font-medium tracking-wide">Portal Dosen PA</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-all border border-transparent hover:border-red-100"
        >
          <span className="hidden sm:inline">Keluar</span>
          <LogOut size={18} />
        </button>
      </nav>

      {/* MAIN CONTENT (Lebih lebar dan berada di tengah) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 sm:p-8">
        
        {/* Card Profil Dosen */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          {/* Aksen visual halus di background card profil */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60"></div>

          <div className="flex items-center space-x-6 z-10">
            <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-emerald-200">
              {avatarInitial}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{dosenData?.nama}</h2>
              <p className="text-slate-500 mt-1">NIP. {dosenData?.nip} • Dosen Pembimbing Akademik</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl p-5 text-center min-w-40 shadow-sm z-10">
            <p className="text-xs font-bold text-emerald-600 mb-1 tracking-wider">TOTAL MAHASISWA</p>
            <p className="text-4xl font-black text-slate-900">{totalMahasiswa}</p>
          </div>
        </div>

        {/* Tabel Mahasiswa */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Daftar Mahasiswa Bimbingan</h3>
            </div>
            
            {/* Input Pencarian */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama atau NIM..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-72 bg-white transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-5 px-6">Mahasiswa</th>
                  <th className="py-5 px-6">Angkatan</th>
                  <th className="py-5 px-6">Progres Hafalan</th>
                  <th className="py-5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMahasiswa.length > 0 ? (
                  filteredMahasiswa.map((mhs, index) => {
                    const info = mhs.info_setoran || {};
                    const progres = info.persentase_progres_setor || 0;
                    const sudahSetor = info.total_sudah_setor || 0;
                    const wajibSetor = info.total_wajib_setor || 23;
                    const mhsInitial = mhs.nama.substring(0, 2).toUpperCase();
                    
                    return (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-emerald-100 transition-colors">
                              {mhsInitial}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{mhs.nama}</p>
                              <p className="text-sm text-slate-500 font-medium">{mhs.nim}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900">{mhs.angkatan}</p>
                          <p className="text-xs text-slate-500 font-medium">Semester {mhs.semester}</p>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm mb-1.5">
                            <span className="font-bold text-slate-700">{sudahSetor} / {wajibSetor} Surah</span>
                            <span className={progres > 0 ? "text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md" : "text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md"}>
                              {progres}%
                            </span>
                          </div>
                          <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                              style={{ width: `${progres}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => navigate('/mahasiswa/' + mhs.nim)}
                            className="inline-flex items-center space-x-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm"
                          >
                            <span>Detail</span>
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Search size={32} className="mb-3 opacity-20" />
                        <p className="font-medium text-slate-500">Tidak ada mahasiswa yang cocok dengan pencarian "{searchQuery}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;