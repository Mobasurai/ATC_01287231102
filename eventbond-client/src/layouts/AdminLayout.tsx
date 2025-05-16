import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">{t('adminSidebar.panel')}</h2>
        <nav>
          <ul>
            <li><Link to="/admin/events" className="block py-2 px-3 hover:bg-gray-700 rounded">{t('adminSidebar.links.events')}</Link></li>
            <li><Link to="/admin/users" className="block py-2 px-3 hover:bg-gray-700 rounded">{t('adminSidebar.links.users')}</Link></li>
            <li><Link to="/admin/bookings" className="block py-2 px-3 hover:bg-gray-700 rounded">{t('adminSidebar.links.bookings')}</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;