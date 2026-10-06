import { shopProducts } from "../data/shop-products.js";
import { presentProduct, productUrl, renderCard } from "./shop.js";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const decodeSlug = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const sameSlug = (left, right) => decodeSlug(left) === decodeSlug(right);

const productSlug = () => {
  const slug = window.location.pathname.match(/^\/el-parduotuve\/([^/]+)\/?$/)?.[1];
  return slug && slug !== "preke" ? slug : "";
};

const families = [
  ["kuprine", "kuprine-2"],
  ["danes-krantine", "birzos-tilto-eskizas", "meridiano-eskizas", "dane-riverside", "evening", "zveju-2-paveikslas"],
  ["lipdukas-mazoji-lietuva-herbas", "lipdukas-mazoji-lietuva-veliava"],
  ["balti-marskineliai-su-neptuno-herbu", "marskineliai-klaipeda-2"],
  ["klaipeda-und-die-kurische-nehrung", "%d0%ba%d0%bb%d0%b0%d0%b9%d0%bf%d0%b5%d0%b4%d0%b0-%d0%b8-%d0%ba%d1%83%d1%80%d1%88%d1%81%d0%ba%d0%b0%d1%8f-%d0%ba%d0%be%d1%81%d0%b0"],
  ["gido-sistema", "nesiojama-garso-sistema"],
];

const catalogFacts = {
  "kepure-su-klaipedos-herbu": ["Spalvos: raudona, juoda"],
  "apyranke-klaipeda": ["Dydžiai: S, L"],
  "marskineliai-klaipeda-2": ["Dydis: S"],
  "balti-marskineliai-su-neptuno-herbu": ["Dydis: XXL"],
  "kojines-klaipeda": ["Dydis: 41–45"],
};

const crumbTitles = {
  "ekskursija-nuo-turbinos-iki-bravoro-unikalios-patirtys-klaipedos-elektrines-teritorijoje-liepos-23-d-18-00": "Nuo turbinos iki bravoro",
  "suvenyrine-vetrunge-su-klaipedos-miesto-simboliais": "Vėtrungė",
  "drobinis-maiseliai-tote-bags": "Maišeliai",
  "pliusiniai-meskinai": "Meškiukai",
  "linkejimai-nuo-juros-apyranke-su-gintarais": "Apyrankė su gintarais",
  "balti-marskineliai-su-neptuno-herbu": "Marškinėliai „Neptūnas“",
  "marskineliai-klaipeda-2": "Marškinėliai KLAIPĖDA",
  "k-demereckas-nemuno-delta-penkiu-simtmeciu-akimirka": "Nemuno delta",
  "keraminis-dubenelis-su-kojytemis": "Dubenėlis",
  "mini-keramikos-auskarai": "Auskarai",
  "klaipeda-und-die-kurische-nehrung": "Gidas vokiečių k.",
  "%d0%ba%d0%bb%d0%b0%d0%b9%d0%bf%d0%b5%d0%b4%d0%b0-%d0%b8-%d0%ba%d1%83%d1%80%d1%88%d1%81%d0%ba%d0%b0%d1%8f-%d0%ba%d0%be%d1%81%d0%b0": "Gidas rusų k.",
  kuprine: "Kuprinė",
  "kuprine-2": "Kuprinė",
  "nesiojama-garso-sistema": "Garso sistema",
  "lipdukas-mazoji-lietuva-herbas": "Lipdukas. Herbas",
  "lipdukas-mazoji-lietuva-veliava": "Lipdukas. Vėliava",
  "zveju-2-paveikslas": "Žvejų g. 2",
};

const consultantEmail = "tic@klaipedainfo.lt";

const places = {
  "danės g. 8": { lat: "55.714357", lng: "21.144193" },
};

