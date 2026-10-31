const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const flyingWizard = document.querySelector(".flying-wizard");
const pageProgress = document.querySelector(".page-progress span");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
  };

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();
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
    const y = window.innerHeight * (0.2 + (Math.sin(timestamp / 2100 + window.scrollY / 410) + 1) * 0.26);
    const delta = timestamp - previousTime;
    const verticalSpeed = delta > 0 ? (y - previousY) / delta : 0;

    flyingWizard.style.setProperty("--flight-x", `${x}px`);
    flyingWizard.style.setProperty("--flight-y", `${y}px`);
    flyingWizard.style.setProperty("--flight-direction", cycle < 0.5 ? "1" : "-1");
    flyingWizard.style.setProperty("--flight-tilt", `${Math.max(-8, Math.min(8, verticalSpeed * 160))}deg`);
    flyingWizard.classList.add("is-visible");

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
