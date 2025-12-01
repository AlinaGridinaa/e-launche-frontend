'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Lock, Unlock, Edit, Trash2, Eye, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  isLocked: boolean;
  unlockDate?: Date;
  category?: string;
  lessonsCount: number;
  surveyFormUrl?: string;
  surveyFormTitle?: string;
}

export default function AdminModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    number: 0,
    title: '',
    description: '',
    category: '',
    isLocked: false,
    surveyFormUrl: '',
    surveyFormTitle: '',
  });

  useEffect(() => {
    checkAdminAccess();
    loadModules();
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
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const loadModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          number: 0,
          title: '',
          description: '',
          category: '',
          isLocked: false,
          surveyFormUrl: '',
          surveyFormTitle: '',
        });
        loadModules();
        alert('Модуль створено! ✅');
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка створення модуля');
      }
    } catch (error) {
      console.error('Failed to create module:', error);
      alert('Помилка створення модуля');
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditingModule(null);
        setFormData({
          number: 0,
          title: '',
          description: '',
          category: '',
          isLocked: false,
          surveyFormUrl: '',
          surveyFormTitle: '',
        });
        loadModules();
        alert('Модуль оновлено! ✅');
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка оновлення модуля');
      }
    } catch (error) {
      console.error('Failed to update module:', error);
      alert('Помилка оновлення модуля');
    }
  };

  const handleToggleLock = async (moduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}/toggle-lock`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadModules();
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити модуль "${moduleTitle}"? Це видалить всі уроки в ньому!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadModules();
        alert('Модуль видалено! 🗑️');
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
      alert('Помилка видалення модуля');
    }
  };

  const openEditModal = (module: Module) => {
    setEditingModule(module);
    setFormData({
      number: module.number,
      title: module.title,
      description: module.description,
      category: module.category || '',
      isLocked: module.isLocked,
      surveyFormUrl: module.surveyFormUrl || '',
      surveyFormTitle: module.surveyFormTitle || '',
    });
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
      <div className="bg-gradient-to-br from-[#2466FF] to-[#10A3FE] px-4 py-6 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1 text-center">Управління модулями</h1>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setFormData({
                number: modules.length + 1,
                title: '',
                description: '',
                category: '',
                isLocked: false,
                surveyFormUrl: '',
                surveyFormTitle: '',
              });
            }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <p className="text-xs text-white/80">Всього модулів</p>
          <p className="text-2xl font-bold text-white">{modules.length}</p>
        </div>
      </div>

      {/* Modules List */}
      <div className="px-4 mt-4 space-y-3">
        {modules.map((module) => (
          <div key={module.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-[#E9F0FF] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#2466FF]">{module.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-black mb-1">{module.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                  {module.category && (
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {module.category}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    {module.lessonsCount} уроків
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleLock(module.id)}
                className={`p-2 rounded-lg transition-colors ${
                  module.isLocked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {module.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/modules/${module.id}`)}
                className="flex-1 px-3 py-2 bg-[#2466FF] text-white text-xs font-medium rounded-xl hover:bg-[#1557ee] transition-colors flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Уроки
              </button>
              <button
                onClick={() => openEditModal(module)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Редагувати
              </button>
              <button
                onClick={() => handleDeleteModule(module.id, module.title)}
                className="px-3 py-2 bg-red-100 text-red-600 text-xs font-medium rounded-xl hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingModule) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">
                {editingModule ? 'Редагувати модуль' : 'Створити модуль'}
              </h2>
            </div>

            <form onSubmit={editingModule ? handleUpdateModule : handleCreateModule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер модуля <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва модуля <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Опис</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категорія</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  placeholder="Наприклад: Бізнес, Маркетинг"
                />
              </div>

              {/* Survey Form Fields */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">📋 Анкета після модуля (опціонально)</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Назва анкети</label>
                    <input
                      type="text"
                      value={formData.surveyFormTitle}
                      onChange={(e) => setFormData({ ...formData, surveyFormTitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                      placeholder="Анкета для запитань до модуля"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Посилання на анкету</label>
                    <input
                      type="url"
                      value={formData.surveyFormUrl}
                      onChange={(e) => setFormData({ ...formData, surveyFormUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                      placeholder="https://forms.gle/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Form або інше посилання на анкету
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLocked"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                  className="w-4 h-4 text-[#2466FF] border-gray-300 rounded focus:ring-[#2466FF]"
                />
                <label htmlFor="isLocked" className="text-sm text-gray-700">
                  Модуль заблоковано
                </label>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors"
                >
                  {editingModule ? 'Зберегти зміни' : 'Створити модуль'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingModule(null);
                    setFormData({
                      number: 0,
                      title: '',
                      description: '',
                      category: '',
                      isLocked: false,
                      surveyFormUrl: '',
                      surveyFormTitle: '',
                    });
                  }}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
