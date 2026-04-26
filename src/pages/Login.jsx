import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { BookOpen, User, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate(); // 2. Inisialisasi navigate
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const keycloakUrl = 'https://id.tif.uin-suska.ac.id/realms/dev/protocol/openid-connect/token';
    const params = new URLSearchParams();
    params.append('client_id', 'setoran-mobile-dev');
    params.append('client_secret', 'aqJp3xnXKudgC7RMOshEQP7ZoVKWzoSl');
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('scope', 'openid profile email');

    try {
      const response = await fetch(keycloakUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        // Cek jika error dari API Keycloak adalah masalah kredensial
        if (data.error_description === 'Invalid user credentials' || data.error === 'invalid_grant') {
          throw new Error('Username atau Password salah.');
        }
        
        // Jika ada error bentuk lain dari server, tampilkan ini
        throw new Error('Terjadi kesalahan pada server. Silakan coba lagi.');
      }

      // Simpan token ke storage
      localStorage.setItem('TOKEN', data.access_token);
      localStorage.setItem('KC_REFRESH_TOKEN', data.refresh_token);
      localStorage.setItem('KC_TOKEN_ID', data.id_token);

      // 3. JALANKAN PERINTAH PINDAH HALAMAN
      navigate('/dashboard');
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">Havalin</h2>
          <p className="mt-2 text-center text-sm font-medium text-emerald-600">Portal Dosen PA</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email / Username</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center"><User className="h-5 w-5 text-slate-400" /></div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan email atau username"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center"><Lock className="h-5 w-5 text-slate-400" /></div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Masuk ke Havalin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;