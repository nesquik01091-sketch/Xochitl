(function () {
  "use strict";

  const HNL = 26.866;
  const money = (n) => {
    if (n === 0) return "Gratis";
    const v = n * HNL;
    return "L " + v.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const cartKey = "vortix-cart";
  const products = () => window.VORTIX_PRODUCTS || [];
  const byId = (id) => products().find((p) => p.id === id);

  function cart() {
    try { return JSON.parse(localStorage.getItem(cartKey)) || []; }
    catch (e) { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(cartKey, JSON.stringify(items));
    const b = document.querySelector("[data-cart-count]");
    if (b) b.textContent = items.reduce((s, i) => s + i.qty, 0);
  }
  function add(id) {
    const p = byId(id);
    if (!p) return;
    const items = cart();
    const row = items.find((i) => i.id === id);
    if (row) row.qty += 1;
    else items.push({ id, qty: 1 });
    saveCart(items);
    openCart();
  }
  function change(id, d) {
    let items = cart().map((i) => i.id === id ? { ...i, qty: i.qty + d } : i).filter((i) => i.qty > 0);
    saveCart(items);
    renderCart();
  }
  function total() {
    return cart().reduce((s, i) => s + (byId(i.id)?.price || 0) * i.qty, 0);
  }

  function motion() {
    if (!window.AOS) return;
    if (!window.__vortixAos) {
      AOS.init({ duration: 700, easing: "ease-out-cubic", once: false, mirror: true, offset: 48 });
      window.__vortixAos = true;
    } else {
      AOS.refresh();
    }
  }

  // ---------------- HEADER / FOOTER ----------------
  function header(active) {
    const links = [
      ["index.html", "Inicio", "home"],
      ["blog.html", "Catálogo", "catalog"],
      ["portfolio-details.html", "Cómo se crearon", "history"],
      ["blog-details.html", "Guía", "guide"]
    ];
    return `
      <header class="site-header" id="vortix-header">
        <div class="header-inner">
          <a class="brand-link" href="index.html">
            <span class="brand-mark"><img src="assets/img/logo.jpg" alt="Logo VORTIXBYTE"></span>
            <span class="brand small">VORTIXBYTE</span>
          </a>
          <nav class="nav" id="nav">
            ${links.map(([href, label, key]) => `<a href="${href}" class="${active === key ? "active" : ""}">${label}</a>`).join("")}
          </nav>
          <div class="header-actions">
            <div class="music-box">
              <button class="icon-btn" type="button" data-music aria-label="Silenciar música">♪</button>
              <input class="music-vol" data-music-vol type="range" min="0" max="1" step="0.05" value="0.4" aria-label="Bajar o subir la música">
            </div>
            <button class="icon-btn menu-btn" type="button" data-menu aria-label="Menú">☰</button>
            <button class="icon-btn" type="button" data-open-cart aria-label="Carrito">
              🛒 <span class="badge" data-cart-count>0</span>
            </button>
          </div>
        </div>
      </header>`;
  }
  function footer() {
    return `
      <footer class="site-footer" data-aos="fade-up">
        <div class="wrap foot-grid">
          <div>
            <div class="brand small">VORTIXBYTE</div>
            <p>Tienda de videojuegos. Los precios son de demostración y el pago no es real.</p>
          </div>
          <div>
            <strong>Explorar</strong>
            <p><a href="blog.html">Catálogo</a><br><a href="portfolio-details.html">Historia y lenguajes</a><br><a href="blog-details.html">Guía de compra</a></p>
          </div>
          <div>
            <strong>Contacto demo</strong>
            <p>hola@vortixbyte.demo<br>Soporte de laboratorio, no es una tienda real.</p>
          </div>
        </div>
      </footer>
      <div class="drawer" id="cart-drawer">
        <aside>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2>Tu carrito</h2>
            <button class="icon-btn" type="button" data-close-cart>✕</button>
          </div>
          <div id="cart-body"></div>
        </aside>
      </div>
      <div class="modal" id="pay-modal">
        <div class="sheet">
          <h2>Pedido de demostración</h2>
          <p class="note">Esto no cobra dinero. Sirve para ver cómo quedaría la compra en VORTIXBYTE.</p>
          <form id="pay-form">
            <p><input required name="nombre" placeholder="Nombre" style="width:100%;padding:.7rem;border-radius:10px;border:1px solid #333;background:#0e0c18;color:#fff;"></p>
            <p><input required type="email" name="email" placeholder="Correo" style="width:100%;padding:.7rem;border-radius:10px;border:1px solid #333;background:#0e0c18;color:#fff;"></p>
            <button class="btn block" type="submit">Confirmar pedido demo</button>
          </form>
          <p id="pay-result"></p>
          <button class="btn ghost" type="button" data-close-pay>Cerrar</button>
        </div>
      </div>`;
  }

  // ---------------- TARJETAS ----------------
  function thumb(p) {
    const src = p.img || ("assets/img/" + p.id + ".jpg");
    return `<div class="thumb" style="background:linear-gradient(135deg, ${p.color}, #12121f 80%)">
      <img src="${src}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.remove()">
      <strong>${p.name}</strong>
    </div>`;
  }
  function card(p, i) {
    const price = p.price === 0 ? `<span class="price free">Gratis</span>` : `<span class="price">${money(p.price)}</span>`;
    const buyLabel = p.price === 0 ? "Ver ficha" : "Comprar";
    const delay = (Number(i) || 0) % 6 * 70;
    return `<article class="card" data-aos="fade-up" data-aos-duration="650" data-aos-delay="${delay}">
      <a href="service-details.html?id=${p.id}">${thumb(p)}</a>
      <div class="card-body">
        <div class="meta">${p.badge || p.platform} · ${p.age}</div>
        <strong>${p.name}</strong>
        <div class="meta">${p.platform}</div>
        ${price}
        <div class="card-actions">
          <a class="btn ghost" href="service-details.html?id=${p.id}">Ver</a>
          <button class="btn" type="button" data-add="${p.id}">${buyLabel}</button>
        </div>
      </div>
    </article>`;
  }

  function openCart() {
    document.getElementById("cart-drawer").classList.add("open");
    renderCart();
  }
  function renderCart() {
    const body = document.getElementById("cart-body");
    const items = cart();
    if (!items.length) {
      body.innerHTML = `<p class="empty">El carrito está vacío. Elige un juego.</p>`;
      return;
    }
    body.innerHTML = items.map((i) => {
      const p = byId(i.id);
      if (!p) return "";
      return `<div class="cart-row">
        <div><strong>${p.name}</strong><br><span class="meta">${money(p.price)}</span></div>
        <div>
          <button class="icon-btn" type="button" data-qty="${p.id}" data-d="-1">−</button>
          ${i.qty}
          <button class="icon-btn" type="button" data-qty="${p.id}" data-d="1">+</button>
        </div>
      </div>`;
    }).join("") + `<p><strong>Total demo: ${money(total())}</strong></p>
      <button class="btn block" type="button" data-checkout>Pagar (demo)</button>`;
    saveCart(items);
  }

  // ---------------- MOSTRAR VISTA ----------------
  function showPage(view) {
    const secciones = document.querySelectorAll("[data-page]");
    let ok = false;
    Array.prototype.forEach.call(secciones, function (el) {
      const es = el.getAttribute("data-page") === view;
      el.classList.toggle("is-active", es);
      if (es) ok = true;
    });
    if (!ok) {
      Array.prototype.forEach.call(secciones, function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-page") === "missing");
      });
    }
  }

  // ---------------- MOUNT ----------------
  function mount(active) {
    if (window.__vortixMounted) {
      document.querySelectorAll(".nav a").forEach((a) => {
        const file = (a.getAttribute("href") || "").split("?")[0].split("/").pop();
        a.classList.toggle("active", pageNames[file] === active);
      });
      return;
    }
    window.__vortixMounted = true;

    document.body.insertAdjacentHTML("afterbegin", header(active));
    document.body.insertAdjacentHTML("beforeend", footer());
    saveCart(cart());

    document.querySelector("[data-menu]")?.addEventListener("click", () => document.getElementById("nav").classList.toggle("open"));
    document.querySelector("[data-open-cart]")?.addEventListener("click", openCart);
    document.querySelector("[data-close-cart]")?.addEventListener("click", () => document.getElementById("cart-drawer").classList.remove("open"));
    document.getElementById("cart-drawer").addEventListener("click", (e) => { if (e.target.id === "cart-drawer") e.currentTarget.classList.remove("open"); });

    document.body.addEventListener("submit", (e) => {
      const form = e.target;
      if (!form.matches || !form.matches(".search-bar")) return;
      e.preventDefault();
      const q = new FormData(form).get("q") || "";
      openView("catalog", "q=" + encodeURIComponent(q), true);
    });

    document.body.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) {
        const href = link.getAttribute("href") || "";
        if (href.includes(".html") && !href.startsWith("http")) {
          e.preventDefault();
          const file = href.split("?")[0].split("/").pop();
          const search = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
          openView(pageNames[file] || "missing", search, true);
          return;
        }
      }
      const addBtn = e.target.closest("[data-add]");
      if (addBtn) add(addBtn.dataset.add);
      const railBtn = e.target.closest("[data-rail]");
      if (railBtn) {
        const rail = document.getElementById(railBtn.dataset.rail);
        if (rail) {
          const card = rail.querySelector(".card");
          const step = (card ? card.getBoundingClientRect().width : 230) + 14;
          rail.scrollBy({ left: Number(railBtn.dataset.dir) * step, behavior: "smooth" });
          rail.classList.remove("is-sliding");
          void rail.offsetWidth;
          rail.classList.add("is-sliding");
        }
      }
      const qty = e.target.closest("[data-qty]");
      if (qty) change(qty.dataset.qty, Number(qty.dataset.d));
      if (e.target.closest("[data-checkout]")) document.getElementById("pay-modal").classList.add("open");
      if (e.target.closest("[data-close-pay]")) document.getElementById("pay-modal").classList.remove("open");
    });

    document.getElementById("pay-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      document.getElementById("pay-result").textContent = `Listo, ${data.get("nombre")}. Pedido demo por ${money(total())}. No se hizo ningún cobro.`;
      saveCart([]);
      renderCart();
    });

    setupMusic();
    motion();
  }

  // ---------------- MÚSICA ----------------
  function setupMusic() {
    const todos = document.querySelectorAll("audio#bg-music");
    if (todos.length > 1) {
      for (let i = 1; i < todos.length; i++) {
        try { todos[i].pause(); } catch (e) {}
        todos[i].remove();
      }
    }
    if (window.__vortixMusicReady) {
      const a = document.getElementById("bg-music");
      const b = document.querySelector("[data-music]");
      const s = document.querySelector("[data-music-vol]");
      if (a && s) s.value = a.muted ? 0 : a.volume;
      if (a && b) b.textContent = a.muted || a.volume === 0 ? "🔇" : "♪";
      return;
    }
    const btn = document.querySelector("[data-music]");
    const slider = document.querySelector("[data-music-vol]");

    let audio = document.getElementById("bg-music");
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "bg-music";
      audio.src = "assets/audio/fondo.mp3";
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = Number(localStorage.getItem("vortix-vol") || 0.4);
      audio.muted = localStorage.getItem("vortix-muted") === "1";
      document.body.appendChild(audio);
    }
    if (slider) slider.value = audio.muted ? 0 : audio.volume;
    const paint = () => { if (btn) btn.textContent = audio.muted || audio.volume === 0 ? "🔇" : "♪"; };
    const start = () => { if (!audio.dataset.ducked && audio.paused) audio.play().catch(() => {}); };

    start();
    document.body.addEventListener("pointerdown", () => start());

    btn?.addEventListener("click", () => {
      audio.muted = !audio.muted;
      localStorage.setItem("vortix-muted", audio.muted ? "1" : "0");
      if (!audio.muted && audio.volume === 0) { audio.volume = 0.4; if (slider) slider.value = 0.4; }
      paint();
      start();
    });
    slider?.addEventListener("input", () => {
      audio.volume = Number(slider.value);
      audio.muted = audio.volume === 0;
      localStorage.setItem("vortix-vol", String(audio.volume));
      localStorage.setItem("vortix-muted", audio.muted ? "1" : "0");
      paint();
      start();
    });
    paint();

    window.VortixBgm = {
      duck() {
        if (!audio.paused) audio.dataset.wasPlaying = "1";
        audio.dataset.ducked = "1";
        audio.pause();
      },
      back() {
        delete audio.dataset.ducked;
        if (audio.dataset.wasPlaying === "1") {
          delete audio.dataset.wasPlaying;
          audio.play().catch(() => {});
        }
      }
    };
    window.__vortixMusicReady = true;
  }

  // ---------------- RAILS / BÚSQUEDA ----------------
  function renderRail(id, list) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = list.map(card).join("");
  }
  function searchProducts(q) {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products().filter((p) => (p.name + p.platform + p.about + p.kind).toLowerCase().includes(s)).slice(0, 8);
  }

  function home() {
    const all = products();
    renderRail("rail-switch", all.filter((p) => p.platform.includes("Switch") && p.kind === "game").slice(0, 8));
    renderRail("rail-ps", all.filter((p) => p.badge === "PlayStation").slice(0, 8));
    renderRail("rail-xb", all.filter((p) => p.badge === "Xbox").slice(0, 8));
    const box = document.getElementById("live-search");
    const input = document.getElementById("q");
    input?.addEventListener("input", () => {
      const found = searchProducts(input.value);
      box.innerHTML = found.length ? `<div class="grid">${found.map(card).join("")}</div>` : (input.value ? `<p class="empty">Nada con ese nombre. Prueba Mario, PS5, Zelda o Roblox.</p>` : "");
      motion();
    });
    motion();
  }

  function catalog() {
    const grid = document.getElementById("catalog-grid");
    const q = document.getElementById("filter-q");
    const plat = document.getElementById("filter-plat");
    const kind = document.getElementById("filter-kind");
    if (!grid || !q || !plat || !kind) return;
    function draw() {
      const s = (q.value || "").toLowerCase();
      const alias = s === "playstation" ? "ps" : s === "xbox" ? "xbox" : s;
      const list = products().filter((p) => {
        const blob = (p.name + " " + p.platform + " " + p.about + " " + (p.badge || "")).toLowerCase();
        const okS = !s || blob.includes(s) || (alias === "ps" && (blob.includes("ps5") || blob.includes("ps4") || blob.includes("playstation")));
        const okP = plat.value === "todas" || p.platform.includes(plat.value) || p.badge === plat.value || p.name.includes(plat.value);
        const okK = kind.value === "todos" || p.kind === kind.value;
        return okS && okP && okK;
      });
      grid.innerHTML = list.map(card).join("") || `<p class="empty">No hay resultados.</p>`;
      document.getElementById("count").textContent = list.length + " productos";
      motion();
    }
    [q, plat, kind].forEach((el) => el.addEventListener("input", draw));
    const params = new URLSearchParams(window.VortixQuery || location.search);
    if (params.get("q")) q.value = params.get("q");
    draw();
  }

  function productPage() {
    const id = new URLSearchParams(window.VortixQuery || location.search).get("id") || "mk8";
    const p = byId(id);
    const root = document.getElementById("product-root");
    if (!root) return;
    if (!p) {
      root.innerHTML = `<p>No encontramos ese producto. <a href="404.html">Volver</a></p>`;
      return;
    }
    document.title = p.name + " · VORTIXBYTE";
    const related = products().filter((o) => o.id !== p.id && (o.platform === p.platform || o.badge === p.badge)).slice(0, 4);
    const src = p.img || ("assets/img/" + p.id + ".jpg");
    const vid = p.video || ("assets/video/" + p.id + ".mp4");
    root.innerHTML = `
      <div class="product-layout">
        <div data-aos="fade-right" data-aos-duration="700">
          <div class="stage yt" id="stage">
            <img src="${src}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.remove()">
            <video id="clip" src="${vid}" poster="${src}" playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#07060f;display:none;"></video>
            ${p.slides.map((s, i) => `<div class="stage-slide" data-slide="${i}" style="background:linear-gradient(160deg, ${p.color}99, #07060fcc 70%); display:${i ? "none" : "flex"}"><div class="kicker">FICHA · ${p.badge}</div><h3>${p.name}</h3><p>${s}</p></div>`).join("")}
            <button class="yt-big" id="big-play" type="button" aria-label="Reproducir">▶</button>
            <div class="yt-bar" id="yt-bar">
              <button class="yt-btn" id="play" type="button" aria-label="Pausa">▶</button>
              <div class="yt-seek" id="seek"><span id="bar"></span></div>
              <span class="yt-time" id="time">0:00 / 0:00</span>
              <button class="yt-btn" id="mute" type="button" aria-label="Silencio">🔊</button>
              <input class="yt-vol" id="vol" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volumen">
            </div>
          </div>
          <div class="panel" style="margin-top:12px;">
            <h2>De qué trata</h2>
            <p>${p.about}</p>
            <h3>Qué incluye y cómo funciona</h3>
            <div class="specs">${p.features.map((f) => `<div class="spec">▸ ${f}</div>`).join("")}</div>
            <h3>En la caja o en la descarga</h3>
            <div class="specs">${p.includes.map((f) => `<div class="spec">▸ ${f}</div>`).join("")}</div>
          </div>
        </div>
        <aside class="buy-box" data-aos="fade-left" data-aos-duration="700">
          <div class="kicker">${p.platform}</div>
          <h2>${p.name}</h2>
          <p class="meta">Clasificación: ${p.age}</p>
          <p class="price" style="font-size:1.8rem;">${money(p.price)}</p>
          <button class="btn block" type="button" data-add="${p.id}">${p.price === 0 ? "Guardar ficha" : "Agregar al carrito"}</button>
          <p class="note">Compra de demostración. Los juegos gratis como Fortnite y Roblox no se cobran aquí.</p>
          <p><a href="blog.html">Seguir buscando</a></p>
        </aside>
      </div>
      <div class="section" data-aos="fade-up">
        <div class="section-head"><h2>También te puede servir</h2></div>
        <div class="grid">${related.map(card).join("")}</div>
      </div>`;
    let timer = null, sec = 0, slide = 0, useVideo = false, hideTimer = null;
    const stage = document.getElementById("stage");
    const slides = root.querySelectorAll("[data-slide]");
    const bar = document.getElementById("bar");
    const clip = document.getElementById("clip");
    const play = document.getElementById("play");
    const big = document.getElementById("big-play");
    const mute = document.getElementById("mute");
    const vol = document.getElementById("vol");
    const seek = document.getElementById("seek");
    const clock = (n) => {
      n = Math.floor(n || 0);
      return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0");
    };
    const paintTime = () => {
      const cur = useVideo ? clip.currentTime : sec;
      const dur = useVideo ? clip.duration : 12;
      document.getElementById("time").textContent = clock(cur) + " / " + clock(dur);
      if (dur) bar.style.width = (cur / dur * 100) + "%";
    };
    const showControls = () => {
      stage.classList.remove("idle");
      clearTimeout(hideTimer);
      if (useVideo && !clip.paused) hideTimer = setTimeout(() => stage.classList.add("idle"), 2500);
    };
    const markPlay = (on) => {
      play.textContent = on ? "❚❚" : "▶";
      big.classList.toggle("hide", on);
      if (on) { showControls(); window.VortixBgm?.duck(); }
      else { stage.classList.remove("idle"); window.VortixBgm?.back(); }
    };
    const toggle = () => {
      if (useVideo) {
        if (clip.paused) clip.play();
        else clip.pause();
        return;
      }
      if (timer) { clearInterval(timer); timer = null; markPlay(false); return; }
      markPlay(true);
      timer = setInterval(() => {
        sec += 1;
        paintTime();
        if (sec % 4 === 0) {
          slides[slide].style.display = "none";
          slide = (slide + 1) % slides.length;
          slides[slide].style.display = "flex";
        }
      }, 1000);
    };
    clip.addEventListener("loadeddata", () => {
      useVideo = true;
      clip.style.display = "block";
      slides.forEach((s) => { s.style.display = "none"; });
      clip.play().catch(() => {
        clip.muted = true;
        vol.value = 0;
        mute.textContent = "🔇";
        clip.play().catch(() => {});
      });
    });
    clip.addEventListener("error", () => { clip.remove(); });
    clip.addEventListener("timeupdate", paintTime);
    clip.addEventListener("play", () => markPlay(true));
    clip.addEventListener("pause", () => markPlay(false));
    clip.addEventListener("ended", () => markPlay(false));
    play.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    big.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    stage.addEventListener("mousemove", showControls);
    stage.addEventListener("click", (e) => {
      if (e.target.closest(".yt-bar") || e.target.id === "big-play") return;
      toggle();
      showControls();
    });
    document.addEventListener("keydown", (e) => {
      if (e.code !== "Space" || e.target.matches("input, textarea, select")) return;
      e.preventDefault();
      toggle();
      showControls();
    });
    seek.addEventListener("click", (e) => {
      e.stopPropagation();
      const r = seek.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      if (useVideo && clip.duration) clip.currentTime = ratio * clip.duration;
      else { sec = Math.floor(ratio * 12); paintTime(); }
    });
    const paintVol = () => {
      clip.muted = Number(vol.value) === 0;
      clip.volume = Number(vol.value);
      mute.textContent = clip.muted || clip.volume === 0 ? "🔇" : "🔊";
    };
    vol.addEventListener("input", (e) => { e.stopPropagation(); paintVol(); showControls(); });
    mute.addEventListener("click", (e) => {
      e.stopPropagation();
      if (clip.muted || clip.volume === 0) {
        clip.muted = false;
        clip.volume = 0.7;
        vol.value = 0.7;
      } else {
        clip.muted = true;
        vol.value = 0;
      }
      mute.textContent = clip.muted ? "🔇" : "🔊";
      showControls();
    });
    showControls();
    motion();
  }

  const pageNames = {
    "index.html": "home",
    "blog.html": "catalog",
    "blog-details.html": "guide",
    "portfolio-details.html": "history",
    "service-details.html": "product",
    "404.html": "missing"
  };

  // ---------------- NAVEGACIÓN ----------------
  function openView(view, search, push) {
    // Pausa cualquier <video> de la ficha anterior (evita audio mezclado)
    document.querySelectorAll("video").forEach((v) => {
      try { v.pause(); } catch (e) {}
    });

    const qs = (search || "").replace(/^\?/, "");
    window.VortixQuery = qs ? "?" + qs : "";

    window.VortixBgm?.back();
    showPage(view);

    document.querySelectorAll(".nav a").forEach((a) => {
      const file = (a.getAttribute("href") || "").split("?")[0].split("/").pop();
      a.classList.toggle("active", pageNames[file] === view);
    });

    if (push) {
      const params = new URLSearchParams(qs);
      params.set("p", view);
      history.pushState({ view, qs }, "", "?" + params.toString());
    }

    if (view === "home") home();
    else if (view === "catalog") catalog();
    else if (view === "product") productPage();
    else motion();

    window.scrollTo(0, 0);
  }

  window.Vortix = { mount, home, catalog, productPage, card, products, add, start, openView };

  function start() {
    const params = new URLSearchParams(location.search);
    const view = params.get("p") || "home";
    params.delete("p");
    const qs = params.toString();

    showPage(view);
    openView(view, qs, false);

    window.addEventListener("popstate", () => {
      const p = new URLSearchParams(location.search);
      const v = p.get("p") || "home";
      p.delete("p");
      const s = p.toString();
      showPage(v);
      openView(v, s, false);
    });
  }
})();