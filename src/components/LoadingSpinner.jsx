import { FiLoader } from 'react-icons/fi';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );
}
