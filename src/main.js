import "./styles.css";
import { createIcons, Accessibility, ArrowLeft, ArrowRight, Bike, Bus, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, CloudUpload, Copy, Filter, Globe, Languages, LayoutDashboard, Mail, MapPin, PawPrint, Phone, Route, Search, Send, Share2, Ship, SlidersHorizontal, Star, Ticket, TrainFront, Utensils, Users } from "lucide";
import { initSiteUI } from "./scripts/site-ui.js";
import cardHoverVideo from "./assets/Baznycia-388w-q25.mp4";
window.__livingCardHoverVideo = cardHoverVideo;
import eventAludariai from "./assets/event-aludariai.png";
import eventBiplan from "./assets/event-biplan.png";
import eventGodo from "./assets/event-godo.png";
import eventJurosSvente from "./assets/event-juros-svente.png";
import eventKamaniuSilelis from "./assets/event-kamaniu-silelis.png";
import footerRibbon from "./assets/footer-ribbon.png";
import heroBg from "./assets/hero-bg.png";
import brandLogo from "./assets/klaipedaON.svg";
import citySeal from "./assets/city-seal.svg";
import logoBooking from "./assets/logo-booking.svg";
import logoTripadvisor from "./assets/logo-tripadvisor.svg";
import logoGooglemaps from "./assets/logo-googlemaps.svg";
import attractionsTop from "./assets/attractions-top.png";
import homeGuideActivity from "./assets/home-guide-activity.webp";
import navGyvenk from "./assets/home-guide-activity.webp"; // TODO: replace with actual jumping photo
import navApie from "./assets/hero-bg.png"; // TODO: replace with aerial Klaipėda port photo
import seimaiHero from "./assets/hero-bg.png"; // TODO: replace with family-life photo
import jaunimuiHero from "./assets/hero-bg.png"; // TODO: replace with youth photo
import talentuiHero from "./assets/hero-bg.png"; // TODO: replace with talent/career photo
import homeGuideFood from "./assets/home-guide-food.webp";
import homeGuideStay from "./assets/home-guide-stay.webp";
import homeNewsRoute from "./assets/home-news-route.webp";
import homeNewsPort from "./assets/home-news-port.webp";
import homeNewsCity from "./assets/home-news-city.webp";
import newsHeroBeach from "./assets/news-hero-beach.webp";
import newsCardHeritage from "./assets/news-card-heritage.webp";
import newsCardDunes from "./assets/news-card-dunes.webp";
import newsCardPattern from "./assets/news-card-pattern.webp";
import newsCardStage from "./assets/news-card-stage.webp";
import newsCardLogo from "./assets/news-card-logo.webp";
import newsCardMuseum from "./assets/news-card-museum.webp";
import newsDetailCarmina from "./assets/news-detail-carmina.webp";
import newsAitvaru from "./assets/news-aitvaru.jpg";
import newsMuge from "./assets/news-muge.jpg";
import newsNepramiegok from "./assets/news-nepramiegok.webp";
import aitvaru from "./assets/aitvaru-festivalis.jpg";
import kurPavalgyti1 from "./assets/kur-pavalgyti-1.png";
import kurPavalgyti2 from "./assets/kur-pavalgyti-2.png";
import kurPavalgyti3 from "./assets/kur-pavalgyti-3.png";
import kurPavalgytiHero from "./assets/kur-pavalgyti-hero.png";
import kaVeikti1 from "./assets/ka-veikti-1.jpg";
import kaVeikti2 from "./assets/ka-veikti-2.jpg";
import kaVeikti3 from "./assets/ka-veikti-3.jpg";
import kaVeiktiHero from "./assets/ka-veikti-hero.jpg";
import kaPamatyti1 from "./assets/ka-pamatyti-1.jpg";
import kaPamatyti2 from "./assets/ka-pamatyti-2.jpg";
import kaPamatyti3 from "./assets/ka-pamatyti-3.jpg";
import kaPamatytiHero from "./assets/ka-pamatyti-hero.jpg";
import konferencijuSales1 from "./assets/konferenciju-sales-1.jpg";
import konferencijuSales2 from "./assets/konferenciju-sales-2.jpg";
import konferencijuSales3 from "./assets/konferenciju-sales-3.jpg";
import konferencijuSalesHero from "./assets/konferenciju-sales-hero.jpg";
import kurApsistoti1 from "./assets/kur-apsistoti-1.jpg";
import kurApsistoti2 from "./assets/kur-apsistoti-2.jpg";
import kurApsistoti3 from "./assets/kur-apsistoti-3.jpg";
import kurApsistotiHero from "./assets/kur-apsistoti-hero.png";
import exhibitionDomsaitis from "./assets/exhibition-domsaitis.webp";
import exhibitionMedziai from "./assets/exhibition-medziai.webp";
import exhibitionSpalva from "./assets/exhibition-spalva.webp";
import studijuok1 from "./assets/studijuok-1.svg";
import studijuok2 from "./assets/studijuok-2.svg";
import studijuok3 from "./assets/studijuok-3.svg";
import studijuokHero from "./assets/studijuok-hero.png";
import svietimoIstaigos1 from "./assets/svietimo-istaigos-1.png";
import svietimoIstaigos2 from "./assets/svietimo-istaigos-2.png";
import svietimoIstaigos3 from "./assets/svietimo-istaigos-3.jpg";
import svietimoIstaigosHero from "./assets/svietimo-istaigos-hero.png";
import districtsMapBg from "./assets/figma-district-map-bg.png";

