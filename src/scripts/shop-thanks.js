import { formatCartMoney } from "./shop-cart.js";
import { formatShopMoney } from "./shop.js";

const orderKey = "klaipedon-order";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatSummaryMoney = formatShopMoney;

const readOrder = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(orderKey) || "null");
    const lines = Array.isArray(parsed?.lines)
      ? parsed.lines.filter((line) => line && String(line.name || "").trim())
      : [];

    if (!lines.length) {
      return null;
    }

    return { ...parsed, lines };
  } catch {
    return null;
  }
};

export const initShopThanks = () => {
  const root = document.querySelector("[data-shop-thanks]");

  if (!root) {
    return;
  }

  const empty = root.querySelector("[data-thanks-empty]");
  const orderView = root.querySelector("[data-thanks-order]");
  const order = readOrder();

  if (!empty || !orderView) {
    return;
  }

  if (!order) {
    empty.hidden = false;
    return;
  }

  const firstName = String(order.firstName || "").trim();
  const email = String(order.email || "").trim();
  const title = root.querySelector("[data-thanks-title]");
  const lead = root.querySelector("[data-thanks-lead]");
  const lines = root.querySelector("[data-thanks-lines]");
  const subtotal = root.querySelector("[data-thanks-subtotal]");
  const shipping = root.querySelector("[data-thanks-shipping]");
  const shippingLabel = root.querySelector("[data-thanks-shipping-label]");
  const grand = root.querySelector("[data-thanks-grand]");
  const delivery = root.querySelector("[data-thanks-delivery]");
  const payment = root.querySelector("[data-thanks-payment]");
  const ticket = root.querySelector("[data-thanks-ticket]");
  const next = root.querySelector("[data-thanks-next]");
  const detail = order.deliveryDetail && typeof order.deliveryDetail === "object" ? order.deliveryDetail : {};

  if (title) {
    title.textContent = firstName ? `Ačiū, ${firstName}` : "Ačiū";
  }

  const hasExperience = order.hasExperience === true || Boolean(String(order.reference || "").trim());
  const onlyTickets = Boolean(order.ticketsOnly);

  if (lead) {
    lead.textContent = !onlyTickets && !hasExperience && email
      ? `Užsakymą gavome. Patvirtinimą atsiųsime į ${email}.`
      : "Užsakymą gavome.";
  }

  if (lines) {
    lines.innerHTML = order.lines.map((line) => `
      <article class="thanks__line">
        ${line.image ? `<img src="${escapeHtml(line.image)}" alt="" />` : "<span></span>"}
        <div>
          <p class="thanks__name">${escapeHtml(line.name)}</p>
          ${line.variant ? `<p class="shop-choice">${escapeHtml(line.variant)}</p>` : ""}
          ${line.date ? `<p>${escapeHtml(line.date)}</p>` : ""}
          <p>${Number(line.qty) || 1} vnt.</p>
        </div>
        <p>${formatCartMoney(line.linePrice)}</p>
      </article>
    `).join("");
  }

  if (subtotal) {
    subtotal.textContent = formatSummaryMoney(order.goodsTotal);
  }

  if (shippingLabel) {
    shippingLabel.textContent = order.deliveryLabel
      ? `Pristatymas · ${order.deliveryLabel}`
      : "Pristatymas";
    shippingLabel.closest("div").hidden = Boolean(order.ticketsOnly);
  }

  if (shipping) {
    shipping.textContent = formatSummaryMoney(order.deliveryPrice);
  }

  if (grand) {
    grand.textContent = formatSummaryMoney(order.grandTotal);
  }

  if (delivery) {
    const name = String(detail.name || "").trim();
    const address = String(detail.address || "").trim();
    const deliverySection = root.querySelector("[data-thanks-delivery-section]");
    delivery.hidden = !name && !address;
    delivery.innerHTML = `
      ${name ? `<p class="thanks__place">${escapeHtml(name)}</p>` : ""}
      ${address ? `<p>${escapeHtml(address)}</p>` : ""}
    `;

    if (deliverySection) {
      deliverySection.hidden = onlyTickets || (!name && !address);
    }
  }

  if (payment) {
    payment.textContent = String(order.paymentLabel || "").trim();
    payment.hidden = !payment.textContent;
  }

  if (ticket) {
    const reference = String(order.reference || "").trim();
    ticket.hidden = !reference;
    ticket.textContent = reference
      ? `Užsakymo numeris ${reference}. Jis ir yra bilietas. Gidas jį patikrins vietoje.`
      : "";
  }

  const experienceNote = root.querySelector("[data-thanks-experience]");
  const experienceLine = email
    ? `Ekskursijos patvirtinimą atsiųsime į ${email}.`
    : "Ekskursijos patvirtinimą atsiųsime el. paštu.";

  if (next) {
    next.hidden = onlyTickets;
    next.textContent = hasExperience && !onlyTickets
      ? `Siuntą paruošime ir pristatysime per 1–2 darbo dienas. ${experienceLine}`
      : "Siuntą paruošime ir pristatysime per 1–2 darbo dienas.";
  }

  if (experienceNote) {
    experienceNote.hidden = !onlyTickets;
    experienceNote.textContent = experienceLine;
  }

  orderView.hidden = false;
};
