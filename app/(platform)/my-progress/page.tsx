'use client';

import { useState } from 'react';
import { ChevronDown, MoreHorizontal, X, Plus } from 'lucide-react';
import Image from 'next/image';

export default function MyProgressPage() {
  const [activeTab, setActiveTab] = useState<'rating' | 'rewards'>('rating');

  // Прогрес користувача
  const userProgress = {
    name: 'Александр Петров',
    modulesCompleted: 0,
    totalModules: 10,
    lessonsCompleted: 0,
    totalLessons: 114,
    earnings: 500,
    rank: 145,
  };

  // Топ студентів
  const leaderboard = [
    { rank: 1, name: 'Владимир Степанов', earnings: 10000 },
    { rank: 2, name: 'Мария Морозова', earnings: 9000 },
    { rank: 3, name: 'Максим Антонов', earnings: 8800 },
    { rank: 4, name: 'София Терехова', earnings: 7000 },
    { rank: 145, name: 'Александр Петров', earnings: 500, isCurrentUser: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto">
      {/* Header з градієнтом */}
      <div className="relative bg-gradient-to-br from-[#2466FF] to-[#10A3FE] rounded-b-2xl">
        <div className="relative  pt-14 pb-20">
        {/* Header кнопки */}
        <div className="absolute top-14 left-0 right-0 px-4 flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-[32px]">
            <X className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Закрить</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-md rounded-[32px]">
            <ChevronDown className="w-5 h-5 text-white" />
            <MoreHorizontal className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Заголовок */}
        <div className="px-4 pt-12">
          <h1 className="text-2xl font-bold text-white mb-4">Мій прогрес</h1>
          
          <button className="flex items-center gap-1 px-4 py-2.5 bg-black/20 backdrop-blur-md rounded-[13px]">
            <Plus className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">Додати дохід</span>
          </button>
        </div>
      </div>

      {/* Картка профілю */}
      <div className=" -mt-16">
        <div className="rounded-2xl overflow-hidden shadow-sm">
          {/* Верхня частина з градієнтом */}
          <div className=" p-4">
            <div className="flex gap-3.5">
              {/* Аватар */}
              <div className="w-[123px] h-[164px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative border border-white/50">
                {/* Placeholder для зображення Harry Potter */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A4A4A] to-[#2A2A2A] flex items-center justify-center">
                  <span className="text-6xl">🧙‍♂️</span>
                </div>
              </div>

              {/* Інформація */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2 py-1.5 bg-white rounded-full mb-3.5">
                    <span className="text-xs font-bold text-black leading-[11px]">{userProgress.name}</span>
                  </div>

                  <div className="mb-0">
                    <p className="text-base font-bold text-white mb-2 leading-5">
                      {userProgress.modulesCompleted}/{userProgress.totalModules} модулів пройдено
                    </p>
                    {/* Прогрес бар */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: userProgress.totalModules }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < userProgress.modulesCompleted
                              ? 'bg-white'
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/90 leading-5 mt-3">
                  Ти поки що новачок. Проходь модулі та виконуй завдання уроків щоб стати випускником Академії запусків
                </p>
              </div>
            </div>
          </div>

          {/* Пройдено уроків - біла частина */}
          <div className="bg-white rounded-b-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-1.5 bg-[#F2F2F2] rounded-full">
                <span className="text-xs font-bold text-black leading-[11px]">Пройдено уроків</span>
              </div>
              <span className="text-sm font-bold text-black leading-5">
                {userProgress.lessonsCompleted}/{userProgress.totalLessons}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
      

      {/* Таби */}
      <div className="px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('rating')}
            className={`px-3 py-2 rounded-[20px] text-sm font-medium transition-colors ${
              activeTab === 'rating'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Рейтинг студентів
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-2 rounded-[20px] text-sm font-medium transition-colors ${
              activeTab === 'rewards'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            Мої нагороди
          </button>
        </div>
      </div>

      {/* Лідерборд */}
      <div className="px-4 mt-4">
        <div className="space-y-0">
          {leaderboard.map((user) => (
            <div
              key={`${user.rank}-${user.name}`}
              className={`bg-[#F2F2F2] border-b border-[#E7E7E7] px-0 py-3 ${
                user.isCurrentUser ? 'relative' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Ранк badge */}
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span
                    className={`text-xs font-bold ${
                      user.isCurrentUser ? 'text-[#2466FF]' : 'text-black'
                    }`}
                  >
                    {user.rank}
                  </span>
                </div>

                {/* Ім'я */}
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">{user.name}</p>
                </div>

                {/* Заробіток */}
                <span className="text-sm font-bold text-black">
                  $ {user.earnings.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Мій дохід - внизу з градієнтом */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pt-5 pb-5 bg-gradient-to-t from-[#F2F2F2]/70 to-transparent pointer-events-none max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-[#E7E7E7] p-3 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-1">
            <div className="w-[35px] h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-[#2466FF]">{userProgress.rank}</span>
            </div>
            <div className="px-2 py-1.5 bg-[#E9F0FF] rounded-full">
              <span className="text-xs font-bold text-[#2466FF]">Мій дохід</span>
            </div>
            <div className="flex-1" />
            <span className="text-sm font-bold text-black">$ {userProgress.earnings}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
