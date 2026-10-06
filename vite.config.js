import { defineConfig } from "vite";

const shopProductPages = () => {
  const rewrite = (req, _res, next) => {
    const path = req.url?.split("?")[0] ?? "";
    const slug = path.match(/^\/el-parduotuve\/([^/.]+)\/?$/)?.[1];

    if (slug && slug !== "preke" && slug !== "atsiskaitymas" && slug !== "aciu") {
      req.url = "/el-parduotuve/preke/index.html";
    }

    next();
  };

  return {
    name: "shop-product-pages",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
};

export default defineConfig({
  plugins: [shopProductPages()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        apie: "apie/index.html",
        atraskDviraciu: "atrask/dviraciu/index.html",
        seimai: "seimai/index.html",
        jaunimui: "jaunimui/index.html",
        talentui: "talentui/index.html",
        gyvenk: "gyvenk/index.html",
        kapamatyti: "ka-pamatyti/index.html",
        kurpavalgyti: "gyvenk/kur-pavalgyti/index.html",
        svietimoistagios: "gyvenk/svietimo-istaigos/index.html",
        studijuok: "gyvenk/studijuok/index.html",
        kaveikti: "ka-veikti/index.html",
        kaveiktiLaisvalaikiu: "ka-veikti-laisvalaikiu/index.html",
        konferencijuErdves: "konferenciju-erdves/index.html",
        versloIrCoworkingCentrai: "verslo-ir-coworking-centrai/index.html",
        kurApsistoti: "kur-apsistoti/index.html",
        naujienos: "naujienos/index.html",
        naujiena: "naujienos/carmina-burana/index.html",
        praneskiteApieRengini: "praneskite-apie-rengini/index.html",
        renginiai: "renginiai/index.html",
        parodos: "renginiai/parodos/index.html",
        renginys: "renginiai/kamaniu-silelis/index.html",
        elParduotuve: "el-parduotuve/index.html",
        elParduotuvePreke: "el-parduotuve/preke/index.html",
        atsiskaitymas: "el-parduotuve/atsiskaitymas/index.html",
        aciu: "el-parduotuve/aciu/index.html",
      },
    },
  },
});
