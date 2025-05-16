import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-center p-4 mt-8 border-t border-gray-300">
      <div className="container mx-auto">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} EventBond. All rights reserved.
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Crafted with ❤️.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 