import { FiHeart, FiPlus, FiCompass, FiMapPin } from 'react-icons/fi';

export default function EmptyState({ type, onAddClick }) {
  const isCities = type === 'cities';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto my-6">
      <div className="relative mb-5">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
          {isCities ? (
            <FiMapPin className="w-10 h-10 text-blue-600" />
          ) : (
            <FiCompass className="w-10 h-10 text-blue-600" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-pink-100 p-1.5 rounded-xl text-pink-500 shadow-sm">
          <FiHeart className="w-4 h-4 fill-pink-500" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-1.5">
        {type === 'monthly'
          ? 'Belum Ada List Date Bulanan'
          : type === 'longterm'
          ? 'Belum Ada Destinasi Impian'
          : 'Belum Ada Rencana Trip Kota'}
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
        {type === 'monthly'
          ? 'Mulai rencanakan agenda date seru kita setiap bulannya. Mau makan bareng, nonton, atau keliling kota!'
          : type === 'longterm'
          ? 'Tulis destinasi impian yang ingin kita kunjungi bersama. Ayo mulai nabung dan wujudkan satu per satu!'
          : 'Tentukan kota tujuan kita, atur tanggal mulai sampai selesai, dan susun tempat-tempat seru beserta jam kunjungannya!'}
      </p>

      {onAddClick && (
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-200 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4 stroke-[2.5]" />
          <span>
            {type === 'cities'
              ? 'Buat Trip Kota Pertama Kita'
              : 'Tambah Destinasi Pertama Kita'}
          </span>
        </button>
      )}
    </div>
  );
}
