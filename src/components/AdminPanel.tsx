import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Sparkles, Image as ImageIcon, Users, DollarSign, Clock, ShieldAlert, Plus, Trash2, CheckCircle, XCircle, Search, Edit3, Shield, User, Save, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { Reservation, Promotion, Photo, Team, Player, AppStats, FieldConfig, Review } from '../types';

interface AdminPanelProps {
  token: string | null;
  onLogout: () => void;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'kpi' | 'bookings' | 'promos' | 'gallery' | 'teams' | 'reviews'>('kpi');
  const [stats, setStats] = useState<AppStats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReplyReviewId, setEditingReplyReviewId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Search/Filters State
  const [bookingFilterName, setBookingFilterName] = useState('');
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  // 1. Create Promotion Form State
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState('discount');
  const [promoUntil, setPromoUntil] = useState('2026-12-31');

  // 2. Add Photo Form State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'facilities' | 'matches' | 'events'>('facilities');

  // 3. Team Management Form State
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('');
  const [teamCaptain, setTeamCaptain] = useState('');
  const [teamGoals, setTeamGoals] = useState('0');

  // 4. Player Management Form State
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [selectedPlayerTeamId, setSelectedPlayerTeamId] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState('');
  const [playerPosition, setPlayerPosition] = useState('Delantero');
  const [playerContact, setPlayerContact] = useState('');