const readSummary = (summary) => {
  const source = summary.trim();
  const mapUrl = source.match(/https?:\/\/\S+/)?.[0] ?? "";
  const location = source.match(/susitikimo vieta\s*[–—-]\s*([^,\n]+)/i)?.[1].trim() ?? "";
  const text = source
    .replace(/https?:\/\/\S+/g, "")
    .replace(/,?\s*susitikimo vieta\s*[–—-]\s*[^,\n]+/i, "")
    .replace(/\s+,/g, "")
    .replace(/\.,/g, ".")
    .replace(/[,\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();

  return { text, mapUrl, location };
};

const paragraphs = (text) => {
  const sentences = text.split(/(?<=\.)\s+(?=[A-ZĄČĘĖĮŠŲŪŽ„"])/u).filter(Boolean);

  if (sentences.length < 3) {
    return [text];
  }

  const groups = [];

  for (let index = 0; index < sentences.length; index += 2) {
    groups.push(sentences.slice(index, index + 2).join(" "));
  }

  return groups;
};

export const relatedProducts = (slug) => {
  const family = families.find((group) => group.some((entry) => sameSlug(entry, slug)));

  if (family) {
    return family
      .filter((entry) => !sameSlug(entry, slug))
      .map((entry) => shopProducts.find((product) => sameSlug(product.slug, entry)))
      .filter(Boolean);
  }

  const product = shopProducts.find((entry) => sameSlug(entry.slug, slug));

  if (!product?.categorySlug) {
    return [];
  }

  return shopProducts
    .filter((entry) => entry.categorySlug === product.categorySlug && !sameSlug(entry.slug, slug))
    .slice(0, 4);
};

const crumbTitle = (item) => {
  const named = Object.entries(crumbTitles).find(([slug]) => sameSlug(slug, item.slug))?.[1];

  if (named) {
    return named;
  }

  return item.title.replace(/^(?:Art print|Grafikos darbas)\s*\|\s*/i, "").trim();
};

const rentalRate = (summary) => summary.match(/Kaina\s*[–—-]\s*([^.]+)/i)?.[1].trim() ?? "";

const rentalBody = (text) => text
  .replace(/Dėl šio produkto nuomos bendrauti asmeniškai su Klaipėdos TIC konsultantu\.?/gi, "")
  .replace(/Kaina\s*[–—-]\s*[^.]+\.?/gi, "")
  .replace(/\s{2,}/g, " ")
  .trim();

const experienceRows = (item, details) => {
  const summary = item.summary || "";
  const duration = summary.match(/trukmė\s*[–—-]\s*([^.]*)/i)?.[1].trim() ?? "";
  const age = summary.match(/skirta asmenims\s+([^.]*)/i)?.[1].trim() ?? "";
  const styleCount = summary.match(/(\d+)\s+skirtingų stilių/i)?.[1];
  const included = /degustacija/i.test(summary) && /mini-kvizas/i.test(summary)
    ? `Alaus degustacija${styleCount ? ` (${styleCount} stiliai)` : ""} ir mini-kvizas`
    : "";
  const place = details.location
    ? details.mapUrl
      ? `<a href="${escapeHtml(details.mapUrl)}" target="_blank" rel="noreferrer">${escapeHtml(details.location)}</a>`
      : escapeHtml(details.location)
    : "";

  return [
    duration ? ["clock", "Trukmė", escapeHtml(duration)] : "",
    age ? ["users", "Skirta", escapeHtml(age.charAt(0).toUpperCase() + age.slice(1))] : "",
    included ? ["check", "Įskaičiuota", escapeHtml(included)] : "",
    place ? ["map-pin", "Vieta", place] : "",
  ].filter(Boolean);
};

const mapMarkup = (details) => {
  const coords = places[details.location.toLocaleLowerCase("lt")];

  if (!coords) {
    return "";
  }

  const label = `${details.location}, Klaipėda`;

  return `
    <div
      class="event-map shop-product__map"
      aria-label="${escapeHtml(label)} Google Maps žemėlapyje"
      data-google-map
      data-map-lat="${coords.lat}"
      data-map-lng="${coords.lng}"
      data-map-zoom="15"
      data-map-title="${escapeHtml(details.location)}"
    >
      <div class="event-map__canvas" data-google-map-canvas></div>
      <div class="event-map__fallback">
        <span class="event-map__pin">${escapeHtml(details.location)}</span>
        <p>${escapeHtml(label)}</p>
        <small>Google Maps įsijungs įdėjus API raktą.</small>
      </div>
    </div>
  `;
};

const quantityMarkup = () => `
  <div class="shop-product__qty">
    <button type="button" data-shop-qty="minus" aria-label="Mažinti kiekį">−</button>
    <span data-shop-qty-value aria-live="polite">1</span>
    <button type="button" data-shop-qty="plus" aria-label="Didinti kiekį">+</button>
  </div>
`;

const dateMarkup = (item) => {
  if (item.kind !== "experience" || !item.dates?.length) {
    return "";
  }

  const visibleCount = 5;
  const more = item.dates.length > visibleCount;

  return `
    <div class="shop-product__dates">
      <p>Data</p>
      <div role="radiogroup" aria-label="Ekskursijos data">
        ${item.dates.map((date, index) => `
          <label ${index >= visibleCount ? "hidden" : ""}>
            <input type="radio" name="experience-date" value="${escapeHtml(date.id)}" data-shop-date ${index === 0 ? "checked" : ""} />
            <span>${escapeHtml(date.label)}</span>
          </label>
        `).join("")}
      </div>
      ${more ? `<button type="button" data-shop-dates-more aria-expanded="false">Rodyti daugiau</button>` : ""}
    </div>
  `;
};

const actionMarkup = (item) => {
  if (item.kind === "rental") {
    const subject = encodeURIComponent(`Nuoma: ${item.title}`);
    return `<a class="event-detail-card__cta" href="mailto:${consultantEmail}?subject=${subject}">Rašyti konsultantui</a>`;
  }

  if (item.kind === "experience") {
    return `<button class="event-detail-card__cta" type="button" data-shop-add="${escapeHtml(item.slug)}">Registruotis</button>`;
  }

  return `<button class="event-detail-card__cta" type="button" data-shop-add="${escapeHtml(item.slug)}">Į krepšelį</button>`;
};

const shirtSizes = {
  "balti-marskineliai-su-neptuno-herbu": ["S", "M", "L", "XL", "XXL"],
};

const shirtColors = {
  "balti-marskineliai-su-neptuno-herbu": ["Balta", "Mėlyna", "Juoda"],
};

const shirtColorImages = {
  "balti-marskineliai-su-neptuno-herbu": {
    Balta: "/el-parduotuve/images/22339.png",
    Mėlyna: "/el-parduotuve/images/neptunas-marskineliai-melyna-demo.png",
    Juoda: "/el-parduotuve/images/neptunas-marskineliai-juoda-demo.png",
  },
};

const choiceMarkup = (label, name, values, selected) => {
  const options = values.map((value) => `
    <label>
      <input type="radio" name="${name}" value="${escapeHtml(value)}" ${value === selected ? "checked" : ""} />
      ${escapeHtml(value)}
    </label>
  `).join("");

  return `<div class="shop-product__variants"><p>${escapeHtml(label)}</p><div role="radiogroup" aria-label="${escapeHtml(label)}">${options}</div></div>`;
};

const shirtSizeMarkup = (item) => {
  const sizes = Object.entries(shirtSizes).find(([slug]) => sameSlug(slug, item.slug))?.[1];

  if (!sizes?.length) {
    return "";
  }

  const selected = sizes.includes("M") ? "M" : sizes[Math.floor((sizes.length - 1) / 2)];

  return choiceMarkup("Dydis", "shirt-size", sizes, selected);
};

const shirtColorMarkup = (item) => {
  const colors = Object.entries(shirtColors).find(([slug]) => sameSlug(slug, item.slug))?.[1];

  if (!colors?.length) {
    return "";
  }

  const images = Object.entries(shirtColorImages).find(([slug]) => sameSlug(slug, item.slug))?.[1] || {};
  const selected = colors.includes("Balta") ? "Balta" : colors[0];
  const options = colors.map((color) => {
    const image = images[color] || item.image;

    return `
      <label class="shop-product__color">
        <input type="radio" name="shirt-color" value="${escapeHtml(color)}" data-shop-color-image="${escapeHtml(image)}" ${color === selected ? "checked" : ""} />
        <img src="${escapeHtml(image)}" alt="" />
        <span>${escapeHtml(color)}</span>
      </label>
    `;
  }).join("");

  return `<div class="shop-product__variants shop-product__colors"><p>Spalva</p><div role="radiogroup" aria-label="Spalva">${options}</div></div>`;
};

const shirtDetailMarkup = (item) => {
  if (!sameSlug(item.slug, "balti-marskineliai-su-neptuno-herbu")) {
    return "";
  }

  return `
    <div class="shop-product__detail">
      <button type="button" data-shop-detail aria-expanded="false" aria-controls="shop-shirt-detail">
        <span>Detali informacija</span>
        <i data-lucide="chevron-down"></i>
      </button>
      <div id="shop-shirt-detail" class="shop-product__detail-panel" hidden>
        <dl>
          <div>
            <dt>Audinys</dt>
            <dd>100 % medvilnė, apie 180 g/m². Audinys tankus, nelimpa prie kūno ir po skalbimo išlaiko formą.</dd>
          </div>
          <div>
            <dt>Kirpimas</dt>
            <dd>Tiesus kirpimas, apvali iškirptė, trumpos rankovės. Dydžiai nuo S iki XXL. Medvilnė po pirmo skalbimo šiek tiek susitraukia, todėl tarp dviejų dydžių geriau imti didesnį.</dd>
          </div>
          <div>
            <dt>Spauda</dt>
            <dd>Ant krūtinės – Neptūno krepšinio klubo herbas. Spauda plokščia. Spalvos: balta, mėlyna ir juoda, herbas ant visų vienodas.</dd>
          </div>
          <div>
            <dt>Priežiūra</dt>
            <dd>Skalbkite iki 30 °C, išvirkščiąja puse, be baliklio. Nedžiovinkite būgne. Lyginkite išvirkščiąja puse, ne per patį herbą.</dd>
          </div>
          <div>
            <dt>Kilmė</dt>
            <dd>Marškinėlius parduoda VšĮ Klaipėdos turizmo informacijos centras. Ant jų – Klaipėdos krepšinio klubo „Neptūnas“ herbas.</dd>
          </div>
        </dl>
      </div>
    </div>
  `;
};

const variantMarkup = (item) => {
  const family = families.find((group) => group.some((entry) => sameSlug(entry, "kuprine")) && group.some((entry) => sameSlug(entry, item.slug)));

  if (!family) {
    return "";
  }

  const options = family.map((slug) => {
    const product = shopProducts.find((entry) => sameSlug(entry.slug, slug));
    const label = (product?.displayName || product?.name || "").split("|").pop().trim();
    const current = sameSlug(slug, item.slug);

    if (current) {
      return `<span aria-current="true">${escapeHtml(label)}</span>`;
    }

    return `<a href="${productUrl(product.slug)}">${escapeHtml(label)}</a>`;
  }).join("");

  return `<div class="shop-product__variants"><p>Raštas</p><div role="group" aria-label="Kuprinės variantas">${options}</div></div>`;
};

const renderProductPage = (product) => {
  const item = presentProduct(product);
  const details = readSummary(item.summary || "");
  const body = item.kind === "rental" ? rentalBody(details.text) : details.text;
  const isLongCopy = body.length > 160;
  const sizeMarkup = shirtSizeMarkup(item);
  const colorMarkup = shirtColorMarkup(item);
  const facts = (catalogFacts[item.slug] || Object.entries(catalogFacts).find(([slug]) => sameSlug(slug, item.slug))?.[1] || [])
    .filter((fact) => !(sizeMarkup && /^dydis\b/i.test(fact)))
    .filter((fact) => !(colorMarkup && /^spalv/i.test(fact)));
  const noteRepeatsFact = facts.length > 0 && body.length < 48 && /dydis|spalv|dydž/i.test(body);
  const noteRepeatsSize = Boolean(sizeMarkup) && body.length < 48 && /^dydis\b/i.test(body);
  const noteRepeatsColor = Boolean(colorMarkup) && body.length < 48 && /^spalv/i.test(body);
  const showNote = item.kind === "goods" && !isLongCopy && body && !noteRepeatsFact && !noteRepeatsSize && !noteRepeatsColor;
  const rate = item.kind === "rental" ? rentalRate(item.summary || "") : "";
  const context = item.kind === "rental"
    ? `${rate ? `${rate}. ` : ""}Dėl nuomos parašykite Klaipėdos TIC konsultantui.`
    : "";
  const barNote = item.kind === "rental"
    ? [rate, "Rašykite konsultantui"].filter(Boolean).join(" · ")
    : item.kind === "experience"
      ? (item.dates?.length > 1 ? "Pasirinkite datą" : (item.dates?.[0]?.label || ""))
      : "";
  const rows = item.kind === "experience" ? experienceRows(item, details) : [];
  const related = relatedProducts(item.slug);
  const meta = rows.map(([icon, label, value]) => `
    <div>
      <dt><i data-lucide="${icon}"></i><span>${escapeHtml(label)}</span></dt>
      <dd>${value}</dd>
    </div>
  `).join("");

  document.title = `${item.title} | KlaipėdON`;

  return `
    <section class="event-detail-showcase shop-product shop-product--${item.kind}" data-wp-partial="template-parts/single-product/product-content.php">
      <nav class="shop-product__crumb" aria-label="Kelias">
        <ol>
          <li><a href="/el-parduotuve/">Parduotuvė</a></li>
          <li><a href="/el-parduotuve/?kategorija=${encodeURIComponent(item.categorySlug)}">${escapeHtml(item.category)}</a></li>
          <li aria-current="page">${escapeHtml(crumbTitle(item))}</li>
        </ol>
      </nav>
      <div class="event-detail-showcase__layout">
        <div class="event-detail-cover" data-acf-field="product_image">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />` : ""}
        </div>
        <aside class="event-detail-card shop-product__card">
          <p class="section-kicker" data-acf-field="product_category">${escapeHtml(item.category)}</p>
          <h1 data-acf-field="product_title">${escapeHtml(item.title)}</h1>
          <p class="shop-product__price" data-acf-field="product_price">${escapeHtml(item.priceLabel)}</p>
          ${context ? `<p class="shop-product__context">${escapeHtml(context)}</p>` : ""}
          ${facts.length ? `<p class="shop-product__facts">${facts.map((fact) => escapeHtml(fact)).join("<br>")}</p>` : ""}
          ${sizeMarkup}
          ${colorMarkup}
          ${variantMarkup(item)}
          ${dateMarkup(item)}
          ${meta ? `<dl class="event-detail-meta">${meta}</dl>` : ""}
          ${showNote ? `<p class="shop-product__note">${escapeHtml(body)}</p>` : ""}
          ${item.kind === "rental" && body && !isLongCopy ? `<p class="shop-product__note">${escapeHtml(body)}</p>` : ""}
          <div class="shop-product__buy">
            ${item.kind === "rental" ? "" : quantityMarkup()}
            ${actionMarkup(item)}
            ${item.kind === "experience" ? `<p class="shop-product__ticket">Bilietas yra užsakymo numeris. Gidas jį patikrins vietoje.</p>` : ""}
            ${item.kind === "goods" ? `
              <ul class="shop-product__assurances">
                <li><i data-lucide="truck"></i><span>Pristatome per 1–2 darbo dienas</span></li>
                <li><i data-lucide="shield-check"></i><span>Mokate saugiai</span></li>
              </ul>
            ` : ""}
          </div>
          <div class="event-detail-share" aria-label="Dalintis preke">
            <span>Dalintis</span>
            <a href="/" aria-label="Dalintis preke"><i data-lucide="share-2"></i></a>
            <a href="/" aria-label="Kopijuoti nuorodą"><i data-lucide="copy"></i></a>
          </div>
          ${shirtDetailMarkup(item)}
        </aside>
        ${isLongCopy ? `<article class="event-detail-copy" data-acf-field="product_description"><h2>${item.kind === "experience" ? "Apie ekskursiją" : item.kind === "rental" ? "Apie nuomą" : "Apie prekę"}</h2>${paragraphs(body).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</article>` : ""}
        ${item.kind === "experience" ? mapMarkup(details) : ""}
      </div>
    </section>
    ${related.length ? `
      <section class="related-events">
        <div class="related-events__header">
          <div>
            <p class="section-kicker">El. parduotuvė</p>
            <h2>Panašios prekės</h2>
          </div>
          <a href="/el-parduotuve/">Visos prekės <i data-lucide="chevron-right"></i></a>
        </div>
        <div class="events-grid">
          ${related.map((entry, index) => renderCard(entry, index)).join("")}
        </div>
      </section>
    ` : ""}
    <div class="shop-product__bar" data-shop-bar>
      <div class="shop-product__bar-copy">
        <p class="shop-product__price">${escapeHtml(item.priceLabel)}</p>
        ${barNote ? `<p class="shop-product__bar-note">${escapeHtml(barNote)}</p>` : ""}
      </div>
      <div class="shop-product__bar-actions">
        ${item.kind === "rental" ? "" : quantityMarkup()}
        ${actionMarkup(item)}
      </div>
    </div>
  `;
};

const renderMissing = () => `
  <section class="event-detail-showcase shop-product">
    <nav class="shop-product__crumb" aria-label="Kelias">
      <ol>
        <li><a href="/el-parduotuve/">Parduotuvė</a></li>
        <li aria-current="page">Tokios prekės nėra</li>
      </ol>
    </nav>
    <h1>Tokios prekės nėra</h1>
  </section>
`;

const bindPurchase = (root) => {
  const values = [...root.querySelectorAll("[data-shop-qty-value]")];

  if (!values.length) {
    return;
  }

  let quantity = 1;
  const paint = () => {
    values.forEach((node) => {
      node.textContent = String(quantity);
    });
    root.querySelectorAll("[data-shop-qty='minus']").forEach((button) => {
      button.disabled = quantity <= 1;
    });
  };

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shop-qty]");

    if (!button || button.disabled) {
      return;
    }

    quantity = Math.max(1, quantity + (button.getAttribute("data-shop-qty") === "plus" ? 1 : -1));
    paint();
  });

  paint();
};

const bindShirtColor = (root) => {
  const cover = root.querySelector(".event-detail-cover img");

  if (!cover || !root.querySelector("[data-shop-color-image]")) {
    return;
  }

  root.addEventListener("change", (event) => {
    const input = event.target.closest("[data-shop-color-image]");
    const next = input?.getAttribute("data-shop-color-image");

    if (next) {
      cover.src = next;
    }
  });
};

const bindShirtDetail = (root) => {
  const trigger = root.querySelector("[data-shop-detail]");
  const panel = trigger ? root.querySelector(`#${trigger.getAttribute("aria-controls")}`) : null;

  if (!trigger || !panel) {
    return;
  }

  trigger.addEventListener("click", () => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    trigger.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  });
};

const bindDates = (root) => {
  const more = root.querySelector("[data-shop-dates-more]");
  const labels = [...root.querySelectorAll(".shop-product__dates label")];

  if (!more || labels.length <= 5) {
    return;
  }

  const paint = (open) => {
    labels.forEach((label, index) => {
      const selected = label.querySelector("input")?.checked;
      label.hidden = !open && index >= 5 && !selected;
    });
    more.setAttribute("aria-expanded", String(open));
    more.textContent = open ? "Rodyti mažiau" : "Rodyti daugiau";
  };

  more.addEventListener("click", () => {
    paint(more.getAttribute("aria-expanded") !== "true");
  });
};

export const renderProduct = () => {
  const root = document.querySelector("[data-shop-product]");

  if (!root) {
    return;
  }

  const product = shopProducts.find((entry) => sameSlug(entry.slug, productSlug()));
  root.innerHTML = product ? renderProductPage(product) : renderMissing();
  bindPurchase(root);
  bindShirtColor(root);
  bindShirtDetail(root);
  bindDates(root);
};
