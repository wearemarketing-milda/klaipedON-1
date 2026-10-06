import { shopProducts } from "../data/shop-products.js";
import { relatedProducts } from "./shop-product.js";
import { presentProduct, productUrl } from "./shop.js";

const storageKey = "klaipedon-shop-cart";

const bagIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <path d="M3 6h18"></path>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
`;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const countLabel = (count) => {
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

const money = (value) => {
  const amount = Math.round(Number(value) * 100);
  const euros = Math.trunc(amount / 100);
  const cents = Math.abs(amount % 100);

  return cents ? `${euros},${String(cents).padStart(2, "0")} €` : `${euros} €`;
};

const loadCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.slug && item.qty > 0).map((item) => ({ slug: String(item.slug), qty: Math.min(99, Number(item.qty) || 1) }))
      : [];
  } catch {
    return [];
  }
};

let memory = loadCart();

const readCart = () => memory;

const writeCart = (items) => {
  memory = items;

  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    memory = items;
  }

  window.dispatchEvent(new CustomEvent("klaipedon-cart"));
};

const productFor = (slug) => shopProducts.find((entry) => entry.slug === slug);

const slugKey = (slug) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

const shortTitle = (item) => {
  const title = item.title.replace(/^(?:Art print|Grafikos darbas)\s*\|\s*/i, "").trim();
  return title || item.title;
};

const suggestionsFor = (items) => {
  const taken = new Set(items.map((item) => slugKey(item.slug)));
  const picks = [];

  for (const item of items) {
    for (const sibling of relatedProducts(item.slug)) {
      const suggestion = presentProduct(sibling);
      const key = slugKey(suggestion.slug);

      if (suggestion.kind !== "goods" || taken.has(key)) {
        continue;
      }

      taken.add(key);
      picks.push(suggestion);

      if (picks.length === 2) {
        return picks;
      }
    }
  }

  return picks;
};

const focusableInCart = () => [...panel.querySelectorAll("a[href], button:not([disabled])")]
  .filter((element) => element.getAttribute("tabindex") !== "-1" && !element.closest("[hidden]"));

const lines = () => readCart()
  .map((item) => {
    const product = productFor(item.slug);

    if (!product || presentProduct(product).kind !== "goods") {
      return null;
    }

    return { ...presentProduct(product), qty: item.qty };
  })
  .filter(Boolean);

const quantityFrom = (button) => {
  const scope = button.closest("[data-shop-product]");
  const value = scope?.querySelector("[data-shop-qty-value]")?.textContent;
  return Math.max(1, Math.min(99, Number(value) || 1));
};

let panel;
let toggle;
let lastFocus = null;

const setOpen = (open) => {
  if (!panel) {
    return;
  }

  panel.hidden = !open;
  document.documentElement.classList.toggle("is-shop-cart-open", open);

  if (open) {
    lastFocus = document.activeElement;
    panel.querySelector(".shop-cart__close")?.focus();
    return;
  }

  if (lastFocus instanceof HTMLElement) {
    lastFocus.focus();
  }
};

const paint = () => {
  const items = lines();
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  if (toggle) {
    const badge = toggle.querySelector("[data-shop-cart-count]");
    badge.hidden = count === 0;
    badge.textContent = String(count);
    toggle.setAttribute("aria-label", count ? `Krepšelis, ${countLabel(count)}` : "Krepšelis");
  }

  document.querySelectorAll(".shop-card__cart[data-shop-add]").forEach((button) => {
    const qty = items.find((item) => item.slug === button.getAttribute("data-shop-add"))?.qty || 0;
    const badge = button.querySelector(".shop-card__cart-count");
    button.classList.toggle("is-in-cart", qty > 0);
    button.setAttribute("aria-label", qty ? `Į krepšelį, ${countLabel(qty)}` : "Į krepšelį");

    if (badge) {
      badge.hidden = qty === 0;
      badge.textContent = String(qty);
    }
  });

  if (!panel) {
    return;
  }

  const body = panel.querySelector("[data-shop-cart-body]");
  const footer = panel.querySelector("[data-shop-cart-footer]");
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const suggestions = suggestionsFor(items);
  const upsell = suggestions.length
    ? `<div class="shop-cart__upsell">
        <h3 class="shop-cart__upsell-title">Panašios prekės</h3>
        ${suggestions.map((item) => `
          <article class="shop-cart__suggest">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" />` : ""}
            <div class="shop-cart__suggest-copy">
              <a href="${productUrl(item.slug)}">${escapeHtml(shortTitle(item))}</a>
              <p>${escapeHtml(item.priceLabel)}</p>
            </div>
            <button type="button" class="shop-cart__suggest-add" data-shop-add="${escapeHtml(item.slug)}" aria-label="Pridėti, ${escapeHtml(item.title)}">Pridėti</button>
          </article>
        `).join("")}
      </div>`
    : "";
  const scrollTop = body.scrollTop;

  body.innerHTML = items.length
    ? `${items.map((item) => `
      <article class="shop-cart__item">
        <a href="${productUrl(item.slug)}" aria-label="${escapeHtml(item.title)}">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" />` : ""}
        </a>
        <div class="shop-cart__copy">
          <a href="${productUrl(item.slug)}">${escapeHtml(item.title)}</a>
          <p>${escapeHtml(item.priceLabel)}</p>
          <div class="shop-product__qty">
            <button type="button" data-shop-cart-qty="minus" data-shop-cart-slug="${escapeHtml(item.slug)}" aria-label="${item.qty <= 1 ? "Pašalinti" : "Mažinti kiekį"}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-shop-cart-qty="plus" data-shop-cart-slug="${escapeHtml(item.slug)}" aria-label="Didinti kiekį" ${item.qty >= 99 ? "disabled" : ""}>+</button>
          </div>
        </div>
        <div class="shop-cart__side">
          <p>${money(item.price * item.qty)}</p>
          <button type="button" data-shop-cart-remove="${escapeHtml(item.slug)}">Pašalinti</button>
        </div>
      </article>
    `).join("")}${upsell}`
    : `<div class="shop-cart__empty"><p>Krepšelis tuščias.</p><a href="/el-parduotuve/" data-shop-cart-browse>Žiūrėti prekes</a></div>`;
  body.scrollTop = scrollTop;

  footer.hidden = items.length === 0;
  footer.querySelector("[data-shop-cart-total]").textContent = money(total);
};

