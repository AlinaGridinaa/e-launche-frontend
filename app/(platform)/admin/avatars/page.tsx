'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image, Save, Trash2, Plus, RefreshCw } from 'lucide-react';
import { adminService } from '@/lib/services/admin.service';

interface AvatarLevel {
  _id: string;
  level: number;
  imageUrl: string;
  description?: string;
}

export default function AvatarsManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState<AvatarLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ imageUrl: '', description: '' });
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    loadAvatars();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isAdmin) {
        router.push('/home');
        return;
      }
    } catch (error) {
      console.error('Invalid token:', error);
      router.push('/login');
    }
  };

  const loadAvatars = async () => {
    try {
      const data = await adminService.getAllAvatarLevels();
      setAvatars(data);
    } catch (error) {
      console.error('Failed to load avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('Ви впевнені? Це створить 11 дефолтних аватарів (рівні 0-10).')) {
      return;
    }

    setInitializing(true);
    try {
      await adminService.initializeDefaultAvatars();
      await loadAvatars();
      alert('Дефолтні аватари успішно ініціалізовані!');
    } catch (error: any) {
      console.error('Failed to initialize avatars:', error);
      alert(error.response?.data?.message || 'Помилка при ініціалізації');
    } finally {
      setInitializing(false);
    }
  };

  const handleEdit = (avatar: AvatarLevel) => {
    setEditingLevel(avatar.level);
    setEditForm({
      imageUrl: avatar.imageUrl,
      description: avatar.description || '',
    });
  };

  const handleSave = async (level: number) => {
    try {
      await adminService.setAvatarLevel(
        level,
        editForm.imageUrl,
        editForm.description || undefined
      );
      await loadAvatars();
      setEditingLevel(null);
      setEditForm({ imageUrl: '', description: '' });
    } catch (error) {
      console.error('Failed to save avatar:', error);
      alert('Помилка при збереженні аватара');
    }
  };

  const handleDelete = async (level: number) => {
    if (!confirm(`Видалити аватар для рівня ${level}?`)) {
      return;
    }

    try {
      await adminService.deleteAvatarLevel(level);
      await loadAvatars();
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      alert('Помилка при видаленні аватара');
    }
  };

  const handleAddNew = () => {
    const maxLevel = avatars.length > 0 ? Math.max(...avatars.map(a => a.level)) : -1;
    const newLevel = maxLevel + 1;
    
    setEditingLevel(newLevel);
    setEditForm({
      imageUrl: `/avatars/level-${newLevel}.png`,
      description: `Аватар після ${newLevel} модуля`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2466FF] to-[#1557EE] px-4 pt-14 pb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Керування аватарами</h1>
            <p className="text-sm text-white/80">Налаштування аватарів за рівнями</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {/* Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleInitialize}
              disabled={initializing || avatars.length > 0}
              className="flex-1 bg-[#2466FF] text-white px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${initializing ? 'animate-spin' : ''}`} />
              Ініціалізувати дефолтні
            </button>
            <button
              onClick={handleAddNew}
              className="flex-1 bg-[#10B981] text-white px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Додати новий
            </button>
          </div>
          {avatars.length > 0 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ініціалізація доступна лише коли немає жодного аватара
            </p>
          )}
        </div>

        {/* Avatars List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black px-1">
            Аватари ({avatars.length})
          </h2>

          {avatars.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">Аватари ще не налаштовані</p>
              <p className="text-xs text-gray-400">
                Натисніть "Ініціалізувати дефолтні" для створення початкових аватарів
              </p>
            </div>
          )}

          {avatars.map((avatar) => (
            <div key={avatar._id} className="bg-white rounded-2xl p-4 shadow-sm">
              {editingLevel === avatar.level ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-black">
                      Редагування рівня {avatar.level}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingLevel(null);
                        setEditForm({ imageUrl: '', description: '' });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL зображення
                    </label>
                    <input
                      type="text"
                      value={editForm.imageUrl}
                      onChange={(e) =>
                        setEditForm({ ...editForm, imageUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2466FF] focus:border-transparent"
                      placeholder="/avatars/level-0.png"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Опис (необов'язково)
                    </label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2466FF] focus:border-transparent"
                      placeholder="Початковий аватар"
                    />
                  </div>

                  <button
                    onClick={() => handleSave(avatar.level)}
                    className="w-full bg-[#10B981] text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Зберегти
                  </button>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={avatar.imageUrl}
                          alt={`Level ${avatar.level}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-black">
                          Рівень {avatar.level}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {avatar.description || 'Без опису'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(avatar)}
                        className="text-[#2466FF] hover:text-[#1557EE] text-xs font-medium"
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() => handleDelete(avatar.level)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 font-mono break-all">
                      {avatar.imageUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add New Form */}
          {editingLevel !== null && !avatars.find(a => a.level === editingLevel) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#2466FF]">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-black">
                    Новий рівень {editingLevel}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingLevel(null);
                      setEditForm({ imageUrl: '', description: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL зображення
                  </label>
                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, imageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2466FF] focus:border-transparent"
                    placeholder="/avatars/level-0.png"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Опис (необов'язково)
                  </label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2466FF] focus:border-transparent"
                    placeholder="Початковий аватар"
                  />
                </div>

                <button
                  onClick={() => handleSave(editingLevel)}
                  className="w-full bg-[#10B981] text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Створити
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
