export function initSiteUI() {
  const googleMapStyles = [
    {
      featureType: "all",
      stylers: [
        {
          saturation: 0,
        },
        {
          hue: "#e7ecf0",
        },
      ],
    },
    {
      featureType: "road",
      stylers: [
        {
          saturation: -70,
        },
      ],
    },
    {
      featureType: "transit",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "water",
      stylers: [
        {
          visibility: "simplified",
        },
        {
          saturation: -60,
        },
      ],
    },
  ];
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const header = document.querySelector("[data-site-header]");
  const navItemsWithSubmenu = document.querySelectorAll(".site-nav__item:has(.site-nav__submenu)");
  const accordionTriggers = document.querySelectorAll("[data-accordion-trigger]");
  const hoverPreview = document.querySelector("[data-accordion-hover-preview]");
  const hoverPreviewImage = document.querySelector("[data-accordion-hover-image]");
  const filterToggle = document.querySelector("[data-filter-toggle]");
  const datePickers = document.querySelectorAll("[data-date-picker]");
  const customSelects = document.querySelectorAll("[data-custom-select]");
  const toggleChecks = document.querySelectorAll("[data-toggle-check]");
  const eventCategoryFilters = document.querySelectorAll("[data-category-filter]");
  const eventCategoryWraps = document.querySelectorAll(".event-categories-wrap");
  const eventArchiveCards = document.querySelectorAll("[data-event-card]");
  const eventsCarousels = document.querySelectorAll("[data-events-carousel]");
  const attractionSliders = document.querySelectorAll("[data-attractions-slider]");
  const homeNewsTabs = document.querySelectorAll("[data-home-news-tabs]");
  const googleMaps = document.querySelectorAll("[data-google-map]");
  const revealTargets = document.querySelectorAll(
    ".events-panel, .info-panel, .home-attractions__intro, .home-attractions__layout, .home-guide__intro, .home-guide-card, .home-news__head, .home-news-card, .news-hero__inner, .news-archive__intro, .news-card, .news-detail-hero__inner, .news-detail-content__inner, .bike-hero__inner, .bike-content__intro, .bike-section, .archive-hero__inner, .exhibitions-hero__inner, .exhibition-venue, .exhibition-card, .about-hero__inner, .about-history-row, .living-hero__inner, .living-directory__intro, .living-card, .living-map, .events-filter, .event-categories, .archive-event-card",
  );
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const eventAccessibilityItems = [
    { type: "language" },
    {
      icon: "accessibility",
      label: "Pritaikyta judėjimo negaliai",
    },
    {
      icon: "paw-print",
      label: "Galima su gyvūnais",
    },
  ];

  const getEventLanguageMeta = (card) => {
    const lang = (card.dataset.eventLanguage || "lt").toLowerCase();
    const code = lang === "en" ? "EN" : "LT";

    return {
      code,
      label: lang === "en" ? "Informacija anglų kalba" : "Informacija lietuvių kalba",
    };
  };

  const createEventAccessibilityList = (context) => {
    const list = document.createElement("ul");
    list.className = "archive-event-card__accessibility";
    list.setAttribute("aria-label", "Renginio prieinamumo žymos");

    eventAccessibilityItems.forEach((item) => {
      const listItem = document.createElement("li");
      const srLabel = document.createElement("span");
      srLabel.className = "archive-event-card__accessibility-label";

      if (item.type === "language") {
        const { code, label } = getEventLanguageMeta(context);
        const langCode = document.createElement("span");

        langCode.className = "archive-event-card__accessibility-lang";
        langCode.setAttribute("aria-hidden", "true");
        langCode.textContent = code;
        srLabel.textContent = label;
        listItem.append(langCode, srLabel);
      } else {
        const icon = document.createElement("i");

        icon.setAttribute("data-lucide", item.icon);
        srLabel.textContent = item.label;
        listItem.append(icon, srLabel);
      }

      list.append(listItem);
    });

    return list;
  };

  const normalizeCategorySlug = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .trim()
      .replace(/\s+/g, "-");

  const relatedEventsSection = document.querySelector(".related-events");
  const relatedCategoryLabel = document
    .querySelector(".event-detail-card [data-acf-field='event_category']")
    ?.textContent.trim();
  const relatedCurrentTitle = document
    .querySelector(".event-detail-card [data-acf-field='event_title']")
    ?.textContent.trim();

  if (relatedEventsSection && relatedCategoryLabel) {
    const relatedCategorySlug = normalizeCategorySlug(relatedCategoryLabel);

    relatedEventsSection.querySelectorAll("[data-event-card]").forEach((card) => {
      const cardTitle = card.querySelector("h2")?.textContent.trim();
      const cardSlugs = (card.dataset.category || "")
        .split(/\s+/)
        .filter(Boolean);
      const cardLabels = card.querySelectorAll(".archive-event-card__media > span");
      const matchesCategory =
        cardSlugs.includes(relatedCategorySlug) ||
        Array.from(cardLabels).some((label) => label.textContent.trim() === relatedCategoryLabel);
      const isCurrentEvent = relatedCurrentTitle && cardTitle === relatedCurrentTitle;

      if (!matchesCategory || isCurrentEvent) {
        card.remove();
        return;
      }

      cardLabels.forEach((label) => {
        if (label.textContent.trim() !== relatedCategoryLabel) {
          label.remove();
        }
      });
    });

    if (!relatedEventsSection.querySelector("[data-event-card]")) {
      relatedEventsSection.hidden = true;
    }
  }

  eventArchiveCards.forEach((card) => {
    if (!card.isConnected) {
      return;
    }
    const media = card.querySelector(".archive-event-card__media");

    if (!media) {
      return;
    }

    const categoryLabels = media.querySelectorAll(":scope > span");

    if (categoryLabels.length && !media.querySelector(".archive-event-card__labels")) {
      const labelWrap = document.createElement("div");
      labelWrap.className = "archive-event-card__labels";
      categoryLabels[0].before(labelWrap);
      categoryLabels.forEach((label) => labelWrap.append(label));
    }

    if (card.querySelector(".archive-event-card__accessibility")) {
      return;
    }

    const list = createEventAccessibilityList(card);
    const body = card.querySelector(".archive-event-card__body");
    const link = card.querySelector("a");

    if (body) {
      body.append(list);
    } else if (link) {
      link.append(list);
    }
  });

  document.querySelectorAll(".event-detail-card").forEach((card) => {
    const meta = card.querySelector(".event-detail-meta");

    if (!meta || card.querySelector(".archive-event-card__accessibility")) {
      return;
    }

    meta.insertAdjacentElement("afterend", createEventAccessibilityList(card));
  });

  navItemsWithSubmenu.forEach((item) => {
    item.classList.add("site-nav__item--has-submenu");

    if (item.querySelector(".site-nav__mega-menu")) {
      item.classList.add("site-nav__item--mega");
    }
  });

  // Nav submenu — click to open/close, click outside to close.
  const allSubmenuItems = document.querySelectorAll(".site-nav__item--has-submenu");

  allSubmenuItems.forEach((item) => {
    const trigger = item.querySelector(".site-nav__link");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      const isOpen = item.classList.contains("is-open");
      // Close all
      allSubmenuItems.forEach((other) => other.classList.remove("is-open"));
      // Toggle this one
      if (!isOpen) {
        item.classList.add("is-open");
        e.stopPropagation();
      }
    });
  });

  document.addEventListener("click", () => {
    allSubmenuItems.forEach((item) => item.classList.remove("is-open"));
  });

  if (mobileMenu) {
    const desktopItems = document.querySelectorAll(".site-nav .site-nav__item");
    const mobileNav = mobileMenu.querySelector(".mobile-menu__nav");

    if (desktopItems.length && mobileNav) {
      mobileNav.innerHTML = "";

      desktopItems.forEach((item) => {
        const mainLink = item.querySelector(".site-nav__link");
        const submenuLinks = item.querySelectorAll(".site-nav__submenu a");

        if (!mainLink) {
          return;
        }

        const group = document.createElement("div");
        group.className = "mobile-menu__group";

        const title = document.createElement("a");
        title.className = "mobile-menu__title";
        title.href = mainLink.getAttribute("href") || "#";
        title.textContent = mainLink.textContent;
        if (mainLink.hasAttribute("aria-current")) {
          title.setAttribute("aria-current", mainLink.getAttribute("aria-current"));
        }
        group.append(title);

        if (submenuLinks.length) {
          const list = document.createElement("div");
          list.className = "mobile-menu__subnav";

          submenuLinks.forEach((link) => {
            const subLink = document.createElement("a");
            subLink.href = link.getAttribute("href") || "#";
            subLink.textContent = link.textContent;
            list.append(subLink);
          });

          group.append(list);
        }

        mobileNav.append(group);
      });

    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      const nextState = !isOpen;
      menuToggle.setAttribute("aria-expanded", String(nextState));
      mobileMenu.classList.toggle("is-open", nextState);
      header?.classList.toggle("is-menu-open", nextState);
      document.documentElement.classList.toggle("is-mobile-menu-open", nextState);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
        header?.classList.remove("is-menu-open");
        document.documentElement.classList.remove("is-mobile-menu-open");
      });
    });
  }

  if (header) {
    const setHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  eventCategoryWraps.forEach((wrap) => {
    const rail = wrap.querySelector("[data-category-rail]");
    const nextButton = wrap.querySelector("[data-category-next]");
    const prevButton = wrap.querySelector("[data-category-prev]");

    if (!rail) {
      return;
    }

    let scrollSettleTimer = null;

    const updateCategoryArrows = () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      const canScrollLeft = rail.scrollLeft > 2;
      const canScrollRight = maxScrollLeft > 2 && rail.scrollLeft < maxScrollLeft - 2;

      wrap.classList.toggle("has-prev", canScrollLeft);

      if (prevButton) prevButton.hidden = !canScrollLeft;
      if (nextButton) nextButton.hidden = !canScrollRight;
    };

    const scheduleUpdate = () => {
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(updateCategoryArrows, 300);
    };

    prevButton?.addEventListener("click", () => {
      rail.scrollTo({
        left: Math.max(0, rail.scrollLeft - rail.clientWidth * 0.72),
        behavior: "smooth",
      });
      scheduleUpdate();
    });

    nextButton?.addEventListener("click", () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      rail.scrollTo({
        left: Math.min(rail.scrollLeft + rail.clientWidth * 0.72, maxScrollLeft),
        behavior: "smooth",
      });
      scheduleUpdate();
    });

    rail.addEventListener("scroll", updateCategoryArrows, { passive: true });
    window.addEventListener("resize", updateCategoryArrows);
    requestAnimationFrame(updateCategoryArrows);
  });

  accordionTriggers.forEach((trigger) => {
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    const accordion = trigger.closest(".events-panel, .info-panel");

    if (!panel || !accordion) {
      return;
    }

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      const updateAccordion = () => {
        accordionTriggers.forEach((otherTrigger) => {
          if (otherTrigger === trigger) {
            return;
          }

          const otherPanelId = otherTrigger.getAttribute("aria-controls");
          const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
          const otherAccordion = otherTrigger.closest(".events-panel, .info-panel");

          otherTrigger.setAttribute("aria-expanded", "false");
          otherPanel?.setAttribute("hidden", "");
          otherAccordion?.classList.remove("is-open");
        });

        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;
        accordion.classList.toggle("is-open", !isOpen);
      };

      if (document.startViewTransition) {
        document.startViewTransition(updateAccordion);
      } else {
        updateAccordion();
      }
    });
  });

  if (hoverPreview && hoverPreviewImage && canHover) {
    const movePreview = (clientX, clientY) => {
      const previewWidth = hoverPreview.offsetWidth || 360;
      const previewHeight = hoverPreview.offsetHeight || 280;
      const x = Math.min(clientX + 28, window.innerWidth - previewWidth - 24);
      const y = Math.min(Math.max(clientY - previewHeight * 0.45, 24), window.innerHeight - previewHeight - 24);

      hoverPreview.style.setProperty("--preview-x", `${x}px`);
      hoverPreview.style.setProperty("--preview-y", `${y}px`);
    };

    const showPreview = (trigger, event) => {
      if (trigger.getAttribute("aria-expanded") === "true") {
        hidePreview();
        return;
      }

      const assetKey = trigger.getAttribute("data-preview-asset");
      const source = assetKey ? document.querySelector(`[data-asset="${assetKey}"]`) : null;
      const sourceUrl = source?.getAttribute("src");

      if (!sourceUrl) {
        return;
      }

      hoverPreviewImage.setAttribute("src", sourceUrl);

      if (event instanceof MouseEvent) {
        movePreview(event.clientX, event.clientY);
      } else {
        const rect = trigger.getBoundingClientRect();
        movePreview(rect.right + 20, rect.top + rect.height * 0.5);
      }

      hoverPreview.classList.add("is-visible");
    };

    const hidePreview = () => {
      hoverPreview.classList.remove("is-visible");
      hoverPreviewImage.removeAttribute("src");
    };

    accordionTriggers.forEach((trigger) => {
      trigger.addEventListener("mouseenter", (event) => showPreview(trigger, event));
      trigger.addEventListener("mousemove", (event) => {
        if (trigger.getAttribute("aria-expanded") === "true") {
          hidePreview();
          return;
        }

        movePreview(event.clientX, event.clientY);
      });
      trigger.addEventListener("mouseleave", hidePreview);
      trigger.addEventListener("focus", (event) => showPreview(trigger, event));
      trigger.addEventListener("blur", hidePreview);
      trigger.addEventListener("click", () => {
        window.requestAnimationFrame(hidePreview);
      });
    });
  }

  eventsCarousels.forEach((carousel) => {
    const rail = carousel.querySelector("[data-events-rail]");
    const prevButton = carousel.querySelector("[data-events-prev]");
    const nextButton = carousel.querySelector("[data-events-next]");

    if (!rail || !prevButton || !nextButton) {
      return;
    }

    const originalCards = Array.from(rail.children);

    if (originalCards.length < 2) {
      return;
    }

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a, button, input, select, textarea").forEach((element) => {
        element.setAttribute("tabindex", "-1");
      });
      rail.append(clone);
    });

    let offset = 0;
    const getLoopWidth = () => rail.scrollWidth / 2;
    const getStep = () => {
      const firstCard = rail.querySelector(".archive-event-card");
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 320;
      const parsedGap = Number.parseFloat(window.getComputedStyle(rail).columnGap || "0");
      const gap = Number.isFinite(parsedGap) ? parsedGap : 0;

      return cardWidth + gap;
    };
    const renderOffset = () => {
      const loopWidth = getLoopWidth();

      if (loopWidth <= 0) {
        return;
      }

      offset = ((offset % loopWidth) + loopWidth) % loopWidth;
      rail.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };
    const scrollByStep = (direction) => {
      offset += direction * getStep();
      renderOffset();
    };

    let isPaused = false;
    let frameId = null;
    let lastTimestamp = null;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (timestamp) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isPaused) {
        offset += delta * 0.035;
        renderOffset();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    prevButton.addEventListener("click", () => {
      scrollByStep(-1);
    });
    nextButton.addEventListener("click", () => {
      scrollByStep(1);
    });
    carousel.addEventListener("mouseenter", () => {
      isPaused = true;
    });
    carousel.addEventListener("mouseleave", () => {
      isPaused = false;
    });
    carousel.addEventListener("focusin", () => {
      isPaused = true;
    });
    carousel.addEventListener("focusout", () => {
      isPaused = false;
    });

    if (!prefersReducedMotion && !carousel.hasAttribute("data-no-autoscroll")) {
      frameId = window.requestAnimationFrame(tick);
    }

    window.addEventListener("pagehide", () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    });
  });

  attractionSliders.forEach((slider) => {
    const dataElement = slider.querySelector("[data-attractions-data]");
    const image = slider.querySelector("[data-attraction-image]");
    const copy = slider.querySelector("[data-attraction-copy]");
    const link = slider.querySelector("[data-attraction-link]");
    const tabs = Array.from(slider.querySelectorAll("[data-attraction-tab]"));
    const prevButton = slider.querySelector("[data-attraction-prev]");
    const nextButton = slider.querySelector("[data-attraction-next]");

    if (!dataElement || !image || !copy || !link || !tabs.length) {
      return;
    }

    let items = [];

    try {
      items = JSON.parse(dataElement.textContent || "[]");
    } catch {
      items = [];
    }

    if (!items.length) {
      return;
    }

    let activeIndex = 0;

    const getAssetSource = (assetKey) => {
      const source = assetKey ? document.querySelector(`[data-asset="${assetKey}"]`) : null;
      return source?.getAttribute("src") || image.getAttribute("src") || "";
    };

    const renderAttraction = () => {
      const item = items[activeIndex];

      tabs.forEach((tab, index) => {
        tab.setAttribute("aria-selected", String(index === activeIndex));
      });

      image.classList.remove("is-ready");

      window.requestAnimationFrame(() => {
        image.setAttribute("src", getAssetSource(item.asset));
        image.setAttribute("alt", item.alt || "");
        copy.textContent = item.copy || "";
        link.setAttribute("href", item.url || "#");
        window.requestAnimationFrame(() => image.classList.add("is-ready"));
      });
    };

    const setActiveIndex = (nextIndex) => {
      activeIndex = (nextIndex + items.length) % items.length;
      renderAttraction();
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const nextIndex = Number(tab.getAttribute("data-index"));

        if (Number.isFinite(nextIndex)) {
          setActiveIndex(nextIndex);
        }
      });
    });

    prevButton?.addEventListener("click", () => setActiveIndex(activeIndex - 1));
    nextButton?.addEventListener("click", () => setActiveIndex(activeIndex + 1));
    image.classList.add("is-ready");
  });

  homeNewsTabs.forEach((section) => {
    const tabButtons = Array.from(section.querySelectorAll("[data-home-news-tab]"));
    const panels = Array.from(section.querySelectorAll("[data-home-news-panel]"));

    if (!tabButtons.length || !panels.length) {
      return;
    }

    const activateTab = (activeTab) => {
      const activePanelId = activeTab.getAttribute("aria-controls");

      tabButtons.forEach((tab) => {
        const isActive = tab === activeTab;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== activePanelId;
      });
    };

    tabButtons.forEach((tab, index) => {
      tab.setAttribute("tabindex", tab.classList.contains("is-active") ? "0" : "-1");

      tab.addEventListener("click", () => {
        activateTab(tab);
      });

      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }

        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
        const nextTab = tabButtons[nextIndex];

        activateTab(nextTab);
        nextTab.focus();
      });
    });
  });

  if (filterToggle) {
    const filterRoot = filterToggle.closest(".events-filter");
    const desktopFilter = window.matchMedia("(min-width: 1101px)");

    const setFilterOpen = (open) => {
      filterToggle.setAttribute("aria-expanded", String(open));
      filterToggle.setAttribute("aria-label", open ? "Suskleisti filtravimą" : "Atverti filtravimą");
      filterRoot?.classList.toggle("is-open", open);
    };

    setFilterOpen(desktopFilter.matches);

    desktopFilter.addEventListener("change", (event) => {
      setFilterOpen(event.matches);
    });

    filterToggle.addEventListener("click", () => {
      const isOpen = filterToggle.getAttribute("aria-expanded") === "true";

      setFilterOpen(!isOpen);
    });
  }

  datePickers.forEach((datePicker) => {
    const trigger = datePicker.querySelector("[data-date-trigger]");
    const calendar = datePicker.querySelector("[data-date-calendar]");
    const grid = datePicker.querySelector("[data-date-grid]");
    const label = datePicker.querySelector("[data-date-label]");
    const valueInput = datePicker.querySelector("[data-date-value]");
    const monthLabel = datePicker.querySelector("[data-date-month]");
    const prevButton = datePicker.querySelector("[data-date-prev]");
    const nextButton = datePicker.querySelector("[data-date-next]");
    const clearButton = datePicker.querySelector("[data-date-clear]");
    const todayButton = datePicker.querySelector("[data-date-today]");

    if (!trigger || !calendar || !grid || !label || !valueInput || !monthLabel) {
      return;
    }

    const monthNames = [
      "sausis",
      "vasaris",
      "kovas",
      "balandis",
      "gegužė",
      "birželis",
      "liepa",
      "rugpjūtis",
      "rugsėjis",
      "spalis",
      "lapkritis",
      "gruodis",
    ];
    const today = new Date();
    const pad = (number) => String(number).padStart(2, "0");
    const toIsoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const toDisplayDate = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const parseIsoDate = (value) => {
      if (!value) {
        return null;
      }

      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    let selectedDate = parseIsoDate(valueInput.value);
    let visibleDate = selectedDate ? new Date(selectedDate) : new Date(today);

    const closeCalendar = () => {
      calendar.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };

    const openCalendar = () => {
      calendar.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    };

    const updateLabel = () => {
      label.textContent = selectedDate ? toDisplayDate(selectedDate) : "Pasirinkite datą";
      valueInput.value = selectedDate ? toIsoDate(selectedDate) : "";
    };

    const renderCalendar = () => {
      const year = visibleDate.getFullYear();
      const month = visibleDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const startDate = new Date(year, month, 1 - startOffset);

      monthLabel.textContent = `${monthNames[month]} ${year}`;
      grid.innerHTML = "";

      for (let index = 0; index < 42; index += 1) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + index);

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.className = "date-calendar__day";
        dayButton.textContent = String(dayDate.getDate());
        dayButton.setAttribute("role", "gridcell");
        dayButton.setAttribute("aria-label", toDisplayDate(dayDate));

        if (dayDate.getMonth() !== month) {
          dayButton.classList.add("is-muted");
        }

        if (toIsoDate(dayDate) === toIsoDate(today)) {
          dayButton.classList.add("is-today");
        }

        if (selectedDate && toIsoDate(dayDate) === toIsoDate(selectedDate)) {
          dayButton.classList.add("is-selected");
          dayButton.setAttribute("aria-selected", "true");
        }

        dayButton.addEventListener("click", () => {
          selectedDate = new Date(dayDate);
          visibleDate = new Date(dayDate);
          updateLabel();
          renderCalendar();
          closeCalendar();
        });

        grid.append(dayButton);
      }
    };

    trigger.addEventListener("click", () => {
      if (calendar.hidden) {
        openCalendar();
      } else {
        closeCalendar();
      }
    });

    prevButton?.addEventListener("click", () => {
      visibleDate.setMonth(visibleDate.getMonth() - 1);
      renderCalendar();
    });

    nextButton?.addEventListener("click", () => {
      visibleDate.setMonth(visibleDate.getMonth() + 1);
      renderCalendar();
    });

    clearButton?.addEventListener("click", () => {
      selectedDate = null;
      updateLabel();
      renderCalendar();
      closeCalendar();
    });

    todayButton?.addEventListener("click", () => {
      selectedDate = new Date(today);
      visibleDate = new Date(today);
      updateLabel();
      renderCalendar();
      closeCalendar();
    });

    document.addEventListener("click", (event) => {
      if (!datePicker.contains(event.target)) {
        closeCalendar();
      }
    });

    updateLabel();
    renderCalendar();
  });

  customSelects.forEach((select) => {
    const trigger = select.querySelector("[data-select-trigger]");
    const menu = select.querySelector("[data-select-menu]");
    const label = select.querySelector("[data-select-label]");
    const valueInput = select.querySelector("[data-select-value]");
    const options = select.querySelectorAll("[data-select-option]");

    if (!trigger || !menu || !label || !valueInput || !options.length) {
      return;
    }

    const closeSelect = () => {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };

    const openSelect = () => {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    };

    trigger.addEventListener("click", () => {
      if (menu.hidden) {
        openSelect();
      } else {
        closeSelect();
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        options.forEach((otherOption) => otherOption.setAttribute("aria-selected", "false"));
        option.setAttribute("aria-selected", "true");
        label.textContent = option.textContent.trim();
        valueInput.value = option.getAttribute("data-value") ?? "";
        closeSelect();
      });
    });

    document.addEventListener("click", (event) => {
      if (!select.contains(event.target)) {
        closeSelect();
      }
    });

    // URL parameter sync — opt-in via data-url-param on the hidden input
    const urlParam = valueInput.getAttribute("data-url-param");
    if (urlParam) {
      const initialValue = new URLSearchParams(location.search).get(urlParam);
      if (initialValue) {
        const matchingOption = [...options].find((o) => o.getAttribute("data-value") === initialValue);
        if (matchingOption) {
          options.forEach((o) => o.setAttribute("aria-selected", "false"));
          matchingOption.setAttribute("aria-selected", "true");
          label.textContent = matchingOption.textContent.trim();
          valueInput.value = initialValue;
        }
      }

      options.forEach((option) => {
        option.addEventListener("click", () => {
          const value = option.getAttribute("data-value") ?? "";
          const params = new URLSearchParams(location.search);
          if (value && value !== "all") {
            params.set(urlParam, value);
          } else {
            params.delete(urlParam);
          }
          const qs = params.toString();
          history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
        });
      });
    }
  });

  toggleChecks.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const isPressed = toggle.getAttribute("aria-pressed") === "true";
      toggle.setAttribute("aria-pressed", String(!isPressed));
    });
  });

  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const parentGroup = pill.closest(".filter-pills");
      const isStacked = parentGroup?.classList.contains("filter-pills--stacked");

      if (!isStacked) {
        parentGroup?.querySelectorAll(".filter-pill").forEach((otherPill) => {
          if (otherPill !== pill) {
            otherPill.classList.remove("is-active");
          }
        });
      }

      pill.classList.toggle("is-active");
    });
  });

  const filterForm = document.querySelector("[data-filter-body]");
  const filterResetButton = document.querySelector("[data-filter-reset]");
  const archiveEventCards = document.querySelectorAll(".events-grid [data-event-card]");
  let appliedFormFilters = null;

  const getFilterGroupPills = (form, legendLabel) => {
    const fieldset = [...form.querySelectorAll(".filter-group")].find(
      (group) => group.querySelector("legend")?.textContent.trim() === legendLabel,
    );

    return fieldset
      ? [...fieldset.querySelectorAll(".filter-pill.is-active")].map((pill) => pill.textContent.trim())
      : [];
  };

  const getFormFilterState = (form) => {
    const dateFieldset = form.querySelector(".filter-group");

    return {
      date: form.querySelector("[data-date-value]")?.value || "",
      datePill: dateFieldset?.querySelector(".filter-pill.is-active")?.textContent.trim() || "",
      audience: getFilterGroupPills(form, "Auditorija"),
      language: getFilterGroupPills(form, "Kalba"),
      accessibility: getFilterGroupPills(form, "Prieinamumas"),
    };
  };

  const hasFilterSelections = (form) => {
    const state = getFormFilterState(form);

    return Boolean(
      state.date ||
        state.datePill ||
        state.audience.length ||
        state.language.length ||
        state.accessibility.length,
    );
  };

  const updateFilterResetVisibility = (form) => {
    if (!filterResetButton) {
      return;
    }

    filterResetButton.hidden = !hasFilterSelections(form);
  };

  const toIsoDate = (date) => {
    const pad = (number) => String(number).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const getDatePillRange = (pillLabel) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (pillLabel === "Rytoj") {
      start.setDate(start.getDate() + 1);
      return { start, end: new Date(start) };
    }

    if (pillLabel === "Šią savaitę") {
      const end = new Date(start);
      const day = end.getDay() || 7;

      end.setDate(end.getDate() + (7 - day));
      return { start, end };
    }

    return { start, end: new Date(start) };
  };

  const matchesDateFilter = (cardDate, state) => {
    if (!cardDate) {
      return false;
    }

    if (state.datePill) {
      const { start, end } = getDatePillRange(state.datePill);

      return cardDate >= toIsoDate(start) && cardDate <= toIsoDate(end);
    }

    if (state.date) {
      return cardDate === state.date;
    }

    return true;
  };

  const matchesFormFilters = (card, state) => {
    const hasAnyFilter = Boolean(
      state.date ||
        state.datePill ||
        state.audience.length ||
        state.language.length ||
        state.accessibility.length,
    );

    if (!hasAnyFilter) {
      return true;
    }

    const cardDate = card.querySelector("time")?.getAttribute("datetime")?.slice(0, 10) || "";

    if ((state.date || state.datePill) && !matchesDateFilter(cardDate, state)) {
      return false;
    }

    if (state.language.length) {
      const cardLanguage = (card.dataset.eventLanguage || "lt").toUpperCase();
      const selectedLanguages = state.language.map((language) => language.toUpperCase());

      if (!selectedLanguages.includes(cardLanguage)) {
        return false;
      }
    }

    return true;
  };

  const getActiveEventCategory = () =>
    document.querySelector("[data-category-filter].is-active")?.getAttribute("data-category-filter") || "all";

  const matchesEventCategory = (card, category) => {
    const categories = card.getAttribute("data-category")?.split(" ") ?? [];

    return category === "all" || categories.includes(category ?? "");
  };

  const applyArchiveEventVisibility = () => {
    const category = getActiveEventCategory();

    archiveEventCards.forEach((card) => {
      const matchesCategory = matchesEventCategory(card, category);
      const matchesFilters = appliedFormFilters ? matchesFormFilters(card, appliedFormFilters) : true;

      card.classList.toggle("is-hidden", !(matchesCategory && matchesFilters));
    });
  };

  const clearFilterForm = (form) => {
    form.querySelector("[data-date-clear]")?.click();

    form.querySelectorAll(".filter-pill.is-active").forEach((pill) => pill.classList.remove("is-active"));
    appliedFormFilters = null;
    updateFilterResetVisibility(form);
    applyArchiveEventVisibility();
  };

  if (filterForm) {
    updateFilterResetVisibility(filterForm);

    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      appliedFormFilters = getFormFilterState(filterForm);
      applyArchiveEventVisibility();
    });

    filterForm.addEventListener("click", (event) => {
      const dateFieldset = filterForm.querySelector(".filter-group");

      if (event.target.closest(".date-calendar__day") || event.target.closest("[data-date-today]")) {
        dateFieldset?.querySelectorAll(".filter-pill.is-active").forEach((pill) => {
          pill.classList.remove("is-active");
        });
      }

      if (event.target.closest(".filter-pill") && event.target.closest(".filter-group") === dateFieldset) {
        filterForm.querySelector("[data-date-clear]")?.click();
      }

      if (
        event.target.closest(".filter-pill") ||
        event.target.closest("[data-select-option]") ||
        event.target.closest(".date-calendar__day") ||
        event.target.closest("[data-date-clear]") ||
        event.target.closest("[data-date-today]")
      ) {
        requestAnimationFrame(() => updateFilterResetVisibility(filterForm));
      }
    });

    filterResetButton?.addEventListener("click", () => {
      clearFilterForm(filterForm);
    });
  }

  if (eventCategoryFilters.length) {
    eventCategoryFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        eventCategoryFilters.forEach((otherFilter) => otherFilter.classList.remove("is-active"));
        filter.classList.add("is-active");

        if (archiveEventCards.length) {
          applyArchiveEventVisibility();
          return;
        }

        const category = filter.getAttribute("data-category-filter");

        eventArchiveCards.forEach((card) => {
          const categories = card.getAttribute("data-category")?.split(" ") ?? [];
          const shouldShow = category === "all" || categories.includes(category ?? "");

          card.classList.toggle("is-hidden", !shouldShow);
        });
      });
    });
  }

  const initGoogleMaps = () => {
    if (!window.google?.maps) {
      return;
    }

    googleMaps.forEach((mapElement) => {
      const canvas = mapElement.querySelector("[data-google-map-canvas]");
      const lat = Number(mapElement.getAttribute("data-map-lat"));
      const lng = Number(mapElement.getAttribute("data-map-lng"));
      const zoom = Number(mapElement.getAttribute("data-map-zoom") ?? 15);
      const title = mapElement.getAttribute("data-map-title") ?? "KlaipėdON";

      if (!canvas || Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
      }

      const center = { lat, lng };
      const map = new window.google.maps.Map(canvas, {
        center,
        zoom,
        styles: googleMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      });

      new window.google.maps.Marker({
        position: center,
        map,
        title,
      });

      mapElement.classList.add("is-loaded");
    });
  };

  window.initKlaipedonMaps = initGoogleMaps;

  if (googleMaps.length) {
    const apiKey = window.KLAIPEDON_GOOGLE_MAPS_API_KEY;

    if (window.google?.maps) {
      initGoogleMaps();
    } else if (apiKey && !document.querySelector("[data-klaipedon-google-maps-script]")) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initKlaipedonMaps`;
      script.async = true;
      script.defer = true;
      script.setAttribute("data-klaipedon-google-maps-script", "");
      document.head.append(script);
    }
  }

  if ("IntersectionObserver" in window) {
    revealTargets.forEach((target, index) => {
      target.classList.add("motion-reveal");
      target.setAttribute("data-reveal-delay", String(index % 4));
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08,
      },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  // Living card hover video
  const hoverVideoSrc = window.__livingCardHoverVideo;
  if (hoverVideoSrc) {
    document.querySelectorAll(".living-card").forEach((card) => {
      if (card.closest("[data-no-card-video]")) return;
      const img = card.querySelector(":scope > img");
      if (!img) return;

      const video = document.createElement("video");
      video.src = hoverVideoSrc;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.className = "living-card__hover-video";
      video.style.display = "none";
      img.after(video);

      card.addEventListener("mouseenter", () => {
        img.style.display = "none";
        video.style.display = "block";
        video.play();
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
        video.style.display = "none";
        img.style.display = "";
      });
    });
  }

}
