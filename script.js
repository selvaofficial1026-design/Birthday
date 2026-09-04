// =========================================================
// BIRTHDAY WEBSITE - INTERACTIVITY ENGINE (100% EXACT REPLICA)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  const CORRECT_PIN = '123456';
  let currentPin = '';

  // -------------------------------------------------------
  // 1. Audio Synthesizer (for Keypad, Chimes & Pops)
  // -------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.15) {
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  function playUnlockChime() {
    try {
      initAudio();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((note, i) => {
        setTimeout(() => {
          playTone(note, 'triangle', 0.35, 0.2);
        }, i * 90);
      });
    } catch(e) {}
  }

  function playEnvelopeChime() {
    try {
      initAudio();
      const notes = [659.25, 880, 1174.66, 1318.51];
      notes.forEach((note, i) => {
        setTimeout(() => {
          playTone(note, 'sine', 0.4, 0.18);
        }, i * 110);
      });
    } catch(e) {}
  }

  // -------------------------------------------------------
  // 1b. Screen 0: Romantic Heart Gateway Transition
  // -------------------------------------------------------
  const gatewayScreen = document.getElementById('gateway-screen');
  const gatewayHeartBtn = document.getElementById('gateway-heart-btn');
  const gatewayEnterBtn = document.getElementById('gateway-enter-btn');
  let isGatewayEntered = false;

  function enterFromGateway(e) {
    if (e) e.stopPropagation();
    if (isGatewayEntered) return;
    isGatewayEntered = true;

    // Play heartbeat + romantic chime sequence
    playHeartbeatAndChime();
    burstHearts(30);

    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);

    if (gatewayScreen) {
      gatewayScreen.style.transition = 'all 0.75s cubic-bezier(0.4, 0, 0.2, 1)';
      gatewayScreen.style.opacity = '0';
      gatewayScreen.style.transform = 'scale(1.08)';

      setTimeout(() => {
        gatewayScreen.classList.remove('active');
        if (lockScreen) {
          lockScreen.classList.add('active');
          lockScreen.style.opacity = '1';
          lockScreen.style.transform = 'scale(1)';
        }
      }, 650);
    }
  }

  function playHeartbeatAndChime() {
    try {
      initAudio();
      // Low heartbeat "thump"
      playTone(95, 'sine', 0.2, 0.3);
      setTimeout(() => playTone(80, 'sine', 0.25, 0.35), 140);
      // Celestial chime chords
      setTimeout(() => playTone(523.25, 'sine', 0.4, 0.15), 250);
      setTimeout(() => playTone(659.25, 'sine', 0.5, 0.15), 350);
      setTimeout(() => playTone(783.99, 'sine', 0.6, 0.18), 450);
      setTimeout(() => playTone(1046.50, 'sine', 0.8, 0.2), 550);
    } catch(e) {}
  }

  if (gatewayHeartBtn) {
    gatewayHeartBtn.addEventListener('click', enterFromGateway);
  }
  if (gatewayScreen) {
    gatewayScreen.addEventListener('click', enterFromGateway);
  }

  // -------------------------------------------------------
  // 2. Passcode Keypad Engine (PIN: 123456)
  // -------------------------------------------------------
  const dots = document.querySelectorAll('.passcode-dot');
  const keypadButtons = document.querySelectorAll('.keypad-btn');
  const dotsBox = document.getElementById('passcode-dots');
  const lockScreen = document.getElementById('lock-screen');
  const mainFlow = document.getElementById('main-flow');
  const mobileFrame = document.getElementById('app-frame');

  keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      playTone(550, 'sine', 0.05, 0.1);

      if (navigator.vibrate) navigator.vibrate(15);

      if (val === 'C') {
        currentPin = '';
        renderDots();
      } else if (val === 'back') {
        currentPin = currentPin.slice(0, -1);
        renderDots();
      } else {
        if (currentPin.length < 6) {
          currentPin += val;
          renderDots();

          if (currentPin.length === 6) {
            validatePin();
          }
        }
      }
    });
  });

  function renderDots() {
    dots.forEach((dot, idx) => {
      if (idx < currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function validatePin() {
    if (currentPin === CORRECT_PIN) {
      playUnlockChime();
      dotsBox.style.filter = 'drop-shadow(0 0 16px #00ff88)';

      setTimeout(() => {
        lockScreen.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        lockScreen.style.opacity = '0';
        lockScreen.style.transform = 'scale(0.92)';

        setTimeout(() => {
          lockScreen.classList.remove('active');
          mainFlow.classList.add('active');
          initAmbientParticles();
          burstHearts(25);
        }, 600);
      }, 350);
    } else {
      dotsBox.classList.add('shake');
      playTone(200, 'sawtooth', 0.2, 0.2);
      if (navigator.vibrate) navigator.vibrate([40, 50, 40]);

      setTimeout(() => {
        dotsBox.classList.remove('shake');
        currentPin = '';
        renderDots();
      }, 500);
    }
  }

  // -------------------------------------------------------
  // 3. Interactive 3D Envelope & Content Gating
  //    (Envelope tap reveals Letter; Subsequent sections stay locked)
  // -------------------------------------------------------
  const envelopeBox = document.getElementById('envelope-box');
  const birthdaySubtext = document.getElementById('birthday-subtext');
  const letterSection = document.getElementById('letter-section');
  let isEnvelopeOpened = false;

  if (envelopeBox) {
    envelopeBox.addEventListener('click', () => {
      if (isEnvelopeOpened) return;
      isEnvelopeOpened = true;

      envelopeBox.classList.add('is-opened');
      birthdaySubtext.classList.add('is-visible');
      playEnvelopeChime();
      burstHearts(25);

      // Reveal Letter section after envelope flap 3D animation finishes
      setTimeout(() => {
        if (letterSection) {
          letterSection.classList.remove('is-hidden');
          letterSection.classList.add('is-visible');

          // Scroll smoothly to the Letter
          letterSection.scrollIntoView({ behavior: 'smooth' });

          // Start crisp typewriter animation after scroll settles
          setTimeout(() => {
            startTypewriter();
          }, 700);
        }
      }, 1200);
    });
  }

  // -------------------------------------------------------
  // 4. Romantic Love Letter: Crisp Character-by-Character Typewriter
  // -------------------------------------------------------
  let isTypewriterRunning = false;

  function startTypewriter() {
    if (isTypewriterRunning) return;
    isTypewriterRunning = true;

    const container = document.getElementById('typewriter-body');
    const cursor = document.getElementById('typing-cursor');
    if (!container) return;
    container.innerHTML = '';

    const letterSections = [
      {
        tag: 'p',
        className: 'letter-body-p',
        text: "From the very moment you walked into my life, every single day turned brighter, warmer, and infinitely more magical. Your gentle smile brings peace to my restless heart, and your laughter is the sweetest melody I could ever listen to."
      },
      {
        tag: 'p',
        className: 'letter-body-p',
        text: "Every memory with you is an answered prayer that I hold close. I promise to stand beside you, hold your hand through every storm, and celebrate all the beautiful milestones of our journey together."
      },
      {
        tag: 'span',
        className: 'callout-wish',
        text: "Happiest Birthday, My Everything! 🎂✨"
      },
      {
        tag: 'p',
        className: 'final-quote',
        text: "In all the universe, across all lifetimes, it will always be you."
      },
      {
        tag: 'span',
        className: 'parchment-signature',
        text: "Forever & Always Yours, ❤️"
      }
    ];

    let secIndex = 0;
    let charIndex = 0;
    let currentElement = null;

    function typeCharacter() {
      if (secIndex >= letterSections.length) {
        if (cursor) {
          cursor.style.display = 'inline-block';
        }
        return;
      }

      const sec = letterSections[secIndex];

      if (!currentElement) {
        currentElement = document.createElement(sec.tag);
        currentElement.className = sec.className;
        container.appendChild(currentElement);
      }

      if (charIndex < sec.text.length) {
        currentElement.textContent += sec.text.charAt(charIndex);
        charIndex++;
        // Natural typewriter cadence (~26ms per character)
        setTimeout(typeCharacter, 26);
      } else {
        // Finished this paragraph / section
        secIndex++;
        charIndex = 0;
        currentElement = null;
        if (secIndex < letterSections.length) {
          setTimeout(typeCharacter, 420); // Romantic pause between lines
        } else {
          // ========================================================
          // ALL LETTER TEXT FINISHED TYPING!
          // NOW REVEAL THE CONTENT BELOW AND POP UP ONE BY ONE
          // ========================================================
          if (cursor) {
            cursor.style.display = 'inline-block';
          }
          setTimeout(() => {
            onLetterTypingComplete();
          }, 1000);
        }
      }
    }

    typeCharacter();
  }

  // -------------------------------------------------------
  // 5. Letter Complete Callback: Reveal Below Content & Pop Up One-by-One
  // -------------------------------------------------------
  function onLetterTypingComplete() {
    const afterLetterContent = document.getElementById('after-letter-content');
    const togethernessStage = document.getElementById('togetherness-stage');
    const clotheslineDeck = document.getElementById('clothesline-deck');

    if (!afterLetterContent) return;
  
    // 1. Reveal content below the letter
    afterLetterContent.classList.remove('is-hidden');
    afterLetterContent.classList.add('is-visible');

    // 2. Initialize radio/cassette observer for subsequent scrolling
    setupCassetteObserver();

    // 3. Smooth scroll down to "Celebrating our Togetherness"
    setTimeout(() => {
      if (togethernessStage) {
        if (mobileFrame) {
          mobileFrame.scrollTo({
            top: togethernessStage.offsetTop,
            behavior: 'smooth'
          });
        }
        togethernessStage.scrollIntoView({ behavior: 'smooth' });

        // 4. Trigger slow 1-by-1 pop up of the 8 photos
        setTimeout(() => {
          if (clotheslineDeck) {
            clotheslineDeck.classList.add('in-view');
            triggerSlowOneByOnePops();
          }
        }, 750);
      }
    }, 600);
  }
  window.revealAfterLetterContent = onLetterTypingComplete;

  // Fallback observer in case user revisits or scrolls manually
  function setupClotheslineObserver() {
    const clotheslineDeck = document.getElementById('clothesline-deck');
    const togethernessStage = document.getElementById('togetherness-stage');

    if (!clotheslineDeck || !togethernessStage) return;

    let hasTriggered = false;

    function runPopSequence() {
      if (hasTriggered) return;
      hasTriggered = true;
      clotheslineDeck.classList.add('in-view');
      triggerSlowOneByOnePops();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runPopSequence();
        }
      });
    }, {
      root: mobileFrame,
      threshold: 0.15
    });

    observer.observe(togethernessStage);
  }

  function triggerSlowOneByOnePops() {
    const cards = document.querySelectorAll('.clothesline-area .polaroid-wrapper');
    cards.forEach((card, i) => {
      setTimeout(() => {
        playTone(550 + (i * 50), 'sine', 0.08, 0.12);
        burstHearts(4);
      }, (800 * i) + 200);
    });
  }

  // -------------------------------------------------------
  // 6. Real Audio Player: "This Song Reminds Me Of You"
  //    (Click to Play Song button toggles song.mp3)
  // -------------------------------------------------------
  const romanticAudio = document.getElementById('romantic-audio');
  const playSongBtn = document.getElementById('play-song-btn');
  const playBtnIcon = document.getElementById('play-btn-icon');
  const playBtnLabel = document.getElementById('play-btn-label');
  const vinylTrigger = document.getElementById('vinyl-trigger');
  const vinylElement = document.getElementById('vinyl-element');
  const trackBarContainer = document.getElementById('track-bar-container');
  const trackFill = document.getElementById('track-fill');
  const currTimeSpan = document.getElementById('curr-time');
  const totalTimeSpan = document.getElementById('total-time');
  const likeBtn = document.getElementById('like-btn');

  let isAudioPlaying = false;

  function toggleAudioPlayback() {
    if (!romanticAudio) return;

    if (romanticAudio.paused) {
      romanticAudio.play().then(() => {
        isAudioPlaying = true;
        updatePlayStateUI(true);
        burstHearts(15);
      }).catch(err => {
        console.log('Audio autoplay blocked or interaction needed:', err);
      });
    } else {
      romanticAudio.pause();
      isAudioPlaying = false;
      updatePlayStateUI(false);
    }
  }

  function updatePlayStateUI(playing) {
    if (playBtnIcon) playBtnIcon.textContent = playing ? '⏸' : '▶';
    if (playBtnLabel) playBtnLabel.textContent = playing ? 'Pause Song' : 'Click to Play Song';
    if (vinylElement) vinylElement.classList.toggle('is-spinning', playing);
  }

  if (playSongBtn) {
    playSongBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudioPlayback();
    });
  }

  if (vinylTrigger) {
    vinylTrigger.addEventListener('click', () => {
      toggleAudioPlayback();
    });
  }

  if (romanticAudio) {
    romanticAudio.addEventListener('timeupdate', () => {
      if (romanticAudio.duration) {
        const pct = (romanticAudio.currentTime / romanticAudio.duration) * 100;
        if (trackFill) trackFill.style.width = `${pct}%`;
        if (currTimeSpan) {
          const m = Math.floor(romanticAudio.currentTime / 60);
          const s = String(Math.floor(romanticAudio.currentTime % 60)).padStart(2, '0');
          currTimeSpan.textContent = `${m}:${s}`;
        }

        // Synchronized Live Karaoke Lyrics
        const lyricLines = document.querySelectorAll('.lyric-line');
        if (lyricLines.length > 0) {
          const curTime = romanticAudio.currentTime;
          let activeIndex = 0;
          lyricLines.forEach((line, idx) => {
            const t = parseFloat(line.getAttribute('data-time') || '0');
            if (curTime >= t) {
              activeIndex = idx;
            }
          });
          lyricLines.forEach((line, idx) => {
            const isActive = (idx === activeIndex);
            if (line.classList.contains('active') !== isActive) {
              line.classList.toggle('active', isActive);
              if (isActive) {
                line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          });
        }
      }
    });

    romanticAudio.addEventListener('loadedmetadata', () => {
      if (totalTimeSpan && romanticAudio.duration) {
        const m = Math.floor(romanticAudio.duration / 60);
        const s = String(Math.floor(romanticAudio.duration % 60)).padStart(2, '0');
        totalTimeSpan.textContent = `${m}:${s}`;
      }
    });

    romanticAudio.addEventListener('ended', () => {
      isAudioPlaying = false;
      updatePlayStateUI(false);
      if (trackFill) trackFill.style.width = '0%';
      if (currTimeSpan) currTimeSpan.textContent = '0:00';
      const lyricLines = document.querySelectorAll('.lyric-line');
      lyricLines.forEach((line, idx) => line.classList.toggle('active', idx === 0));
    });
  }

  // Click on any lyric line to jump directly to that part of the song
  const allLyricLines = document.querySelectorAll('.lyric-line');
  allLyricLines.forEach(line => {
    line.style.cursor = 'pointer';
    line.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = parseFloat(line.getAttribute('data-time') || '0');
      if (romanticAudio) {
        romanticAudio.currentTime = t;
        if (romanticAudio.paused) {
          toggleAudioPlayback();
        }
        burstHearts(8);
      }
    });
  });

  // Seek on progress bar click
  if (trackBarContainer && romanticAudio) {
    trackBarContainer.addEventListener('click', (e) => {
      const rect = trackBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      if (romanticAudio.duration) {
        romanticAudio.currentTime = ratio * romanticAudio.duration;
      }
    });
  }

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      burstHearts(12);
      likeBtn.style.transform = 'scale(1.4)';
      setTimeout(() => likeBtn.style.transform = 'scale(1)', 250);
    });
  }

  // -------------------------------------------------------
  // 7. Vintage Radio / Cassette: Sliding Letter Slip on Scroll
  //    (Ticket "I Love You... As Always ❤️" slides out smoothly)
  // -------------------------------------------------------
  function setupCassetteObserver() {
    const cassetteStage = document.getElementById('cassette-stage');
    if (!cassetteStage) return;

    let hasTriggered = false;

    function triggerSlipSlide() {
      if (hasTriggered) return;
      hasTriggered = true;
      cassetteStage.classList.add('in-view');
      playTone(720, 'triangle', 0.15, 0.1);
      burstHearts(10);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerSlipSlide();
        }
      });
    }, {
      root: mobileFrame,
      threshold: 0.25
    });

    observer.observe(cassetteStage);

    // Scroll fallback
    if (mobileFrame) {
      mobileFrame.addEventListener('scroll', () => {
        if (hasTriggered) return;
        const rect = cassetteStage.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          triggerSlipSlide();
        }
      });
    }
  }

  // -------------------------------------------------------
  // 7b. Interactive 35mm Negative Film Strip Reel (Initially Closed -> Opens on "CLICK HERE")
  // -------------------------------------------------------
  function setupFilmstripToggle() {
    const filmstripWrapper = document.getElementById('filmstrip-wrapper');
    const filmstripBadge = document.getElementById('filmstrip-badge');
    const closedReelPlaceholder = document.getElementById('filmstrip-closed-reel');
    const filmstripTrack = document.getElementById('filmstrip-track');

    if (!filmstripWrapper) return;

    function toggleFilmstrip(e) {
      if (e) e.stopPropagation();
      const willOpen = !filmstripWrapper.classList.contains('is-open');

      if (willOpen) {
        filmstripWrapper.classList.add('is-open');
        // Unrolling sound effect
        playTone(480, 'triangle', 0.06, 0.1);
        setTimeout(() => playTone(640, 'triangle', 0.08, 0.12), 90);
        setTimeout(() => playTone(820, 'sine', 0.15, 0.15), 200);
        burstHearts(14);

        // Nudge horizontal scroll gently after unroll completes
        if (filmstripTrack) {
          setTimeout(() => {
            filmstripTrack.scrollTo({ left: 40, behavior: 'smooth' });
            setTimeout(() => {
              filmstripTrack.scrollTo({ left: 0, behavior: 'smooth' });
            }, 600);
          }, 1100);
        }
      } else {
        filmstripWrapper.classList.remove('is-open');
        playTone(380, 'sine', 0.08, 0.1);
      }
    }

    if (filmstripBadge) {
      filmstripBadge.addEventListener('click', toggleFilmstrip);
      filmstripBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFilmstrip(e);
        }
      });
    }

    if (closedReelPlaceholder) {
      closedReelPlaceholder.addEventListener('click', toggleFilmstrip);
    }
  }
  setupFilmstripToggle();

  // -------------------------------------------------------
  // 8. Lightbox Modal for Full-Resolution Photo Viewing
  // -------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-image');
  const closeModal = document.getElementById('close-modal');

  const allClickableImgs = document.querySelectorAll('.polaroid-frame img, .film-single-frame img, .drift-polaroid img');

  allClickableImgs.forEach(img => {
    img.parentElement.addEventListener('click', (e) => {
      // If inside filmstrip and reel is not yet open, do not trigger lightbox
      const filmParent = img.closest('.filmstrip-wrapper');
      if (filmParent && !filmParent.classList.contains('is-open')) {
        return;
      }
      e.stopPropagation();
      if (!lightboxModal || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxModal.classList.add('active');
      burstHearts(12);
      playTone(850, 'sine', 0.07, 0.12);
    });
  });

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------
  // 9. Ambient Twinkling Stars
  // -------------------------------------------------------
  function initAmbientParticles() {
    const layer = document.getElementById('stars-layer');
    if (!layer) return;

    for (let i = 0; i < 35; i++) {
      const speck = document.createElement('div');
      speck.className = 'star-speck';
      const sz = Math.random() * 3 + 2;
      speck.style.width = `${sz}px`;
      speck.style.height = `${sz}px`;
      speck.style.top = `${Math.random() * 100}%`;
      speck.style.left = `${Math.random() * 100}%`;
      speck.style.animationDelay = `${Math.random() * 4}s`;
      speck.style.animationDuration = `${Math.random() * 3 + 3}s`;
      layer.appendChild(speck);
    }
  }

  // -------------------------------------------------------
  // 10. Floating Hearts Burst Engine
  // -------------------------------------------------------
  function burstHearts(num = 14) {
    for (let i = 0; i < num; i++) {
      const heart = document.createElement('div');
      heart.textContent = '❤️';
      heart.style.position = 'fixed';
      heart.style.left = `${Math.random() * 85 + 8}%`;
      heart.style.bottom = '12%';
      heart.style.fontSize = `${Math.random() * 18 + 14}px`;
      heart.style.zIndex = '999999';
      heart.style.pointerEvents = 'none';
      heart.style.transition = 'all 2.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
      heart.style.opacity = '1';
      heart.style.transform = `translateY(0) scale(1) rotate(${Math.random() * 40 - 20}deg)`;

      document.body.appendChild(heart);

      setTimeout(() => {
        heart.style.transform = `translateY(-${Math.random() * 320 + 200}px) scale(1.6) rotate(${Math.random() * 60 - 30}deg)`;
        heart.style.opacity = '0';
      }, 50);

      setTimeout(() => heart.remove(), 2300);
    }
  }

  // Climax Floating Polaroid Taps & Staggered Pop-In Observer
  const climaxStage = document.getElementById('climax-stage');
  const driftItems = document.querySelectorAll('.drift-polaroid');

  function triggerClimaxPopIn() {
    driftItems.forEach((card, index) => {
      card.classList.add('pop-in');
      setTimeout(() => {
        burstHearts(4);
        playTone(600 + index * 60, 'sine', 0.04, 0.08);
      }, (index + 1) * 250);
    });
  }

  if ('IntersectionObserver' in window && climaxStage) {
    const climaxObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerClimaxPopIn();
          climaxObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    climaxObserver.observe(climaxStage);
  } else {
    // Fallback: Trigger after small delay
    setTimeout(triggerClimaxPopIn, 1200);
  }

  driftItems.forEach(card => {
    card.addEventListener('click', () => {
      burstHearts(14);
      playTone(900, 'sine', 0.08, 0.15);
    });
  });
});
