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
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showCuratorModal, setShowCuratorModal] = useState(false);
  const [selectedUserForAchievement, setSelectedUserForAchievement] = useState<string | null>(null);
  const [selectedUserForCurator, setSelectedUserForCurator] = useState<string | null>(null);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [curators, setCurators] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedCuratorId, setSelectedCuratorId] = useState<string>('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    faculty: '',
    isAdmin: false,
    isCurator: false,
  });
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [achievementLoading, setAchievementLoading] = useState(false);

  const faculties = ['Продюсер', 'Експерт', 'Досвідчений'];

  useEffect(() => {
    loadUsers();
    loadCurators();
  }, []);

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
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      alert('Заповніть всі обов\'язкові поля');
      return;
    }

    if (newUser.password.length < 6) {
      alert('Пароль має бути не менше 6 символів');
      return;
    }

    try {
      setCreateLoading(true);
      await adminService.createUser(newUser);
      alert('Користувача успішно створено! ✅');
      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        faculty: '',
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
          onClick={() => setShowCreateModal(true)}
          className="p-2 bg-[#2466FF] text-white rounded-full hover:bg-[#1557ee] transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Список користувачів */}
      <div className="p-4 space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-black">
                    {user.firstName} {user.lastName}
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
                {user.phone && (
                  <p className="text-sm text-gray-500">{user.phone}</p>
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
        ))}
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
            <div className="p-6 space-y-4">
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

              {/* Ім'я */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Іван"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Прізвище */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Прізвище <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Іваненко"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
              </div>

              {/* Телефон */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+380 XX XXX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                />
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
            <div className="p-6">
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

            <div className="p-6 space-y-4">
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
    </div>
  );
}
