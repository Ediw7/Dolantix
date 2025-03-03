import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('olahraga');
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/');
    } else {
      fetchEvents(activeTab);
      fetchPendingOrders();
    }
  }, [navigate, token, role, activeTab]);

  const fetchEvents = async (category) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/${category}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Data acara ${category} dari server:`, res.data);
      setEvents(res.data);
      res.data.forEach(event => fetchTickets(event.id, category));
    } catch (err) {
      console.error(`Gagal mengambil acara ${category}:`, err.response?.status, err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTickets = async (eventId, category) => {
    try {
      const res = await axios.get(`/api/tickets/${eventId}/${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(prev => ({ ...prev, [eventId]: res.data }));
    } catch (err) {
      console.error('Gagal mengambil tiket:', err.response?.data || err.message);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get('/api/orders/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingOrders(res.data);
    } catch (err) {
      console.error('Gagal mengambil pesanan:', err);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      await axios.put(`/api/orders/approve/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Pesanan disetujui!');
      fetchPendingOrders();
    } catch (err) {
      alert('Gagal menyetujui pesanan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async (eventId, newStatus) => {
    try {
      await axios.put(`/api/${activeTab}/status/${eventId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Status acara berhasil diubah menjadi ${newStatus}`);
      fetchEvents(activeTab);
    } catch (err) {
      alert(`Gagal mengubah status: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };
  
  const handleAddEvent = () => {
    navigate(`/admin/tambah-${activeTab}`);
  };

  // Stats calculations
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).length;
  const totalTickets = Object.values(tickets).reduce((sum, ticketArray) => sum + ticketArray.length, 0);
  const soldTickets = Object.values(tickets).reduce((sum, ticketArray) => {
    return sum + ticketArray.reduce((ticketSum, ticket) => {
      return ticketSum + (ticket.initial_stock - ticket.stock);
    }, 0);
  }, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 ml-80">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Admin Dolantix</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all duration-300 shadow-md transform hover:scale-105"
          >
            Logout
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-blue-500 transform hover:scale-102 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div className="text-left">
                <p className="text-gray-600 text-sm">Total Acara</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-green-500 transform hover:scale-102 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl">🕒</span>
              </div>
              <div className="text-left">
                <p className="text-gray-600 text-sm">Acara Mendatang</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-purple-500 transform hover:scale-102 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎟️</span>
              </div>
              <div className="text-left">
                <p className="text-gray-600 text-sm">Total Tiket</p>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-yellow-500 transform hover:scale-102 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🏷️</span>
              </div>
              <div className="text-left">
                <p className="text-gray-600 text-sm">Tiket Terjual</p>
                <p className="text-2xl font-bold text-gray-900">{soldTickets}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['olahraga', 'konser', 'festival', 'seminar'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-gray-700 font-semibold">Nama Acara</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Tanggal</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Lokasi</th>
                <th className="p-4 text-center text-gray-700 font-semibold">Kategori</th>
                <th className="p-4 text-center text-gray-700 font-semibold">Status</th>
                <th className="p-4 text-center text-gray-700 font-semibold">Tiket</th>
                <th className="p-4 text-center text-gray-700 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">Belum ada acara {activeTab}</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className="border-b border-gray-200 hover:bg-gray-100 transition-all duration-200">
                    <td className="p-4">{event.name}</td>
                    <td className="p-4">{new Date(event.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="p-4">{event.location}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                        {activeTab}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select 
                        value={event.status} 
                        onChange={(e) => handleUpdateStatus(event.id, e.target.value)}
                        className={`p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      {(tickets[event.id]?.length || 0) > 0 ? 
                        <span className="text-gray-700">{tickets[event.id]?.length || 0} jenis</span> : 
                        <span className="text-red-500">0 jenis</span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/admin/edit-${activeTab}/${event.id}`)}
                          className="bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/tickets-${activeTab}/${event.id}`)}
                          className="bg-purple-600 text-white px-2 py-1 rounded-full hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          Tiket
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pending Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesanan User (Pending)</h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 text-center">Tidak ada pesanan yang menunggu persetujuan.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-gray-700 font-semibold">User ID</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Acara</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Kategori Tiket</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">Harga (Rp)</th>
                  <th className="p-4 text-center text-gray-700 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100 transition-all duration-200">
                    <td className="p-4">{order.user_id}</td>
                    <td className="p-4">{order.event_name} ({order.event_category})</td>
                    <td className="p-4">{order.ticket_category}</td>
                    <td className="p-4 text-right">{order.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleApproveOrder(order.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-sm"
                      >
                        Setujui
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;