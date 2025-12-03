'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';


export function CommunityRules() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      <div 
        className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer "
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Image 
              src="/icons/cubok.svg" 
              alt="Trophy" 
              width={64} 
              height={64}
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center">
            <h2 className="text-xl font-bold text-gray-900">
              НАШІ ЦІННОСТІ<br />ТА ПРАВИЛА СПІЛЬНОТИ
            </h2>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl pb-26 max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                НАШІ ЦІННОСТІ ТА ПРАВИЛА СПІЛЬНОТИ
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Документи */}
          <div className="space-y-3">
            <a
              href="https://docs.google.com/document/d/1YtOA1lRkIsYg1ALPV0ZwnPtFlZKqtSKicQ6ZSjPTGs4/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="font-semibold text-[#2466FF]">ПУБЛІЧНИЙ ДОГОВІР (ОФЕРТА)</span>
              <ExternalLink className="w-5 h-5 text-[#2466FF]" />
            </a>

            <a
              href="https://docs.google.com/document/d/15kaex577rJOUv3ghuAZpl18_ipPSOXKLmuv2aMzJzIc/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="font-semibold text-[#2466FF]">ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ</span>
              <ExternalLink className="w-5 h-5 text-[#2466FF]" />
            </a>
          </div>

          {/* Правила чату з куратором */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('curator')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-900">ПРАВИЛА ЧАТУ З КУРАТОРОМ</span>
              {expandedSection === 'curator' ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {expandedSection === 'curator' && (
              <div className="p-4 text-sm text-gray-700 leading-relaxed space-y-2">
                <p className="font-semibold">Спілкування з куратором:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Всі питання ставте у чат, не в особисті повідомлення</li>
                  <li>Спілкуйтеся лише текстовими повідомленнями</li>
                  <li>Не дзвоніть куратору</li>
                  <li>Не відволікайте питаннями поза навчанням або в неробочий час</li>
                </ul>
              </div>
            )}
          </div>

          {/* Правила загального чату */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('general')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-900">ПРАВИЛА ЗАГАЛЬНОГО ЧАТУ 👇👇👇</span>
              {expandedSection === 'general' ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {expandedSection === 'general' && (
              <div className="p-4 text-sm text-gray-700 leading-relaxed space-y-4">
                <p className="font-semibold">Щоб у чаті панувала комфортна, продуктивна та дружня атмосфера, тут МОЖНА:</p>
                
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Чат використовуватись лише для спілкування по темі навчання. Будь-які повідомлення, що не відносяться до навчального матеріалу будуть видалятись, а їх автори видалені з чату без права повернення</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Знайомитися та допомагати один одному у навчанні</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Ми з повагою ставимося один до одного</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Ми даємо чесний зворотній зв'язок один одному</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Не роздаємо поради та рекомендації іншим учасникам без їхнього запиту</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Ділитися соцмережами лише в рамках знайомства</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Ставити запитання кураторам — усі питання тільки в чат, не в приватні повідомлення</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Публікувати свої домашні завдання прямо в чаті у відповідному розділі</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Спілкуватися лише текстовими повідомленнями, щоб уникати шуму та хаосу</span>
                  </li>
                </ul>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="font-semibold text-red-600 mb-3">У чаті СУВОРО ЗАБОРОНЕНО:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Будь-які прямі продажі своїх продуктів чи послуг</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Пересилати або копіювати будь-які матеріали курсу</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Передавати будь-який контент чату третім особам — це конфіденційна інформація</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Ображати, знецінювати, погрожувати, переслідувати, цькувати, проявляти відвертий хейт, тощо</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Обговорення політики та релігії</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Створення активностей на кшталт «постав +, щоб отримати…»</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Публікація зовнішніх посилань без прямої користі</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Спам будь-якого виду</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Писати іншим учасникам у приватні повідомлення з пропозиціями, запрошеннями або збиранням даних</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Дзвонити куратору або учасникам — спілкування тільки текстом</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Записувати голосові повідомлення — спілкування тільки текстом</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Переносити особисте життя, драми, конфлікти чи розбір стосунків у навчальний простір</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Відволікати кураторів питаннями поза навчанням або в неробочий час</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Поширювати матеріали інших авторів</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Рекламувати свої послуги, відкрито продавати</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Рекламувати інших експертів та їх послуги</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>Спамити учасників чату та надсилати їм розсилки у особисті повідомлення!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">☑️</span>
                      <span>Писати негативні відгуки по навчанню та збирати людей для обговорення якості навчання. Для цього передбачена ел.пошта kai@e-launch.net</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="font-bold text-red-600 mb-2">НАГОЛОШУЮ ❗️❗️❗️</p>
                  <p className="text-sm">Навіть одноразове порушення може стати підставою для обмеження доступу до чату, матеріалів або припинення навчання без повернення коштів</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="font-bold text-[#2466FF] mb-2">ПІДТРИМКА</p>
                  <p className="text-sm">Питання з доступом, оплатами, входом у кабінет:</p>
                  <p className="text-sm font-semibold mt-1">👉 @dimashevchuck_support</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
