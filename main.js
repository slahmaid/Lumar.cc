(() => {
  "use strict";

  if (typeof gsap === "undefined") return;

  const plugins = [];
  if (typeof ScrollTrigger !== "undefined") plugins.push(ScrollTrigger);
  if (typeof ScrollSmoother !== "undefined") plugins.push(ScrollSmoother);
  if (typeof SplitText !== "undefined") plugins.push(SplitText);
  if (plugins.length) gsap.registerPlugin(...plugins);

  gsap.config({ force3D: true });
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  const hamburger = document.getElementById("hamburger-12");
  const siteMenu = document.getElementById("site-menu");
  const menuLinks = siteMenu ? gsap.utils.toArray(".site-menu-link") : [];
  const siteHeader = document.querySelector(".site-header");
  const heroTitle = document.querySelector(".logo-section .hero-title");
  const marqueeTrack = document.querySelector(".text-marquee-track");
  // Prefer coarse pointer over maxTouchPoints — Windows laptops often report
  // touch points even when used with a mouse, which was muting animations.
  const isCoarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

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

    if (smoother) smoother.paused(isOpen);

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

  const discoverBtn = document.getElementById("hero-discover");
  if (discoverBtn) {
    discoverBtn.addEventListener("click", () => {
      const target = document.querySelector("#programs");
      if (!target) return;
      if (smoother) {
        smoother.scrollTo(target, true, "top 80px");
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Pricing packages carousel — starts on STANDARD (index 1)
  (function initPricingSlider() {
    const root = document.querySelector("[data-pricing-slider]");
    if (!root) return;

    const viewport = root.querySelector(".pricing-viewport");
    const cards = Array.from(root.querySelectorAll(".pricing-card"));
    const prevBtn = root.querySelector(".pricing-nav--prev");
    const nextBtn = root.querySelector(".pricing-nav--next");
    const dots = Array.from(
      document.querySelectorAll(".pricing-dots .pricing-dot")
    );
    if (!viewport || cards.length < 3) return;

    let index = 1;
    let scrollRaf = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function updateUI() {
      cards.forEach((card, i) => {
        card.classList.toggle("is-active", i === index);
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= cards.length - 1;
    }

    function nearestIndex() {
      const mid = viewport.scrollLeft + viewport.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }

    function goTo(nextIndex, animate) {
      index = Math.max(0, Math.min(cards.length - 1, nextIndex));
      updateUI();

      const card = cards[index];
      const left =
        card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;

      if (animate && !reduceMotion && typeof viewport.scrollTo === "function") {
        viewport.scrollTo({ left, behavior: "smooth" });
      } else {
        viewport.scrollLeft = left;
      }
    }

    function onScroll() {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const next = nearestIndex();
        if (next !== index) {
          index = next;
          updateUI();
        }
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1, true));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1, true));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.dataset.index) || 0, true);
      });
    });

    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => goTo(index, false));

    // Horizontal swipe between plans without blocking vertical page scroll
    let touchStartX = 0;
    let touchStartY = 0;
    let touchAxis = null;

    viewport.addEventListener(
      "touchstart",
      (event) => {
        const t = event.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchAxis = null;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      (event) => {
        if (touchAxis) return;
        const t = event.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        touchAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchend",
      (event) => {
        const t = event.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        const wasHorizontal =
          touchAxis === "x" ||
          (touchAxis == null && Math.abs(dx) > Math.abs(dy));
        touchAxis = null;
        if (!wasHorizontal || Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) {
          return;
        }
        if (dx < 0) goTo(index + 1, true);
        else goTo(index - 1, true);
      },
      { passive: true }
    );

    // Start on STANDARD after layout (and again after fonts/images)
    const centerStandard = () => goTo(1, false);
    centerStandard();
    requestAnimationFrame(centerStandard);
    window.addEventListener("load", centerStandard, { once: true });
    setTimeout(centerStandard, 100);
    setTimeout(centerStandard, 400);
  })();

  // Lead form → WhatsApp (replace YOUR_NUMBER with digits only, country code, no +)
  (function initLeadForm() {
    const form = document.getElementById("lead-form");
    if (!form) return;

    const WHATSAPP_NUMBER = "YOUR_NUMBER";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const whatsapp = String(data.get("whatsapp") || "").trim();
      const major = String(data.get("major") || "").trim();
      const language = String(data.get("language") || "").trim();
      const gpa = String(data.get("gpa") || "").trim();
      const budget = String(data.get("budget") || "").trim();

      const message = [
        "Hello LUMAR — I'd like my university options.",
        "",
        `Name: ${name}`,
        `WhatsApp: ${whatsapp}`,
        `Desired major: ${major}`,
        `Study language: ${language}`,
        `High school GPA: ${gpa}`,
        `Yearly budget: ${budget}`,
      ].join("\n");

      if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "YOUR_NUMBER") {
        console.warn(
          "Set WHATSAPP_NUMBER in main.js (digits only, e.g. 2126xxxxxxx)."
        );
        window.alert(
          "WhatsApp number not configured yet. Replace YOUR_NUMBER in main.js."
        );
        return;
      }

      const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER.replace(/\D/g, "") +
        "?text=" +
        encodeURIComponent(message);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  })();

  // FAQ accordion — one open item at a time
  (function initFaqAccordion() {
    const root = document.querySelector("[data-faq-accordion]");
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".faq-item"));
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  })();

  function ensureVisible(targets) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    gsap.set(els, {
      clearProps:
        "opacity,visibility,transform,clipPath,webkitClipPath,filter",
      opacity: 1,
      visibility: "visible",
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      rotationX: 0,
      scale: 1,
      clipPath: "none",
    });
  }

  function killTween(tween) {
    if (!tween) return;
    if (tween.scrollTrigger) tween.scrollTrigger.kill();
    tween.kill();
  }

  function refreshAfterImages() {
    if (typeof ScrollTrigger === "undefined") return;

    const images = gsap.utils.toArray("img");
    let pending = images.length;

    if (!pending) {
      ScrollTrigger.refresh();
      return;
    }

    const done = () => {
      pending -= 1;
      if (pending <= 0) ScrollTrigger.refresh();
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

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    ensureVisible([
      ".hero-word",
      ".after-title",
      ".after-body-text",
      ".after-image-wrap",
      ".after-image",
      ".after-fact",
      ".grid-layout",
      ".grid-image",
      ".parallax-section",
      ".program-card",
      ".program-image-wrap",
      ".program-image",
    ]);

    if (siteHeader) {
      gsap.set(siteHeader, { autoAlpha: 1 });
      siteHeader.style.pointerEvents = "auto";
    }

    return () => {};
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ctx = gsap.context(() => {
      if (typeof ScrollSmoother !== "undefined") {
        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: isCoarsePointer ? 0.8 : 1.25,
          effects: true,
          // Keep a light touch smooth so scrubbed hero/grid still feel alive
          // without fighting native mobile scroll as hard as 0.15–1.0 can.
          smoothTouch: isCoarsePointer ? 0.1 : 0,
          normalizeScroll: false,
        });
      }

      if (siteHeader && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: ".scroll-smoother-section",
          start: "bottom top",
          onEnter: () => {
            siteHeader.style.pointerEvents = "auto";
            gsap.to(siteHeader, {
              autoAlpha: 1,
              duration: 0.4,
              ease: "power2.out",
            });
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
      }

      // Hero word disperse — same animation as original preview on all viewports
      if (heroTitle) {
        const originalHero =
          heroTitle.dataset.originalText || heroTitle.textContent.trim();
        heroTitle.dataset.originalText = originalHero;
        const words = originalHero.split(/\s+/);
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
              invalidateOnRefresh: true,
            },
          })
          .to(heroWords, { x: distPaths, ease: "none" })
          .to(heroWords, { opacity: 0, ease: "none" }, 0);
      }

      // Grid zoom + column fly-in (all breakpoints)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".grid-section",
            scrub: 1.2,
            start: "top center",
            end: "bottom+=10% bottom",
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        })
        .add("start")
        .from(".grid-layout", { scale: 3 }, "start")
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
          invalidateOnRefresh: true,
        },
      });

      let afterSplit = null;
      let afterBodySplit = null;
      let afterLinesAnimation = null;
      let afterWordsAnimation = null;
      let afterImageReveal = null;
      let afterImageScale = null;
      let afterFactsReveal = null;
      let afterTitleResizeTimer = null;
      let lastSetupWidth = window.innerWidth;

      function setupAfterTitle() {
        try {
          killTween(afterLinesAnimation);
          killTween(afterWordsAnimation);
          killTween(afterImageReveal);
          killTween(afterImageScale);
          killTween(afterFactsReveal);
          afterLinesAnimation = null;
          afterWordsAnimation = null;
          afterImageReveal = null;
          afterImageScale = null;
          afterFactsReveal = null;

          if (afterSplit) {
            afterSplit.revert();
            afterSplit = null;
          }
          if (afterBodySplit) {
            afterBodySplit.revert();
            afterBodySplit = null;
          }

          ensureVisible([
            ".after-title",
            ".after-body-text",
            ".after-image-wrap",
            ".after-image",
            ".after-fact",
          ]);

          const titleEl = document.querySelector(".after-title");
          const bodyEls = document.querySelectorAll(".after-body-text");
          if (!titleEl || !bodyEls.length) return;

          if (typeof SplitText !== "undefined") {
            afterSplit = SplitText.create(".after-title", {
              type: "lines",
              linesClass: "after-line",
            });
            afterBodySplit = SplitText.create(".after-body-text", {
              type: "words",
              wordsClass: "after-word",
            });

            gsap.set(afterSplit.lines, { transformOrigin: "50% 50% -160px" });

            afterLinesAnimation = gsap.fromTo(
              afterSplit.lines,
              { rotationX: -80, opacity: 0 },
              {
                rotationX: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.18,
                scrollTrigger: {
                  trigger: ".after-title-container",
                  start: "top 90%",
                  once: true,
                  toggleActions: "play none none none",
                },
              }
            );

            afterWordsAnimation = gsap.fromTo(
              afterBodySplit.words,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.02,
                scrollTrigger: {
                  trigger: ".after-body",
                  start: "top 92%",
                  once: true,
                  toggleActions: "play none none none",
                },
              }
            );
          }

          afterImageReveal = gsap.fromTo(
            ".after-image-wrap",
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: 1.2,
              ease: "power3.out",
              stagger: 0.18,
              scrollTrigger: {
                trigger: ".after-body",
                start: "top 85%",
                once: true,
                toggleActions: "play none none none",
              },
            }
          );

          afterImageScale = gsap.fromTo(
            ".after-image",
            { scale: 1.12 },
            {
              scale: 1,
              duration: 1.2,
              ease: "power3.out",
              stagger: 0.18,
              scrollTrigger: {
                trigger: ".after-body",
                start: "top 85%",
                once: true,
                toggleActions: "play none none none",
              },
            }
          );

          afterFactsReveal = gsap.fromTo(
            ".after-fact",
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.12,
              scrollTrigger: {
                trigger: ".after-facts",
                start: "top 92%",
                once: true,
                toggleActions: "play none none none",
              },
            }
          );

          // If a section is already on screen (common after mobile refresh),
          // force reveals so content never stays stuck at opacity 0.
          requestAnimationFrame(() => {
            if (typeof ScrollTrigger === "undefined") return;
            const scrollPos = ScrollTrigger.scroll();
            [
              afterLinesAnimation,
              afterWordsAnimation,
              afterImageReveal,
              afterImageScale,
              afterFactsReveal,
            ].forEach((tween) => {
              const st = tween && tween.scrollTrigger;
              if (!st) return;
              if (scrollPos >= st.start - 8) {
                tween.progress(1);
              }
            });
          });

          // Last-resort visibility if a tween never starts (plugin/layout glitch).
          setTimeout(() => {
            const stuck = document.querySelectorAll(
              ".after-line, .after-word, .after-fact, .after-image-wrap, .program-card, .program-image-wrap"
            );
            stuck.forEach((el) => {
              const opacity = window.getComputedStyle(el).opacity;
              const rect = el.getBoundingClientRect();
              const inView =
                rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
              if (inView && Number(opacity) < 0.05) {
                gsap.set(el, {
                  opacity: 1,
                  y: 0,
                  rotationX: 0,
                  clipPath: "none",
                  clearProps: "transform",
                });
              }
            });
          }, 1200);

          if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
          }
        } catch (err) {
          console.warn("LUMAR after-section setup failed:", err);
          ensureVisible([
            ".after-title",
            ".after-body-text",
            ".after-image-wrap",
            ".after-image",
            ".after-fact",
          ]);
        }
      }

      const fontsReady =
        document.fonts && document.fonts.ready
          ? document.fonts.ready
          : Promise.resolve();

      fontsReady.then(() => {
        setupAfterTitle();
        refreshAfterImages();
      });

      const onResize = () => {
        clearTimeout(afterTitleResizeTimer);
        afterTitleResizeTimer = setTimeout(() => {
          const width = window.innerWidth;
          if (Math.abs(width - lastSetupWidth) < 40) return;
          lastSetupWidth = width;
          setupAfterTitle();
        }, 300);
      };

      window.addEventListener("resize", onResize);

      if (marqueeTrack) {
        gsap.to(marqueeTrack, {
          xPercent: -50,
          duration: 28,
          ease: "none",
          repeat: -1,
          force3D: true,
        });
      }

      const programCards = gsap.utils.toArray(".program-card");
      let programsReveal = null;

      if (programCards.length) {
        programsReveal = gsap.fromTo(
          programCards,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".programs-section",
              start: "top 85%",
              once: true,
              toggleActions: "play none none none",
            },
          }
        );

        gsap.fromTo(
          ".program-image-wrap",
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".programs-section",
              start: "top 80%",
              once: true,
              toggleActions: "play none none none",
            },
          }
        );

        gsap.fromTo(
          ".program-image",
          { scale: 1.12 },
          {
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".programs-section",
              start: "top 80%",
              once: true,
              toggleActions: "play none none none",
            },
          }
        );
      }

      const uniCards = gsap.utils.toArray(".uni-stack__card");
      if (uniCards.length && typeof ScrollTrigger !== "undefined") {
        uniCards.forEach((card, index) => {
          const content = card.querySelector(".uni-stack__content");
          const next = uniCards[index + 1];
          if (!content || !next) return;

          gsap.fromTo(
            content,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.92,
              filter: "brightness(0.7)",
              ease: "none",
              scrollTrigger: {
                trigger: next,
                start: "top bottom",
                end: "top 10%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }

      window.addEventListener("load", () => {
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      });

      return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(afterTitleResizeTimer);
        killTween(afterLinesAnimation);
        killTween(afterWordsAnimation);
        killTween(afterImageReveal);
        killTween(afterImageScale);
        killTween(afterFactsReveal);
        killTween(programsReveal);
        if (afterSplit) afterSplit.revert();
        if (afterBodySplit) afterBodySplit.revert();
        if (smoother) {
          smoother.kill();
          smoother = null;
        }
        ensureVisible([
          ".after-title",
          ".after-body-text",
          ".after-image-wrap",
          ".after-image",
          ".after-fact",
          ".hero-word",
          ".program-card",
          ".program-image-wrap",
          ".program-image",
          ".uni-stack__content",
        ]);
      };
    });

    return () => ctx.revert();
  });
})();
