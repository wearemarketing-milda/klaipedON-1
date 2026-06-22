import { defineConfig } from "vite";

export default defineConfig({
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
      },
    },
  },
});
