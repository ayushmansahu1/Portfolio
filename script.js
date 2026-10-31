const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const flyingWizard = document.querySelector(".flying-wizard");
const pageProgress = document.querySelector(".page-progress span");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const chapterSections = [...document.querySelectorAll("main > section")];
const chapterCount = document.querySelector(".chapter-hud-count");
const chapterName = document.querySelector(".chapter-hud-name");
const chapterTrack = document.querySelector(".chapter-hud-track > span");
const chapterNext = document.querySelector(".chapter-next");
const magicCursor = document.querySelector(".magic-cursor");
const chapterNames = ["The arrival", "The story", "Field notes", "Creations", "Spellbook", "Foundations", "Field guide", "Owl post"];
let activeChapter = 0;

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

if (magicCursor && !reducedMotion.matches && !window.matchMedia("(pointer: coarse)").matches) {
  window.addEventListener("pointermove", (event) => {
    magicCursor.style.setProperty("--pointer-x", `${event.clientX}px`);
    magicCursor.style.setProperty("--pointer-y", `${event.clientY}px`);
    magicCursor.classList.add("is-visible");

    const hero = document.querySelector(".hero");
    if (hero && event.clientY < window.innerHeight) {
      hero.style.setProperty("--parallax-x", `${((event.clientX / window.innerWidth) - 0.5) * 10}px`);
      hero.style.setProperty("--parallax-y", `${((event.clientY / window.innerHeight) - 0.5) * 8}px`);
      hero.classList.add("has-pointer");
    }
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => magicCursor.classList.remove("is-visible"));

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
    ".section-label, .display-title, .project-card, .timeline-item, .skill-card, .education-item, .award, .cert-cloud > span, .contact-card"
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
    const x = -width + progress * (window.innerWidth + width);
    const y = window.innerHeight * (0.1 + (Math.sin(timestamp / 2300 + window.scrollY / 410) + 1) * 0.15);
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
