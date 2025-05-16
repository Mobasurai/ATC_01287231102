import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin } from '../../services/adminService';
import type { User } from '../../types';
import type { UpdateUserDto as ClientUpdateUserDto } from '../../types/dto';
import { useTranslation } from 'react-i18next';

const AdminUsersListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updatedRole, setUpdatedRole] = useState<string>('');
  const { t, i18n } = useTranslation();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(t('adminUsers.errors.fetchUsers'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(t('adminUsers.confirmations.deleteUser'))) {
      try {
        await deleteUserByAdmin(userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        alert(t('adminUsers.feedback.deleteSuccess'));
      } catch (err: any) {
        console.error("Failed to delete user:", err);
        alert(err.response?.data?.message || t('adminUsers.errors.deleteUser'));
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUpdatedRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !updatedRole) return;
    if (editingUser.role === updatedRole) {
      setEditingUser(null);
      return;
    }

    const dto: Partial<ClientUpdateUserDto> = { role: updatedRole as 'user' | 'admin' };

    try {
      const updatedUser = await updateUserByAdmin(editingUser.id, dto);
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      alert(t('adminUsers.feedback.updateRoleSuccess'));
      setEditingUser(null);
    } catch (err: any) {
      console.error("Failed to update user role:", err);
      alert(err.response?.data?.message || t('adminUsers.errors.updateRole'));
    }
  };

  if (loading) return <p className="text-center py-10">{t('adminUsers.loading')}</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('adminUsers.title')}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminUsers.table.id')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminUsers.table.username')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminUsers.table.email')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminUsers.table.role')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminUsers.table.joined')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminUsers.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingUser?.id === user.id ? (
                    <select 
                      value={updatedRole}
                      onChange={(e) => setUpdatedRole(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="user">{t('adminUsers.roles.user')}</option>
                      <option value="admin">{t('adminUsers.roles.admin')}</option>
                    </select>
                  ) : (
                    t(`adminUsers.roles.${user.role}`)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString(i18n.language) : t('adminUsers.table.na')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {editingUser?.id === user.id ? (
                    <button onClick={handleSaveRole} className="text-indigo-600 hover:text-indigo-900">{t('adminUsers.buttons.save')}</button>
                  ) : (
                    <button onClick={() => handleEditUser(user)} className="text-indigo-600 hover:text-indigo-900">{t('adminUsers.buttons.editRole')}</button>
                  )}
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">{t('adminUsers.buttons.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersListPage; 