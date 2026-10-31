const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const flyingWizard = document.querySelector(".flying-wizard");
const pageProgress = document.querySelector(".page-progress span");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const chapterSections = [...document.querySelectorAll("main > section:not(.secret-chapter):not(.linkedin-section)")];
const chapterCount = document.querySelector(".chapter-hud-count");
const chapterName = document.querySelector(".chapter-hud-name");
const chapterTrack = document.querySelector(".chapter-hud-track > span");
const chapterNext = document.querySelector(".chapter-next");
const magicCursor = document.querySelector(".magic-cursor");
const pointerRoot = document.documentElement;
const chapterNames = ["The arrival", "The story", "Field notes", "Creations", "Spellbook", "Foundations", "Field guide", "Owl post"];
let activeChapter = 0;

const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themeRoot = document.documentElement;
const storedTheme = (() => {
  try { return window.localStorage.getItem("ayushman-portfolio-theme"); }
  catch { return null; }
})();
const initialTheme = storedTheme === "light" || storedTheme === "dark"
  ? storedTheme
  : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

const setTheme = (theme, persist = false) => {
  themeRoot.dataset.theme = theme;
  if (themeColorMeta) themeColorMeta.setAttribute("content", theme === "light" ? "#f4f0e6" : "#11130f");
  if (themeToggle) {
    const isLight = theme === "light";
    themeToggle.textContent = isLight ? "☾" : "☼";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark color theme" : "Switch to light color theme");
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.title = isLight ? "Switch to dark theme" : "Switch to light theme";
  }
  if (persist) {
    try { window.localStorage.setItem("ayushman-portfolio-theme", theme); }
    catch { /* Theme remains usable for this page view when storage is unavailable. */ }
  }
};

setTheme(initialTheme);
themeToggle?.addEventListener("click", () => {
  setTheme(themeRoot.dataset.theme === "light" ? "dark" : "light", true);
});

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    }
  });
}

if (pageProgress) {
  const updateScrollProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
    pageProgress.style.transform = `scaleX(${progress})`;
    if (chapterTrack) chapterTrack.style.transform = `scaleX(${progress})`;
  };

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();
}

