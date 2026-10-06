import { omnivaLockers } from "../data/shop-lockers.js";
import { clearCart, formatCartMoney, getCartLines, setCartQty } from "./shop-cart.js";
import { productUrl } from "./shop.js";

const draftKey = "klaipedon-checkout";
const orderKey = "klaipedon-order";
const paymentLabels = {
  banklink: "Per banką",
  "apple-pay": "Apple Pay",
  card: "Kortelė",
  paysera: "Paysera",
};

const deliveryFees = {
  omniva: 3,
  courier: 5,
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const contactRules = [
  ["email", "Įrašykite el. paštą.", (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Patikrinkite el. paštą."],
  ["phone", "Įrašykite telefoną.", (value) => value.replace(/\D/g, "").length >= 6, "Įrašykite visą numerį."],
  ["firstName", "Įrašykite vardą."],
  ["lastName", "Įrašykite pavardę."],
];

const addressRules = [
  ["address", "Įrašykite adresą."],
  ["city", "Įrašykite miestą."],
  ["postcode", "Įrašykite pašto kodą."],
];

const fold = (value) =>
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

const distanceKm = (from, locker) => {
  const rad = Math.PI / 180;
  const dLat = (locker.lat - from.lat) * rad;
  const dLng = (locker.lng - from.lng) * rad;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(from.lat * rad) * Math.cos(locker.lat * rad) * Math.sin(dLng / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const readDraft = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(draftKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeDraft = (form) => {
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    sessionStorage.setItem(draftKey, JSON.stringify(data));
  } catch {
    /* The draft is only a convenience while moving between pages. */
  }
};

export const initShopCheckout = () => {
  const root = document.querySelector("[data-shop-checkout]");

  if (!root) {
    return;
  }

  const form = root.querySelector("[data-checkout-form]");
  const layout = root.querySelector("[data-checkout-layout]");
  const empty = root.querySelector("[data-checkout-empty]");
  const summary = root.querySelector("[data-checkout-summary]");
  const summaryToggle = root.querySelector("[data-checkout-summary-toggle]");
  const lines = root.querySelector("[data-checkout-lines]");
  const linesToggle = root.querySelector("[data-checkout-lines-toggle]");
  const linesToggleLabel = linesToggle.querySelector("span");
  const result = root.querySelector("[data-checkout-result]");
  const couponInput = root.querySelector("[data-checkout-coupon-input]");
  const couponNote = root.querySelector("[data-checkout-coupon-note]");
  const lockerList = root.querySelector("[data-checkout-locker-list]");
  const lockerSearch = root.querySelector("[data-checkout-locker-search]");
  const lockerEmpty = root.querySelector("[data-checkout-locker-empty]");
  const lockerMore = root.querySelector("[data-checkout-locker-more]");
  const lockerNearNote = root.querySelector("[data-checkout-locker-near-note]");
  const lockerPanel = root.querySelector("[data-checkout-lockers]");
  const addressPanel = root.querySelector("[data-checkout-address]");
  const bankPanel = root.querySelector("[data-checkout-banks]");
  const deliveryLabel = root.querySelector("[data-checkout-delivery]");
  const mobileQuery = window.matchMedia("(max-width: 1100px)");
  const draft = readDraft();
  let showAllLockers = false;
  let nearest = null;
  let selectedLocker = draft.locker || "";
  let linesExpanded = false;

  for (const [name, value] of Object.entries(draft)) {
    if (name === "locker") {
      continue;
    }

    const field = form.elements.namedItem(name);

    if (field && "value" in field && value) {
      field.value = value;
    }
  }

  const deliveryMethod = () => form.elements.namedItem("delivery").value;

  const chosenLocker = () => omnivaLockers.find((locker) => locker.id === selectedLocker);

  const updateDeliveryLabel = () => {
    if (deliveryMethod() === "courier") {
      deliveryLabel.textContent = "Kurjeris į adresą";
      return;
    }

    const locker = chosenLocker();
    deliveryLabel.textContent = locker ? locker.name : "Omniva paštomatas";
  };

  const renderLockers = () => {
    const query = fold(lockerSearch.value.trim());
    let list = omnivaLockers.filter((locker) =>
      !query || fold(`${locker.name} ${locker.address} ${locker.city}`).includes(query));

    if (nearest && !query) {
      list = [...list].sort((left, right) => distanceKm(nearest, left) - distanceKm(nearest, right));
    }

    const visible = query || showAllLockers ? list : list.slice(0, 4);

    lockerList.innerHTML = visible.map((locker) => `
      <label class="checkout-locker">
        <input type="radio" name="locker" value="${escapeHtml(locker.id)}" ${locker.id === selectedLocker ? "checked" : ""} />
        <span>
          <span class="checkout-locker__name">${escapeHtml(locker.name)}</span>
          <span class="checkout-locker__meta">24/7 · ${escapeHtml(locker.address)}, ${escapeHtml(locker.city)}</span>
        </span>
      </label>
    `).join("");
    lockerEmpty.hidden = list.length > 0;
    lockerMore.hidden = Boolean(query) || list.length <= 4;
    lockerMore.textContent = showAllLockers ? "Rodyti mažiau" : "Rodyti daugiau paštomatų";
    lockerMore.setAttribute("aria-expanded", String(showAllLockers));
    updateDeliveryLabel();
  };

  const syncDelivery = () => {
    const courier = deliveryMethod() === "courier";
    lockerPanel.hidden = courier;
    addressPanel.hidden = !courier;
    updateDeliveryLabel();
    paintTotals();
  };

  const syncBanks = () => {
    bankPanel.hidden = form.elements.namedItem("payment").value !== "banklink";
  };

  const goodsTotal = () => getCartLines().reduce((sum, item) => sum + item.price * item.qty, 0);

  const ticketsOnly = () => {
    const items = getCartLines();
    return items.length > 0 && items.every((item) => item.kind === "experience");
  };

  const deliveryFee = () => (ticketsOnly() ? 0 : (deliveryFees[deliveryMethod()] ?? deliveryFees.omniva));

  const formatSummaryMoney = (value) => {
    const amount = Math.round(Number(value) * 100);
    const euros = Math.trunc(amount / 100);
    const cents = String(Math.abs(amount % 100)).padStart(2, "0");

    return `${euros},${cents} €`;
  };

  const paintTotals = () => {
    const goods = goodsTotal();
    const shipping = deliveryFee();

    root.querySelectorAll("[data-checkout-subtotal]").forEach((node) => {
      node.textContent = formatSummaryMoney(goods);
    });
    root.querySelectorAll("[data-checkout-shipping]").forEach((node) => {
      node.textContent = formatSummaryMoney(shipping);
    });
    root.querySelectorAll("[data-checkout-goods]").forEach((node) => {
      node.textContent = formatSummaryMoney(goods + shipping);
    });

    const items = getCartLines();
    const onlyTickets = ticketsOnly();
    const hasExperience = items.some((item) => item.kind === "experience");
    const deliverySection = root.querySelector("[data-checkout-delivery-section]");
    const shippingRow = root.querySelector("[data-checkout-shipping-row]");
    const contactNote = root.querySelector("[data-checkout-contact-note]");
    const experienceNote = root.querySelector("[data-checkout-experience-note]");

    if (deliverySection) {
      deliverySection.hidden = onlyTickets;
    }

    if (shippingRow) {
      shippingRow.hidden = onlyTickets;
    }

    if (contactNote) {
      contactNote.hidden = onlyTickets;
      contactNote.textContent = hasExperience
        ? "Sąskaitą atsiųsime šiuo el. paštu. Apie siuntą pranešime telefonu."
        : "Sąskaitą ir patvirtinimą atsiųsime šiuo el. paštu. Apie siuntą pranešime telefonu.";
    }

    if (experienceNote) {
      experienceNote.hidden = !hasExperience;
      experienceNote.textContent = onlyTickets
        ? "Ekskursijos patvirtinimą atsiųsime šiuo el. paštu. Kurjerio nereikia."
        : "Ekskursijos patvirtinimą atsiųsime šiuo el. paštu.";
    }
  };

  const paint = (focusSlug, focusQty, focusDate = "") => {
    const items = getCartLines();

    paintTotals();

    layout.hidden = items.length === 0;
    empty.hidden = items.length > 0;
    root.classList.toggle("is-empty", items.length === 0);

    lines.innerHTML = items.map((item) => `
      <article class="checkout__line">
        <a href="${productUrl(item.slug)}">${item.image ? `<img src="${escapeHtml(item.image)}" alt="" />` : ""}</a>
        <div>
          <a href="${productUrl(item.slug)}">${escapeHtml(item.title)}</a>
          ${item.dateLabel ? `<p class="checkout__date">${escapeHtml(item.dateLabel)}</p>` : ""}
          <p>${escapeHtml(item.priceLabel)}</p>
          <div class="shop-product__qty">
            <button type="button" data-checkout-qty="minus" data-checkout-slug="${escapeHtml(item.slug)}" data-checkout-date="${escapeHtml(item.date)}" aria-label="${item.qty <= 1 ? "Pašalinti" : "Mažinti kiekį"}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-checkout-qty="plus" data-checkout-slug="${escapeHtml(item.slug)}" data-checkout-date="${escapeHtml(item.date)}" aria-label="Didinti kiekį" ${item.qty >= 99 ? "disabled" : ""}>+</button>
          </div>
        </div>
        <p>${formatCartMoney(item.price * item.qty)}</p>
      </article>
    `).join("");

    const canCollapse = items.length > 1;
    const collapsed = canCollapse && !linesExpanded;
    const linesOpen = canCollapse && linesExpanded;

    lines.classList.toggle("is-collapsed", collapsed);
    linesToggle.hidden = !canCollapse;
    linesToggle.setAttribute("aria-expanded", String(linesOpen));
    linesToggleLabel.textContent = linesExpanded
      ? "Slėpti prekes"
      : `Rodyti visas prekes (${Math.max(0, items.length - 1)})`;

    if (focusSlug === undefined) {
      return;
    }

    const next = focusQty
      ? lines.querySelector(`[data-checkout-qty="${focusQty}"][data-checkout-slug="${CSS.escape(focusSlug)}"][data-checkout-date="${CSS.escape(focusDate)}"]`)
      : null;
    (next || empty.querySelector("a") || summaryToggle)?.focus();
  };

  const syncSummary = () => {
    summaryToggle.tabIndex = mobileQuery.matches ? 0 : -1;

    if (mobileQuery.matches) {
      return;
    }

    summary.classList.add("is-open");
    summaryToggle.setAttribute("aria-expanded", "true");
  };

  const showError = (name, message) => {
    const field = form.elements.namedItem(name);
    const error = document.getElementById(`${field?.id}-error`);

    field?.closest(".checkout__field")?.classList.toggle("is-invalid", Boolean(message));
    field?.setAttribute("aria-invalid", message ? "true" : "false");

    if (error) {
      error.hidden = !message;
      error.textContent = message || "";
    }
  };

  const validateFields = (rules, firstInvalid) => {
    for (const [name, emptyMessage, test, invalidMessage] of rules) {
      const value = String(form.elements.namedItem(name)?.value || "").trim();
      let message = "";

      if (!value) {
        message = emptyMessage;
      } else if (test && !test(value)) {
        message = invalidMessage;
      }

      showError(name, message);

      if (message && !firstInvalid) {
        firstInvalid = form.elements.namedItem(name);
      }
    }

    return firstInvalid;
  };

  const showNote = (id, message) => {
    const note = document.getElementById(id);
    note.hidden = !message;
    note.textContent = message || "";
    return note;
  };

  const validate = () => {
    let firstInvalid = null;
    const courier = deliveryMethod() === "courier";

    if (ticketsOnly()) {
      showNote("checkout-locker-error", "");
      addressRules.forEach(([name]) => showError(name, ""));
    } else if (!courier && !selectedLocker) {
      const note = showNote("checkout-locker-error", "Pasirinkite paštomatą.");
      firstInvalid = lockerSearch;
      note.scrollIntoView({ block: "nearest" });
    } else {
      showNote("checkout-locker-error", "");
    }

    if (!ticketsOnly() && courier) {
      firstInvalid = validateFields(addressRules, firstInvalid);
    } else if (!ticketsOnly()) {
      addressRules.forEach(([name]) => showError(name, ""));
    }

    firstInvalid = validateFields(contactRules, firstInvalid);

    if (form.elements.namedItem("payment").value === "banklink" && !form.elements.namedItem("bank").value) {
      const note = showNote("checkout-bank-error", "Pasirinkite banką.");
      if (!firstInvalid) {
        firstInvalid = bankPanel.querySelector("input");
      }
      note.scrollIntoView({ block: "nearest" });
    } else {
      showNote("checkout-bank-error", "");
    }

    return firstInvalid;
  };

  summaryToggle.addEventListener("click", () => {
    if (!mobileQuery.matches) {
      return;
    }

    const open = summary.classList.toggle("is-open");
    summaryToggle.setAttribute("aria-expanded", String(open));
  });

  if (mobileQuery.matches) {
    summary.classList.remove("is-open");
    summaryToggle.setAttribute("aria-expanded", "false");
  }

  mobileQuery.addEventListener("change", syncSummary);

  form.addEventListener("input", (event) => {
    if (event.target === lockerSearch) {
      showAllLockers = false;
      renderLockers();
    }

    writeDraft(form);
  });
  form.addEventListener("change", (event) => {
    if (event.target.name === "delivery") {
      syncDelivery();
    }

    if (event.target.name === "locker") {
      selectedLocker = event.target.value;
      updateDeliveryLabel();
      showNote("checkout-locker-error", "");
    }

    if (event.target.name === "payment") {
      syncBanks();
    }

    if (event.target.name === "bank") {
      showNote("checkout-bank-error", "");
    }

    writeDraft(form);
  });

  lockerMore.addEventListener("click", () => {
    showAllLockers = !showAllLockers;
    renderLockers();
  });

  root.querySelector("[data-checkout-locker-near]").addEventListener("click", () => {
    if (!navigator.geolocation) {
      lockerNearNote.hidden = false;
      lockerNearNote.textContent = "Čia vietos nenustatome. Ieškokite pagal miestą ar gatvę.";
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      nearest = { lat: position.coords.latitude, lng: position.coords.longitude };
      showAllLockers = false;
      lockerSearch.value = "";
      lockerNearNote.hidden = false;
      lockerNearNote.textContent = "Rodome artimiausius paštomatus.";
      renderLockers();
    }, () => {
      lockerNearNote.hidden = false;
      lockerNearNote.textContent = "Vietos negavome. Ieškokite pagal miestą ar gatvę.";
    });
  });

  lockerSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  linesToggle.addEventListener("click", () => {
    linesExpanded = !linesExpanded;
    paint();
  });

  lines.addEventListener("click", (event) => {
    const button = event.target.closest("[data-checkout-qty]");

    if (!button) {
      return;
    }

    const slug = button.getAttribute("data-checkout-slug");
    const date = button.getAttribute("data-checkout-date") || "";
    const current = getCartLines().find((item) => item.slug === slug && (item.date || "") === date)?.qty || 1;

    if (button.getAttribute("data-checkout-qty") === "plus" && current >= 99) {
      return;
    }

    const direction = button.getAttribute("data-checkout-qty");
    const next = current + (direction === "plus" ? 1 : -1);
    setCartQty(slug, next, date);
    paint(next > 0 ? slug : "", next > 0 ? direction : "", date);
  });

  root.querySelector("[data-checkout-coupon]").addEventListener("click", () => {
    const code = couponInput.value.trim();
    couponNote.hidden = false;
    couponNote.textContent = code ? "Tokio kodo neturime." : "Įrašykite kodą.";
  });

  couponInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      root.querySelector("[data-checkout-coupon]").click();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalid = validate();

    if (invalid) {
      result.hidden = true;
      invalid.focus();
      return;
    }

    const items = getCartLines();

    if (!items.length) {
      return;
    }

    const onlyTickets = ticketsOnly();
    const hasExperience = items.some((item) => item.kind === "experience");
    const courier = !onlyTickets && deliveryMethod() === "courier";
    const locker = chosenLocker();
    const paymentValue = form.elements.namedItem("payment").value;
    const method = paymentLabels[paymentValue] || "Paysera";
    const bank = String(form.elements.namedItem("bank").value || "").trim();
    const field = (name) => String(form.elements.namedItem(name)?.value || "").trim();
    const goods = goodsTotal();
    const shipping = deliveryFee();
    const order = {
      lines: items.map((item) => ({
        name: item.title,
        qty: item.qty,
        linePrice: item.price * item.qty,
        image: item.image || "",
        date: item.dateLabel || "",
      })),
      ticketsOnly: onlyTickets,
      hasExperience,
      reference: hasExperience ? `K${Date.now().toString(36).toUpperCase()}` : "",
      deliveryLabel: onlyTickets ? "" : (courier ? "Kurjeris į adresą" : "Omniva paštomatas"),
      deliveryPrice: shipping,
      goodsTotal: goods,
      grandTotal: goods + shipping,
      email: field("email"),
      firstName: field("firstName"),
      deliveryDetail: onlyTickets
        ? { name: "", address: "" }
        : courier
          ? { name: "", address: [field("address"), field("city"), field("postcode")].filter(Boolean).join(", ") }
          : { name: locker?.name || "", address: locker ? `${locker.address}, ${locker.city}` : "" },
      paymentLabel: method === "Per banką" && bank ? `${method}, ${bank}` : method,
    };

    try {
      sessionStorage.setItem(orderKey, JSON.stringify(order));
    } catch {
      result.hidden = false;
      result.textContent = "Nepavyko išsaugoti užsakymo. Bandykite dar kartą.";
      result.focus();
      return;
    }

    if (!clearCart()) {
      result.hidden = false;
      result.textContent = "Nepavyko išsaugoti užsakymo. Bandykite dar kartą.";
      result.focus();
      return;
    }

    result.hidden = true;
    window.location.assign("/el-parduotuve/aciu/");
  });

  window.addEventListener("klaipedon-cart", () => paint());
  renderLockers();
  syncDelivery();
  syncBanks();
  paint();
};