const assetMap = {
  "attractions-top": attractionsTop,
  "city-seal": citySeal,
  "event-aludariai": eventAludariai,
  "event-biplan": eventBiplan,
  "event-godo": eventGodo,
  "event-juros-svente": eventJurosSvente,
  "event-kamaniu-silelis": eventKamaniuSilelis,
  "exhibition-domsaitis": exhibitionDomsaitis,
  "exhibition-medziai": exhibitionMedziai,
  "exhibition-spalva": exhibitionSpalva,
  "footer-ribbon": footerRibbon,
  "hero-bg": heroBg,
  "info-panel-image": heroBg,
  "logo-footer": brandLogo,
  "logo-header": brandLogo,
  "logo-booking": logoBooking,
  "logo-tripadvisor": logoTripadvisor,
  "logo-googlemaps": logoGooglemaps,
  "home-guide-activity": homeGuideActivity,
  "nav-gyvenk-cta": navGyvenk,
  "nav-apie-cta": navApie,
  "seimai-hero": seimaiHero,
  "jaunimui-hero": jaunimuiHero,
  "talentui-hero": talentuiHero,
  "home-guide-food": homeGuideFood,
  "home-guide-stay": homeGuideStay,
  "home-news-route": homeNewsRoute,
  "home-news-port": homeNewsPort,
  "home-news-city": homeNewsCity,
  "news-hero-beach": newsHeroBeach,
  "news-card-heritage": newsCardHeritage,
  "news-card-dunes": newsCardDunes,
  "news-card-pattern": newsCardPattern,
  "news-card-stage": newsCardStage,
  "news-card-logo": newsCardLogo,
  "news-card-museum": newsCardMuseum,
  "news-detail-carmina": newsDetailCarmina,
  "news-aitvaru": newsAitvaru,
  "kur-pavalgyti-1": kurPavalgyti1,
  "kur-pavalgyti-2": kurPavalgyti2,
  "kur-pavalgyti-3": kurPavalgyti3,
  "kur-pavalgyti-hero": kurPavalgytiHero,
  "ka-veikti-1": kaVeikti1,
  "ka-veikti-2": kaVeikti2,
  "ka-veikti-3": kaVeikti3,
  "ka-veikti-hero": kaVeiktiHero,
  "ka-pamatyti-1": kaPamatyti1,
  "ka-pamatyti-2": kaPamatyti2,
  "ka-pamatyti-3": kaPamatyti3,
  "ka-pamatyti-hero": kaPamatytiHero,
  "konferenciju-sales-1": konferencijuSales1,
  "konferenciju-sales-2": konferencijuSales2,
  "konferenciju-sales-3": konferencijuSales3,
  "konferenciju-sales-hero": konferencijuSalesHero,
  "kur-apsistoti-1": kurApsistoti1,
  "kur-apsistoti-2": kurApsistoti2,
  "kur-apsistoti-3": kurApsistoti3,
  "kur-apsistoti-hero": kurApsistotiHero,
  "studijuok-1": studijuok1,
  "studijuok-2": studijuok2,
  "studijuok-3": studijuok3,
  "studijuok-hero": studijuokHero,
  "svietimo-istaigos-1": svietimoIstaigos1,
  "svietimo-istaigos-2": svietimoIstaigos2,
  "svietimo-istaigos-3": svietimoIstaigos3,
  "svietimo-istaigos-hero": svietimoIstaigosHero,
  "districts-map-bg": districtsMapBg,
  "news-muge": newsMuge,
  "news-nepramiegok": newsNepramiegok,
  "aitvaru-festivalis": aitvaru,
};

document.querySelectorAll("[data-asset]").forEach((element) => {
  const assetKey = element.getAttribute("data-asset");
  const assetValue = assetMap[assetKey];

  if (assetValue) {
    element.setAttribute("src", assetValue);
  }
});

// Resolve data-district-map-bg-asset → data-district-map-bg with hashed Vite URL
document.querySelectorAll("[data-district-map-bg-asset]").forEach((element) => {
  const key = element.getAttribute("data-district-map-bg-asset");
  const url = assetMap[key];
  if (url) {
    element.setAttribute("data-district-map-bg", url);
  }
});

initSiteUI();

createIcons({
  icons: {
    Accessibility,
    ArrowLeft,
    ArrowRight,
    Bike,
    Bus,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    CloudUpload,
    Copy,
    Filter,
    Globe,
    Languages,
    LayoutDashboard,
    Mail,
    MapPin,
    PawPrint,
    Phone,
    Route,
    Search,
    Send,
    Share2,
    Ship,
    SlidersHorizontal,
    Star,
    Ticket,
    TrainFront,
    Utensils,
    Users,
  },
  attrs: {
    "aria-hidden": "true",
    "stroke-width": 1.8,
  },
});
