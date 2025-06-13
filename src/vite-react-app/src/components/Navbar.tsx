
import React from 'react';
import { ThemeToggle } from './theme/ThemeToggle';

interface NavbarProps {
  logoUrl?: string;
  companyName?: string;
}

const Navbar = ({ 
  logoUrl = "/placeholder.svg", 
  companyName = "Ship Command" 
}: NavbarProps) => {
  return (
    <div id="top-navbar" className="sticky top-0 z-50">
      <nav className="bg-[#62739a] border-b h-14">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
