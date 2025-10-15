import React from 'react';
import type { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage, onLogoClick }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button 
          onClick={onLogoClick} 
          className="cursor-pointer flex items-center gap-3" 
          aria-label="Back to homepage"
        >
          {/* Modern SVG Logo */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.37,9.54a4.34,4.34,0,0,0-4-3.88,4.5,4.5,0,0,0-4.45,4.71,4.2,4.2,0,0,0-1.5,1.1,4.3,4.3,0,0,0-1.12,3.14,4.45,4.45,0,0,0,4.45,4.45h8.3a4.32,4.32,0,0,0,1.44-8.38Z" fill="#FB923C"/>
            <path d="M12.33,21.61a1,1,0,0,0,1-1V15.39a1.14,1.14,0,0,0-.49-1,1,1,0,0,0-1,0,1.14,1.14,0,0,0-.49,1v5.22a1,1,0,0,0,1,1Z" fill="#F97316"/>
            <path d="M12.82,14.41a1.14,1.14,0,0,0,.49-1,1.12,1.12,0,0,0-1.12-1.12H5.1a1,1,0,0,0,0,2H11.7a1.12,1.12,0,0,0,1.12-1.12Z" fill="#F97316"/>
            <path d="M18.89,17.45H12.82a1,1,0,1,0,0,2h6.07a1,1,0,1,0,0-2Z" fill="#F97316"/>
          </svg>
          <span className="text-2xl font-bold text-orange-500 tracking-wider">
            Recipe AI
          </span>
        </button>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </header>
  );
};
