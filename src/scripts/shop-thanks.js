import { formatCartMoney } from "./shop-cart.js";

const orderKey = "klaipedon-order";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatSummaryMoney = (value) => {
  const amount = Math.round(Number(value) * 100);
  const euros = Math.trunc(amount / 100);
  const cents = String(Math.abs(amount % 100)).padStart(2, "0");

  return `${euros},${cents} €`;
};

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
  const detail = order.deliveryDetail && typeof order.deliveryDetail === "object" ? order.deliveryDetail : {};

  if (title) {
    title.textContent = firstName ? `Ačiū, ${firstName}` : "Ačiū";
  }

  if (lead) {
    lead.textContent = email
      ? `Užsakymą gavome. Patvirtinimą atsiųstume į ${email}.`
      : "Užsakymą gavome.";
  }

  if (lines) {
    lines.innerHTML = order.lines.map((line) => `
      <article class="thanks__line">
        ${line.image ? `<img src="${escapeHtml(line.image)}" alt="" />` : "<span></span>"}
        <div>
          <p class="thanks__name">${escapeHtml(line.name)}</p>
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
    delivery.hidden = !name && !address;
    delivery.innerHTML = `
      ${name ? `<p class="thanks__place">${escapeHtml(name)}</p>` : ""}
      ${address ? `<p>${escapeHtml(address)}</p>` : ""}
    `;
  }

  if (payment) {
    payment.textContent = String(order.paymentLabel || "").trim();
    payment.hidden = !payment.textContent;
  }

  orderView.hidden = false;
};
