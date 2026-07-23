gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

gsap.config({ force3D: true });
ScrollTrigger.config({ ignoreMobileResize: true });

const hamburger = document.getElementById("hamburger-12");
const siteMenu = document.getElementById("site-menu");
const menuLinks = siteMenu ? gsap.utils.toArray(".site-menu-link") : [];

let menuOpen = false;
let menuTween = null;
let smoother = null;

function setMenuOpen(isOpen) {
  if (!hamburger || !siteMenu || menuOpen === isOpen) return;

  menuOpen = isOpen;
  hamburger.classList.toggle("is-active", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  siteMenu.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("menu-open", isOpen);

  if (smoother) {
    smoother.paused(isOpen);
  }

  if (menuTween) menuTween.kill();

  if (isOpen) {
    siteMenu.style.pointerEvents = "auto";
    gsap.set(menuLinks, { opacity: 0 });
    menuTween = gsap
      .timeline()
      .set(siteMenu, { visibility: "visible" })
      .to(siteMenu, {
        opacity: 1,
        duration: 0.75,
        ease: "power1.inOut",
      })
      .to(menuLinks, {
        opacity: 1,
        duration: 0.55,
        ease: "power1.out",
        stagger: 0.22,
      });
  } else {
    siteMenu.style.pointerEvents = "none";
    menuTween = gsap
      .timeline({
        onComplete: () => {
          gsap.set(siteMenu, { visibility: "hidden" });
        },
      })
      .to(menuLinks, {
        opacity: 0,
        duration: 0.4,
        ease: "power1.in",
        stagger: {
          each: 0.12,
          from: "end",
        },
      })
      .to(siteMenu, {
        opacity: 0,
        duration: 0.75,
        ease: "power1.inOut",
      });
  }
}

if (hamburger && siteMenu) {
  gsap.set([siteMenu, menuLinks], { opacity: 0 });
  gsap.set(siteMenu, { visibility: "hidden" });

  hamburger.addEventListener("click", () => {
    setMenuOpen(!menuOpen);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });
}

smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.25,
  effects: true,
  smoothTouch: 0.15,
});

const siteHeader = document.querySelector(".site-header");

ScrollTrigger.create({
  trigger: ".scroll-smoother-section",
  start: "bottom top",
  onEnter: () => {
    siteHeader.style.pointerEvents = "auto";
    gsap.to(siteHeader, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
  },
  onLeaveBack: () => {
    gsap.to(siteHeader, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        siteHeader.style.pointerEvents = "none";
      },
    });
  },
});

const heroTitle = document.querySelector(".logo-section .hero-title");
const words = heroTitle.textContent.trim().split(/\s+/);

heroTitle.textContent = "";
words.forEach((word, index) => {
  const span = document.createElement("span");
  span.className = "hero-word";
  span.textContent = word;
  heroTitle.appendChild(span);
  if (index < words.length - 1) {
    heroTitle.appendChild(document.createTextNode(" "));
  }
});

const heroWords = gsap.utils.toArray(".hero-word");
const distPaths = gsap.utils.distribute({
  base: -300,
  amount: 600,
});

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".logo-section",
      scrub: 1.2,
      start: "bottom 95%",
      end: "bottom center",
    },
  })
  .to(heroWords, { x: distPaths, ease: "none" })
  .to(heroWords, { opacity: 0, ease: "none" }, 0);

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".grid-section",
      scrub: 1.2,
      start: "top center",
      end: "bottom+=10% bottom",
    },
    defaults: {
      ease: "none",
    },
  })
  .add("start")
  .from(
    ".grid-layout",
    {
      scale: 3,
    },
    "start"
  )
  .from(
    ".column-1 .grid-image",
    {
      xPercent: (i) => -((i + 1) * 40 + i * 100),
      yPercent: (i) => (i + 1) * 40 + i * 100,
    },
    "start"
  )
  .from(
    ".column-3 .grid-image",
    {
      xPercent: (i) => (i + 1) * 40 + i * 100,
      yPercent: (i) => (i + 1) * 40 + i * 100,
    },
    "start"
  );

gsap.from(".parallax-section", {
  scale: 1 / 3,
  ease: "none",
  scrollTrigger: {
    trigger: ".parallax-section",
    scrub: 1.2,
  },
});

