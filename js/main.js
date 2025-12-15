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

/* ✅ Drawer: no scrim, no scroll locking, no auto-focus on X */
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

  const show = () => {
    drawer.hidden = false;

    // ✅ Keep overlay hidden always (no grey scrim)
    if (overlay) overlay.hidden = true;
  };

  const hide = () => {
    drawer.hidden = true;

    // ✅ Keep overlay hidden always (no grey scrim)
    if (overlay) overlay.hidden = true;
  };

  const openDrawer = () => {
    if (root.classList.contains("is-drawer-open")) return;

    lastActive = document.activeElement;

    show();

    // ✅ Add class immediately; no scroll/overflow changes
    requestAnimationFrame(() => {
      root.classList.add("is-drawer-open");
    });

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");

    // ✅ Do NOT auto-focus the close button (prevents the focus ring highlight)
    // if (closeBtn) closeBtn.focus({ preventScroll: true });
  };

  const finishClose = () => {
    hide();

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");

    // Optional: restore focus to the toggle without causing scroll jumps
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

    const dur = parseFloat(getComputedStyle(drawer).transitionDuration) || 0;

    // If no transition (or reduced motion), close immediately
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

  // ✅ No overlay click handler (overlay stays hidden anyway)
  // if (overlay) overlay.addEventListener("click", closeDrawer);

  // Close if user taps a link inside the drawer
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // Click/tap outside closes (works without overlay)
  document.addEventListener("pointerdown", (e) => {
    if (!root.classList.contains("is-drawer-open")) return;
    const insideDrawer = e.target.closest("[data-drawer]");
    const onToggle = e.target.closest("[data-drawer-toggle]");
    if (!insideDrawer && !onToggle) closeDrawer();
  });

  // Accordion
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