const update = (slug, nextQty, focus) => {
  const items = readCart();
  const index = items.findIndex((item) => item.slug === slug);
  const qty = Math.min(99, nextQty);

  if (qty <= 0 && index >= 0) {
    items.splice(index, 1);
  } else if (index >= 0) {
    items[index] = { slug, qty };
  } else if (qty > 0) {
    items.push({ slug, qty });
  }

  writeCart(items);
  paint();

  if (focus) {
    const nextFocus = panel?.querySelector(`[data-shop-cart-qty="${focus}"][data-shop-cart-slug="${CSS.escape(slug)}"]`);
    (nextFocus || panel?.querySelector(".shop-cart__close"))?.focus();
  }
};

const addToCart = (slug, amount) => {
  const product = productFor(slug);

  if (!product || presentProduct(product).kind !== "goods") {
    return;
  }

  const current = readCart().find((item) => item.slug === slug)?.qty || 0;
  update(slug, current + amount);
  setOpen(true);
};

export const initShopCart = () => {
  const tools = document.querySelector(".site-header__tools");

  if (!tools || tools.querySelector("[data-shop-cart-toggle]")) {
    return;
  }

  toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "shop-cart__toggle";
  toggle.setAttribute("data-shop-cart-toggle", "");
  toggle.setAttribute("aria-label", "Krepšelis");
  toggle.innerHTML = `${bagIcon}<span class="shop-cart__count" data-shop-cart-count hidden>0</span>`;
  tools.insertBefore(toggle, tools.querySelector(".site-lang"));

  panel = document.createElement("div");
  panel.className = "shop-cart";
  panel.hidden = true;
  panel.innerHTML = `
    <button type="button" class="shop-cart__backdrop" data-shop-cart-close tabindex="-1" aria-label="Uždaryti krepšelį"></button>
    <div class="shop-cart__panel" role="dialog" aria-modal="true" aria-labelledby="shop-cart-title">
      <header class="shop-cart__header">
        <h2 id="shop-cart-title">Krepšelis</h2>
        <button type="button" class="shop-cart__close" data-shop-cart-close>Uždaryti</button>
      </header>
      <div class="shop-cart__body" data-shop-cart-body></div>
      <footer class="shop-cart__footer" data-shop-cart-footer hidden>
        <div class="shop-cart__total">
          <div class="shop-cart__sum">
            <span>Viso</span>
            <strong data-shop-cart-total>0 €</strong>
          </div>
          <p class="shop-cart__note">Kainos su PVM. Pristatymą ir nuolaidą rasite atsiskaitydami.</p>
        </div>
        <div class="shop-cart__actions">
          <a class="shop-cart__pay" href="/el-parduotuve/atsiskaitymas/">Sumokėti</a>
          <button type="button" class="shop-cart__continue" data-shop-cart-continue>Tęsti apsipirkimą</button>
        </div>
      </footer>
    </div>
  `;
  document.body.append(panel);

  toggle.addEventListener("click", () => setOpen(panel.hidden));

  panel.addEventListener("click", (event) => {
    const browse = event.target.closest("[data-shop-cart-browse]");

    if (browse && window.location.pathname.replace(/\/$/, "") === "/el-parduotuve") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    const pay = event.target.closest(".shop-cart__pay");

    if (pay && window.location.pathname.replace(/\/$/, "") === "/el-parduotuve/atsiskaitymas") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.target.closest("[data-shop-cart-continue]")) {
      if (toggle) {
        lastFocus = toggle;
      }

      setOpen(false);
      return;
    }

    if (event.target.closest("[data-shop-cart-close]")) {
      setOpen(false);
      return;
    }

    const qtyButton = event.target.closest("[data-shop-cart-qty]");

    if (qtyButton) {
      const slug = qtyButton.getAttribute("data-shop-cart-slug");
      const current = readCart().find((item) => item.slug === slug)?.qty || 1;
      const direction = qtyButton.getAttribute("data-shop-cart-qty");

      if (direction === "plus" && current >= 99) {
        return;
      }

      const next = current + (direction === "plus" ? 1 : -1);
      update(slug, next, next > 0 ? direction : null);
      return;
    }

    const remove = event.target.closest("[data-shop-cart-remove]");

    if (remove) {
      update(remove.getAttribute("data-shop-cart-remove"), 0);
    }
  });

  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-shop-add]");

    if (!add) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    addToCart(add.getAttribute("data-shop-add"), quantityFrom(add));
  });

  document.addEventListener("keydown", (event) => {
    if (!panel || panel.hidden) {
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const items = focusableInCart();

    if (!items.length) {
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!panel.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  paint();
};

export const formatCartMoney = money;
export const getCartLines = () => lines();
export const setCartQty = (slug, qty) => update(slug, qty);

export const clearCart = () => {
  try {
    localStorage.setItem(storageKey, "[]");
  } catch {
    return false;
  }

  memory = [];
  return true;
};
