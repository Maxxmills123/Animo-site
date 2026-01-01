"use strict";

(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const TOP_REVEAL_PX = 40;
  const DELTA = 8;

  function update() {
    const y = window.scrollY;

    if (y <= TOP_REVEAL_PX) {
      header.classList.remove("is-links-hidden");
      lastY = y;
      ticking = false;
      return;
    }

    const diff = y - lastY;

    if (diff > DELTA) {
      header.classList.add("is-links-hidden");
      lastY = y;
    } else if (diff < -DELTA) {
      header.classList.remove("is-links-hidden");
      lastY = y;
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
})();

(() => {
  const triggers = document.querySelectorAll("[data-submenu-trigger]");
  if (!triggers.length) return;

  const closeAll = () => {
    triggers.forEach((t) => {
      const li = t.closest(".nav-item--has-submenu");
      if (!li) return;
      li.classList.remove("is-open");
      t.setAttribute("aria-expanded", "false");
    });
  };

  triggers.forEach((trigger) => {
    const li = trigger.closest(".nav-item--has-submenu");
    if (!li) return;

    trigger.addEventListener("click", (e) => {
      const isTouchLike =
        matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0;
      if (!isTouchLike) return;

      e.preventDefault();

      const isOpen = li.classList.contains("is-open");
      closeAll();
      if (!isOpen) {
        li.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (e) => {
    const inside = e.target.closest(".nav-item--has-submenu");
    if (!inside) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();

(() => {
  const links = document.querySelectorAll(".nav-link");
  if (!links.length) return;

  links.forEach((a) => {
    if (!a.querySelector(".nav-link-label")) {
      const text = (a.textContent || "").trim();
      if (!text) return;

      a.textContent = "";

      const label = document.createElement("span");
      label.className = "nav-link-label";
      label.dataset.text = text;
      label.textContent = text;

      a.appendChild(label);
    }

    const label = a.querySelector(".nav-link-label");
    if (!label) return;

    const startRoll = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (a.dataset.rolling === "1") return;

      a.dataset.rolling = "1";
      a.classList.add("is-rolling");
    };

    const endRoll = () => {
      a.classList.remove("is-rolling");
      a.dataset.rolling = "0";
    };

    a.addEventListener("pointerenter", startRoll);
    a.addEventListener("focusin", startRoll);

    label.addEventListener("animationend", (e) => {
      if (e.animationName !== "nav-roll") return;
      endRoll();
    });
  });
})();

(() => {
  const toggle = document.querySelector("[data-drawer-toggle]");
  const drawer = document.querySelector("[data-drawer]");
  const overlay = document.querySelector("[data-drawer-overlay]");
  const closeBtn = document.querySelector("[data-drawer-close]");
  if (!toggle || !drawer) return;

  const root = document.documentElement;
  let lastActive = null;
  let closeTimer = null;

  const prefersReduced = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getTransitionSeconds = (el) => {
    const d = getComputedStyle(el).transitionDuration || "0s";
    const first = d.split(",")[0].trim();
    if (first.endsWith("ms")) return (parseFloat(first) || 0) / 1000;
    return parseFloat(first) || 0;
  };

  const show = () => {
    drawer.hidden = false;
    if (overlay) overlay.hidden = true;
  };

  const hide = () => {
    drawer.hidden = true;
    if (overlay) overlay.hidden = true;
  };

  const openDrawer = () => {
    if (root.classList.contains("is-drawer-open")) return;

    lastActive = document.activeElement;

    show();

    requestAnimationFrame(() => {
      root.classList.add("is-drawer-open");
    });

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  };

  const finishClose = () => {
    hide();

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");

    if (lastActive && typeof lastActive.focus === "function") {
      lastActive.focus({ preventScroll: true });
    }
    lastActive = null;
  };

  const closeDrawer = () => {
    if (!root.classList.contains("is-drawer-open")) return;

    root.classList.remove("is-drawer-open");

    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    const dur = getTransitionSeconds(drawer);

    if (prefersReduced() || dur === 0) {
      finishClose();
      return;
    }

    drawer.addEventListener(
      "transitionend",
      (e) => {
        if (e.target !== drawer) return;
        finishClose();
      },
      { once: true }
    );

    closeTimer = window.setTimeout(finishClose, Math.ceil(dur * 1000 + 80));
  };

  toggle.addEventListener("click", () => {
    if (root.classList.contains("is-drawer-open")) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

  const acc = drawer.querySelector("[data-acc]");
  if (!acc) return;

  const trigger = acc.querySelector("[data-acc-trigger]");
  const panel = acc.querySelector("[data-acc-panel]");
  const icon = acc.querySelector(".drawer-acc-icon");
  if (!trigger || !panel || !icon) return;

  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
    icon.textContent = expanded ? "+" : "−";
  });
})();

(() => {
  const root = document.querySelector("[data-footer-accordion]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll("details[data-acc-item]"));

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();

(() => {
  const hero = document.querySelector(".hero.hero-bubble");
  if (!hero) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  let ticking = false;

  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  function update() {
    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const end = vh * 0.6;
    const travelled = -rect.top;

    const t = clamp01(travelled / end);
    hero.style.setProperty("--shrink", t.toFixed(4));

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

(() => {
  const ctas = Array.from(document.querySelectorAll("[data-float-cta]"));
  if (!ctas.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const HIDE_CLASS = "is-hidden";

  let timer = null;

  function hideAll() {
    for (const el of ctas) el.classList.add(HIDE_CLASS);
  }

  function showAll() {
    for (const el of ctas) el.classList.remove(HIDE_CLASS);
  }

  function onScroll() {
    hideAll();

    if (timer) clearTimeout(timer);
    timer = setTimeout(
      () => {
        showAll();
      },
      reduceMotion.matches ? 0 : 220
    );
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  showAll();
})();

document.addEventListener("DOMContentLoaded", () => {
  const ctas = Array.from(document.querySelectorAll("[data-float-cta]"));
  const footer =
    document.querySelector("footer") || document.querySelector(".footer");

  if (!ctas.length || !footer) return;

  function setHidden(hidden) {
    for (const cta of ctas) {
      cta.style.display = hidden ? "none" : "";
    }
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      setHidden(entry.isIntersecting);
    },
    {
      threshold: 0,
      rootMargin: "0px 0px 200px 0px",
    }
  );

  io.observe(footer);
});

document.addEventListener("DOMContentLoaded", () => {
  const processSections = document.querySelectorAll(".process--oval");

  if (!processSections.length) {
    console.log("No sections found");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("wobble");
          void entry.target.offsetWidth;
          entry.target.classList.add("wobble");
        }
      });
    },
    {
      threshold: 0.3,
    }
  );

  processSections.forEach((section) => {
    observer.observe(section);
  });
});

(() => {
  const section = document.querySelector("[data-half-image]");
  if (!section) return;

  const circle = section.querySelector(".half-image__circle");
  if (!circle) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  let raf = 0;
  let currentT = 0;
  let targetT = 0;

  const measure = () => {
    const sw = section.clientWidth;
    const sh = section.clientHeight;

    const styles = getComputedStyle(section);
    const endMax = parseFloat(styles.getPropertyValue("--end-max")) || 560;
    const endVw = (parseFloat(styles.getPropertyValue("--end-vw")) || 55) / 100;

    const startSize = sw;
    const endSize = Math.min(sh, Math.min(sw * endVw, endMax));

    const shrinkDist =
      parseFloat(styles.getPropertyValue("--shrink-dist")) || 0.6;
    const smooth = parseFloat(styles.getPropertyValue("--smooth")) || 0.1;

    return { sw, sh, startSize, endSize, shrinkDist, smooth };
  };

  const apply = (t) => {
    const { sh, startSize, endSize } = measure();
    const size = lerp(startSize, endSize, t);
    const ty = lerp(0, Math.max(0, (sh - size) / 2), t);
    circle.style.setProperty("--half-size", `${size}px`);
    circle.style.setProperty("--half-ty", `${ty}px`);
  };

  const computeTarget = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    const { shrinkDist } = measure();
    const distPx = Math.max(1, vh * shrinkDist);

    const delta = Math.max(0, vh - rect.bottom);
    targetT = clamp(delta / distPx, 0, 1);
  };

  const tick = () => {
    raf = 0;

    const { smooth } = measure();
    currentT = lerp(currentT, targetT, clamp(smooth, 0.01, 0.35));
    apply(currentT);

    if (Math.abs(currentT - targetT) > 0.001) {
      raf = requestAnimationFrame(tick);
    }
  };

  const onUpdate = () => {
    computeTarget();

    if (reduce.matches) {
      currentT = targetT;
      apply(currentT);
      return;
    }

    if (!raf) raf = requestAnimationFrame(tick);
  };

  window.addEventListener("scroll", onUpdate, { passive: true });
  window.addEventListener("resize", onUpdate, { passive: true });

  onUpdate();
})();

(() => {
  const mq = window.matchMedia("(max-width: 1024px)");

  const apply = () => {
    if (!mq.matches) return;

    document.querySelectorAll(".half-image").forEach((root) => {
      if (root.dataset.noAnim === "1") return;

      const clone = root.cloneNode(true);
      clone.dataset.noAnim = "1";
      root.replaceWith(clone);

      clone.querySelectorAll(".half-image__circle").forEach((c) => {
        c.style.setProperty("--half-ty", "0px");
        c.style.transition = "none";
        c.style.animation = "none";
        c.style.willChange = "auto";
      });

      clone.querySelectorAll(".half-image__img").forEach((img) => {
        img.style.transition = "none";
        img.style.animation = "none";
        img.style.objectPosition = "50% 100%";
      });
    });
  };

  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
  else mq.addListener(apply);
})();

(() => {
  const header = document.querySelector(".site-header");
  const darkSection = document.querySelector(".thought_section2");
  if (!header || !darkSection) return;

  function update() {
    const headerRect = header.getBoundingClientRect();
    const secRect = darkSection.getBoundingClientRect();
    const overlaps =
      secRect.bottom > headerRect.top && secRect.top < headerRect.bottom;

    header.classList.toggle("is-on-dark", overlaps);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

(() => {
  const root = document.documentElement;
  const ctas = Array.from(document.querySelectorAll("[data-float-cta]"));
  if (!ctas.length) return;

  const HIDE_CLASS = "is-hidden";

  const sync = () => {
    const open = root.classList.contains("is-drawer-open");
    for (const cta of ctas) {
      cta.classList.toggle(HIDE_CLASS, open);
    }
  };

  sync();

  const mo = new MutationObserver(sync);
  mo.observe(root, { attributes: true, attributeFilter: ["class"] });
})();

(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const mq = window.matchMedia("(max-width: 1024px)");

  let lastY = window.scrollY;
  let ticking = false;
  let idleTimer = null;

  const TOP_REVEAL_PX = 40;
  const DELTA = 6;
  const IDLE_MS = 180;

  const show = () => header.classList.remove("is-mobile-hidden");
  const hide = () => header.classList.add("is-mobile-hidden");

  function update() {
    if (!mq.matches) {
      header.classList.remove("is-mobile-hidden");
      ticking = false;
      return;
    }

    const y = window.scrollY;

    if (y <= TOP_REVEAL_PX) {
      show();
      lastY = y;
      ticking = false;
      return;
    }

    const diff = y - lastY;

    if (diff > DELTA) {
      hide();
      lastY = y;
    } else if (diff < -DELTA) {
      show();
      lastY = y;
    }

    ticking = false;
  }

  function onScroll() {
    if (mq.matches) {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(show, IDLE_MS);
    }

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    lastY = window.scrollY;
    if (!mq.matches) header.classList.remove("is-mobile-hidden");
  });

  if (mq.matches) show();
})();
