import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-dark-700 bg-dark-900/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            <p>© {currentYear} NebulaMint. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/MarcusMore/NebulaMint"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              aria-label="GitHub"
            >
              <div className="p-2 rounded-lg bg-dark-800 border border-dark-700 group-hover:border-brand-500/50 group-hover:bg-dark-700 transition-all">
                <Github className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">GitHub</span>
            </a>

            <a
              href="https://x.com/MarcusMore_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              aria-label="X (Twitter)"
            >
              <div className="p-2 rounded-lg bg-dark-800 border border-dark-700 group-hover:border-brand-500/50 group-hover:bg-dark-700 transition-all">
                <Twitter className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">X</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

