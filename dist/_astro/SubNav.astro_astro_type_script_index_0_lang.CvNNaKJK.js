import{t as e}from"./i18n.service.Ber3Lkiq.js";import{n as t,t as n}from"./storage.service.DpZMG_4C.js";import{t as r}from"./network.service.BRUQDYT6.js";import{c as i,n as a,o,s,t as c}from"./geocoding.service.j1K5fiFo.js";var l=document.getElementById(`sub-nav-frosted`),u=document.getElementById(`sub-nav-persona-pill`),d=document.getElementById(`sub-nav-persona-icon`),f=document.getElementById(`sub-nav-persona-name`),p=document.getElementById(`location-search-input`),m=document.getElementById(`location-search-results`),h=document.getElementById(`use-my-location-btn`),g=document.getElementById(`sub-nav-radar-btn`);function _(){let r=n.getActivePersona(),i=t[r]||t.farmer,a=i.name.split(`/`)[0].trim();d&&(d.textContent=i.icon),f&&(f.textContent=e.t(a,a))}function v(e){if(p){let t=e.split(`,`)[0].trim();p.placeholder=r.isOnline()?t:`${t} (Offline)`}}function y(){m&&(l?.classList.add(`z-[100]`),m.classList.remove(`hidden`))}function b(){m&&(l?.classList.remove(`z-[100]`),m.classList.add(`hidden`))}u?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`mausam-open-profile-settings`))}),g?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`mausam-open-radar`))});function x(t){if(!m)return;let i=r.isOnline();if(!t||t.length===0){m.innerHTML=`
        <div class="p-3 text-xs text-slate-400 text-center">
          <span>🔍 ${e.t(`No matching locations found`,`No matching locations found`)}</span>
        </div>
      `,y();return}m.innerHTML=`
      <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/60 border-b border-white/5 flex items-center justify-between">
        <span>${i?e.t(`Select Location`,`Select Location`):e.t(`Offline Location Database`,`Offline Location Database`)}</span>
        ${i?``:`<span class="text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-400/20">OFFLINE READY</span>`}
      </div>
      ${t.map(e=>{let t=e.isFallback||e.matchType===`fallback`,n=e.matchType===`fuzzy`;return`
        <button
          type="button"
          class="search-result-item w-full px-3.5 py-2.5 text-left text-xs hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors flex items-center justify-between cursor-pointer border-b border-white/5 last:border-0 ${t?`bg-amber-500/5`:``}"
          data-loc-key="${e.id||e.key||e.name.toLowerCase().replace(/\s+/g,`_`)}"
          data-loc-display="${e.display||`${e.name}, ${e.region?`${e.region}, `:``}${e.country}`}"
          data-loc-lat="${e.lat}"
          data-loc-lon="${e.lon}"
          data-loc-name="${e.name}"
          data-loc-region="${e.region||``}"
          data-loc-country="${e.country||`India`}"
        >
          <div class="truncate mr-2 flex items-center gap-2">
            <span class="text-emerald-400 text-sm shrink-0">📍</span>
            <div class="truncate">
              <div class="flex items-center gap-1.5 truncate">
                <span class="font-semibold text-white truncate">${e.name}</span>
                ${e.category?`<span class="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">${e.category}</span>`:``}
                ${t?`<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">Suggested</span>`:``}
                ${n?`<span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">Did you mean?</span>`:``}
              </div>
              <span class="text-slate-400 text-[11px] block truncate mt-0.5">
                ${e.suggestionReason?`<span class="text-cyan-400/90 font-medium">${e.suggestionReason} • </span>`:``}
                ${e.region?`${e.region}, `:``}${e.country||`India`}
              </span>
            </div>
          </div>
          <span class="text-cyan-400 text-[10px] shrink-0 font-medium px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">Select ➔</span>
        </button>
      `}).join(``)}
    `,y(),m.querySelectorAll(`.search-result-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-loc-key`)||``,r=e.getAttribute(`data-loc-display`)||``,i=parseFloat(e.getAttribute(`data-loc-lat`)||`0`),a=parseFloat(e.getAttribute(`data-loc-lon`)||`0`),s=e.getAttribute(`data-loc-name`)||``,c=e.getAttribute(`data-loc-region`)||``,l=e.getAttribute(`data-loc-country`)||`India`;s&&o({id:t,name:s,region:c,country:l,lat:i,lon:a,display:r}),b(),p&&(p.value=``,p.placeholder=r.split(`,`)[0].trim()),n.setLastLocation(r,t),n.addSavedLocation(r),v(r),window.dispatchEvent(new CustomEvent(`mausam-location-selected`,{detail:{key:t,display:r,lat:i,lon:a}})),window.dispatchEvent(new CustomEvent(`mausam-location-changed`,{detail:{key:t,display:r,lat:i,lon:a}}))})})}p?.addEventListener(`focus`,()=>{if(!p.value.trim()){if(r.isOnline())x(c.slice(0,8));else{let e=n.getSavedLocations().map(e=>{let t=e.split(`,`);return{id:t[0].trim().toLowerCase().replace(/\s+/g,`_`),name:t[0].trim(),region:t[1]?.trim()||``,country:t[2]?.trim()||`India`,lat:28.61,lon:77.2,display:e}});x(e.length>0?e:c.slice(0,6))}}});var S;p?.addEventListener(`input`,e=>{let t=e.target.value.trim();if(clearTimeout(S),!t){x(c.slice(0,8));return}S=setTimeout(async()=>{if(!r.isOnline())x(s(t));else try{let e=await i(t);x(e&&e.length>0?e:s(t))}catch(e){console.warn(`[SubNav] Search error:`,e),x(s(t))}},200)}),document.addEventListener(`click`,e=>{!p?.contains(e.target)&&!m?.contains(e.target)&&b()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&b()}),h?.addEventListener(`click`,async()=>{try{h.classList.add(`opacity-60`);let e=await a();n.setLastLocation(e.display,e.key),n.addSavedLocation(e.display),v(e.display),window.dispatchEvent(new CustomEvent(`mausam-location-selected`,{detail:{key:e.key,display:e.display}})),window.dispatchEvent(new CustomEvent(`mausam-location-changed`,{detail:{key:e.key,display:e.display}}))}catch{alert(`Unable to retrieve GPS location.`)}finally{h.classList.remove(`opacity-60`)}});function C(){let t=document.getElementById(`sub-nav-frosted`);t&&e.translateDocument(t)}window.addEventListener(`mausam-persona-changed`,_),window.addEventListener(`mausam-language-changed`,()=>{C(),_()}),window.addEventListener(`mausam-location-changed`,e=>{e.detail?.display&&v(e.detail.display)}),window.addEventListener(`mausam-location-selected`,e=>{e.detail?.display&&v(e.detail.display)}),window.addEventListener(`mausam-network-status-changed`,()=>{let e=n.getLastLocation();e&&v(e)}),_(),C();var w=n.getLastLocation();w&&v(w);