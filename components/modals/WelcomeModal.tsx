'use client';

import { useState, useEffect, useRef } from 'react';
import { Confetti, type ConfettiRef } from '../ui/confetti';

interface WelcomeModalProps {
  isOpen: boolean;
  faculty: string;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, faculty, onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);

  const fireSideCannons = () => {
    if (!confettiRef.current) return;
    const duration = 1400; // ms
    const end = Date.now() + duration;
    const colors: string[] = ['#2466FF', '#1557EE', '#E9F0FF'];
    const baseSpread = 55;
    const baseVelocity = 60;
    const baseTicks = 180;

    const frame = () => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;
      const intensityFactor = timeLeft / duration; // taper off
      const count = Math.ceil(8 * (0.5 + intensityFactor));
      // Left cannon
      confettiRef.current?.fire({
        particleCount: count,
        angle: 60,
        origin: { x: 0, y: 0.5 },
        spread: baseSpread,
        startVelocity: baseVelocity,
        ticks: baseTicks,
        colors,
      });
      // Right cannon
      confettiRef.current?.fire({
        particleCount: count,
        angle: 120,
        origin: { x: 1, y: 0.5 },
        spread: baseSpread,
        startVelocity: baseVelocity,
        ticks: baseTicks,
        colors,
      });
      // Occasional center burst for richness
      if (Math.random() > 0.65) {
        confettiRef.current?.fire({
          spread: 90,
          startVelocity: 45,
          particleCount: Math.ceil(14 * intensityFactor),
          ticks: 160,
          colors,
          origin: { x: 0.5, y: 0.4 },
        });
      }
      requestAnimationFrame(frame);
    };
    frame();
  };

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    }
  }, [!isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Confetti layer - full screen, above everything */}
      {showConfetti && (
        <Confetti
          ref={confettiRef}
          manualstart
          className="pointer-events-none fixed inset-0 z-[9999]"
          options={{
            particleCount: 0,
            spread: 90,
            origin: { x: 0.5, y: 0.4 },
            colors: ['#2466FF', '#1557EE', '#E9F0FF'],
          }}
        />
      )}

      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0" 
          onClick={handleClose}
        />

        {/* Modal Content */}
      <div
        className={`relative rounded-3xl max-w-[420px] w-full transform transition-all duration-300 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
        data-welcome-modal
      >
        {/* Card shell */}
        <div className="rounded-3xl border border-[#E7E7E7] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Header (простий, без синього фону і шапки) */}
          <div className="px-6 pt-6 pb-4 bg-white flex justify-center">
            <h1 className="text-[20px] font-bold text-black tracking-tight">Вітаємо в Академії!</h1>
          </div>

          {/* Media */}
          <div className="px-6">
            <div className="relative rounded-2xl overflow-hidden border border-[#E7E7E7] bg-white">
              <video
                src="/images/pop-up.gif.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[160px] object-cover"
                onLoadedData={() => console.log('Video loaded successfully')}
                onError={(e) => {
                  console.error('Failed to load video');
                  const target = e.currentTarget as HTMLVideoElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-[160px] flex items-center justify-center text-6xl bg-gray-50';
                    fallback.innerHTML = '🎉';
                    target.parentElement.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-[14px] text-gray-700 text-center">
              Інститут Хогвортса уважно вивчив вашу анкету студента…
            </p>

            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                {/* Маленька картинка шляпи зліва, трохи повернута */}
                <img
                  src="/images/hat.png"
                  alt="Sorting Hat"
                  className="w-6 h-6 rotate-[-12deg]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="text-[14px] font-medium text-gray-800"> Шляпа Розподілу обрала для вас факультет</p>
              </div>

              

              {/* Кнопка із знаком питання або відкритий факультет */}
              {!revealed ? (
                <button
                  type="button"
                  onClick={() => {
                    setRevealed(true);
                    setShowConfetti(true);
                    // Fire side cannons pattern
                    setTimeout(fireSideCannons, 40);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#2466FF] text-white text-[15px] font-semibold shadow-sm hover:bg-[#1557EE] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2466FF]/30 transition-all"
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-white">?</span>
                  Дізнатись факультет
                </button>
              ) : (
                <div className="mt-3 inline-flex items-center justify-center mx-auto gap-2 px-6 py-2.5 rounded-2xl bg-[#E9F0FF] shadow-sm">
                  <span className="text-[18px] font-bold text-[#2466FF] tracking-tight">{faculty}</span>
                </div>
              )}
              {/* Пояснення під знаком питання */}
              {!revealed && (
                <p className="mt-2 text-[12px] text-gray-500 leading-relaxed">
                  Натисніть кнопку нижче, щоб відкрити свій факультет.
                </p>
              )}
            </div>

            {revealed && (
              <button
                onClick={handleClose}
                className="mt-4 w-full py-3.5 rounded-2xl bg-[#2466FF] text-white text-[16px] font-semibold shadow-md hover:bg-[#1557EE] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2466FF]/30 transition-all"
              >
                Почати навчання
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