if (chapterSections.length) {
  const setChapter = (index) => {
    activeChapter = Math.max(0, Math.min(index, chapterSections.length - 1));
    if (chapterCount) chapterCount.innerHTML = `<strong>${String(activeChapter + 1).padStart(2, "0")}</strong><i> / ${String(chapterSections.length).padStart(2, "0")}</i>`;
    if (chapterName) chapterName.textContent = chapterNames[activeChapter] || chapterSections[activeChapter].id;
  };

  const chapterObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setChapter(chapterSections.indexOf(visible.target));
  }, { threshold: [0.05, 0.2, 0.45, 0.7], rootMargin: "-12% 0px -48% 0px" });
  chapterSections.forEach((section) => chapterObserver.observe(section));
  setChapter(0);

  chapterNext?.addEventListener("click", () => {
    chapterSections[(activeChapter + 1) % chapterSections.length].scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
}

if (magicCursor && !window.matchMedia("(pointer: coarse)").matches) {
  window.addEventListener("pointermove", (event) => {
    pointerRoot.style.setProperty("--pointer-x", `${event.clientX}px`);
    pointerRoot.style.setProperty("--pointer-y", `${event.clientY}px`);
    pointerRoot.classList.add("wand-pointer-active");
    if (!reducedMotion.matches) magicCursor.classList.add("is-visible");

    const hero = document.querySelector(".hero");
    if (!reducedMotion.matches && hero && event.clientY < window.innerHeight) {
      hero.style.setProperty("--parallax-x", `${((event.clientX / window.innerWidth) - 0.5) * 10}px`);
      hero.style.setProperty("--parallax-y", `${((event.clientY / window.innerHeight) - 0.5) * 8}px`);
      hero.classList.add("has-pointer");
    }
  }, { passive: true });
  pointerRoot.addEventListener("pointerleave", () => {
    pointerRoot.classList.remove("wand-pointer-active");
    magicCursor.classList.remove("is-visible");
  });

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--card-tilt-x", `${x * 2.4}deg`);
      card.style.setProperty("--card-tilt-y", `${y * -2.4}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--card-tilt-x", "0deg");
      card.style.setProperty("--card-tilt-y", "0deg");
    });
  });
}

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -35px 0px" }
  );
  const revealTargets = document.querySelectorAll(
    ".section-label, .display-title, .project-card, .linkedin-post-card, .timeline-item, .skill-card, .education-item, .award, .cert-cloud > span, .contact-card"
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal-ready");
    revealObserver.observe(target);
  });
}

if (flyingWizard) {
  const heroSection = document.querySelector(".hero");
  let previousY = 0;
  let previousTime = 0;
  let animationFrame = 0;

  const fly = (timestamp) => {
    if (document.hidden || reducedMotion.matches) {
      animationFrame = 0;
      return;
    }

    const cycle = ((timestamp + window.scrollY * 4.5) % 20000) / 20000;
    const progress = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
    const width = flyingWizard.getBoundingClientRect().width;
    const startX = Math.max(24, window.innerWidth * (window.innerWidth < 760 ? 0.2 : 0.39)) - width;
    const x = startX + progress * (window.innerWidth - startX + width * 0.35);
    const y = window.innerHeight * (0.06 + (Math.sin(timestamp / 2300 + window.scrollY / 410) + 1) * 0.09);
    const delta = timestamp - previousTime;
    const verticalSpeed = delta > 0 ? (y - previousY) / delta : 0;

    flyingWizard.style.setProperty("--flight-x", `${x}px`);
    flyingWizard.style.setProperty("--flight-y", `${y}px`);
    flyingWizard.style.setProperty("--flight-direction", cycle < 0.5 ? "1" : "-1");
    flyingWizard.style.setProperty("--flight-tilt", `${Math.max(-8, Math.min(8, verticalSpeed * 160))}deg`);
    const stillInOpeningScene = !heroSection || window.scrollY < heroSection.offsetHeight * 0.85;
    flyingWizard.classList.toggle("is-visible", stillInOpeningScene);

    previousY = y;
    previousTime = timestamp;
    animationFrame = window.requestAnimationFrame(fly);
  };

  const startFlight = () => {
    if (!reducedMotion.matches && !document.hidden && !animationFrame) {
      animationFrame = window.requestAnimationFrame(fly);
    }
  };

  const stopFlight = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    flyingWizard.classList.toggle("is-visible", reducedMotion.matches);
  };

  const setRestingFlightPosition = () => {
    flyingWizard.style.setProperty("--flight-x", "68vw");
    flyingWizard.style.setProperty("--flight-y", "20vh");
    flyingWizard.classList.add("is-visible");
  };

  window.addEventListener("scroll", () => {
    if (reducedMotion.matches && heroSection) {
      flyingWizard.classList.toggle("is-visible", window.scrollY < heroSection.offsetHeight * 0.85);
    }
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopFlight();
    } else {
      previousTime = 0;
      startFlight();
    }
  });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      stopFlight();
      setRestingFlightPosition();
    } else {
      previousTime = 0;
      startFlight();
    }
  });

  if (reducedMotion.matches) {
    setRestingFlightPosition();
  } else {
    startFlight();
  }
}

/* Additional wand magic, adapted to this portfolio's existing section classes. */
(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const body = document.body;

  // Duplicate the original sequence once so it can wrap without a visible reset.
  const postTrack = document.querySelector(".linkedin-post-track");
  const carouselToggle = document.querySelector(".linkedin-carousel-toggle");
  if (postTrack) {
    const originalPosts = [...postTrack.children];
    if (!reducedMotion.matches && originalPosts.length > 1) {
      originalPosts.forEach((post) => {
        const duplicate = post.cloneNode(true);
        duplicate.classList.remove("reveal-ready", "is-revealed");
        duplicate.setAttribute("aria-hidden", "true");
        duplicate.setAttribute("tabindex", "-1");
        duplicate.querySelectorAll("a, button, [tabindex]").forEach((element) => element.setAttribute("tabindex", "-1"));
        postTrack.appendChild(duplicate);
      });
      postTrack.classList.add("is-looping");
    } else if (carouselToggle) {
      carouselToggle.hidden = true;
    }

    carouselToggle?.addEventListener("click", () => {
      const isPaused = postTrack.classList.toggle("is-paused");
      carouselToggle.setAttribute("aria-pressed", String(isPaused));
      carouselToggle.setAttribute("aria-label", isPaused ? "Resume LinkedIn post carousel" : "Pause LinkedIn post carousel");
      const label = carouselToggle.querySelector("span");
      if (label) label.textContent = isPaused ? "RESUME" : "PAUSE";
      carouselToggle.firstChild.textContent = isPaused ? "▶ " : "Ⅱ ";
    });
  }

  // Sparkle trail: the existing SVG wand stays the only cursor.
  if (finePointer && !reducedMotion.matches) {
    const canvas = document.createElement("canvas");
    canvas.id = "spark-canvas";
    canvas.setAttribute("aria-hidden", "true");
    body.appendChild(canvas);
    const context = canvas.getContext("2d");
    const sparks = [];
    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", (event) => {
      for (let i = 0; i < 2 && sparks.length < 90; i += 1) {
        sparks.push({
          x: event.clientX, y: event.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.1 + 0.25,
          life: 1, radius: Math.random() * 2 + 0.8,
        });
      }
    }, { passive: true });

    const drawSparks = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= 0.026;
        if (spark.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        context.beginPath();
        context.arc(spark.x, spark.y, spark.radius * spark.life, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 228, 150, ${spark.life})`;
        context.shadowColor = "#ffcf7a";
        context.shadowBlur = 8;
        context.fill();
      }
      window.requestAnimationFrame(drawSparks);
    };
    window.requestAnimationFrame(drawSparks);
  }

  // Lumos/Nox uses the pointer position on desktop and the last touch point on mobile.
  const veil = document.createElement("div");
  veil.id = "nox-veil";
  veil.setAttribute("aria-hidden", "true");
  body.appendChild(veil);
  window.addEventListener("pointermove", (event) => {
    veil.style.setProperty("--magic-x", `${event.clientX}px`);
    veil.style.setProperty("--magic-y", `${event.clientY}px`);
  }, { passive: true });

  const toggle = document.createElement("button");
  toggle.className = "lumos-toggle";
  toggle.type = "button";
  const syncLumos = () => {
    const isNox = body.classList.contains("nox");
    toggle.textContent = isNox ? "✦ Lumos" : "☾ Nox";
    toggle.setAttribute("aria-label", isNox ? "Turn on Lumos and light the page" : "Turn on Nox and dim the page");
    toggle.setAttribute("aria-pressed", String(isNox));
  };
  toggle.addEventListener("click", () => {
    body.classList.toggle("nox");
    syncLumos();
  });
  syncLumos();
  body.appendChild(toggle);

  // Floating candles stay behind hero content and never intercept clicks.
  const hero = document.querySelector("#home");
  if (hero && !reducedMotion.matches) {
    const candleWrap = document.createElement("div");
    candleWrap.className = "candles";
    candleWrap.setAttribute("aria-hidden", "true");
    const count = window.innerWidth < 700 ? 5 : 11;
    for (let i = 0; i < count; i += 1) {
      const candle = document.createElement("span");
      candle.className = "candle";
      candle.style.left = `${Math.random() * 95}%`;
      candle.style.top = `${Math.random() * 42 + 5}%`;
      candle.style.setProperty("--candle-duration", `${5 + Math.random() * 5}s`);
      candle.style.animationDelay = `${-Math.random() * 6}s`;
      candle.style.scale = String(0.6 + Math.random() * 0.6);
      candleWrap.appendChild(candle);
    }
    hero.prepend(candleWrap);
  }

  // Ink reveal applies to the existing section title class as it enters view.
  if ("IntersectionObserver" in window) {
    const headings = document.querySelectorAll("main section h2");
    const inkObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-written");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    headings.forEach((heading) => {
      heading.classList.add("ink-reveal");
      if (heading.closest(".secret-chapter")?.getAttribute("aria-hidden") !== "true") inkObserver.observe(heading);
    });
  }

  // Actual skill markup is .skill-card; the timeline is .timeline inside #work.
  document.querySelectorAll("#skills .skill-card").forEach((card) => card.classList.add("spell-card"));
  const timeline = document.querySelector("#work .timeline");
  if (timeline && !reducedMotion.matches) {
    timeline.style.position ||= "relative";
    const footprints = document.createElement("div");
    footprints.className = "footprints";
    footprints.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 14; i += 1) {
      const footprint = document.createElement("span");
      footprint.className = "footprint";
      footprint.style.top = `${i * 7}%`;
      footprint.style.left = i % 2 ? "18px" : "4px";
      footprint.style.transform = `rotate(${i % 2 ? 8 : -8}deg)`;
      footprint.style.animationDelay = `${i * 0.28}s`;
      footprints.appendChild(footprint);
    }
    timeline.appendChild(footprints);
  }

  document.querySelectorAll('#contact a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (reducedMotion.matches) return;
      const letter = document.createElement("div");
      letter.className = "owl-letter";
      letter.setAttribute("aria-hidden", "true");
      letter.style.left = `${event.clientX || window.innerWidth / 2}px`;
      letter.style.top = `${event.clientY || window.innerHeight * 0.7}px`;
      body.appendChild(letter);
      window.setTimeout(() => letter.remove(), 1700);
    });
  });

  const secretChapter = document.querySelector(".secret-chapter");
  const spells = {
    lumos: () => { body.classList.remove("nox"); syncLumos(); },
    nox: () => { body.classList.add("nox"); syncLumos(); },
    accio: () => document.querySelector("#projects")?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" }),
    alohomora: () => {
      if (!secretChapter) return;
      secretChapter.setAttribute("aria-hidden", "false");
      body.classList.add("alohomora");
      const heading = secretChapter.querySelector("h2");
      if (heading && "IntersectionObserver" in window) heading.classList.add("is-written");
    },
  };
  let typed = "";
  window.addEventListener("keydown", (event) => {
    if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return;
    typed = (typed + event.key.toLowerCase()).slice(-12);
    for (const word of Object.keys(spells)) {
      if (!typed.endsWith(word)) continue;
      spells[word]();
      const toast = document.createElement("div");
      toast.className = "spell-toast";
      toast.setAttribute("role", "status");
      toast.textContent = `${word[0].toUpperCase()}${word.slice(1)}!`;
      body.appendChild(toast);
      window.setTimeout(() => toast.remove(), 2300);
      typed = "";
      break;
    }
  });
})();
