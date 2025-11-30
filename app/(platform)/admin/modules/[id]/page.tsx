'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Plus, Edit, Trash2, Video, FileText, Link as LinkIcon, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Lesson {
  number: number;
  title: string;
  description: string;
  videoUrl: string;
  homework: string;
  duration: number;
  materials: LessonMaterial[];
}

interface LessonMaterial {
  type: string;
  title: string;
  url: string;
}

interface Module {
  _id: string;
  number: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export default function AdminModuleLessonsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [materialFormData, setMaterialFormData] = useState({
    type: 'link',
    title: '',
    url: '',
  });
  const [formData, setFormData] = useState({
    number: 0,
    title: '',
    description: '',
    videoUrl: '',
    homework: '',
    duration: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadModule();
  }, [moduleId]);

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

  const loadModule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModule(data);
      }
    } catch (error) {
      console.error('Failed to load module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}/lessons`, {
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
          videoUrl: '',
          homework: '',
          duration: 0,
        });
        loadModule();
        alert('Урок створено! ✅');
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка створення уроку');
      }
    } catch (error) {
      console.error('Failed to create lesson:', error);
      alert('Помилка створення уроку');
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}/lessons/${editingLesson.number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditingLesson(null);
        setFormData({
          number: 0,
          title: '',
          description: '',
          videoUrl: '',
          homework: '',
          duration: 0,
        });
        loadModule();
        alert('Урок оновлено! ✅');
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка оновлення уроку');
      }
    } catch (error) {
      console.error('Failed to update lesson:', error);
      alert('Помилка оновлення уроку');
    }
  };

  const handleDeleteLesson = async (lessonNumber: number, lessonTitle: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити урок "${lessonTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}/lessons/${lessonNumber}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadModule();
        alert('Урок видалено! 🗑️');
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Помилка видалення уроку');
    }
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      number: lesson.number,
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      homework: lesson.homework || '',
      duration: lesson.duration || 0,
    });
  };

  const openMaterialsModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowMaterialsModal(true);
    setMaterialFormData({
      type: 'link',
      title: '',
      url: '',
    });
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/admin/modules/${moduleId}/lessons/${selectedLesson.number}/materials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(materialFormData),
        }
      );

      if (response.ok) {
        setMaterialFormData({
          type: 'link',
          title: '',
          url: '',
        });
        loadModule();
        alert('Матеріал додано! ✅');
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка додавання матеріалу');
      }
    } catch (error) {
      console.error('Failed to add material:', error);
      alert('Помилка додавання матеріалу');
    }
  };

  const handleDeleteMaterial = async (lessonNumber: number, materialIndex: number) => {
    if (!confirm('Видалити цей матеріал?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/admin/modules/${moduleId}/lessons/${lessonNumber}/materials/${materialIndex}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        loadModule();
        alert('Матеріал видалено! 🗑️');
      }
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Помилка видалення матеріалу');
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

  if (!module) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] max-w-md mx-auto flex items-center justify-center">
        <p className="text-sm text-gray-500">Модуль не знайдено</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2466FF] to-[#10A3FE] px-4 py-6 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/admin/modules')}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-white">Модуль {module.number}</h1>
            <p className="text-sm text-white/80">{module.title}</p>
          </div>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setFormData({
                number: (module.lessons?.length || 0) + 1,
                title: '',
                description: '',
                videoUrl: '',
                homework: '',
                duration: 0,
              });
            }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <p className="text-xs text-white/80">Всього уроків</p>
          <p className="text-2xl font-bold text-white">{module.lessons?.length || 0}</p>
        </div>
      </div>

      {/* Lessons List */}
      <div className="px-4 mt-4 space-y-3">
        {module.lessons && module.lessons.length > 0 ? (
          module.lessons.map((lesson) => (
            <div key={lesson.number} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#E9F0FF] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#2466FF]">{lesson.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-black mb-1">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-xs text-gray-600 mb-2">{lesson.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {lesson.videoUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <Video className="w-3 h-3" />
                        Відео
                      </span>
                    )}
                    {lesson.homework && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        <FileText className="w-3 h-3" />
                        Домашка
                      </span>
                    )}
                    {lesson.duration > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        {lesson.duration} хв
                      </span>
                    )}
                  </div>
                  {lesson.materials && lesson.materials.length > 0 && (
                    <p className="text-xs text-gray-500">
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      {lesson.materials.length} матеріалів
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(lesson)}
                  className="flex-1 px-3 py-2 bg-[#2466FF] text-white text-xs font-medium rounded-xl hover:bg-[#1557ee] transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Редагувати
                </button>
                <button
                  onClick={() => openMaterialsModal(lesson)}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 text-xs font-medium rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Матеріали
                </button>
                <button
                  onClick={() => handleDeleteLesson(lesson.number, lesson.title)}
                  className="px-3 py-2 bg-red-100 text-red-600 text-xs font-medium rounded-xl hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Уроків ще немає</p>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setFormData({
                  number: 1,
                  title: '',
                  description: '',
                  videoUrl: '',
                  homework: '',
                  duration: 0,
                });
              }}
              className="mt-4 px-4 py-2 bg-[#2466FF] text-white text-sm font-medium rounded-xl hover:bg-[#1557ee] transition-colors"
            >
              Створити перший урок
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingLesson) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">
                {editingLesson ? 'Редагувати урок' : 'Створити урок'}
              </h2>
            </div>

            <form onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер уроку <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  required
                  disabled={!!editingLesson}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва уроку <span className="text-red-500">*</span>
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
                  placeholder="Опис уроку..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL відео</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Домашнє завдання</label>
                <textarea
                  value={formData.homework}
                  onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black resize-none"
                  placeholder="Опис домашнього завдання..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тривалість (хвилини)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                  min="0"
                />
              </div>

              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-[#2466FF] text-white font-medium rounded-xl hover:bg-[#1557ee] transition-colors"
                >
                  {editingLesson ? 'Зберегти зміни' : 'Створити урок'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLesson(null);
                    setFormData({
                      number: 0,
                      title: '',
                      description: '',
                      videoUrl: '',
                      homework: '',
                      duration: 0,
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

      {/* Materials Modal */}
      {showMaterialsModal && selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">
                Матеріали уроку {selectedLesson.number}
              </h2>
              <p className="text-sm text-gray-600">{selectedLesson.title}</p>
            </div>

            <div className="p-6">
              {/* Existing Materials */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Поточні матеріали:</h3>
                {selectedLesson.materials && selectedLesson.materials.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLesson.materials.map((material, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {material.type}
                            </span>
                            <p className="text-sm font-medium text-black">{material.title}</p>
                          </div>
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all"
                          >
                            {material.url}
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteMaterial(selectedLesson.number, index)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Матеріалів ще немає</p>
                )}
              </div>

              {/* Add Material Form */}
              <form onSubmit={handleAddMaterial} className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Додати новий матеріал:</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип матеріалу <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={materialFormData.type}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    required
                  >
                    <option value="link">Посилання</option>
                    <option value="pdf">PDF документ</option>
                    <option value="video">Відео</option>
                    <option value="spreadsheet">Таблиця</option>
                    <option value="document">Документ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Назва матеріалу <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={materialFormData.title}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    placeholder="Наприклад: Шаблон бізнес-плану"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL матеріалу <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={materialFormData.url}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2466FF] text-black"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Додати матеріал
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaterialsModal(false);
                      setSelectedLesson(null);
                      setMaterialFormData({
                        type: 'link',
                        title: '',
                        url: '',
                      });
                    }}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Закрити
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
