import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import { api } from './api';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TabSelector from './components/TabSelector';
import FilterBar from './components/FilterBar';
import DateCard from './components/DateCard';
import DateForm from './components/DateForm';
import SavingsModal from './components/SavingsModal';
import GoogleSheetsModal from './components/GoogleSheetsModal';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import WelcomeSplash from './components/WelcomeSplash';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');
  const [monthlyDates, setMonthlyDates] = useState([]);
  const [longTermDates, setLongTermDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [savingsItem, setSavingsItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // Default: Yang terbaru di depan
  const [isSheetsConnected, setIsSheetsConnected] = useState(Boolean(api.getSheetsUrl()));

  // Fetch data awal
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [monthly, longTerm] = await Promise.all([
        api.getMonthlyDates(),
        api.getLongTermDates(),
      ]);
      setMonthlyDates(monthly);
      setLongTermDates(longTerm);
      setIsSheetsConnected(Boolean(api.getSheetsUrl()));
    } catch (err) {
      console.error('Gagal memuat data:', err);
      setToast({ message: 'Gagal memuat data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD handlers - REALTIME OPTIMISTIC UPDATE
  const handleSave = async (data) => {
    try {
      if (editItem) {
        // Edit / Update Realtime
        if (activeTab === 'monthly') {
          setMonthlyDates((prev) =>
            prev.map((item) => (String(item.id) === String(editItem.id) ? { ...item, ...data } : item))
          );
          await api.updateMonthlyDate(editItem.id, data);
        } else {
          setLongTermDates((prev) =>
            prev.map((item) => (String(item.id) === String(editItem.id) ? { ...item, ...data } : item))
          );
          await api.updateLongTermDate(editItem.id, data);
        }
        setToast({ message: 'Destinasi kita berhasil diperbarui! ✏️', type: 'success' });
      } else {
        // Tambah Baru Realtime (Langsung muncul di state detik itu juga!)
        if (activeTab === 'monthly') {
          const newItem = await api.addMonthlyDate(data);
          setMonthlyDates((prev) => [newItem, ...prev.filter((it) => it.id !== newItem.id)]);
        } else {
          const newItem = await api.addLongTermDate(data);
          setLongTermDates((prev) => [newItem, ...prev.filter((it) => it.id !== newItem.id)]);
        }
        setToast({ message: 'Destinasi baru kita berhasil ditambahkan! 🎉', type: 'success' });
      }
      setShowForm(false);
      setEditItem(null);
    } catch (err) {
      console.error('Gagal menyimpan:', err);
      setToast({ message: 'Gagal menyimpan destinasi.', type: 'error' });
    }
  };

  const handleSaveSavings = async (updatedItem) => {
    try {
      // Realtime update tabungan
      setLongTermDates((prev) =>
        prev.map((it) => (String(it.id) === String(updatedItem.id) ? updatedItem : it))
      );
      setSavingsItem(null);
      setToast({ message: 'Tabungan kita berhasil ditambahkan! 💰🎉', type: 'success' });
      await api.updateLongTermDate(updatedItem.id, updatedItem);
    } catch (err) {
      console.error('Gagal memperbarui tabungan:', err);
      setToast({ message: 'Gagal menambahkan tabungan.', type: 'error' });
    }
  };

  const handleDelete = (item) => {
    setConfirmDelete({ item, tab: activeTab });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete || !confirmDelete.item) return;
    const targetId = confirmDelete.item.id;
    const targetTab = confirmDelete.tab;
    const targetName = confirmDelete.item.name;

    try {
      // Realtime hapus dari state UI seketika
      if (targetTab === 'monthly') {
        setMonthlyDates((prev) => prev.filter((it) => String(it.id) !== String(targetId)));
        await api.deleteMonthlyDate(targetId);
      } else {
        setLongTermDates((prev) => prev.filter((it) => String(it.id) !== String(targetId)));
        await api.deleteLongTermDate(targetId);
      }
      setToast({ message: `"${targetName}" berhasil dihapus! 🗑️`, type: 'success' });
      setConfirmDelete(null);
    } catch (err) {
      console.error('Gagal menghapus:', err);
      setToast({ message: 'Gagal menghapus data.', type: 'error' });
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleToggleVisited = async (item) => {
    const updated = { ...item, visited: !item.visited };
    try {
      // Realtime toggle status
      if (activeTab === 'monthly') {
        setMonthlyDates((prev) =>
          prev.map((it) => (String(it.id) === String(item.id) ? updated : it))
        );
        await api.updateMonthlyDate(item.id, updated);
      } else {
        setLongTermDates((prev) =>
          prev.map((it) => (String(it.id) === String(item.id) ? updated : it))
        );
        await api.updateLongTermDate(item.id, updated);
      }
      setToast({
        message: updated.visited ? 'Hore! Sudah kita kunjungi! 🎉' : 'Status diubah ke belum dikunjungi',
        type: 'success',
      });
    } catch (err) {
      console.error('Gagal mengubah status:', err);
    }
  };

  const currentRawList = activeTab === 'monthly' ? monthlyDates : longTermDates;

  // Filtered and Searched list with Sorting
  const filteredList = useMemo(() => {
    let result = currentRawList.filter((item) => {
      // Status filter
      if (statusFilter === 'visited' && !item.visited) return false;
      if (statusFilter === 'pending' && item.visited) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        return matchName || matchLoc;
      }

      return true;
    });

    // Sorting (Terbaru selalu di paling depan secara default)
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = new Date(a.createdAt || 0).getTime() || Number(String(a.id).replace(/\D/g, '')) || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || Number(String(b.id).replace(/\D/g, '')) || 0;
        return timeB - timeA;
      }
      if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'savings-desc') {
        const saveA = a.savedAmount || 0;
        const saveB = b.savedAmount || 0;
        return saveB - saveA;
      }
      return 0;
    });

    return result;
  }, [currentRawList, statusFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      <Header
        onOpenSheetsModal={() => setShowSheetsModal(true)}
        isSheetsConnected={isSheetsConnected}
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Stats Bar */}
        <StatsBar
          monthlyDates={monthlyDates}
          longTermDates={longTermDates}
          activeTab={activeTab}
        />

        {/* Action Bar: Tabs + Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabSelector
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSearchQuery('');
              setStatusFilter('all');
            }}
            monthlyCt={monthlyDates.length}
            longTermCt={longTermDates.length}
          />

          <button
            onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer text-sm sm:text-base"
          >
            <FiPlus className="w-5 h-5 stroke-[2.5]" />
            <span>Tambah Destinasi Kita</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        {currentRawList.length > 0 && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isLongTerm={activeTab === 'longterm'}
          />
        )}

        {/* Content Section */}
        {loading ? (
          <LoadingSpinner />
        ) : currentRawList.length === 0 ? (
          <EmptyState
            type={activeTab}
            onAddClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}
          />
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-md mx-auto my-6">
            <p className="text-slate-600 font-semibold mb-1 text-sm">Tidak ada destinasi yang cocok</p>
            <p className="text-xs text-slate-400 mb-4">Coba cari kata kunci lain atau ubah status filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredList.map((item) => (
              <DateCard
                key={item.id}
                item={item}
                type={activeTab}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleVisited={handleToggleVisited}
                onOpenSavings={(it) => setSavingsItem(it)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-slate-400 border-t border-slate-200/70 bg-white">
        <p>Dibuat dengan 💙 untuk perjalanan indah kita berdua</p>
      </footer>

      {/* Modal Form */}
      {showForm && (
        <DateForm
          type={activeTab}
          editItem={editItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}

      {/* Quick Savings Modal */}
      {savingsItem && (
        <SavingsModal
          item={savingsItem}
          onSave={handleSaveSavings}
          onClose={() => setSavingsItem(null)}
        />
      )}

      {/* Google Sheets Modal */}
      <GoogleSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        onConnected={() => {
          setIsSheetsConnected(Boolean(api.getSheetsUrl()));
          setShowSheetsModal(false);
          fetchData();
          setToast({ message: 'Data Google Spreadsheet berhasil disinkronkan! 📊💙', type: 'success' });
        }}
      />

      {/* Confirm Delete with Details */}
      {confirmDelete && (
        <ConfirmDialog
          item={confirmDelete.item}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Opening Splash Animation */}
      {showSplash && <WelcomeSplash onFinish={() => setShowSplash(false)} />}
    </div>
  );
}
