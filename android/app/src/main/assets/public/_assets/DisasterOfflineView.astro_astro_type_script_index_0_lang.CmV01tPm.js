import{t as e}from"./storage.service.zlIY-BUC.js";import{t}from"./barometer.service.v4y331k0.js";import{i as n,n as r,r as i,t as a}from"./survival-guides.service.V_6qT4eO.js";import{t as o}from"./offline-engine.service.xs14U470.js";var s=document.querySelectorAll(`.disaster-tab-btn`),c=document.querySelectorAll(`.disaster-tab-panel`);s.forEach(e=>{e.addEventListener(`click`,()=>{s.forEach(e=>{e.classList.remove(`active`,`bg-gradient-to-r`,`from-blue-600`,`to-cyan-600`,`text-white`,`shadow-[0_0_20px_rgba(6,182,212,0.35)]`),e.classList.add(`bg-slate-900/70`,`text-slate-300`)}),e.classList.add(`active`,`bg-gradient-to-r`,`from-blue-600`,`to-cyan-600`,`text-white`,`shadow-[0_0_20px_rgba(6,182,212,0.35)]`),e.classList.remove(`bg-slate-900/70`,`text-slate-300`);let t=e.getAttribute(`data-d-tab`);c.forEach(e=>e.classList.add(`hidden`)),document.getElementById(`disaster-panel-${t}`)?.classList.remove(`hidden`),t===`shelters`&&T(),t===`guides`&&(I(`Cyclone`),V())})});var l=document.getElementById(`d-baro-pressure`),u=document.getElementById(`d-baro-delta`),d=document.getElementById(`d-baro-source`),f=document.getElementById(`d-baro-status-text`),p=document.getElementById(`d-cyclone-alert-banner`),m=document.getElementById(`d-simulate-drop-btn`),h=document.getElementById(`d-reset-baro-btn`),g=document.getElementById(`offline-test-siren-btn`);t.onReadingUpdate(e=>{l&&(l.textContent=e.pressureHpa.toFixed(1)),u&&(u.textContent=`${e.delta3h>=0?`+`:``}${e.delta3h.toFixed(1)} hPa`,u.className=e.isRapidDrop?`text-lg font-extrabold text-red-400 animate-pulse`:`text-lg font-extrabold text-emerald-400`),d&&(d.textContent=e.isHardware?`Native Hardware Barometer`:`Ambient Barometer Sensor`),f&&(f.textContent=e.statusText),p&&(e.isRapidDrop?p.classList.remove(`hidden`):p.classList.add(`hidden`))}),g?.addEventListener(`click`,()=>{t.playEmergencySiren(4),navigator.vibrate&&navigator.vibrate([200,100,200,100,400])}),m?.addEventListener(`click`,()=>{t.simulatePressureDrop(-3.8)}),h?.addEventListener(`click`,()=>{window.location.reload()});function _(){let e=document.getElementById(`d-rule-alerts-container`);e&&(e.innerHTML=o.evaluateRules({temp_c:32,humidity:88,wind_kph:28.5,pressure_hpa:1008,precip_mm_24h:22}).map(e=>`
      <div class="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 transition-all space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">${e.icon}</span>
            <h4 class="text-xs sm:text-sm font-bold text-amber-200">${e.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${e.severity===`critical`?`bg-red-500/20 text-red-300 border border-red-500/30`:`bg-amber-500/20 text-amber-300 border border-amber-500/30`}">
            ${e.severity}
          </span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${e.conditionMet} ${e.actionRequired}</p>
      </div>
    `).join(``))}var v=28.6139,y=77.209,b=0,x=`All`,S=[],C=document.getElementById(`d-update-gps-btn`),w=document.getElementById(`d-device-heading-badge`);n(e=>{b=e,w&&(w.textContent=`Heading: ${e}°`),document.querySelectorAll(`.d-shelter-arrow`).forEach(t=>{let n=(parseFloat(t.getAttribute(`data-bearing`)||`0`)-e+360)%360;t.style.transform=`rotate(${n}deg)`})});async function T(){navigator.geolocation?navigator.geolocation.getCurrentPosition(async e=>{v=e.coords.latitude,y=e.coords.longitude,S=await i(v,y,b),E()},async()=>{S=await i(v,y,b),E()},{timeout:3500}):(S=await i(v,y,b),E())}function E(){let e=document.getElementById(`d-shelters-grid`);e&&(e.innerHTML=(x===`All`?S:S.filter(e=>e.type===x)).map(e=>`
      <div class="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ${e.type}
            </span>
            <h4 class="text-sm font-bold text-white leading-snug">${e.name}</h4>
            <p class="text-[11px] text-slate-400">${e.address}, ${e.district}</p>
          </div>

          <div class="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 min-w-[56px] shrink-0">
            <span class="d-shelter-arrow text-2xl text-cyan-400 font-bold transition-transform duration-200" data-bearing="${e.bearingDeg}">
              ${e.arrowSymbol}
            </span>
            <span class="text-[10px] font-mono text-cyan-300 font-bold mt-0.5">${e.formattedDistance}</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px] text-slate-300">
          <div>
            <span class="text-slate-500 block">Available</span>
            <span class="font-bold text-white">${e.capacity-e.currentOccupancy} Spots</span>
          </div>
          <div>
            <span class="text-slate-500 block">Walk Time</span>
            <span class="font-bold text-emerald-400">~${e.walkingTimeMin} min</span>
          </div>
          <div>
            <span class="text-slate-500 block">Supplies</span>
            <span class="font-bold text-cyan-300">${e.suppliesStatus}</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <a href="tel:${e.contactNumber}" class="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5 active-scale">
            <span>📞</span> <span>${e.contactNumber}</span>
          </a>
          <span class="text-[10px] text-slate-500 font-medium">${e.state}</span>
        </div>
      </div>
    `).join(``))}C?.addEventListener(`click`,()=>{T(),navigator.vibrate&&navigator.vibrate(15)});var D=document.querySelectorAll(`.shelter-filter-btn`);D.forEach(e=>{e.addEventListener(`click`,()=>{D.forEach(e=>{e.classList.remove(`active`,`bg-cyan-500`,`text-slate-950`),e.classList.add(`bg-slate-900/80`,`text-slate-300`)}),e.classList.add(`active`,`bg-cyan-500`,`text-slate-950`),e.classList.remove(`bg-slate-900/80`,`text-slate-300`),x=e.getAttribute(`data-shelter-type`)||`All`,E()})});var O=`Cyclone Threat`,k=document.getElementById(`d-broadcast-sos-trigger-btn`),A=document.getElementById(`offline-quick-sos-btn`),j=document.querySelectorAll(`.d-sos-reason-chip`),M=document.getElementById(`d-mesh-packet-counter`);j.forEach(e=>{e.addEventListener(`click`,()=>{j.forEach(e=>{e.classList.remove(`bg-red-500/30`,`text-red-200`,`border-red-400`),e.classList.add(`bg-slate-900`,`text-slate-300`,`border-white/10`)}),e.classList.add(`bg-red-500/30`,`text-red-200`,`border-red-400`),e.classList.remove(`bg-slate-900`,`text-slate-300`,`border-white/10`),O=e.getAttribute(`data-d-reason`)||`Cyclone Threat`})});async function N(){navigator.vibrate&&navigator.vibrate([150,50,150,50,300]),P(await r.broadcastSOS(O,v,y)),M&&(M.textContent=`${r.getRecentPackets().length} Packets Relayed`)}k?.addEventListener(`click`,N),A?.addEventListener(`click`,N),r.onPacketReceived(e=>{P(e),M&&(M.textContent=`${r.getRecentPackets().length} Packets Relayed`)});function P(e){let t=document.getElementById(`d-ble-feed-container`);if(!t)return;let n=t.querySelector(`.text-center`);n&&n.remove();let r=document.createElement(`div`);r.className=`p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs animate-fade-in`,r.innerHTML=`
      <div class="flex items-center gap-2.5">
        <span class="text-base">🚨</span>
        <div>
          <div class="font-bold text-white flex items-center gap-1.5">
            <span>${e.emergencyType}</span>
            <span class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-mono font-bold">Hop ${e.hopCount}</span>
          </div>
          <div class="text-[10px] text-slate-400 font-mono">
            ID: ${e.msgId} • Pos: ${e.lat.toFixed(3)}, ${e.lon.toFixed(3)}
          </div>
        </div>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-emerald-400 font-semibold">Relayed</span>
        <div class="text-[9px] text-slate-500">${new Date(e.receivedAt).toLocaleTimeString()}</div>
      </div>
    `,t.insertBefore(r,t.firstChild)}var F=document.querySelectorAll(`.d-guide-btn`);F.forEach(e=>{e.addEventListener(`click`,()=>{F.forEach(e=>{e.classList.remove(`active`,`bg-emerald-500`,`text-slate-950`,`font-bold`),e.classList.add(`bg-slate-900`,`text-slate-300`)}),e.classList.add(`active`,`bg-emerald-500`,`text-slate-950`,`font-bold`),e.classList.remove(`bg-slate-900`,`text-slate-300`),I(e.getAttribute(`data-d-guide`)||`Cyclone`)})});async function I(e){let t=document.getElementById(`d-guide-content-box`);if(!t)return;let n=await a.getGuideByCategory(e);if(!n)return;let r=a.getChecklistState(n.id);t.innerHTML=`
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ${n.urgency} Urgency
          </span>
          <h4 class="text-sm sm:text-base font-bold text-white">${n.title}</h4>
        </div>
      </div>

      <div class="space-y-2">
        <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step-by-Step Action Protocol</h5>
        <ol class="space-y-1.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
          ${n.steps.map(e=>`<li>${e}</li>`).join(``)}
        </ol>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div class="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
          <h6 class="text-xs font-bold text-emerald-400">✅ Essential DOs</h6>
          <ul class="text-[11px] text-slate-300 space-y-1">
            ${n.dos.map(e=>`<li>• ${e}</li>`).join(``)}
          </ul>
        </div>
        <div class="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 space-y-1.5">
          <h6 class="text-xs font-bold text-red-400">❌ Critical DONTs</h6>
          <ul class="text-[11px] text-slate-300 space-y-1">
            ${n.donts.map(e=>`<li>• ${e}</li>`).join(``)}
          </ul>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
        <h6 class="text-xs font-bold text-amber-300">🎒 Emergency Go-Bag Kit Checklist (Persistent)</h6>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300" id="go-bag-list">
          ${n.emergencyKitList.map(e=>`
            <label class="flex items-center gap-2 cursor-pointer hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <input 
                type="checkbox" 
                class="go-bag-checkbox rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-0" 
                data-guide-id="${n.id}"
                data-item="${e}"
                ${r.includes(e)?`checked`:``}
              />
              <span class="${r.includes(e)?`line-through text-slate-500`:``}">${e}</span>
            </label>
          `).join(``)}
        </div>
      </div>
    `,t.querySelectorAll(`.go-bag-checkbox`).forEach(e=>{e.addEventListener(`change`,e=>{let t=e.target,n=t.getAttribute(`data-guide-id`)||``,r=t.getAttribute(`data-item`)||``;a.toggleChecklistItem(n,r);let i=t.nextElementSibling;i&&(i.className=t.checked?`line-through text-slate-500`:``)})})}var L=`All`,R=``,z=document.getElementById(`d-contact-search-input`),B=document.querySelectorAll(`.contact-cat-btn`);async function V(){let t=document.getElementById(`d-contacts-grid`);t&&(t.innerHTML=(await e.searchEmergencyContacts(R,L)).map(e=>`
      <div class="glass-panel rounded-xl p-4 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-3">
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ${e.category}
            </span>
            ${e.available24x7?`<span class="text-[9px] font-bold text-emerald-400">24x7</span>`:``}
          </div>
          <h4 class="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 pt-1">
            <span>${e.icon}</span> <span>${e.name}</span>
          </h4>
          <p class="text-[11px] text-slate-400 leading-snug">${e.description}</p>
        </div>

        <div class="pt-2 border-t border-white/5 flex items-center justify-between">
          <a href="tel:${e.number}" class="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all active-scale cursor-pointer shadow-sm">
            <span>📞</span> <span>Call ${e.number}</span>
          </a>
        </div>
      </div>
    `).join(``))}B.forEach(e=>{e.addEventListener(`click`,()=>{B.forEach(e=>{e.classList.remove(`active`,`bg-amber-500`,`text-slate-950`,`font-bold`),e.classList.add(`bg-slate-900`,`text-slate-300`)}),e.classList.add(`active`,`bg-amber-500`,`text-slate-950`,`font-bold`),e.classList.remove(`bg-slate-900`,`text-slate-300`),L=e.getAttribute(`data-contact-cat`)||`All`,V()})}),z?.addEventListener(`input`,()=>{R=z.value,V()}),(function(){_(),T(),I(`Cyclone`),V()})();