const pinSection = document.querySelector(".pin-section");
const pinContent1 = document.querySelector(".pin-content-1");
const pinContent2 = document.querySelector(".pin-content-2");

const pinTl = gsap.timeline({
  scrollTrigger: {
    pin: true,
    trigger: pinSection,
    scrub: 1.2,
    start: "top top",
    end: () => "+=" + pinContent1.offsetWidth,
    invalidateOnRefresh: true,
    anticipatePin: 1,
  },
});

pinTl.fromTo(
  ".pin-content-1",
  {
    x: () => document.body.clientWidth * 0.9,
  },
  {
    x: () => -pinContent1.offsetWidth,
    ease: "none",
  },
  0
);

pinTl.fromTo(
  ".pin-content-2",
  {
    x: () => -pinContent2.offsetWidth + document.body.clientWidth * 0.1,
  },
  {
    x: () => document.body.clientWidth,
    ease: "none",
  },
  0
);

let afterSplit;
let afterLinesAnimation;
let afterBodySplit;
let afterWordsAnimation;
let afterImageReveal;
let afterImageScale;
let afterFactsReveal;

function killTween(tween) {
  if (!tween) return;
  if (tween.scrollTrigger) tween.scrollTrigger.kill();
  tween.kill();
}

function setupAfterTitle() {
  killTween(afterLinesAnimation);
  afterLinesAnimation = null;
  killTween(afterWordsAnimation);
  afterWordsAnimation = null;
  killTween(afterImageReveal);
  afterImageReveal = null;
  killTween(afterImageScale);
  afterImageScale = null;
  killTween(afterFactsReveal);
  afterFactsReveal = null;

  if (afterSplit) {
    afterSplit.revert();
    afterSplit = null;
  }
  if (afterBodySplit) {
    afterBodySplit.revert();
    afterBodySplit = null;
  }

  afterSplit = SplitText.create(".after-title", {
    type: "lines",
    linesClass: "after-line",
  });
  afterBodySplit = SplitText.create(".after-body-text", {
    type: "words",
    wordsClass: "after-word",
  });

  gsap.set(afterSplit.lines, { transformOrigin: "50% 50% -160px" });

  afterLinesAnimation = gsap.from(afterSplit.lines, {
    rotationX: -80,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.18,
    scrollTrigger: {
      trigger: ".scroll-smoother-section",
      start: "bottom bottom",
      toggleActions: "play none none reverse",
    },
  });

  afterWordsAnimation = gsap.from(afterBodySplit.words, {
    y: 40,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.02,
    scrollTrigger: {
      trigger: ".after-body",
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  });

  afterImageReveal = gsap.from(".after-image-wrap", {
    clipPath: "inset(100% 0 0 0)",
    duration: 1.2,
    ease: "power3.out",
    stagger: 0.18,
    scrollTrigger: {
      trigger: ".after-body",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  afterImageScale = gsap.from(".after-image", {
    scale: 1.12,
    duration: 1.2,
    ease: "power3.out",
    stagger: 0.18,
    scrollTrigger: {
      trigger: ".after-body",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  afterFactsReveal = gsap.from(".after-fact", {
    y: 28,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: ".after-facts",
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  });

  ScrollTrigger.refresh();
}

setupAfterTitle();

let afterTitleResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(afterTitleResizeTimer);
  afterTitleResizeTimer = setTimeout(() => {
    setupAfterTitle();
  }, 250);
});

const marqueeTrack = document.querySelector(".text-marquee-track");

if (marqueeTrack) {
  gsap.to(marqueeTrack, {
    xPercent: -50,
    duration: 28,
    ease: "none",
    repeat: -1,
    force3D: true,
  });
}

function refreshAfterImages() {
  const images = gsap.utils.toArray("img");
  let pending = images.length;

  if (!pending) {
    ScrollTrigger.refresh();
    return;
  }

  const done = () => {
    pending -= 1;
    if (pending <= 0) {
      ScrollTrigger.refresh();
    }
  };

  images.forEach((img) => {
    if (img.complete) {
      done();
    } else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

refreshAfterImages();
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
