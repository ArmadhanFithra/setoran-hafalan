import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleDashed, Loader2} from 'lucide-react';

const DetailMahasiswa = () => {
  const { nim } = useParams();
  const navigate = useNavigate();
  
  const [dataDetail, setDataDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('TOKEN');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`https://api.tif.uin-suska.ac.id/setoran-dev/v1/mahasiswa/setoran/${nim}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        
        if (!response.ok || !result.response) {
          throw new Error(result.message || 'Gagal mengambil data');
        }
        
        setDataDetail(result.data);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [nim, navigate, refreshTrigger]);

  // Fungsi untuk Validasi (Mengubah status menjadi Selesai)
  const handleValidasi = async (surah) => {
    if (!window.confirm(`Validasi hafalan surah ${surah.nama}?`)) return;

    setIsProcessing(true);
    const token = localStorage.getItem('TOKEN');
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`https://api.tif.uin-suska.ac.id/setoran-dev/v1/mahasiswa/setoran/${nim}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_setoran: [{ id_komponen_setoran: surah.id, nama_komponen_setoran: surah.nama }],
          tgl_setoran: today
        })
      });
      
      if (!response.ok) throw new Error("Gagal melakukan validasi");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fungsi untuk Batalkan (Mengubah status kembali menjadi Belum Setor)
  const handleBatalkan = async (surah) => {
    if (!window.confirm(`Batalkan validasi hafalan surah ${surah.nama}?`)) return;

    setIsProcessing(true);
    const token = localStorage.getItem('TOKEN');

    try {
      const response = await fetch(`https://api.tif.uin-suska.ac.id/setoran-dev/v1/mahasiswa/setoran/${nim}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_setoran: [{ 
            id: surah.info_setoran.id, 
            id_komponen_setoran: surah.id, 
            nama_komponen_setoran: surah.nama 
          }]
        })
      });
      
      if (!response.ok) throw new Error("Gagal membatalkan setoran");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-emerald-600">
      <Loader2 className="animate-spin h-10 w-10 mb-4" />
      <p className="font-medium">Memuat Detail Hafalan...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
        <p className="font-bold mb-4">{errorMsg}</p>
        <button onClick={() => navigate('/dashboard')} className="bg-white px-4 py-2 rounded-lg border border-red-200">Kembali</button>
      </div>
    </div>
  );

  const { info, setoran } = dataDetail;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-3 text-emerald-600">
            <Loader2 className="animate-spin h-6 w-6" />
            <span className="font-bold">Memproses ke Server...</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 transition-all shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Setoran Mahasiswa</h1>
        </div>

        {/* Card Info Mahasiswa */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl shrink-0">
              {info.nama.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{info.nama}</h2>
              <p className="text-sm text-slate-500 mt-1">{info.nim} • Angkatan {info.angkatan}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center min-w-25">
              <p className="text-xs font-bold text-emerald-600">SUDAH</p>
              <p className="text-xl font-bold text-slate-900">{setoran.info_dasar.total_sudah_setor}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-25">
              <p className="text-xs font-bold text-slate-500">BELUM</p>
              <p className="text-xl font-bold text-slate-900">{setoran.info_dasar.total_belum_setor}</p>
            </div>
          </div>
        </div>

        {/* List Rincian Komponen */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Rincian Komponen Setoran</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {setoran.detail.map((surah) => (
              <div key={surah.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/40 transition-colors group">
                <div className="flex items-center space-x-4">
                  {surah.sudah_setor ? (
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  ) : (
                    <CircleDashed className="text-slate-300 shrink-0" size={24} />
                  )}
                  <div>
                    <p className={`font-bold ${surah.sudah_setor ? 'text-slate-900' : 'text-slate-400'}`}>
                      {surah.nama}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {surah.label.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {surah.sudah_setor ? (
                    <>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Tervalidasi</p>
                        <p className="text-[11px] text-slate-400">{surah.info_setoran.tgl_validasi}</p>
                      </div>
                      {/* TOMBOL BATALKAN */}
                      <button 
                        onClick={() => handleBatalkan(surah)}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        Batalkan
                      </button>
                    </>
                  ) : (
                    /* TOMBOL VALIDASI (Untuk yang belum setor) */
                    <button 
                      onClick={() => handleValidasi(surah)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      Validasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailMahasiswa;