/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart, Sparkles, Music, Volume2, VolumeX, ChevronRight } from 'lucide-react';

// --- Constants & Types ---
const CORRECT_LOGIN_PASSWORD = "ANU";
const GIFT_CONFIGS = [
  {
    id: 1,
    password: "ANANAS",
    hint: "Fruit that starts with the same letters as your name.",
    message: "I know you do not enjoy celebrating birthdays very much. But this was a very small thing I could do, just to remind you that your existence quietly makes the world a much better."
  },
  {
    id: 2,
    password: "646",
    hint: "Your date of birth. Date/month/last digit of year",
    message: "Some gifts cannot be wrapped in paper. So this one was wrapped in a little piece of the internet. This may not be wrapped in ribbon or paper, but it still carries a wish meant only for you."
  },
  {
    id: 3,
    password: "", // Accept any
    hint: "Anything you feel like typing.",
    message: "A birthday isn’t a reminder that another year passed. It’s a quiet reminder that a new year of possibilities just opened for you."
  }
];

const AUDIO_URL = "https://cdn.pixabay.com/audio/2022/01/21/audio_317429a510.mp3";

type Stage = 'login' | 'opening' | 'intro' | 'main' | 'gift_unlock' | 'confirmation' | 'celebration';

// --- Components ---

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      type: 'sparkle' | 'leaf';
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.type = Math.random() > 0.7 ? 'leaf' : 'sparkle';
        this.size = this.type === 'leaf' ? Math.random() * 8 + 4 : Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.6 + 0.2; // Move downwards
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = this.type === 'leaf' ? `rgba(17, 100, 102, ${this.opacity})` : `rgba(209, 232, 226, ${this.opacity})`;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.x += this.speedX + Math.sin(this.y / 50) * 0.5; // Swaying motion
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        }
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        
        if (this.type === 'leaf') {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(this.size, this.size, 0, this.size * 2);
          ctx.quadraticCurveTo(-this.size, this.size, 0, 0);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default function App() {
  const [stage, setStage] = useState<Stage>('login');
  const [password, setPassword] = useState(['', '', '']);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [giftPassword, setGiftPassword] = useState('');
  const [showSurpriseInit, setShowSurpriseInit] = useState(false);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(AUDIO_URL);
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoginPasswordChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newPassword = [...password];
    newPassword[index] = value.toUpperCase();
    setPassword(newPassword);

    // Auto focus next
    if (value && index < 2) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Check password
    if (newPassword.join('') === CORRECT_LOGIN_PASSWORD) {
      handleCorrectLogin();
    }
  };

  const handleCorrectLogin = () => {
    setStage('opening');
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
      setStage('intro');
    }, 4000); // Duration of opening animation
  };

  const handleGiftClick = (id: number) => {
    setSelectedGift(id);
    setShowSurpriseInit(true);
    setTimeout(() => {
      setShowSurpriseInit(false);
      setStage('gift_unlock');
    }, 2000);
  };

  const handleGiftUnlock = () => {
    const config = GIFT_CONFIGS.find(g => g.id === selectedGift);
    if (!config) return;

    if (selectedGift === 3 || giftPassword.toUpperCase() === config.password) {
      setStage('confirmation');
      setGiftPassword('');
    } else {
      // Shake effect or something?
      alert("Incorrect password. Try again!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#051111] text-[#d1e8e2] font-sans selection:bg-[#116466] selection:text-white overflow-hidden relative">
      <ParticleCanvas />
      
      {/* Background Audio Control */}
      {stage !== 'login' && stage !== 'opening' && (
        <button 
          onClick={toggleMute}
          className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* STAGE 1: LOGIN */}
        {stage === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6"
          >
            {/* Gift Box */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-48 h-48 mb-12"
            >
              {/* Box Body */}
              <div className="absolute inset-0 bg-[#e63946] rounded-lg shadow-2xl border-b-4 border-black/20"></div>
              {/* Ribbon Vertical */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-[#ffb703] shadow-inner"></div>
              {/* Ribbon Horizontal */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8 bg-[#ffb703] shadow-inner"></div>
              {/* Bow */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-10 h-10 bg-[#ffb703] rounded-full rotate-45 border-2 border-black/10"></div>
                <div className="w-10 h-10 bg-[#ffb703] rounded-full -rotate-45 border-2 border-black/10"></div>
              </div>
              {/* Sparkles */}
              <Sparkles className="absolute -top-8 -right-8 text-[#ffb703] animate-pulse" size={32} />
            </motion.div>

            <div className="flex flex-col items-center gap-6 max-w-xs w-full">
              <div className="flex gap-4">
                {[0, 1, 2].map(i => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="text"
                    maxLength={1}
                    value={password[i]}
                    onChange={(e) => handleLoginPasswordChange(i, e.target.value)}
                    className="w-16 h-20 bg-white/5 border border-white/10 rounded-xl text-center text-3xl font-bold focus:outline-none focus:border-[#116466] focus:bg-white/10 transition-all backdrop-blur-sm"
                  />
                ))}
              </div>
              <p className="text-sm text-white/40 italic">Hint: It could be your nickname.</p>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: OPENING ANIMATION */}
        {stage === 'opening' && (
          <motion.div 
            key="opening"
            className="relative z-10 flex items-center justify-center min-h-screen overflow-hidden"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.1, 0.9, 1.2, 50],
                rotate: [0, 5, -5, 10, 0]
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="relative w-48 h-48"
            >
              <motion.div 
                animate={{ y: [0, -100] }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute inset-0 bg-[#e63946] rounded-lg z-20"
              >
                {/* Lid */}
                <motion.div 
                  animate={{ rotateX: -110, y: -20 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="absolute inset-0 bg-[#e63946] rounded-t-lg border-b-4 border-black/20 origin-top"
                ></motion.div>
                {/* Light from inside */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, scale: [1, 2] }}
                  transition={{ delay: 2.2, duration: 1.5 }}
                  className="absolute inset-0 bg-blue-400 blur-3xl rounded-full z-10"
                ></motion.div>
              </motion.div>
            </motion.div>
            
            {/* Confetti Burst */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="fixed inset-0 pointer-events-none"
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: "50vw", y: "50vh", scale: 0 }}
                  animate={{ 
                    x: `${Math.random() * 100}vw`, 
                    y: `${Math.random() * 100}vh`,
                    scale: Math.random() * 1,
                    rotate: Math.random() * 360
                  }}
                  transition={{ delay: 2.5, duration: 2, ease: "easeOut" }}
                  className="absolute w-2 h-2 bg-[#ffb703] rounded-sm"
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 3: INTRO MESSAGE */}
        {stage === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-[#0b2524] to-[#051111]"
          >
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-6xl md:text-8xl font-serif font-bold mb-8 text-[#ffb703] drop-shadow-lg"
            >
              Happy Birthday
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1.5 }}
              className="max-w-2xl text-xl md:text-2xl leading-relaxed text-[#d1e8e2]/80 font-light"
            >
              Congratulations on completing twenty years of life. That’s twenty years of stories, lessons, and moments that slowly shaped the person you are today.
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 6 }}
              onClick={() => setStage('main')}
              className="mt-12 px-8 py-3 rounded-full border border-[#116466] text-[#116466] hover:bg-[#116466] hover:text-white transition-all flex items-center gap-2 group"
            >
              Continue <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}

        {/* STAGE 4: MAIN INTERFACE */}
        {stage === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 bg-[#f0f7f4]/5"
          >
            <h2 className="text-3xl font-serif mb-16 text-[#d1e8e2]/60">Pick a surprise...</h2>
            
            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              {[1, 2, 3].map(id => (
                <motion.div
                  key={id}
                  whileHover={{ scale: 1.1, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGiftClick(id)}
                  className="cursor-pointer group relative"
                >
                  <div className="absolute -inset-4 bg-[#116466]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-32 h-32 md:w-40 md:h-40 bg-[#e63946] rounded-xl shadow-xl flex items-center justify-center overflow-hidden">
                    <div className="absolute w-6 h-full bg-[#ffb703]"></div>
                    <div className="absolute h-6 w-full bg-[#ffb703]"></div>
                    <Gift size={48} className="text-white/20 z-10" />
                    <div className="absolute top-2 right-2 text-white/40 font-serif text-xl">{id}</div>
                  </div>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-6 text-center text-[#d1e8e2]/40 font-light"
                  >
                    Gift {id}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {showSurpriseInit && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-4 inline-block"
                  >
                    <Sparkles size={48} className="text-[#ffb703]" />
                  </motion.div>
                  <p className="text-2xl font-serif italic">Initializing surprise...</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STAGE 5: GIFT UNLOCK */}
        {stage === 'gift_unlock' && (
          <motion.div 
            key="unlock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-serif mb-8 text-center">Unlock Gift {selectedGift}</h3>
              <p className="text-[#d1e8e2]/60 mb-6 text-center italic">"{GIFT_CONFIGS.find(g => g.id === selectedGift)?.hint}"</p>
              
              <input
                autoFocus
                type="text"
                value={giftPassword}
                onChange={(e) => setGiftPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGiftUnlock()}
                placeholder="Enter password..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-center text-xl focus:outline-none focus:border-[#116466] transition-all mb-8"
              />
              
              <button
                onClick={handleGiftUnlock}
                className="w-full py-4 rounded-xl bg-[#116466] text-white font-bold hover:bg-[#116466]/80 transition-all shadow-lg"
              >
                Reveal Surprise
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 6: CONFIRMATION */}
        {stage === 'confirmation' && (
          <motion.div 
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-12 max-w-2xl">Are you ready for the best surprise ever?</h2>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              {["Yes, absolutely", "Yes, definitely", "Yes, why not"].map((text, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStage('celebration')}
                  className="py-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#116466] hover:border-[#116466] transition-all"
                >
                  {text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STAGE 7: CELEBRATION MOMENT */}
        {stage === 'celebration' && (
          <motion.div 
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center"
          >
            {/* Celebration Particles */}
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: "110vh", x: `${Math.random() * 100}vw` }}
                  animate={{ 
                    y: "-10vh",
                    rotate: 360,
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 4, 
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                  className="absolute"
                >
                  <Sparkles className="text-[#ffb703]" size={16 + Math.random() * 24} />
                </motion.div>
              ))}
            </div>

            <div className="max-w-3xl relative z-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-12 inline-block p-6 rounded-full bg-[#116466]/20"
              >
                <Heart size={64} className="text-[#e63946] fill-[#e63946]" />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-8"
              >
                <p className="text-2xl md:text-3xl font-serif italic leading-relaxed text-[#d1e8e2]">
                  {GIFT_CONFIGS.find(g => g.id === selectedGift)?.message}
                </p>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                  className="pt-12 border-t border-white/10"
                >
                  <p className="text-xl md:text-2xl font-light text-[#d1e8e2]/60 leading-relaxed">
                    May Allah keep your heart peaceful, protect you from things that hurt you, and quietly fill your life with goodness.
                  </p>
                </motion.div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 8 }}
                onClick={() => {
                  setStage('main');
                  setSelectedGift(null);
                }}
                className="mt-16 text-sm uppercase tracking-widest text-[#116466] hover:text-[#ffb703] transition-colors"
              >
                Back to gifts
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-0"></div>
    </div>
  );
}