  // General Fetch Engine
  const fetchAllAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resStats, resReservations, resPromos, resPhotos, resTeams, resPlayers, resReviews] = await Promise.all([
        fetch('/api/stats', { headers }),
        fetch('/api/reservations'),
        fetch('/api/promotions/all', { headers }),
        fetch('/api/gallery'),
        fetch('/api/teams'),
        fetch('/api/players'),
        fetch('/api/reviews/admin', { headers })
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resReservations.ok) setReservations(await resReservations.json());
      if (resPromos.ok) setPromotions(await resPromos.json());
      if (resPhotos.ok) setPhotos(await resPhotos.json());
      if (resTeams.ok) setTeams(await resTeams.json());
      if (resPlayers.ok) setPlayers(await resPlayers.json());
      if (resReviews.ok) setReviews(await resReviews.json());

    } catch (e) {
      console.error('Error fetching admin telemetry', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Review Operations
  const handleModerateReview = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      const response = await fetch(`/api/reviews/${id}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error('Error moderating review:', err);
    }
  };

  const handleSendReply = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: reviewReplyText })
      });
      if (response.ok) {
        setEditingReplyReviewId(null);
        setReviewReplyText('');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta reseña de jugador?')) return;
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [token]);

  // Handle Reservation status updates
  const handleUpdateReservation = async (id: string, status: 'confirmed' | 'cancelled', payStatus?: 'pending' | 'paid') => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, paymentStatus: payStatus })
      });

      if (response.ok) {
        fetchAllAdminData();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar reserva.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente esta reservación?')) return;
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Promotion Handlers
  const handleCreatePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle || !promoDesc) return;

    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: promoTitle,
          description: promoDesc,
          discountPercentage: parseInt(promoDiscount) || 0,
          promoCode: promoCode || undefined,
          validUntil: promoUntil,
          type: promoType
        })
      });

      if (response.ok) {
        setPromoTitle('');
        setPromoDesc('');
        setPromoCode('');
        setPromoDiscount('');
        fetchAllAdminData();
      } else {
        alert('Error al guardar promoción.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePromo = async (id: string) => {
    try {
      const response = await fetch(`/api/promotions/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Eliminar esta oferta permanentemente?')) return;
    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Photos Handlers
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !photoCaption) return;

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: photoUrl,
          caption: photoCaption,
          category: photoCategory
        })
      });

      if (response.ok) {
        setPhotoUrl('');
        setPhotoCaption('');
        fetchAllAdminData();
      } else {
        alert('Error al registrar fotografía.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Eliminar esta foto del catálogo?')) return;
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Team CRUD operations
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamColor || !teamCaptain) return;

    try {
      const isEditing = !!editingTeamId;
      const url = isEditing ? `/api/teams/${editingTeamId}` : '/api/teams';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: teamName,
          color: teamColor,
          captainContact: teamCaptain,
          goalsFor: parseInt(teamGoals) || 0
        })
      });

      if (response.ok) {
        setTeamName('');
        setTeamColor('');
        setTeamCaptain('');
        setTeamGoals('0');
        setEditingTeamId(null);
        setShowTeamForm(false);
        fetchAllAdminData();
      } else {
        const err = await response.json();
        alert(err.message || 'Error al guardar equipo.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTeamTrigger = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamColor(team.color);
    setTeamCaptain(team.captainContact);
    setTeamGoals(String(team.goalsFor));
    setShowTeamForm(true);
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('¿Estás totalmente seguro de eliminar este equipo? Esto borrará también a todos los jugadores vinculados.')) return;
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Player CRUD operations
  const handleSavePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerTeamId || !playerName || !playerAge || !playerPosition) return;

    try {
      const isEditing = !!editingPlayerId;
      const url = isEditing ? `/api/players/${editingPlayerId}` : '/api/players';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: selectedPlayerTeamId,
          name: playerName,
          age: parseInt(playerAge),
          position: playerPosition,
          contact: playerContact
        })
      });

      if (response.ok) {
        setPlayerName('');
        setPlayerAge('');
        setPlayerContact('');
        setEditingPlayerId(null);
        setShowPlayerForm(false);
        fetchAllAdminData();
      } else {
        alert('Error al guardar datos del jugador.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPlayerTrigger = (player: Player) => {
    setEditingPlayerId(player.id);
    setSelectedPlayerTeamId(player.teamId);
    setPlayerName(player.name);
    setPlayerAge(String(player.age));
    setPlayerPosition(player.position);
    setPlayerContact(player.contact);
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('¿Eliminar esta ficha de jugador?')) return;
    try {
      const response = await fetch(`/api/players/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReservations = reservations.filter(r => 
    r.userName.toLowerCase().includes(bookingFilterName.toLowerCase()) ||
    r.id.toLowerCase().includes(bookingFilterName.toLowerCase())
  );

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Panel Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-950/20 text-left">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white">Panel de Administración</h2>
          <p className="text-xs text-gray-400 mt-1">Monitoreo mercantil, control de reservaciones, cupones de promoción y cantera de jugadores Guerreros Ayotla.</p>
        </div>

        <button
          onClick={fetchAllAdminData}
          className="bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar DB</span>
        </button>
      </div>

      {/* Tabs list bar */}
      <div className="flex flex-wrap gap-2 pb-1 text-left">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kpi' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/20'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Métricas y KPI</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bookings' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/20'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda Reservas ({reservations.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('teams');
            setShowTeamForm(false);
            setShowPlayerForm(false);
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'teams' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/20'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipos & Jugadores</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'promos' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Cuponera</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gallery' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/20'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Galería</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reviews' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/20'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Moderación Reseñas ({reviews.length})</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-20 text-xs font-mono text-emerald-400">Consultando datos al servidor...</div>
      )}

      {/* RENDER ACTIVE TAB */}
      {!isLoading && (
        <div className="space-y-8 text-left">
          
          {/* TAB 1: KPI Telemetry */}
          {activeTab === 'kpi' && stats && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-emerald-500/10"><DollarSign className="w-12 h-12" /></div>
                  <span className="text-[10px] tracking-widest font-mono text-gray-400 uppercase">Ventas Totales</span>
                  <p className="text-3xl font-display font-black text-white mt-1.5">${stats.totalRevenue} MXN</p>
                  <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">Simulaciones pasarela</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-emerald-500/10"><Calendar className="w-12 h-12" /></div>
                  <span className="text-[10px] tracking-widest font-mono text-gray-400 uppercase">Reservaciones</span>
                  <p className="text-3xl font-display font-black text-white mt-1.5">{stats.totalReservations}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">{stats.pendingReservations} Pendientes</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-emerald-500/10"><Users className="w-12 h-12" /></div>
                  <span className="text-[10px] tracking-widest font-mono text-gray-400 uppercase">Equipos del Torneo</span>
                  <p className="text-3xl font-display font-black text-white mt-1.5">{stats.teamsCount}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">Con plantillas registradas</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-emerald-500/10"><User className="w-12 h-12" /></div>
                  <span className="text-[10px] tracking-widest font-mono text-gray-400 uppercase">Jugadores</span>
                  <p className="text-3xl font-display font-black text-white mt-1.5">{stats.playersCount}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">Fichas de identificación</p>
                </div>

              </div>

              {/* Recent Bookings Roster */}
              <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 space-y-4">
                <h3 className="font-display font-bold text-base text-white">Últimas Solicitudes Agendadas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-emerald-950/20 text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                        <th className="pb-3 pl-2">Cliente / Folio</th>
                        <th className="pb-3">Cancha</th>
                        <th className="pb-3">Fecha y Hora</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3 text-right">Estatus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/10 text-xs">
                      {stats.recentBookings.map((bk) => (
                        <tr key={bk.id}>
                          <td className="py-3 pl-2">
                            <strong className="block text-gray-200 font-medium">{bk.userName}</strong>
                            <span className="text-[10px] font-mono text-gray-500">
                              {bk.id}
                              {bk.entryCode && <span className="text-amber-400 ml-1.5 font-bold">🔑 {bk.entryCode}</span>}
                            </span>
                          </td>
                          <td className="py-3 text-gray-300">{bk.fieldName}</td>
                          <td className="py-3 text-gray-400 font-mono">{bk.date} @ {bk.timeSlot}</td>
                          <td className="py-3 text-white font-mono">${bk.totalPrice}</td>
                          <td className="py-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono leading-none font-bold ${
                              bk.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {bk.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Bookings manager */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-display font-bold text-lg text-white">Agenda General de Canchas</h3>
                <input
                  type="text"
                  placeholder="Buscar por cliente o folio..."
                  value={bookingFilterName}
                  onChange={(e) => setBookingFilterName(e.target.value)}
                  className="bg-emerald-950/20 placeholder-gray-500 px-4 py-2 rounded-xl text-xs text-white border border-gray-800 w-full sm:w-64 focus:outline-none"
                />
              </div>

              {filteredReservations.length === 0 ? (
                <div className="py-12 text-center glass-panel rounded-xl text-xs text-gray-500">Ninguna reservación coincide.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredReservations.map((res) => (
                    <div key={res.id} className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-emerald-400 font-bold">{res.fieldName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-gray-300 rounded">{res.id}</span>
                          {res.entryCode && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded font-black">🔑 {res.entryCode}</span>
                          )}
                        </div>
                        <p className="text-white font-sans text-sm font-bold mt-1">{res.userName} • <span className="text-xs text-gray-400">{res.userPhone}</span></p>
                        <p className="text-gray-400 font-mono text-[11.5px]">{res.date} en horario <strong className="text-gray-200">{res.timeSlot}</strong> ({res.duration}h)</p>
                        <p className="text-[10px] text-gray-500 font-sans">Extras: Balones: {res.extras.balls ? 'Sí':'No'} / Casacas: {res.extras.bibs ? 'Sí':'No'} / Árbitro: {res.extras.referee ? 'Sí':'No'}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-gray-400 text-[10px]">PRECIO LIQUIDADO</p>
                          <p className="text-sm font-bold text-white mt-0.5">${res.totalPrice} MXN</p>
                          <span className={`inline-block text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded leading-none ${
                            res.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {res.paymentStatus === 'paid' ? 'PAGADO (Liquidado)' : 'PAGO PENDIENTE'}
                          </span>
                        </div>

                        {/* Interactive operations switches */}
                        <div className="flex items-center gap-1.5 border-l border-gray-800 pl-4">
                          {res.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateReservation(res.id, 'confirmed', 'paid')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black transition-all"
                              title="Confirmar y Marcar Pagado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {res.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateReservation(res.id, 'cancelled')}
                              className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-500 text-red-400 hover:text-black transition-all"
                              title="Cancelar Reserva"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteReservation(res.id)}
                            className="p-1.5 rounded-lg bg-red-950/10 hover:bg-red-600 text-red-500 hover:text-white transition-all ml-1"
                            title="Eliminar Expediente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Teams & Jugadores (Requested functional requirement) */}
          {activeTab === 'teams' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-emerald-950/20">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Equipos de Fútbol Rápido</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Control directo de escuadras inscritas, puntos, capitanes y jugadores de la copa.</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setEditingTeamId(null);
                      setTeamName('');
                      setTeamColor('');
                      setTeamCaptain('');
                      setTeamGoals('0');
                      setShowTeamForm(!showTeamForm);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Equipo</span>
                  </button>
                </div>
              </div>

              {/* Team Registration/Edit Form block */}
              {showTeamForm && (
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/25 space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-emerald-400">
                    {editingTeamId ? 'Guardar Cambios del Equipo' : 'Inscribir Nuevo Equipo a Base de Datos'}
                  </h4>

                  <form onSubmit={handleSaveTeam} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Nombre Escuadra *</label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Ej. Galaxy CDMX"
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Color del Uniforme *</label>
                      <input
                        type="text"
                        required
                        value={teamColor}
                        onChange={(e) => setTeamColor(e.target.value)}
                        placeholder="Ej. Verde esmeralda"
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Capitán y Teléfono *</label>
                      <input
                        type="text"
                        required
                        value={teamCaptain}
                        onChange={(e) => setTeamCaptain(e.target.value)}
                        placeholder="Ej. Carlos Mendoza (+5255...)"
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Goles a Favor</label>
                      <input
                        type="number"
                        value={teamGoals}
                        onChange={(e) => setTeamGoals(e.target.value)}
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-emerald-950/10">
                      <button
                        type="button"
                        onClick={() => setShowTeamForm(false)}
                        className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Guardar Equipo
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Roster of Teams */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {teams.map((team) => {
                  const teamMembers = players.filter(p => p.teamId === team.id);
                  return (
                    <div key={team.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
                      
                      {/* Brand Info */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-800/40">
                        <div className="flex items-center space-x-3 text-left">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/10">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{team.name}</h4>
                            <p className="text-[11px] text-gray-400">Uniforme: <span className="text-emerald-400 font-medium">{team.color}</span></p>
                          </div>
                        </div>

                        {/* Edit/Delete Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditTeamTrigger(team)}
                            className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                            title="Editar Datos"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="bg-red-950/20 hover:bg-red-600 hover:text-white text-red-400 p-1.5 rounded-lg border border-red-900/10 transition-all cursor-pointer"
                            title="Borrar Escuadra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Captain summary row */}
                      <div className="p-3 bg-emerald-950/5 rounded-xl text-[10.5px] text-gray-400 font-mono flex items-center justify-between">
                        <span>CAPITÁN & CONTACTO: <strong className="text-gray-300 font-sans">{team.captainContact}</strong></span>
                        <span className="text-emerald-400 font-bold">Goles: {team.goalsFor}</span>
                      </div>

                      {/* Players inline lists */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pr-1">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#10b981]/80 font-bold">Plantilla Inscrita ({teamMembers.length})</span>
                          <button
                            onClick={() => {
                              setSelectedPlayerTeamId(team.id);
                              setEditingPlayerId(null);
                              setPlayerName('');
                              setPlayerAge('');
                              setPlayerContact('');
                              setShowPlayerForm(true);
                            }}
                            className="text-[10px] text-emerald-400 hover:text-white flex items-center gap-1 font-bold font-mono uppercase bg-emerald-500/5 px-2 py-1 rounded"
                          >
                            <Plus className="w-3 h-3" /> Añadir Jugador
                          </button>
                        </div>

                        {teamMembers.length === 0 ? (
                          <p className="text-[11px] text-gray-500 italic">No hay jugadores inscritos en este equipo mercantil.</p>
                        ) : (
                          <div className="space-y-1.5 divide-y divide-gray-900">
                            {teamMembers.map((member) => (
                              <div key={member.id} className="flex justify-between items-center text-[11px] pt-1.5">
                                <span className="text-gray-300 flex items-center gap-1 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  {member.name} ({member.age}a) - <strong className="text-emerald-400/80">{member.position}</strong>
                                </span>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 font-mono text-[9px]">{member.contact}</span>
                                  <button
                                    onClick={() => handleEditPlayerTrigger(member)}
                                    className="text-gray-400 hover:text-emerald-400 p-0.5"
                                    title="Editar Jugador"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(member.id)}
                                    className="text-gray-400 hover:text-red-400 p-0.5"
                                    title="Borrar Ficha"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Player Add/Edit form overlay popup */}
              {showPlayerForm && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#050706] glass-panel p-6 sm:p-8 rounded-2xl max-w-md w-full border border-emerald-500/20 text-left space-y-4">
                    <h3 className="font-display font-bold text-lg text-white">
                      {editingPlayerId ? 'Editar Datos del Jugador' : 'Registrar Miembro Oficial'}
                    </h3>

                    <form onSubmit={handleSavePlayerSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          required
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Ej. Carlos Vela Jr"
                          className="w-full bg-emerald-950/20 text-white text-xs p-3 rounded-lg border border-gray-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Edad *</label>
                          <input
                            type="number"
                            required
                            value={playerAge}
                            onChange={(e) => setPlayerAge(e.target.value)}
                            placeholder="21"
                            className="w-full bg-emerald-950/20 text-white text-xs p-3 rounded-lg border border-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Posición *</label>
                          <select
                            value={playerPosition}
                            onChange={(e) => setPlayerPosition(e.target.value)}
                            className="w-full bg-emerald-950/20 text-white text-xs p-3 rounded-lg border border-gray-800"
                          >
                            <option value="Portero">Portero</option>
                            <option value="Defensa">Defensa</option>
                            <option value="Medio">Medio</option>
                            <option value="Delantero">Delantero</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Teléfono o Red Contacto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. +52 559039..."
                          value={playerContact}
                          onChange={(e) => setPlayerContact(e.target.value)}
                          className="w-full bg-emerald-950/20 text-white text-xs p-3 rounded-lg border border-gray-800"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                        <button
                          type="button"
                          onClick={() => setShowPlayerForm(false)}
                          className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Guardar Datos
                        </button>
                      </div>
                    </form>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: Promos custom creations */}
          {activeTab === 'promos' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Creator column */}
                <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-gray-800 text-left space-y-4">
                  <h3 className="font-display font-bold text-base text-white">Publicar Oferta o Torneo</h3>
                  
                  <form onSubmit={handleCreatePromoSubmit} className="space-y-4 select-none">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Título de la Oferta *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Promo Estudiantes"
                        value={promoTitle}
                        onChange={(e) => setPromoTitle(e.target.value)}
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Descripción detallada *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe los alcances y restricciones..."
                        value={promoDesc}
                        onChange={(e) => setPromoDesc(e.target.value)}
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Cupón Clave / Código</label>
                        <input
                          type="text"
                          placeholder="ALUMNOS15"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Porcentaje Descuento (%)</label>
                        <input
                          type="number"
                          placeholder="15"
                          value={promoDiscount}
                          onChange={(e) => setPromoDiscount(e.target.value)}
                          className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Categoría</label>
                        <select
                          value={promoType}
                          onChange={(e) => setPromoType(e.target.value)}
                          className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                        >
                          <option value="discount">Descuento</option>
                          <option value="tournament">Torneo</option>
                          <option value="special">Fijo Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Expira En / Vence</label>
                        <input
                          type="date"
                          value={promoUntil}
                          onChange={(e) => setPromoUntil(e.target.value)}
                          className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Publicar Beneficio
                    </button>
                  </form>
                </div>

                {/* List column */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-display font-bold text-base text-white">Catálogo de Cupones Emitidos</h3>
                  
                  <div className="space-y-3">
                    {promotions.map((pr) => (
                      <div key={pr.id} className="p-4 rounded-xl border border-gray-800 bg-emerald-950/5 flex justify-between items-center text-xs font-mono">
                        <div className="text-left space-y-1 head-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm font-sans">{pr.title}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-1 py-0.5 text-[9px] rounded font-bold uppercase">{pr.type}</span>
                          </div>
                          <p className="text-gray-400 font-sans text-xs">{pr.description}</p>
                          <p className="text-[10px] text-gray-500">Expiración: {pr.validUntil} • Descuento: -{pr.discountPercentage}%</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTogglePromo(pr.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              pr.isActive ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-gray-500'
                            }`}
                          >
                            {pr.isActive ? 'ACTIVO' : 'PAUSADO'}
                          </button>
                          
                          <button
                            onClick={() => handleDeletePromo(pr.id)}
                            className="p-1 rounded-md bg-red-950/20 hover:bg-red-500 text-red-400 hover:text-black"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: Gallery photo additions */}
          {activeTab === 'gallery' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form to submit */}
                <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-gray-800 text-left space-y-4">
                  <h3 className="font-display font-bold text-base text-white">Cargar Foto de Evento o Campo</h3>
                  
                  <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Enlace de Imagen (URL Directa Unsplash u otra) *</label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/photo-..."
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Título de Pie de Foto / Título *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Clausura de la Copa Nocturna"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Categoría</label>
                      <select
                        value={photoCategory}
                        onChange={(e) => setPhotoCategory(e.target.value as any)}
                        className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-800 cursor-pointer"
                      >
                        <option value="facilities">Infraestructura (Canchas)</option>
                        <option value="matches font-medium">Partidos / Juegos nocturnos</option>
                        <option value="events">Torneos y Premiaciones</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Agregar al Catálogo Público
                    </button>
                  </form>
                </div>

                {/* Grid gallery review list */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-display font-bold text-base text-white">Fotos en Catálogo Público ({photos.length})</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photos.map((pt) => {
                      return (
                        <div key={pt.id} className="relative rounded-xl overflow-hidden h-28 group border border-gray-800">
                          <img src={pt.url} alt={pt.caption} className="w-full h-full object-cover" />
                          
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDeletePhoto(pt.id)}
                              className="p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 font-bold flex items-center justify-center transition-all cursor-pointer"
                              title="Eliminar de Galería"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="absolute bottom-1 left-2 text-[9px] bg-black/70 px-1 py-0.5 rounded text-white font-sans max-w-[85px] truncate">
                            {pt.caption}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-950/20 text-left">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">Cola de Calificaciones y Moderación</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Como administrador, puedes aprobar o rechazar los comentarios de los deportistas, y publicar respuestas institucionales oficiales de Guerreros Ayotla.
                  </p>
                </div>

                <div className="flex gap-2 text-xs font-mono">
                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-800/20">
                    Aprobados: {reviews.filter(r => r.status === 'approved').length}
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-800/20">
                    Pendientes: {reviews.filter(r => r.status === 'pending').length}
                  </div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="p-12 text-center bg-emerald-950/5 border border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-xs text-gray-400">No se encontraron comentarios de usuarios registrados en el sistema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    return (
                      <div
                        key={rev.id}
                        className={`p-6 rounded-2xl glass-panel border text-left space-y-4 transition-all ${
                          rev.status === 'pending'
                            ? 'border-yellow-500/30 bg-yellow-950/5'
                            : rev.status === 'rejected'
                            ? 'border-red-500/15 bg-red-950/5 opacity-60'
                            : 'border-emerald-500/15 bg-emerald-950/5'
                        }`}
                      >
                        {/* Header metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/10 pb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">{rev.userName}</span>
                              <span className="text-[10px] text-gray-400 font-mono">({rev.userEmail})</span>
                              {rev.reservationId && (
                                <span className="bg-emerald-500/15 text-emerald-400 text-[8px] tracking-wider px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/10">
                                  ✓ Folio: {rev.reservationId}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-emerald-500 font-mono font-bold mt-1 block">Cancha: {rev.fieldName}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(rev.createdAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {/* STATUS BADGE */}
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                              rev.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                                : rev.status === 'rejected'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/10'
                                : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/10'
                            }`}>
                              {rev.status === 'approved' ? 'Aprobado' : rev.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>

                        {/* Stars and comment */}
                        <div className="space-y-2">
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400 stroke-none' : 'text-zinc-800'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed font-light italic">
                            "{rev.comment}"
                          </p>
                        </div>

                        {/* Existing or edit reply */}
                        {rev.reply && (
                          <div className="p-3 bg-black/40 rounded-xl border-l-[3px] border-emerald-500 text-xs">
                            <span className="font-bold text-emerald-400 text-[10px] font-mono block">RESPUESTA DE ADMINISTRADOR:</span>
                            <p className="text-gray-400 mt-1">{rev.reply}</p>
                          </div>
                        )}

                        {/* Actions block (Moderations buttons + reply triggers) */}
                        <div className="flex flex-wrap sm:items-center justify-between gap-4 pt-4 border-t border-emerald-950/10 text-xs font-mono">
                          <div className="flex flex-wrap gap-2">
                            {rev.status !== 'approved' && (
                              <button
                                onClick={() => handleModerateReview(rev.id, 'approved')}
                                className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Aprobar</span>
                              </button>
                            )}
                            {rev.status !== 'rejected' && (
                              <button
                                onClick={() => handleModerateReview(rev.id, 'rejected')}
                                className="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rechazar</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingReplyReviewId(editingReplyReviewId === rev.id ? null : rev.id);
                                setReviewReplyText(rev.reply || '');
                              }}
                              className="bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/30 text-emerald-400 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{rev.reply ? 'Editar Respuesta' : 'Responder'}</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="text-gray-500 hover:text-red-400 p-1.5 transition-all cursor-pointer self-end sm:self-center"
                            title="Eliminar comentario permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Response Form Editor Panel */}
                        {editingReplyReviewId === rev.id && (
                          <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/10 space-y-3 animate-fadeIn text-xs">
                            <span className="font-mono font-bold text-emerald-400">Responder al Comentario de {rev.userName} 📡</span>
                            <textarea
                              rows={2}
                              value={reviewReplyText}
                              onChange={(e) => setReviewReplyText(e.target.value)}
                              placeholder="Escribe la respuesta institucional oficial..."
                              className="w-full bg-emerald-950/20 text-white font-medium p-3 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none focus:ring-0"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingReplyReviewId(null)}
                                className="px-3 py-1.5 border border-zinc-800 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSendReply(rev.id)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg font-bold font-sans transition-all cursor-pointer shadow-sm"
                              >
                                Enviar Respuesta
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
