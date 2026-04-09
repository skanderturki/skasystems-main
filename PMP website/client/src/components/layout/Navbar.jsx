import { Menu } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-6 z-20">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
    </header>
  );
}
