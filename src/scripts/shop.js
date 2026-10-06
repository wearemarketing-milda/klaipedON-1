import { shopProducts } from "../data/shop-products.js";

const priceFilters = {
  Nemokama: (price) => price === 0,
  "Iki 10 €": (price) => price > 0 && price <= 10,
  "10–30 €": (price) => price > 10 && price <= 30,
  "Nuo 30 €": (price) => price > 30,
};

const foldText = (value) =>
  value
    .toLocaleLowerCase("lt")
    .replaceAll("ą", "a")
    .replaceAll("č", "c")
    .replaceAll("ę", "e")
    .replaceAll("ė", "e")
    .replaceAll("į", "i")
    .replaceAll("š", "s")
    .replaceAll("ų", "u")
    .replaceAll("ū", "u")
    .replaceAll("ž", "z");

const dateCountLabel = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} data`;
  }

  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 12 || mod100 > 20)) {
    return `${count} datos`;
  }

  return `${count} datų`;
};

const productCountLabel = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} prekė`;
  }

  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 12 || mod100 > 20)) {
    return `${count} prekės`;
  }

  return `${count} prekių`;
};

export const productUrl = (slug) => `/el-parduotuve/${slug}/`;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const monthNames = "sausio|vasario|kovo|balandžio|gegužės|birželio|liepos|rugpjūčio|rugsėjo|spalio|lapkričio|gruodžio";
const experienceDate = new RegExp(`(${monthNames})\\s+(\\d{1,2})\\s*d\\.?(?:\\s*\\|\\s*(\\d{1,2})[.:](\\d{2}))?`, "i");

export const presentProduct = (product) => {
  const kind = product.categorySlug === "ekskursijos" ? "experience" : product.categorySlug === "nuoma" ? "rental" : "goods";
  let title = product.displayName || product.name;
  let dateLabel = "";
  let timeLabel = "";

  let dates = Array.isArray(product.dates)
    ? product.dates.filter((entry) => entry?.id && entry?.label).map((entry) => ({ id: String(entry.id), label: String(entry.label) }))
    : [];

  if (kind === "experience") {
    const match = title.match(experienceDate);

    if (match) {
      const month = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      dateLabel = `${month} ${match[2]} d.`;
      timeLabel = match[3] ? `${match[3].padStart(2, "0")}:${match[4]}` : "";
      title = title.slice(0, match.index).replace(/[\s|–—-]+$/u, "").trim();

      if (!dates.length) {
        dates = [{
          id: `${month}-${match[2]}-${timeLabel || "00"}`.toLocaleLowerCase("lt").replaceAll(" ", "-"),
          label: [dateLabel, timeLabel].filter(Boolean).join(", "),
        }];
      }
    }
  }

  return { ...product, title, kind, dates, dateLabel: dates[0]?.label || dateLabel, timeLabel };
};

export const renderCard = (product, order) => {
  const item = presentProduct(product);
  const dateCount = item.dates?.length || 0;
  const when = dateCount > 1 ? dateCountLabel(dateCount) : (item.dates?.[0]?.label || "");
  const meta = item.kind === "experience" && when
    ? `<dl class="shop-card__meta"><div><dt><i data-lucide="calendar-days"></i><span>Data</span></dt><dd>${escapeHtml(when)}</dd></div></dl>`
    : item.kind === "rental"
      ? `<p class="shop-card__kind">Nuoma</p>`
      : "";

  return `
  <article class="archive-event-card archive-event-card--product" data-shop-card data-category="${escapeHtml(item.categorySlug)}" data-price="${item.price}" data-title="${escapeHtml(item.title)}" data-order="${order}">
    <a href="${productUrl(item.slug)}">
      <div class="archive-event-card__media">
        ${item.kind === "rental" ? "" : `<span>${escapeHtml(item.category)}</span>`}
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />` : ""}
      </div>
      <div class="archive-event-card__body">
        <h2>${escapeHtml(item.title)}</h2>
        ${meta}
        <p class="shop-card__price">${escapeHtml(item.priceLabel)}</p>
      </div>
    </a>
    ${item.kind === "goods" ? `<button type="button" class="shop-card__cart" data-shop-add="${escapeHtml(item.slug)}" aria-label="Į krepšelį"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg><span class="shop-card__cart-count" hidden>0</span></button>` : ""}
  </article>
