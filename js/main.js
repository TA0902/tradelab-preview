// トレードLab 共通スクリプト
(() => {
  // ハンバーガー（キーボード操作可・Esc で閉じる）
  const bg = document.querySelector(".burger"), nav = document.getElementById("nav");
  if (bg && nav) {
    const set = o => { nav.classList.toggle("is-open", o); bg.setAttribute("aria-expanded", o); bg.setAttribute("aria-label", o ? "メニューを閉じる" : "メニューを開く"); };
    bg.addEventListener("click", () => set(!nav.classList.contains("is-open")));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); bg.focus(); } });
  }

  // 追従ボタン：ファーストビュー（下層ページはページ見出し）を過ぎたら表示
  const fl = document.getElementById("float");
  const fv = document.getElementById("fv") || document.querySelector(".phead");
  if (fl) {
    const show = s => { fl.classList.toggle("is-show", s); fl.tabIndex = s ? 0 : -1; };
    show(false);
    if (fv && "IntersectionObserver" in window) new IntersectionObserver(([e]) => show(!e.isIntersecting)).observe(fv);
    else addEventListener("scroll", () => show(scrollY > innerHeight * .8), { passive: true });
  }

  // ファーストビューの背景動画
  const box = document.getElementById("fvMedia");
  if (box && box.dataset.src && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const v = document.createElement("video");
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto" });
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.src = box.dataset.src;
    box.appendChild(v);
    v.play().catch(() => {});
  }

  // YouTube の軽い埋め込み：押したら iframe に差し替え
  document.querySelectorAll(".yt[data-yt]").forEach(el => {
    el.querySelector(".yt__btn").addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
      f.title = el.querySelector(".yt__btn").getAttribute("aria-label").replace(/^動画を再生：/, "");
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      el.innerHTML = ""; el.appendChild(f); f.focus();
    });
  });
})();

// 成績表：年の行を押すと月別が開く（ピボットテーブル風）
(() => {
  document.querySelectorAll("[data-pivot]").forEach(tbl => {
    const btns = [...tbl.querySelectorAll(".pivot__btn")];
    const set = (b, o) => { b.setAttribute("aria-expanded", o); document.getElementById(b.getAttribute("aria-controls")).hidden = !o; b.closest("tr").classList.toggle("is-open", o); };
    btns.forEach(b => b.addEventListener("click", () => set(b, b.getAttribute("aria-expanded") !== "true")));
    tbl.querySelectorAll(".pivot__year").forEach(tr => tr.addEventListener("click", e => { if (!e.target.closest(".pivot__btn")) tr.querySelector(".pivot__btn").click(); }));
    const all = tbl.closest("section").querySelector("[data-pivot-all]");
    if (all) all.addEventListener("click", () => {
      const o = all.getAttribute("aria-pressed") !== "true";
      btns.forEach(b => set(b, o)); all.setAttribute("aria-pressed", o); all.textContent = o ? "すべて閉じる" : "すべて開く";
    });
  });
})();

// スライド：1枚ずつ表示して数秒ごとに切り替え（乗せる・フォーカスで一時停止）
(() => {
  document.querySelectorAll("[data-slides]").forEach(box => {
    const items = [...box.querySelectorAll(".slides__item")], dots = [...box.querySelectorAll(".slides__dots button")];
    const wait = +box.dataset.interval || 5000;
    let i = 0, timer = null, hold = false;
    const show = n => {
      i = (n + items.length) % items.length;
      items.forEach((el, k) => { el.classList.toggle("is-on", k === i); el.setAttribute("aria-hidden", k !== i); });
      dots.forEach((d, k) => k === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
    };
    const start = () => { clearInterval(timer); if (!hold && !matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show(i + 1), wait); };
    box.querySelector(".slides__nav--prev").addEventListener("click", () => { show(i - 1); start(); });
    box.querySelector(".slides__nav--next").addEventListener("click", () => { show(i + 1); start(); });
    dots.forEach((d, k) => d.addEventListener("click", () => { show(k); start(); }));
    box.addEventListener("mouseenter", () => { hold = true; clearInterval(timer); });
    box.addEventListener("mouseleave", () => { hold = false; start(); });
    box.addEventListener("focusin", () => { hold = true; clearInterval(timer); });
    box.addEventListener("focusout", () => { hold = false; start(); });
    start();
  });
})();
