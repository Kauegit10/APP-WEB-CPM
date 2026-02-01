
import React, { useState, useEffect, useRef } from 'react';
import { InjecoesDeKing } from './services/api';
import { getGameAssistance } from './services/gemini';
import { 
  SiteUser, Product, GiftCode, AppView, PlayerData 
} from './types';
import { 
  User, Menu, X, Crown, Loader2, ShieldCheck,
  Store, Package, ShoppingBag,
  Copy, Key, Eye, ShoppingCart, Ticket, 
  LayoutDashboard, Sparkles, Send, QrCode, RefreshCw, Zap, Star, UserPlus, LogIn
} from 'lucide-react';

const STORAGE_VER = "v101"; 
const ADMIN_EMAIL = "Kauemito24ff@gmail.com";
const ADMIN_PASSWORD = "324562yzx";
const MP_TOKEN = "APP_USR-6808532253078741-112221-c04cbe90fdae9a3f686ec052b0fb3807-778681188";
const PROXY = "https://corsproxy.io/?";

const App: React.FC = () => {
  const [siteUser, setSiteUser] = useState<SiteUser | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentType, setPaymentType] = useState<'product' | 'king'>('product');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cpmIsLoggedIn, setCpmIsLoggedIn] = useState(false);
  const [cpmEmail, setCpmEmail] = useState('');
  const [cpmPassword, setCpmPassword] = useState('');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  
  const [kingAPI] = useState(new InjecoesDeKing());
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allUsers, setAllUsers] = useState<SiteUser[]>([]);
  const [myOrders, setMyOrders] = useState<Product[]>([]);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  
  const [pixData, setPixData] = useState<{ qrCode: string, qrCodeBase64: string, id: string } | null>(null);
  const [redeemInput, setRedeemInput] = useState('');
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  
  const [newCodeData, setNewCodeData] = useState({ code: '', email: '', password: '' });
  const [newProdData, setNewProdData] = useState({ name: '', desc: '', price: '', email: '', pass: '' });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(`webcpm_p_${STORAGE_VER}`);
      const savedUsers = localStorage.getItem(`webcpm_u_${STORAGE_VER}`);
      const savedOrders = localStorage.getItem(`webcpm_o_${STORAGE_VER}`);
      const savedCodes = localStorage.getItem(`webcpm_c_${STORAGE_VER}`);
      const savedSession = localStorage.getItem(`webcpm_s_${STORAGE_VER}`);

      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedUsers) setAllUsers(JSON.parse(savedUsers));
      if (savedOrders) setMyOrders(JSON.parse(savedOrders));
      if (savedCodes) setGiftCodes(JSON.parse(savedCodes));
      if (savedSession) setSiteUser(JSON.parse(savedSession));
    } catch (e) { console.error("Restore error:", e); }
  }, []);

  useEffect(() => {
    localStorage.setItem(`webcpm_p_${STORAGE_VER}`, JSON.stringify(products));
    localStorage.setItem(`webcpm_u_${STORAGE_VER}`, JSON.stringify(allUsers));
    localStorage.setItem(`webcpm_o_${STORAGE_VER}`, JSON.stringify(myOrders));
    localStorage.setItem(`webcpm_c_${STORAGE_VER}`, JSON.stringify(giftCodes));
  }, [products, allUsers, myOrders, giftCodes]);

  const handleSiteAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    setTimeout(() => {
      if (isRegistering) {
        if (allUsers.some(u => u.email === authEmail) || authEmail === ADMIN_EMAIL) {
          setErrorMsg("Este e-mail já possui cadastro.");
          setLoading(false);
          return;
        }
        const newUser: SiteUser = {
          email: authEmail,
          password: authPassword,
          name: authName,
          dateJoined: new Date().toLocaleDateString()
        };
        const updatedUsers = [...allUsers, newUser];
        setAllUsers(updatedUsers);
        setSiteUser(newUser);
        localStorage.setItem(`webcpm_s_${STORAGE_VER}`, JSON.stringify(newUser));
        setSuccessMsg("CONTA CRIADA COM SUCESSO!");
        setCurrentView('dashboard');
      } else {
        if (authEmail === ADMIN_EMAIL && authPassword === ADMIN_PASSWORD) {
          const admin: SiteUser = { email: authEmail, password: authPassword, name: 'KAUE', isAdmin: true, dateJoined: 'ADM' };
          setSiteUser(admin);
          localStorage.setItem(`webcpm_s_${STORAGE_VER}`, JSON.stringify(admin));
          setCurrentView('dashboard');
        } else {
          const user = allUsers.find(u => u.email === authEmail && u.password === authPassword);
          if (user) {
            setSiteUser(user);
            localStorage.setItem(`webcpm_s_${STORAGE_VER}`, JSON.stringify(user));
            setCurrentView('dashboard');
          } else { 
            setErrorMsg("E-mail ou senha incorretos."); 
          }
        }
      }
      setLoading(false);
    }, 800);
  };

  const handleCpmLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await kingAPI.login(cpmEmail, cpmPassword);
      if (res?.ok && res.auth) {
        kingAPI.setAuthToken(res.auth);
        const player = await kingAPI.getPlayerData();
        setPlayerData(player?.data || null);
        setCpmIsLoggedIn(true);
        setSuccessMsg("ACESSO AO PAINEL LIBERADO!");
      } else { 
        setErrorMsg(`Erro CPM: ${res.message || 'Verifique seus dados'}`); 
      }
    } catch (err: any) { 
      setErrorMsg(`Erro de conexão: Servidor Instável`); 
    } finally { setLoading(false); }
  };

  const createPixPayment = async (prod: Product | null, customPrice?: number, customDesc?: string) => {
    setLoading(true);
    const amount = customPrice || prod?.price || 0;
    const description = customDesc || `COMPRA: ${prod?.name}`;
    const url = `${PROXY}${encodeURIComponent('https://api.mercadopago.com/v1/payments')}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID()
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description,
          payment_method_id: 'pix',
          payer: { email: siteUser?.email || 'user@webcpm.com', first_name: siteUser?.name || 'Player' }
        })
      });
      const data = await response.json();
      if (data.id) {
        setPixData({
          id: data.id,
          qrCode: data.point_of_interaction.transaction_data.qr_code,
          qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64
        });
        setIsCheckoutOpen(true);
      } else { setErrorMsg("Erro no Mercado Pago."); }
    } catch (e) { setErrorMsg("Falha na conexão."); }
    finally { setLoading(false); }
  };

  const checkPaymentStatus = async () => {
    if (!pixData) return;
    setLoading(true);
    const url = `${PROXY}${encodeURIComponent(`https://api.mercadopago.com/v1/payments/${pixData.id}`)}`;
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${MP_TOKEN}` } });
      const data = await response.json();
      if (data.status === 'approved') {
        if (paymentType === 'king') {
          await kingAPI.injectService('rank');
          setSuccessMsg("RANK KING APLICADO!");
        } else if (selectedProduct) {
          setMyOrders([selectedProduct, ...myOrders]);
          setSuccessMsg("ITEM ADICIONADO!");
        }
        setIsCheckoutOpen(false);
        setPixData(null);
      } else { setErrorMsg("Pagamento pendente."); }
    } catch (e) { setErrorMsg("Erro ao verificar status."); }
    finally { setLoading(false); }
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput) return;
    setLoading(true);
    setTimeout(() => {
      const found = giftCodes.find(c => c.code.trim().toUpperCase() === redeemInput.trim().toUpperCase());
      if (found) {
        const item: Product = { 
          id: Date.now().toString(), 
          name: "CARRO VIP", 
          description: "Ativado via código", 
          price: 0, 
          category: "Vip", 
          image: "https://picsum.photos/seed/vip/400/200", 
          accountEmail: found.accountEmail, 
          accountPassword: found.accountPassword 
        };
        setMyOrders([item, ...myOrders]);
        setGiftCodes(giftCodes.filter(c => c.code !== found.code));
        setRedeemInput('');
        setSuccessMsg("CÓDIGO ATIVADO!");
        setCurrentView('inventory');
      } else { setErrorMsg("Código inválido."); }
      setLoading(false);
    }, 800);
  };

  const handlePostProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Product = {
      id: Date.now().toString(),
      name: newProdData.name,
      description: newProdData.desc,
      price: Number(newProdData.price),
      category: 'Admin',
      image: 'https://picsum.photos/seed/' + Date.now() + '/400/200',
      accountEmail: newProdData.email,
      accountPassword: newProdData.pass
    };
    setProducts([newP, ...products]);
    setNewProdData({ name: '', desc: '', price: '', email: '', pass: '' });
    setSuccessMsg("VEÍCULO CADASTRADO!");
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeData.code || !newCodeData.email) {
      setErrorMsg("Preencha todos os campos do código.");
      return;
    }
    const newC: GiftCode = {
      code: newCodeData.code.toUpperCase(),
      accountEmail: newCodeData.email,
      accountPassword: newCodeData.password,
      createdAt: new Date().toISOString()
    };
    setGiftCodes([newC, ...giftCodes]);
    setNewCodeData({ code: '', email: '', password: '' });
    setSuccessMsg("CHAVE VIP GERADA!");
  };

  if (!siteUser) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#121214] border border-white/5 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
          <div className="text-center mb-10">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">WEB CPM</h1>
            <p className="text-emerald-500 text-[10px] font-black uppercase mt-2 tracking-widest">
              {isRegistering ? 'Criar Nova Conta' : 'Acesso Autorizado'}
            </p>
          </div>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-bold uppercase text-center animate-pulse">
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSiteAuth} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nome Completo" 
                  value={authName} 
                  onChange={e => setAuthName(e.target.value)} 
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  required 
                />
                <UserPlus className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
              </div>
            )}
            
            <div className="relative">
              <input 
                type="email" 
                placeholder="E-mail de Acesso" 
                value={authEmail} 
                onChange={e => setAuthEmail(e.target.value)} 
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                required 
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
            </div>

            <div className="relative">
              <input 
                type="password" 
                placeholder="Senha Segura" 
                value={authPassword} 
                onChange={e => setAuthPassword(e.target.value)} 
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                required 
              />
              <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-emerald-600 py-5 rounded-2xl text-white font-black uppercase text-[11px] active:scale-95 transition-all shadow-xl shadow-emerald-600/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isRegistering ? 'Finalizar Cadastro' : 'Entrar na Central')}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
              className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isRegistering ? (
                <><LogIn className="w-4 h-4"/> Já possui conta? Login</>
              ) : (
                <><UserPlus className="w-4 h-4"/> Não tem conta? Registrar</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <nav className="sticky top-0 z-50 bg-[#121214]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20"><ShieldCheck className="text-white w-6 h-6" /></div>
          <h2 className="font-black text-lg text-white tracking-tighter uppercase">WEB CPM</h2>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-white active:scale-90 transition-all"><Menu /></button>
      </nav>

      <div className={`fixed inset-0 z-[100] ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/95 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-72 bg-[#0e0e10] border-l border-white/5 p-8 flex flex-col transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex-1 space-y-2 mt-10">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
              { id: 'shop', icon: Store, label: 'Loja' },
              { id: 'inventory', icon: ShoppingBag, label: 'Inventário' },
              { id: 'redeem', icon: Key, label: 'Injetar Código' },
              { id: 'cpm-tool', icon: Crown, label: 'Painel King' },
              { id: 'ai-helper', icon: Sparkles, label: 'Gemini AI' },
            ].map(item => (
              <button key={item.id} onClick={() => { setCurrentView(item.id as any); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === item.id ? 'bg-emerald-600 text-white' : 'hover:bg-white/5'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
            {siteUser.isAdmin && (
              <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
                <button onClick={() => { setCurrentView('admin-products'); setIsMenuOpen(false); }} className={`w-full p-4 flex items-center gap-4 text-[10px] font-black uppercase rounded-2xl transition-all ${currentView === 'admin-products' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/5'}`}><Package className="w-5 h-5" /> Postar Carro</button>
                <button onClick={() => { setCurrentView('admin-codes'); setIsMenuOpen(false); }} className={`w-full p-4 flex items-center gap-4 text-[10px] font-black uppercase rounded-2xl transition-all ${currentView === 'admin-codes' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/5'}`}><Ticket className="w-5 h-5" /> Gerar Chave</button>
              </div>
            )}
          </div>
          <button onClick={() => setSiteUser(null)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px]">Sair do Sistema</button>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {successMsg && <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-3xl text-[10px] font-black uppercase flex items-center justify-between">{successMsg}<X className="w-4 h-4 cursor-pointer" onClick={() => setSuccessMsg(null)} /></div>}
        {errorMsg && <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl text-[10px] font-black uppercase flex items-center justify-between">{errorMsg}<X className="w-4 h-4 cursor-pointer" onClick={() => setErrorMsg(null)} /></div>}

        {currentView === 'dashboard' && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 animate-in fade-in">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Salve, {siteUser.name}</h3>
            <p className="text-[9px] text-zinc-600 uppercase font-black mt-1">Membro desde {siteUser.dateJoined}</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 text-center"><p className="text-2xl font-black text-white">{myOrders.length}</p><p className="text-[8px] font-black uppercase opacity-20">Itens Possuídos</p></div>
              <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 text-center cursor-pointer hover:bg-zinc-900" onClick={() => setCurrentView('shop')}><p className="text-2xl font-black text-emerald-500">{products.length}</p><p className="text-[8px] font-black uppercase opacity-20">Carros na Loja</p></div>
            </div>
          </div>
        )}

        {currentView === 'shop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-10">
            {products.map(p => (
              <div key={p.id} className="bg-zinc-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden group">
                <div className="h-44 bg-black overflow-hidden"><img src={p.image} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" alt={p.name} /></div>
                <div className="p-8">
                  <h4 className="text-white font-black uppercase text-sm">{p.name}</h4>
                  <div className="flex items-center justify-between mt-8">
                    <span className="text-2xl font-black text-emerald-500">R$ {p.price.toFixed(2)}</span>
                    <button onClick={() => { setSelectedProduct(p); setPaymentType('product'); createPixPayment(p); }} className="p-5 bg-emerald-600 rounded-2xl text-white shadow-lg active:scale-90 transition-all"><ShoppingCart className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'redeem' && (
          <div className="max-w-md mx-auto mt-10 animate-in zoom-in-95">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[3.5rem] p-12 text-center shadow-2xl">
              <Key className="w-12 h-12 text-pink-500 mx-auto mb-6" />
              <h3 className="text-xl font-black text-white uppercase mb-2">Injetar Código VIP</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-10 tracking-widest">Ativação na Hora</p>
              <form onSubmit={handleRedeemCode} className="space-y-5">
                <input type="text" placeholder="DIGITE O CÓDIGO" value={redeemInput} onChange={e => setRedeemInput(e.target.value.toUpperCase())} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-5 text-center text-lg font-black text-white outline-none focus:border-pink-500 placeholder:opacity-20" required />
                <button type="submit" className="w-full bg-pink-600 py-6 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Validar Chave</button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'cpm-tool' && (
          <div className="max-w-xl mx-auto animate-in zoom-in-95">
            {!cpmIsLoggedIn ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 text-center shadow-2xl">
                <Crown className="w-12 h-12 text-orange-500 mx-auto mb-6" />
                <h3 className="text-xl font-black text-white uppercase mb-8">Login Painel King</h3>
                <form onSubmit={handleCpmLogin} className="space-y-4">
                  <input type="email" placeholder="E-mail do CPM" value={cpmEmail} onChange={e => setCpmEmail(e.target.value)} className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-5 py-5 text-sm text-white outline-none focus:border-orange-500" required />
                  <input type="password" placeholder="Senha do CPM" value={cpmPassword} onChange={e => setCpmPassword(e.target.value)} className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-5 py-5 text-sm text-white outline-none focus:border-orange-500" required />
                  <button type="submit" className="w-full bg-orange-600 py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest">Liberar Funções</button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6"><button onClick={() => setCpmIsLoggedIn(false)} className="text-zinc-600 hover:text-white"><X /></button></div>
                  <Crown className="w-10 h-10 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{playerData?.Name || 'CARREGANDO...'}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5"><p className="text-xl font-black text-emerald-500">${playerData?.money?.toLocaleString()}</p><p className="text-[7px] font-black opacity-20 uppercase">Dinheiro</p></div>
                    <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5"><p className="text-xl font-black text-orange-500">{playerData?.coin?.toLocaleString()}</p><p className="text-[7px] font-black opacity-20 uppercase">Gold</p></div>
                  </div>
                </div>
                <div className="bg-[#121214] border border-white/5 rounded-[3.5rem] p-10 text-center">
                   <Zap className="text-orange-500 w-8 h-8 mx-auto mb-4" />
                   <h4 className="text-white font-black uppercase mb-6 text-xl tracking-tighter">Injeção King Rank</h4>
                   <div className="bg-zinc-950 p-10 rounded-[2.5rem] border border-white/5 mb-8">
                      <Star className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-3xl font-black text-emerald-500">R$ 2,50</p>
                      <p className="text-[10px] text-zinc-600 uppercase mt-2 font-black">Rank Profissional Ativado</p>
                   </div>
                   <button onClick={() => { setPaymentType('king'); createPixPayment(null, 2.50, "RANK KING"); }} className="w-full bg-emerald-600 py-6 rounded-2xl text-white font-black uppercase text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-600/10"><QrCode className="w-6 h-6" /> Comprar via PIX</button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {myOrders.length === 0 ? <div className="col-span-full py-32 text-center opacity-10 uppercase font-black tracking-widest text-lg">Inventário Vazio</div> : 
              myOrders.map((ord, i) => (
                <div key={i} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                  <h4 className="text-white font-black uppercase text-xs mb-6 flex items-center gap-2"><Package className="w-4 h-4 text-emerald-500"/> {ord.name}</h4>
                  <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 space-y-4 text-[10px] font-mono">
                    <div className="flex justify-between items-center"><p className="truncate text-zinc-400 mr-4">{ord.accountEmail}</p><button onClick={() => {navigator.clipboard.writeText(ord.accountEmail || ''); setSuccessMsg("E-mail copiado!")}} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><Copy className="w-4 h-4"/></button></div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4"><p className="text-zinc-400">{showPass[i] ? ord.accountPassword : '••••••••••••'}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowPass({...showPass, [i]: !showPass[i]})} className="p-3 bg-white/5 rounded-xl"><Eye className="w-4 h-4"/></button>
                        <button onClick={() => {navigator.clipboard.writeText(ord.accountPassword || ''); setSuccessMsg("Senha copiada!")}} className="p-3 bg-white/5 rounded-xl"><Copy className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {currentView === 'admin-products' && siteUser.isAdmin && (
           <div className="max-w-xl mx-auto bg-zinc-900/40 p-12 rounded-[3.5rem] border border-white/5 animate-in slide-in-from-top-10">
              <h3 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3"><Package className="text-red-500"/> Cadastrar Veículo</h3>
              <form onSubmit={handlePostProduct} className="space-y-4">
                 <input type="text" placeholder="Nome do Carro" value={newProdData.name} onChange={e => setNewProdData({...newProdData, name:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <input type="text" placeholder="Breve Descrição" value={newProdData.desc} onChange={e => setNewProdData({...newProdData, desc:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <input type="number" placeholder="Valor (R$)" value={newProdData.price} onChange={e => setNewProdData({...newProdData, price:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <input type="text" placeholder="E-mail da Conta" value={newProdData.email} onChange={e => setNewProdData({...newProdData, email:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <input type="text" placeholder="Senha da Conta" value={newProdData.pass} onChange={e => setNewProdData({...newProdData, pass:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-600/10">Publicar Agora</button>
              </form>
           </div>
        )}

        {currentView === 'admin-codes' && siteUser.isAdmin && (
           <div className="max-w-xl mx-auto bg-zinc-900/40 p-12 rounded-[3.5rem] border border-white/5 animate-in slide-in-from-top-10">
              <h3 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3"><Ticket className="text-red-500"/> Gerar Chave VIP</h3>
              <form onSubmit={handleGenerateCode} className="space-y-4">
                 <input type="text" placeholder="Código (Ex: VIP100)" value={newCodeData.code} onChange={e => setNewCodeData({...newCodeData, code:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white font-black" required />
                 <input type="text" placeholder="E-mail da Conta" value={newCodeData.email} onChange={e => setNewCodeData({...newCodeData, email:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <input type="text" placeholder="Senha da Conta" value={newCodeData.password} onChange={e => setNewCodeData({...newCodeData, password:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest">Gerar Código</button>
              </form>
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] font-black uppercase text-zinc-500 mb-4">Códigos Gerados ({giftCodes.length})</p>
                <div className="space-y-2">
                  {giftCodes.map((c, i) => (
                    <div key={i} className="bg-zinc-950 p-4 rounded-xl border border-white/5 flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-xs">{c.code}</span>
                        <span className="text-[8px] opacity-20 truncate w-32">{c.accountEmail}</span>
                      </div>
                      <button onClick={() => setGiftCodes(giftCodes.filter((_, idx) => idx !== i))} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        )}

        {currentView === 'ai-helper' && (
          <div className="h-[75vh] flex flex-col animate-in fade-in">
            <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter flex items-center gap-2"><Sparkles className="text-purple-500"/> Suporte Gemini AI</h3>
            <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-8 overflow-y-auto space-y-4 mb-6 scroll-smooth">
              {aiChat.length === 0 && <div className="text-center opacity-10 p-20 font-black uppercase text-xs tracking-[0.5em]">Central de Inteligência Ativa</div>}
              {aiChat.map((c, i) => (
                <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-5 rounded-3xl text-xs max-w-[85%] leading-relaxed ${c.role === 'user' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-zinc-950 text-zinc-300 border border-white/5'}`}>{c.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if(aiInput) { const m = aiInput; setAiInput(''); setAiChat([...aiChat, {role:'user', text:m}]); setLoading(true); getGameAssistance(m).then(r => {setAiChat(prev => [...prev, {role:'bot', text:r}]); setLoading(false);}); } }} className="relative">
              <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Tire sua dúvida com a IA..." className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm outline-none focus:border-purple-600 transition-all text-white" />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-purple-600 text-white rounded-xl shadow-lg active:scale-90 transition-all"><Send className="w-5 h-5"/></button>
            </form>
          </div>
        )}
      </main>

      {isCheckoutOpen && pixData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
          <div className="bg-[#121214] w-full max-w-md rounded-[4rem] border border-white/5 p-12 text-center shadow-2xl animate-in zoom-in-95">
             <QrCode className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
             <h3 className="text-xl font-black text-white uppercase tracking-tighter">Pagamento PIX</h3>
             <p className="text-[11px] text-zinc-500 uppercase mt-1 mb-8 font-black tracking-widest">Valor: {paymentType==='king'?'R$ 2,50':`R$ ${selectedProduct?.price.toFixed(2)}`}</p>
             <div className="bg-white p-5 rounded-[2.5rem] mx-auto w-52 h-52 mb-10 shadow-inner flex items-center justify-center overflow-hidden"><img src={`data:image/png;base64,${pixData.qrCodeBase64}`} className="w-full h-full scale-125" alt="QR"/></div>
             <button onClick={() => {navigator.clipboard.writeText(pixData.qrCode); setSuccessMsg("PIX COPIADO!")}} className="w-full bg-zinc-900 border border-white/5 py-5 rounded-2xl text-[10px] font-black uppercase mb-4 text-white flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"><Copy className="w-4 h-4"/> Copiar Código</button>
             <button onClick={checkPaymentStatus} className="w-full bg-emerald-600 py-6 rounded-2xl text-white font-black uppercase text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-600/20"><RefreshCw className={`w-5 h-5 ${loading?'animate-spin':''}`}/> Validar Pagamento</button>
             <button onClick={() => setIsCheckoutOpen(false)} className="mt-8 text-zinc-600 font-black uppercase text-[9px] tracking-widest hover:text-white transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[500] bg-black/99 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin"></div>
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8"/>
          </div>
          <p className="text-emerald-500 font-black uppercase text-[10px] mt-10 tracking-[0.8em] animate-pulse px-12">Processando Sistema...</p>
        </div>
      )}
    </div>
  );
};

export default App;