`;
};

export const renderShop = () => {
  const grid = document.querySelector("[data-shop-grid]");

  if (!grid) {
    return;
  }

  const header = document.querySelector("[data-site-header]");
  const syncStickyOffset = () => {
    if (!header) {
      return;
    }

    document.documentElement.style.setProperty("--shop-header-offset", `${header.offsetHeight}px`);
  };

  syncStickyOffset();
  window.addEventListener("resize", syncStickyOffset);

  const chips = [...document.querySelectorAll("[data-shop-category]")];
  const form = document.querySelector("[data-shop-filter]");
  const resetButton = document.querySelector("[data-shop-reset]");
  const emptyState = document.querySelector("[data-shop-empty]");
  const count = document.querySelector("[data-shop-count]");
  const sortSelect = document.querySelector("[data-shop-sort]");
  const searchInput = form?.querySelector("[data-shop-search]");
  const requestedCategory = new URLSearchParams(window.location.search).get("kategorija") || "all";
  let category = chips.some((chip) => chip.getAttribute("data-shop-category") === requestedCategory)
    ? requestedCategory
    : "all";
  let priceLabel = "";
  let sort = "default";

  grid.insertAdjacentHTML("afterbegin", shopProducts.map((product, index) => renderCard(product, index)).join(""));

  const searchQuery = () => foldText(searchInput?.value.trim() || "");

  const syncReset = () => {
    const hasPricePill = Boolean(form?.querySelector(".filter-pill.is-active"));

    if (resetButton) {
      resetButton.hidden = category === "all" && !priceLabel && !hasPricePill && !searchQuery();
    }
  };

  const sortCards = () => {
    const empty = grid.querySelector("[data-shop-empty]");
    const cards = [...grid.querySelectorAll("[data-shop-card]")];

    cards.sort((first, second) => {
      const order = Number(first.dataset.order) - Number(second.dataset.order);

      if (sort === "default") {
        return order;
      }

      if (sort.startsWith("name")) {
        const sortTitle = (value) => value.replace(/^[\s"'«»„“”]+/u, "");
        const difference = sortTitle(first.dataset.title).localeCompare(sortTitle(second.dataset.title), "lt", {
          sensitivity: "variant",
          ignorePunctuation: true,
        });
        return sort === "name-asc" ? difference || order : -difference || order;
      }

      const difference = Number(first.dataset.price) - Number(second.dataset.price);
      return sort === "price-asc" ? difference || order : -difference || order;
    });

    cards.forEach((card) => grid.insertBefore(card, empty));
  };

  const applyFilters = () => {
    let visible = 0;

    sortCards();

    const query = searchQuery();

    grid.querySelectorAll("[data-shop-card]").forEach((card) => {
      const cardCategory = card.getAttribute("data-category");
      const price = Number(card.getAttribute("data-price"));
      const matchesCategory = category === "all" || cardCategory === category;
      const matchesPrice = !priceLabel || priceFilters[priceLabel]?.(price);
      const matchesQuery = !query || foldText(card.getAttribute("data-title") || "").includes(query);
      const show = matchesCategory && matchesPrice && matchesQuery;

      card.classList.toggle("is-hidden", !show);

      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = productCountLabel(visible);
    }

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }

    syncReset();
  };

  const writeCategoryUrl = () => {
    const url = new URL(window.location.href);

    if (category === "all") {
      url.searchParams.delete("kategorija");
    } else {
      url.searchParams.set("kategorija", category);
    }

    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (next !== current) {
      window.history.replaceState(null, "", next);
    }
  };

  chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.getAttribute("data-shop-category") === category);
    chip.addEventListener("click", () => {
      chips.forEach((otherChip) => otherChip.classList.remove("is-active"));
      chip.classList.add("is-active");
      category = chip.getAttribute("data-shop-category") || "all";
      writeCategoryUrl();
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    priceLabel = form.querySelector(".filter-pill.is-active")?.textContent.trim() || "";
    applyFilters();
  });

  sortSelect?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-select-option]");

    if (!option) {
      return;
    }

    sort = option.getAttribute("data-value") || "default";
    applyFilters();
  });

  form?.addEventListener("click", (event) => {
    if (event.target.closest(".filter-pill")) {
      requestAnimationFrame(syncReset);
    }
  });

  resetButton?.addEventListener("click", () => {
    form?.querySelectorAll(".filter-pill.is-active").forEach((pill) => pill.classList.remove("is-active"));
    chips.forEach((chip) => {
      chip.classList.toggle("is-active", chip.getAttribute("data-shop-category") === "all");
    });
    category = "all";
    priceLabel = "";
    writeCategoryUrl();

    if (searchInput) {
      searchInput.value = "";
    }

    applyFilters();
  });

  applyFilters();
};
