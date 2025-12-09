'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Award, Plus, X, Trophy } from 'lucide-react';
import { adminService, User as AdminUser, Achievement } from '@/lib/services/admin.service';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showCuratorModal, setShowCuratorModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForAchievement, setSelectedUserForAchievement] = useState<string | null>(null);
  const [selectedUserForCurator, setSelectedUserForCurator] = useState<string | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{ id: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [curators, setCurators] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedCuratorId, setSelectedCuratorId] = useState<string>('');
  
  // Пошук і фільтрація
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all'); // all, student, curator, admin
  const [filterFaculty, setFilterFaculty] = useState<string>('all');
  const [filterTariff, setFilterTariff] = useState<string>('all');
  const [filterCurator, setFilterCurator] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name'); // name, email, tariff, modules, earnings
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneOrTelegram: '',
    group: '',
    accessUntil: '',
    tariff: '',
    faculty: '',
    curatorId: '',
    isAdmin: false,
    isCurator: false,
  });
  const [editUser, setEditUser] = useState<{
    id: string;
    email: string;
    firstName: string;
    phoneOrTelegram: string;
    group: string;
    accessUntil: string;
    tariff: string;
    faculty: string;
    curatorId?: string;
  } | null>(null);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [achievementLoading, setAchievementLoading] = useState(false);

  const faculties = ['Продюсер', 'Експерт', 'Досвідчений'];
  const tariffs = ['Преміум', 'ВІП', 'Легенда'];

  useEffect(() => {
    loadUsers();
    loadCurators();
  }, []);

  // Фільтрація та сортування користувачів
  const filteredAndSortedUsers = users
    .filter(user => {
      // Пошук по імені, email, telegram
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phoneOrTelegram?.toLowerCase().includes(searchLower) || false);

      if (!matchesSearch) return false;

      // Фільтр по ролі
      if (filterRole === 'admin' && !user.isAdmin) return false;
      if (filterRole === 'curator' && !user.isCurator) return false;
      if (filterRole === 'student' && (user.isAdmin || user.isCurator)) return false;

      // Фільтр по факультету
      if (filterFaculty !== 'all' && user.faculty !== filterFaculty) return false;

      // Фільтр по тарифу
      if (filterTariff !== 'all' && user.tariff !== filterTariff) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.firstName.localeCompare(b.firstName);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'tariff':
          const tariffOrder = { 'Легенда': 3, 'ВІП': 2, 'Преміум': 1 };
          return (tariffOrder[b.tariff as keyof typeof tariffOrder] || 0) - (tariffOrder[a.tariff as keyof typeof tariffOrder] || 0);
        case 'modules':
          return b.completedModulesCount - a.completedModulesCount;
        case 'earnings':
          return b.earnings - a.earnings;
        default:
          return 0;
      }
    });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurators = async () => {
    try {
      const data = await adminService.getAllCurators();
      setCurators(data);
    } catch (error) {
      console.error('Failed to load curators:', error);
    }
  };

  const handleAssignFaculty = async (userId: string, faculty: string) => {
    try {
      await adminService.assignFaculty(userId, faculty);
      // Оновлюємо локальний стан
      setUsers(users.map(user => 
        user.id === userId ? { ...user, faculty } : user
      ));
      setSelectedUser(null);
      setSelectedFaculty('');
    } catch (error) {
      console.error('Failed to assign faculty:', error);
      alert('Помилка призначення факультету');
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    try {
      const result = await adminService.toggleAdmin(userId);
      // Оновлюємо локальний стан
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: result.isAdmin } : user
      ));
    } catch (error) {
      console.error('Failed to toggle admin:', error);
      alert('Помилка зміни прав адміністратора');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName) {
      alert('Заповніть всі обов\'язкові поля');
      return;
    }

    if (newUser.password.length < 6) {
      alert('Пароль має бути не менше 6 символів');
      return;
    }

    try {
      setCreateLoading(true);
      // Видаляємо пусті рядки перед відправкою
      const userData = {
        ...newUser,
        accessUntil: newUser.accessUntil.trim() || undefined,
        phoneOrTelegram: newUser.phoneOrTelegram.trim() || undefined,
        group: newUser.group.trim() || undefined,
        tariff: newUser.tariff.trim() || undefined,
        faculty: newUser.faculty.trim() || undefined,
        curatorId: newUser.curatorId.trim() || undefined,
      };
      await adminService.createUser(userData);
      alert('Користувача успішно створено! ✅');
      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneOrTelegram: '',
        group: '',
        accessUntil: '',
        tariff: '',
        faculty: '',
        curatorId: '',
        isAdmin: false,
        isCurator: false,
      });
      loadUsers(); // Перезавантажуємо список
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.message || 'Помилка створення користувача');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenAchievements = async (userId: string) => {
    try {
      setAchievementLoading(true);
      const data = await adminService.getUserAchievements(userId);
      setUserAchievements(data.achievements);
      setSelectedUserForAchievement(userId);
      setShowAchievementModal(true);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      alert('Помилка завантаження нагород');
    } finally {
      setAchievementLoading(false);
    }
  };

  const handleAwardAchievement = async () => {
    if (!selectedUserForAchievement || !newAchievement.title || !newAchievement.description || !newAchievement.imageUrl) {
      alert('Заповніть всі поля');
      return;
    }

    try {
      setAchievementLoading(true);
      const data = await adminService.awardAchievement(selectedUserForAchievement, newAchievement);
      setUserAchievements(data.achievements);
      setNewAchievement({ title: '', description: '', imageUrl: '' });
      alert('Нагороду успішно додано! 🏆');
    } catch (error: any) {
      console.error('Failed to award achievement:', error);
      alert(error.response?.data?.message || 'Помилка додавання нагороди');
    } finally {
      setAchievementLoading(false);
    }
  };

  const handleRemoveAchievement = async (achievementId: string) => {
    if (!selectedUserForAchievement || !confirm('Видалити цю нагороду?')) {
      return;
    }

    try {
      const data = await adminService.removeAchievement(selectedUserForAchievement, achievementId);
      setUserAchievements(data.achievements);
      alert('Нагороду видалено');
    } catch (error) {
      console.error('Failed to remove achievement:', error);
      alert('Помилка видалення нагороди');
    }
  };

  const handleToggleCurator = async (userId: string) => {
    try {
      await adminService.toggleCurator(userId);
      alert('Права куратора змінено! ✅');
      loadUsers();
    } catch (error: any) {
      console.error('Failed to toggle curator:', error);
      alert(error.response?.data?.message || 'Помилка зміни прав куратора');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmed = confirm(`Ви впевнені, що хочете видалити користувача ${userEmail}?\n\nЦя дія незворотна!`);
    if (!confirmed) return;

    try {
      await adminService.deleteUser(userId);
      alert('Користувача успішно видалено! ✅');
      loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || 'Помилка видалення користувача');
    }
  };

  const handleExportUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Будуємо query параметри на основі поточних фільтрів
      const params = new URLSearchParams();
      if (filterTariff !== 'all') params.append('tariff', filterTariff);
      if (filterFaculty !== 'all') params.append('faculty', filterFaculty);
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterCurator !== 'all') params.append('curator', filterCurator);
      
      const queryString = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users/export${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Помилка експорту');
      }

      const data = await response.json();
      
      // Створюємо Blob з BOM для правильного відображення українських символів
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + data.csv], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      const filterInfo = [];
      if (filterTariff !== 'all') filterInfo.push(`Тариф: ${filterTariff}`);
      if (filterFaculty !== 'all') filterInfo.push(`Факультет: ${filterFaculty}`);
      if (filterRole !== 'all') filterInfo.push(`Роль: ${filterRole}`);
      if (filterCurator !== 'all') {
        const curator = curators.find(c => c.id === filterCurator);
        if (curator) filterInfo.push(`Куратор: ${curator.name}`);
      }
      
      const message = filterInfo.length > 0 
        ? `✅ Експортовано ${data.totalUsers} користувачів\nФільтри: ${filterInfo.join(', ')}`
        : `✅ Експортовано ${data.totalUsers} користувачів`;
      
      alert(message);
    } catch (error) {
      console.error('Failed to export users:', error);
      alert('❌ Помилка експорту користувачів');
    }
  };

  const handleOpenCuratorAssignment = (userId: string, currentCuratorId?: string) => {
    setSelectedUserForCurator(userId);
    setSelectedCuratorId(currentCuratorId || '');
    setShowCuratorModal(true);
  };

  const handleAssignCurator = async () => {
    if (!selectedUserForCurator || !selectedCuratorId) {
      alert('Оберіть куратора');
      return;
    }

    try {
      await adminService.assignCurator(selectedUserForCurator, selectedCuratorId);
      alert('Куратора призначено! ✅');
      setShowCuratorModal(false);
      setSelectedUserForCurator(null);
      setSelectedCuratorId('');
      loadUsers();
    } catch (error: any) {
      console.error('Failed to assign curator:', error);
      alert(error.response?.data?.message || 'Помилка призначення куратора');
    }
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setEditUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      phoneOrTelegram: user.phoneOrTelegram || '',
      group: user.group || '',
      accessUntil: user.accessUntil ? new Date(user.accessUntil).toISOString().split('T')[0] : '',
      tariff: user.tariff || '',
      faculty: user.faculty || '',
      curatorId: user.curatorId || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    if (!editUser.email || !editUser.firstName) {
      alert('Заповніть обов\'язкові поля');
      return;
    }

    try {
      setCreateLoading(true);
      const token = localStorage.getItem('token');
      
      // Підготовка даних - пусті рядки замінюємо на undefined
      const updateData: any = {
        email: editUser.email,
        firstName: editUser.firstName,
        lastName: 'Студент',
      };
      
      if (editUser.phoneOrTelegram?.trim()) {
        updateData.phoneOrTelegram = editUser.phoneOrTelegram.trim();
      }
      if (editUser.group?.trim()) {
        updateData.group = editUser.group.trim();
      }
      if (editUser.accessUntil?.trim()) {
        updateData.accessUntil = editUser.accessUntil.trim();
      }
      if (editUser.tariff?.trim()) {
        updateData.tariff = editUser.tariff.trim();
      }
      if (editUser.faculty?.trim()) {
        updateData.faculty = editUser.faculty.trim();
      }
      if (editUser.curatorId?.trim()) {
        updateData.curatorId = editUser.curatorId.trim();
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Помилка оновлення користувача');
      }

      alert('Користувача успішно оновлено! ✅');
      setShowEditModal(false);
      setEditUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.message || 'Помилка оновлення користувача');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenPasswordModal = (userId: string, userEmail: string) => {
    setSelectedUserForPassword({ id: userId, email: userEmail });
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (!selectedUserForPassword || !newPassword) {
      alert('Введіть новий пароль');
      return;
    }

    if (newPassword.length < 6) {
      alert('Пароль має бути не менше 6 символів');
      return;
    }

    try {
      setCreateLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users/${selectedUserForPassword.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Помилка зміни пароля');
      }

      alert('Пароль успішно змінено! ✅');
      setShowPasswordModal(false);
      setSelectedUserForPassword(null);
      setNewPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(error.message || 'Помилка зміни пароля');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-black flex-1">Управління користувачами</h1>
        <button
          onClick={handleExportUsers}
          className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          title="Експорт в CSV"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 bg-[#2466FF] text-white rounded-full hover:bg-[#1557ee] transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Пошук і фільтри */}
      <div className="p-4 space-y-3">
        {/* Пошук */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Пошук по імені, email, telegram..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black placeholder:text-gray-400"
          />
        </div>

        {/* Фільтри */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
          >
            <option value="all">Всі ролі</option>
            <option value="student">Студенти</option>
            <option value="curator">Куратори</option>
            <option value="admin">Адміни</option>
          </select>

          <select
            value={filterFaculty}
            onChange={(e) => setFilterFaculty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
          >
            <option value="all">Всі факультети</option>
            {faculties.map(faculty => (
              <option key={faculty} value={faculty}>{faculty}</option>
            ))}
          </select>

          <select
            value={filterTariff}
            onChange={(e) => setFilterTariff(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
          >
            <option value="all">Всі тарифи</option>
            {tariffs.map(tariff => (
              <option key={tariff} value={tariff}>{tariff}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
          >
            <option value="name">По імені ↑</option>
            <option value="email">По email ↑</option>
            <option value="tariff">По тарифу ↓</option>
            <option value="modules">По модулях ↓</option>
            <option value="earnings">По заробітку ↓</option>
          </select>
        </div>

        {/* Статистика */}
        <div className="bg-gradient-to-r from-[#2466FF] to-[#1557ee] rounded-xl p-4 text-white">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold">{filteredAndSortedUsers.length}</div>
              <div className="text-xs opacity-90">Знайдено</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-xs opacity-90">Всього</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{users.filter(u => u.isCurator).length}</div>
              <div className="text-xs opacity-90">Кураторів</div>
            </div>
          </div>
        </div>

        {/* Скидання фільтрів */}
        {(searchQuery || filterRole !== 'all' || filterFaculty !== 'all' || filterTariff !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('all');
              setFilterFaculty('all');
              setFilterTariff('all');
            }}
            className="w-full py-2 text-sm text-gray-600 hover:text-[#2466FF] font-medium transition-colors"
          >
            ✕ Скинути фільтри
          </button>
        )}
      </div>

      {/* Список користувачів */}
      <div className="px-4 pb-4 space-y-3">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Користувачів не знайдено</p>
          </div>
        ) : (
          filteredAndSortedUsers.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-black">
                    {user.firstName}
                  </h3>
                  {user.isAdmin && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Адмін
                    </span>
                  )}
                  {user.isCurator && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      Куратор
                    </span>
                  )}
                </div>
                {user.curatorId && (
                  <p className="text-xs text-gray-500 mb-1">
                    Куратор: {curators.find(c => c.id === user.curatorId)?.name || 'Призначено'}
                  </p>
                )}
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.phoneOrTelegram && (
                  <p className="text-sm text-gray-500">📱 {user.phoneOrTelegram}</p>
                )}
                {user.group && (
                  <p className="text-sm text-gray-500">👥 {user.group}</p>
                )}
                {user.tariff && (
                  <p className="text-sm font-medium text-purple-600">
                    💎 Тариф: {user.tariff}
                  </p>
                )}
                {user.accessUntil && (
                  <p className="text-xs text-amber-600 mt-1">
                    🔒 Доступ до: {new Date(user.accessUntil).toLocaleDateString('uk-UA')}
                  </p>
                )}
                {!user.accessUntil && user.email !== 'admin@hogwarts.com' && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Доступ назавжди
                  </p>
                )}
              </div>
            </div>

            {/* Факультет */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Факультет
              </label>
              {selectedUser === user.id ? (
                <div className="space-y-2">
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2466FF]"
                  >
                    <option value="">Виберіть факультет</option>
                    {faculties.map(faculty => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAssignFaculty(user.id, selectedFaculty)}
                      disabled={!selectedFaculty}
                      className="flex-1 px-4 py-2 bg-[#2466FF] text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1557ee] transition-colors"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedFaculty('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {user.faculty ? (
                    <span className="px-3 py-1.5 bg-[#E9F0FF] text-[#2466FF] text-sm font-medium rounded-full">
                      {user.faculty}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Не призначено</span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUser(user.id);
                      setSelectedFaculty(user.faculty || '');
                    }}
                    className="text-sm text-[#2466FF] font-medium hover:underline"
                  >
                    Змінити
                  </button>
                </div>
              )}
            </div>

            {/* Статистика */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {user.completedModulesCount} модулів
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  $ {user.earnings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Дії адміна */}
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="text-sm text-[#2466FF] hover:text-[#1557ee] font-medium transition-colors"
                >
                  ✏️ Редагувати
                </button>
                <button
                  onClick={() => handleOpenPasswordModal(user.id, user.email)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  🔑 Змінити пароль
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  🗑️ Видалити
                </button>
                <button
                  onClick={() => handleToggleAdmin(user.id)}
                  className="text-sm text-gray-600 hover:text-[#2466FF] font-medium transition-colors"
                >
                  {user.isAdmin ? 'Забрати права адміна' : 'Надати права адміна'}
                </button>
                <button
                  onClick={() => handleToggleCurator(user.id)}
                  className="text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors"
                >
                  {user.isCurator ? 'Забрати права куратора' : 'Зробити куратором'}
                </button>
                <button
                  onClick={() => handleOpenAchievements(user.id)}
                  className="text-sm text-gray-600 hover:text-amber-500 font-medium transition-colors flex items-center gap-1"
                >
                  <Trophy className="w-4 h-4" />
                  Нагороди
                </button>
              </div>
              {!user.isCurator && (
                <button
                  onClick={() => handleOpenCuratorAssignment(user.id, user.curatorId)}
                  className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors"
                >
                  {user.curatorId ? 'Змінити куратора' : 'Призначити куратора'}
                </button>
              )}
            </div>
          </div>
        ))
        )}
      </div>

      {/* Модальне вікно створення користувача */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header модалки */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Додати користувача</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Форма */}
            <div className="p-6 pb-32 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Пароль */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Мінімум 6 символів"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Ім'я та Прізвище */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я та Прізвище <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value, lastName: 'Студент' })}
                  placeholder="Іван Іваненко"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Телефон або Телеграм */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефону або Телеграм
                </label>
                <input
                  type="text"
                  value={newUser.phoneOrTelegram}
                  onChange={(e) => setNewUser({ ...newUser, phoneOrTelegram: e.target.value })}
                  placeholder="+380 XX XXX XX XX або @username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Група */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Група
                </label>
                <input
                  type="text"
                  value={newUser.group}
                  onChange={(e) => setNewUser({ ...newUser, group: e.target.value })}
                  placeholder="Наприклад: 5 потік"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Доступ до дати */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Доступ до дати (залиште пустим для вічного доступу)
                </label>
                <input
                  type="date"
                  value={newUser.accessUntil}
                  onChange={(e) => setNewUser({ ...newUser, accessUntil: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
                {newUser.accessUntil && (
                  <p className="text-xs text-gray-500 mt-1">
                    Доступ до: {new Date(newUser.accessUntil).toLocaleDateString('uk-UA')}
                  </p>
                )}
                {!newUser.accessUntil && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Доступ назавжди
                  </p>
                )}
              </div>

              {/* Тариф */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тариф навчання
                </label>
                <select
                  value={newUser.tariff}
                  onChange={(e) => setNewUser({ ...newUser, tariff: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                >
                  <option value="">Виберіть тариф</option>
                  <option value="Преміум">💎 Преміум (7 модулів)</option>
                  <option value="ВІП">👑 ВІП (9 модулів)</option>
                  <option value="Легенда">⭐ Легенда (10 модулів)</option>
                </select>
                {newUser.tariff && (
                  <p className="text-xs text-purple-600 mt-1">
                    ✓ Обрано: {newUser.tariff}
                  </p>
                )}
              </div>

              {/* Факультет */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Факультет
                </label>
                <select
                  value={newUser.faculty}
                  onChange={(e) => setNewUser({ ...newUser, faculty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                >
                  <option value="">Виберіть факультет</option>
                  {faculties.map(faculty => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Куратор */}
              <div>
                <label htmlFor="curatorId" className="block text-sm font-medium text-gray-700 mb-2">
                  Куратор
                </label>
                <select
                  id="curatorId"
                  value={newUser.curatorId}
                  onChange={(e) => setNewUser({ ...newUser, curatorId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">Без куратора</option>
                  {curators.map((curator) => (
                    <option key={curator.id} value={curator.id}>
                      {curator.name} ({curator.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Адмін */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="w-5 h-5 text-[#2466FF] border-gray-300 rounded focus:ring-[#2466FF]"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
                  Надати права адміністратора
                </label>
              </div>

              {/* Куратор */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isCurator"
                  checked={newUser.isCurator}
                  onChange={(e) => setNewUser({ ...newUser, isCurator: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <label htmlFor="isCurator" className="text-sm font-medium text-gray-700">
                  Надати права куратора
                </label>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={createLoading}
                  className="flex-1 px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Створення...' : 'Створити'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування користувача */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header модалки */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Редагувати користувача</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditUser(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Форма */}
            <div className="p-6 pb-32 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Ім'я та Прізвище */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я та Прізвище <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                  placeholder="Іван Іваненко"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Телефон або Телеграм */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефону або Телеграм
                </label>
                <input
                  type="text"
                  value={editUser.phoneOrTelegram}
                  onChange={(e) => setEditUser({ ...editUser, phoneOrTelegram: e.target.value })}
                  placeholder="+380 XX XXX XX XX або @username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Група */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Група
                </label>
                <input
                  type="text"
                  value={editUser.group}
                  onChange={(e) => setEditUser({ ...editUser, group: e.target.value })}
                  placeholder="Наприклад: 5 потік"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Доступ до дати */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Доступ до дати (залиште пустим для вічного доступу)
                </label>
                <input
                  type="date"
                  value={editUser.accessUntil}
                  onChange={(e) => setEditUser({ ...editUser, accessUntil: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
                {editUser.accessUntil && (
                  <p className="text-xs text-gray-500 mt-1">
                    Доступ до: {new Date(editUser.accessUntil).toLocaleDateString('uk-UA')}
                  </p>
                )}
                {!editUser.accessUntil && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Доступ назавжди
                  </p>
                )}
              </div>

              {/* Тариф */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тариф навчання
                </label>
                <select
                  value={editUser.tariff}
                  onChange={(e) => setEditUser({ ...editUser, tariff: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                >
                  <option value="">Виберіть тариф</option>
                  <option value="Преміум">Преміум (доступ до 7 модулів)</option>
                  <option value="ВІП">ВІП (доступ до 9 модулів)</option>
                  <option value="Легенда">Легенда (доступ до всіх модулів)</option>
                </select>
                {editUser.tariff && (
                  <p className="text-xs text-purple-600 mt-1">
                    💎 {editUser.tariff === 'Преміум' ? '7 модулів' : editUser.tariff === 'ВІП' ? '9 модулів' : '10 модулів (всі)'}
                  </p>
                )}
              </div>

              {/* Факультет */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Факультет
                </label>
                <select
                  value={editUser.faculty}
                  onChange={(e) => setEditUser({ ...editUser, faculty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                >
                  <option value="">Виберіть факультет</option>
                  <option value="Продюсер">Продюсер</option>
                  <option value="Експерт">Експерт</option>
                  <option value="Досвідчений">Досвідчений</option>
                </select>
              </div>

              {/* Куратор */}
              <div>
                <label htmlFor="editCuratorId" className="block text-sm font-medium text-gray-700 mb-2">
                  Куратор
                </label>
                <select
                  id="editCuratorId"
                  value={editUser.curatorId || ''}
                  onChange={(e) => setEditUser({ ...editUser, curatorId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">Без куратора</option>
                  {curators.map((curator) => (
                    <option key={curator.id} value={curator.id}>
                      {curator.name} ({curator.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={createLoading}
                  className="flex-1 px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно нагород */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header модалки */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                Нагороди
              </h2>
              <button
                onClick={() => {
                  setShowAchievementModal(false);
                  setSelectedUserForAchievement(null);
                  setNewAchievement({ title: '', description: '', imageUrl: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Форма додавання нагороди */}
            <div className="p-6 space-y-4 border-b border-gray-200">
              <h3 className="font-bold text-base text-black mb-3">Додати нову нагороду</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва нагороди <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                  placeholder="Наприклад: Перший крок"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опис <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  placeholder="За що отримана нагорода..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL зображення <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newAchievement.imageUrl}
                  onChange={(e) => setNewAchievement({ ...newAchievement, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              <button
                onClick={handleAwardAchievement}
                disabled={achievementLoading}
                className="w-full px-4 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {achievementLoading ? 'Додавання...' : '🏆 Додати нагороду'}
              </button>
            </div>

            {/* Список нагород */}
            <div className="p-6 pb-32">
              <h3 className="font-bold text-base text-black mb-3">
                Отримані нагороди ({userAchievements.length})
              </h3>
              {userAchievements.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Нагороди ще не надано
                </p>
              ) : (
                <div className="space-y-3">
                  {userAchievements.map((achievement) => (
                    <div 
                      key={achievement._id} 
                      className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={achievement.imageUrl} 
                          alt={achievement.title}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/64?text=🏆';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-black mb-1">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(achievement.awardedAt).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveAchievement(achievement._id!)}
                          className="text-red-500 hover:text-red-700 transition-colors self-start"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно призначення куратора */}
      {showCuratorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">
                Призначити куратора
              </h2>
              <button
                onClick={() => {
                  setShowCuratorModal(false);
                  setSelectedUserForCurator(null);
                  setSelectedCuratorId('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 pb-32 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оберіть куратора <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCuratorId}
                  onChange={(e) => setSelectedCuratorId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                >
                  <option value="">Виберіть куратора зі списку</option>
                  {curators.map((curator) => (
                    <option key={curator.id} value={curator.id}>
                      {curator.name} ({curator.email})
                    </option>
                  ))}
                </select>
                {curators.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Спочатку створіть користувачів з правами куратора
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAssignCurator}
                  disabled={!selectedCuratorId}
                  className="flex-1 px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Призначити
                </button>
                <button
                  onClick={() => {
                    setShowCuratorModal(false);
                    setSelectedUserForCurator(null);
                    setSelectedCuratorId('');
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно зміни пароля */}
      {showPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">
                Змінити пароль
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUserForPassword(null);
                  setNewPassword('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Користувач:</span> {selectedUserForPassword.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Новий пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Мінімум 6 символів"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Пароль має містити мінімум 6 символів
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={createLoading || !newPassword}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Збереження...' : '🔑 Змінити пароль'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUserForPassword(null);
                    setNewPassword('');
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
