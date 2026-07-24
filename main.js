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

  // Pricing packages carousel — drag/swipe (ScrollSmoother-safe)
  (function initPricingSlider() {
    const root = document.querySelector("[data-pricing-slider]");
    if (!root) return;

    const viewport = root.querySelector(".pricing-viewport");
    const track = root.querySelector(".pricing-track");
    const cards = Array.from(root.querySelectorAll(".pricing-card"));
    const prevBtn = root.querySelector(".pricing-nav--prev");
    const nextBtn = root.querySelector(".pricing-nav--next");
    const dots = Array.from(
      document.querySelectorAll(".pricing-dots .pricing-dot")
    );
    if (!viewport || !track || cards.length < 3) return;

    let index = 1;
    let trackX = 0;
    let trackTween = null;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let axis = null;
    let didDrag = false;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function setTrackX(x, animate) {
      trackX = x;
      if (trackTween) {
        trackTween.kill();
        trackTween = null;
      }
      if (typeof gsap === "undefined") {
        track.style.transform = `translate3d(${x}px, 0, 0)`;
        return;
      }
      if (animate && !reduceMotion) {
        trackTween = gsap.to(track, {
          x,
          duration: 0.5,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.set(track, { x });
      }
    }

    function centeredX(i) {
      const card = cards[i];
      return -(card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2);
    }

    function clampIndex(i) {
      return Math.max(0, Math.min(cards.length - 1, i));
    }

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

    function goTo(nextIndex, animate) {
      index = clampIndex(nextIndex);
      updateUI();
      setTrackX(centeredX(index), animate);
    }

    function nearestFromX(x) {
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((_, i) => {
        const dist = Math.abs(centeredX(i) - x);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }

    function pauseSmoother(paused) {
      if (smoother && typeof smoother.paused === "function") {
        smoother.paused(paused);
      }
    }

    function onPointerDown(event) {
      if (event.button != null && event.button !== 0) return;
      if (event.target.closest("a, button")) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      originX = trackX;
      axis = null;
      didDrag = false;
      viewport.classList.add("is-dragging");
      if (trackTween) {
        trackTween.kill();
        trackTween = null;
      }
      viewport.setPointerCapture?.(pointerId);
    }

    function onPointerMove(event) {
      if (pointerId == null || event.pointerId !== pointerId) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        if (axis === "x") pauseSmoother(true);
      }

      if (axis !== "x") return;

      event.preventDefault();
      didDrag = true;
      setTrackX(originX + dx, false);
    }

    function onPointerUp(event) {
      if (pointerId == null || event.pointerId !== pointerId) return;

      viewport.classList.remove("is-dragging");
      viewport.releasePointerCapture?.(pointerId);
      pointerId = null;

      if (axis === "x") {
        pauseSmoother(false);
        const dx = event.clientX - startX;
        const threshold = Math.min(56, viewport.clientWidth * 0.12);
        if (dx < -threshold) goTo(index + 1, true);
        else if (dx > threshold) goTo(index - 1, true);
        else goTo(nearestFromX(trackX), true);
      } else {
        goTo(index, false);
      }

      axis = null;
    }

    function onWheel(event) {
      const horizontal =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontal && Math.abs(event.deltaY) < 1) return;
      if (!horizontal) return;

      event.preventDefault();
      const delta = event.shiftKey ? event.deltaY : event.deltaX || event.deltaY;
      const nextX = trackX - delta;
      const minX = centeredX(cards.length - 1);
      const maxX = centeredX(0);
      setTrackX(Math.min(maxX, Math.max(minX, nextX)), false);
      index = nearestFromX(trackX);
      updateUI();
    }

    function onClickCapture(event) {
      if (!didDrag) return;
      if (event.target.closest("a")) {
        event.preventDefault();
        event.stopPropagation();
      }
      didDrag = false;
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1, true));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1, true));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.dataset.index) || 0, true);
      });
    });

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove, { passive: false });
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("click", onClickCapture, true);

    window.addEventListener("resize", () => goTo(index, false));

    const centerStandard = () => goTo(1, false);
    centerStandard();
    requestAnimationFrame(centerStandard);
    window.addEventListener("load", centerStandard, { once: true });
    setTimeout(centerStandard, 120);
    setTimeout(centerStandard, 450);
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
