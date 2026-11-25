/* 时迹 · 首页脚本：迷你时间线 + 进入工作台 + 滚动入场 */
(function(){
  const board = document.getElementById('board');
  if (board){
    const TOP = 56, ROW = 34;
    const LANES = [
      { p:0.24, c:'#2F7D6D', nodes:[1.2,3.4,5.6,8.2], start:0.4, end:null,
        cards:[{row:2.05, t:'11.02 起 · 5 公里', m:'第 1 天'}] },
      { p:0.53, c:'#BE8A2B', nodes:[1.8,4.0,6.4], start:1.0, end:null,
        cards:[{row:3.45, t:'11.10 第一版信息架构', m:'第 6 天'}] },
      { p:0.80, c:'#3F72A0', nodes:[0.8,2.8,5.0,7.4], start:0.2, end:7.9,
        cards:[{row:5.25, t:'11.19 全书完 · 输出长文', m:'第 14 天', align:'left'}] },
    ];
    const yOf = r => TOP + r * ROW;
    const svg = document.getElementById('rels');

    function build(){
      board.querySelectorAll('.lane').forEach(n => n.remove());
      const W = board.clientWidth || 480, H = board.clientHeight || 430;
      const xs = LANES.map(l => Math.round(W * l.p));

      if (svg){
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        const p1 = { x:xs[0], y:yOf(3.4) }, p2 = { x:xs[2], y:yOf(2.8) };
        const midY = (p1.y + p2.y) / 2 - 30;
        svg.innerHTML = `<path d="M${p1.x},${p1.y} Q${(p1.x+p2.x)/2},${midY} ${p2.x},${p2.y}"
          fill="none" stroke="#8C867B" stroke-width="1" stroke-dasharray="5 5" opacity=".7"/>`;
      }

      const showCards = W >= 400;

      LANES.forEach((l, i) => {
        const el = document.createElement('div');
        el.className = 'lane';
        el.style.left = xs[i] + 'px';
        el.innerHTML = `<div class="rail" style="background:${l.c}"></div>`;

        el.insertAdjacentHTML('beforeend', `
          <div class="mk" style="top:${yOf(l.start)}px;left:1px;background:#139A62">
            <svg viewBox="0 0 10 10"><path d="M0,0 L8,5 L0,10 z" fill="#fff"/></svg></div>`);

        if (l.end !== null && l.end !== undefined){
          el.insertAdjacentHTML('beforeend', `
            <div class="mk" style="top:${yOf(l.end)}px;left:1px;background:#D93F3A">
              <svg viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1.6" fill="#fff"/></svg></div>`);
        } else {
          el.insertAdjacentHTML('beforeend', `
            <div class="mk live" style="top:${yOf(8.6)}px;left:1px;background:#2F72E4">
              <svg viewBox="0 0 10 10"><path d="M5,0 L5,9 M1,5 L5,9 L9,5" stroke="#fff" stroke-width="1.6" fill="none"/></svg></div>`);
        }

        l.nodes.forEach(r => {
          el.insertAdjacentHTML('beforeend',
            `<div class="node" style="top:${yOf(r)}px;border-color:${l.c}"></div>`);
        });

        if (showCards) l.cards.forEach(cd => {
          const tx = cd.align === 'left' ? 'translate(calc(-100% - 10px),-108%)' : 'translate(10px,-108%)';
          el.insertAdjacentHTML('beforeend', `
            <div class="card" style="top:${yOf(cd.row)}px;left:1px;transform:${tx}">
              ${cd.t}<em>${cd.m}</em></div>`);
        });

        board.appendChild(el);
      });
    }

    build();
    let rt = null;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 160); });
  }
})();

/* 进入工作台：点击直接进入 */
(function(){
  const APP = 'app.html';
  const isFile = location.protocol === 'file:';

  function veil(){
    let v = document.getElementById('enterVeil');
    if (!v){
      v = document.createElement('div');
      v.id = 'enterVeil';
      v.className = 'veil';
      document.body.appendChild(v);
    }
    v.innerHTML = `<div class="ev-card">
        <div class="ev-spin"></div>
        <div class="ev-t">正在进入工作台</div>
        <div class="ev-s">载入时迹 · 事件生命线…</div>
      </div>`;
    v.classList.add('on');
    return v;
  }

  function fail(){
    const v = document.getElementById('enterVeil') || veil();
    v.innerHTML = `<div class="ev-card" style="text-align:left;max-width:420px">
        <div class="ev-t">没能直接打开工作台</div>
        <div class="ev-s">当前环境读不到同目录的 app.html，请确认它与首页在同一个文件夹后再试。</div>
        <div style="margin-top:16px;text-align:right">
          <button class="btn btn-dark" id="evClose">知道了</button></div>
      </div>`;
    document.getElementById('evClose').onclick = () => v.classList.remove('on');
  }

  async function enter(){
    if (isFile){ location.href = APP; return; }
    veil();
    try{
      const r = await fetch(APP, { cache:'no-store' });
      if (!r.ok) throw new Error('not found');
      const txt = await r.text();
      document.open(); document.write(txt); document.close();
    }catch(err){ fail(); }
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-enter]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    enter();
  });
})();

/* 滚动入场 */
(function(){
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)){ items.forEach(i => i.classList.add('in')); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:.14, rootMargin:'0px 0px -8% 0px' });
  items.forEach(i => io.observe(i));
})();
