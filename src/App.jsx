import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import { api } from './api';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TabSelector from './components/TabSelector';
import FilterBar from './components/FilterBar';
import DateCard from './components/DateCard';
import DateForm from './components/DateForm';
import CityCard from './components/CityCard';
import CityFormModal from './components/CityFormModal';
import CityDetailModal from './components/CityDetailModal';
import SavingsModal from './components/SavingsModal';
import GoogleSheetsModal from './components/GoogleSheetsModal';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import WelcomeSplash from './components/WelcomeSplash';
import ImageLightboxModal from './components/ImageLightboxModal';
import Pagination from './components/Pagination';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' | 'longterm' | 'cities'
  const [monthlyDates, setMonthlyDates] = useState([]);
  const [longTermDates, setLongTermDates] = useState([]);
  const [cityTrips, setCityTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showCityForm, setShowCityForm] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [selectedCityForDetail, setSelectedCityForDetail] = useState(null);
  const [savingsItem, setSavingsItem] = useState(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);

  const handleOpenImage = (imageUrl, title, subtitle, date) => {
    setLightboxData({ imageUrl, title, subtitle, date });
  };

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isSheetsConnected, setIsSheetsConnected] = useState(Boolean(api.getSheetsUrl()));
  const [toast, setToast] = useState(null);

  // Pagination
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page ke 1 saat tab, filter, atau search berubah
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch data awal
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAllData(true);
      setMonthlyDates(data.monthlyDates);
      setLongTermDates(data.longTermDates);
      setCityTrips(data.cityTrips);
      setIsSheetsConnected(Boolean(api.getSheetsUrl()));
    } catch (err) {
      console.error('Gagal memuat data:', err);
      setToast({ message: 'Gagal memuat data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Silent Auto-Sync di background (Real-time tanpa loading spinner agar tidak mengganggu)
  const silentSync = useCallback(async () => {
    if (!api.getSheetsUrl()) return;
    try {
      const data = await api.getAllData(false);
      setMonthlyDates(data.monthlyDates);
      setLongTermDates(data.longTermDates);
      setCityTrips(data.cityTrips);
      setIsSheetsConnected(true);
    } catch {}
  }, []);

  // Auto-Sync berkala (setiap 12 detik) & saat aplikasi dibuka / tab kembali aktif
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !showForm && !showCityForm && !selectedCityForDetail) {
        silentSync();
      }
    }, 12000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        silentSync();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchData, silentSync, showForm, showCityForm, selectedCityForDetail]);

  // Helper: sync ulang data dari Sheets setelah delay (untuk memastikan foto dari Drive sudah masuk)
  const syncAfterDelay = useCallback((delayMs = 4000) => {
    if (!api.getSheetsUrl()) return;
    setTimeout(async () => {
      try {
        const data = await api.getAllData(true); // force re-fetch
        setMonthlyDates(data.monthlyDates);
        setLongTermDates(data.longTermDates);
        setCityTrips(data.cityTrips);
      } catch {}
    }, delayMs);
  }, []);

  // CRUD handlers - Monthly & Long Term
  const handleSave = async (data) => {
    try {
      if (editItem) {
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
      // Sync ulang setelah 4 detik agar URL foto dari Drive sudah tersimpan di Sheets
      if (data.imageUrl && data.imageUrl.startsWith('https://lh3.googleusercontent.com')) {
        syncAfterDelay(4000);
      }
    } catch (err) {
      console.error('Gagal menyimpan:', err);
      setToast({ message: 'Gagal menyimpan destinasi.', type: 'error' });
    }
  };

  // CRUD handlers - City Trips
  const handleSaveCity = async (cityData) => {
    try {
      if (editCity) {
        setCityTrips((prev) =>
          prev.map((c) => (String(c.id) === String(editCity.id) ? { ...c, ...cityData } : c))
        );
        await api.updateCityTrip(editCity.id, cityData);
        setToast({ message: `Kota "${cityData.cityName}" berhasil diperbarui! ✏️`, type: 'success' });
      } else {
        const newCity = await api.addCityTrip(cityData);
        setCityTrips((prev) => [newCity, ...prev.filter((c) => c.id !== newCity.id)]);
        setToast({ message: `Kota "${newCity.cityName}" berhasil ditambahkan! 🗺️🎉`, type: 'success' });
      }
      setShowCityForm(false);
      setEditCity(null);
      // Sync ulang setelah 4 detik agar URL foto cover dari Drive sudah tersimpan di Sheets
      if (cityData.coverUrl && cityData.coverUrl.startsWith('https://lh3.googleusercontent.com')) {
        syncAfterDelay(4000);
      }
    } catch (err) {
      console.error('Gagal menyimpan kota:', err);
      setToast({ message: 'Gagal menyimpan kota tujuan.', type: 'error' });
    }
  };

  const handleUpdateCityFromDetail = async (updatedCity) => {
    setCityTrips((prev) =>
      prev.map((c) => (String(c.id) === String(updatedCity.id) ? updatedCity : c))
    );
    setSelectedCityForDetail(updatedCity);
    await api.updateCityTrip(updatedCity.id, updatedCity);
    // Sync setelah delay jika ada foto destinasi baru dari Drive
    const hasNewDrivePhoto = updatedCity.destinations?.some(
      (d) => d.imageUrl && d.imageUrl.startsWith('https://lh3.googleusercontent.com')
    );
    if (hasNewDrivePhoto || (updatedCity.coverUrl && updatedCity.coverUrl.startsWith('https://lh3.googleusercontent.com'))) {
      syncAfterDelay(4000);
    }
  };

  const handleSaveSavings = async (updatedItem) => {
    try {
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
    const targetName = confirmDelete.item.name || confirmDelete.item.cityName;

    try {
      if (targetTab === 'monthly') {
        setMonthlyDates((prev) => prev.filter((it) => String(it.id) !== String(targetId)));
        await api.deleteMonthlyDate(targetId);
      } else if (targetTab === 'longterm') {
        setLongTermDates((prev) => prev.filter((it) => String(it.id) !== String(targetId)));
        await api.deleteLongTermDate(targetId);
      } else if (targetTab === 'cities') {
        setCityTrips((prev) => prev.filter((it) => String(it.id) !== String(targetId)));
        await api.deleteCityTrip(targetId);
      }
      setToast({ message: `"${targetName}" berhasil dihapus! 🗑️`, type: 'success' });
      setConfirmDelete(null);
    } catch (err) {
      console.error('Gagal menghapus:', err);
      setToast({ message: 'Gagal menghapus data.', type: 'error' });
    }
  };

  const handleEdit = (item) => {
    if (activeTab === 'cities') {
      setEditCity(item);
      setShowCityForm(true);
    } else {
      setEditItem(item);
      setShowForm(true);
    }
  };

  const handleToggleVisited = async (item) => {
    const updated = { ...item, visited: !item.visited };
    try {
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

  // Filtered and Searched list
  const filteredList = useMemo(() => {
    if (activeTab === 'cities') {
      return cityTrips
        .filter((city) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          const matchCity = city.cityName?.toLowerCase().includes(q);
          const matchNotes = city.notes?.toLowerCase().includes(q);
          const matchDest = city.destinations?.some(
            (d) =>
              d.placeName?.toLowerCase().includes(q) ||
              d.location?.toLowerCase().includes(q)
          );
          return matchCity || matchNotes || matchDest;
        })
        .sort((a, b) => {
          if (sortBy === 'newest') {
            const timeA = new Date(a.createdAt || 0).getTime() || 0;
            const timeB = new Date(b.createdAt || 0).getTime() || 0;
            return timeB - timeA;
          }
          if (sortBy === 'date-desc') {
            return new Date(b.startDate || 0) - new Date(a.startDate || 0);
          }
          if (sortBy === 'date-asc') {
            return new Date(a.startDate || 0) - new Date(b.startDate || 0);
          }
          if (sortBy === 'name-asc') {
            return (a.cityName || '').localeCompare(b.cityName || '');
          }
          return 0;
        });
    }

    const currentRawList = activeTab === 'monthly' ? monthlyDates : longTermDates;

    let result = currentRawList.filter((item) => {
      if (statusFilter === 'visited' && !item.visited) return false;
      if (statusFilter === 'pending' && item.visited) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        return matchName || matchLoc;
      }

      return true;
    });

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
  }, [activeTab, monthlyDates, longTermDates, cityTrips, statusFilter, searchQuery, sortBy]);

  // Total pages & paginated items
  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage, PAGE_SIZE]);

  // Pastikan currentPage tidak melebihi totalPages saat item dihapus atau difilter
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const rawCount =
    activeTab === 'monthly'
      ? monthlyDates.length
      : activeTab === 'longterm'
      ? longTermDates.length
      : cityTrips.length;

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
          cityTrips={cityTrips}
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
              setCurrentPage(1);
            }}
            monthlyCt={monthlyDates.length}
            longTermCt={longTermDates.length}
            citiesCt={cityTrips.length}
          />

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'cities') {
                setEditCity(null);
                setShowCityForm(true);
              } else {
                setEditItem(null);
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer text-sm sm:text-base flex-shrink-0"
          >
            <FiPlus className="w-5 h-5 stroke-[2.5]" />
            <span>
              {activeTab === 'cities'
                ? 'Buat Trip Kota Kita'
                : 'Tambah Destinasi Kita'}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        {rawCount > 0 && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            sortBy={sortBy}
            onSortChange={(v) => { setSortBy(v); setCurrentPage(1); }}
            isLongTerm={activeTab === 'longterm'}
          />
        )}

        {/* Content Section */}
        {loading ? (
          <LoadingSpinner />
        ) : rawCount === 0 ? (
          <EmptyState
            type={activeTab}
            onAddClick={() => {
              if (activeTab === 'cities') {
                setEditCity(null);
                setShowCityForm(true);
              } else {
                setEditItem(null);
                setShowForm(true);
              }
            }}
          />
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-md mx-auto my-6">
            <p className="text-slate-600 font-semibold mb-1 text-sm">Tidak ada yang cocok</p>
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
          <>
            {activeTab === 'cities' ? (
              /* Grid Kota Tujuan */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {paginatedList.map((city) => (
                  <CityCard
                    key={city.id}
                    city={city}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDetail={(c) => setSelectedCityForDetail(c)}
                    onOpenImage={handleOpenImage}
                  />
                ))}
              </div>
            ) : (
              /* Grid Bulanan & Jangka Panjang */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {paginatedList.map((item) => (
                  <DateCard
                    key={item.id}
                    item={item}
                    type={activeTab}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleVisited={handleToggleVisited}
                    onOpenSavings={(it) => setSavingsItem(it)}
                    onOpenImage={handleOpenImage}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredList.length}
              pageSize={PAGE_SIZE}
              onPageChange={goToPage}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-slate-400 border-t border-slate-200/70 bg-white">
        <p>Dibuat dengan 💙 untuk perjalanan indah kita berdua</p>
      </footer>

      {/* Modal Form Destinasi (Bulanan / Jangka Panjang) */}
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

      {/* Modal Form Kota Tujuan */}
      {showCityForm && (
        <CityFormModal
          isOpen={showCityForm}
          editCity={editCity}
          onSave={handleSaveCity}
          onClose={() => {
            setShowCityForm(false);
            setEditCity(null);
          }}
        />
      )}

      {/* Modal Detail & Itinerary Kota */}
      {selectedCityForDetail && (
        <CityDetailModal
          isOpen={Boolean(selectedCityForDetail)}
          city={selectedCityForDetail}
          onClose={() => setSelectedCityForDetail(null)}
          onUpdateCity={handleUpdateCityFromDetail}
          onOpenImage={handleOpenImage}
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

      {/* Image Lightbox Modal */}
      {lightboxData && (
        <ImageLightboxModal
          isOpen={Boolean(lightboxData)}
          imageUrl={lightboxData.imageUrl}
          title={lightboxData.title}
          subtitle={lightboxData.subtitle}
          date={lightboxData.date}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}
