import{t as e}from"./geocoding.service.BBpeU16T.js";var t=[{name:`Mumbai`,admin1:`Maharashtra`,country:`India`,latitude:19.076,longitude:72.8777},{name:`Delhi`,admin1:`Delhi`,country:`India`,latitude:28.6139,longitude:77.209},{name:`Bengaluru`,admin1:`Karnataka`,country:`India`,latitude:12.9716,longitude:77.5946},{name:`London`,admin1:`England`,country:`United Kingdom`,latitude:51.5074,longitude:-.1278},{name:`Tokyo`,admin1:`Tokyo`,country:`Japan`,latitude:35.6762,longitude:139.6503}],n=[],r=()=>{try{let e=localStorage.getItem(`mausam_saved_locations`);if(e)return JSON.parse(e)}catch(e){console.error(e)}return t},i=e=>{localStorage.setItem(`mausam_saved_locations`,JSON.stringify(e)),n=e,p()},a=document.getElementById(`saved-locations-drawer-backdrop`),o=document.getElementById(`saved-locations-drawer`),s=document.getElementById(`close-saved-drawer-btn`),c=document.getElementById(`saved-cities-list`),l=document.getElementById(`add-location-input`),u=document.getElementById(`add-location-results`),d=()=>{a?.classList.remove(`opacity-0`,`pointer-events-none`),a?.classList.add(`opacity-100`),o?.classList.remove(`translate-x-full`),o?.classList.add(`translate-x-0`),p()},f=()=>{a?.classList.add(`opacity-0`,`pointer-events-none`),a?.classList.remove(`opacity-100`),o?.classList.add(`translate-x-full`),o?.classList.remove(`translate-x-0`),u&&u.classList.add(`hidden`)};s?.addEventListener(`click`,f),a?.addEventListener(`click`,e=>{e.target===a&&f()});var p=()=>{if(!c)return;n=r();let e=window.__MAUSAM_CURRENT_LOCATION__?.name||`Mumbai`;if(n.length===0){c.innerHTML=`
        <div class="text-center py-10 text-slate-500 text-xs">
          No saved cities yet. Search above to add your favorites!
        </div>
      `;return}c.innerHTML=n.map((t,n)=>{let r=t.name.toLowerCase()===e.toLowerCase();return`
        <div 
          class="saved-city-card p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${r?`bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40 shadow-glow-emerald`:`bg-slate-900/60 hover:bg-slate-800/80 border-white/5 hover:border-white/20`}"
          data-city-idx="${n}"
        >
          <div class="flex-1 pr-2">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-semibold text-white">${t.name}</span>
              ${r?`<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">CURRENT</span>`:``}
            </div>
            <p class="text-[11px] text-slate-400">${t.admin1?t.admin1+`, `:``}${t.country||``}</p>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              class="delete-city-btn p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              data-delete-idx="${n}"
              title="Remove from saved"
              aria-label="Remove city"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <div class="text-slate-400 group-hover:text-emerald-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      `}).join(``),c.querySelectorAll(`.saved-city-card`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.delete-city-btn`))return;let r=parseInt(e.getAttribute(`data-city-idx`)||`0`,10),i=n[r];i&&(f(),window.dispatchEvent(new CustomEvent(`mausam-location-selected`,{detail:i})))})}),c.querySelectorAll(`.delete-city-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let r=parseInt(e.getAttribute(`data-delete-idx`)||`0`,10);i(n.filter((e,t)=>t!==r))})})},m=null;l?.addEventListener(`input`,()=>{clearTimeout(m);let e=l.value.trim();if(e.length<2){u&&u.classList.add(`hidden`);return}m=setTimeout(async()=>{try{let t=await(await fetch(`/api/search?q=${encodeURIComponent(e)}`)).json(),r=Array.isArray(t)?t:t.results||t.value||[];r.length>0&&u?(u.innerHTML=r.slice(0,6).map(e=>{let t=e.name||``,n=e.region||e.admin1||``,r=e.country||``,i=e.lat??e.latitude??0,a=e.lon??e.longitude??0;return`
              <div class="p-2.5 hover:bg-slate-800 text-xs text-slate-200 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between add-result-item transition-colors"
                data-loc='${JSON.stringify({name:t,admin1:n,country:r,latitude:i,longitude:a})}'
              >
                <div>
                  <span class="font-semibold text-white">${t}</span>
                  <span class="text-slate-400 text-[10px] ml-1">${n?n+`, `:``}${r}</span>
                </div>
                <span class="text-emerald-400 font-bold text-sm">+</span>
              </div>
            `}).join(``),u.classList.remove(`hidden`),u.querySelectorAll(`.add-result-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=JSON.parse(e.getAttribute(`data-loc`)||`{}`);n.some(e=>e.name.toLowerCase()===t.name.toLowerCase())||i([t,...n]),l.value=``,u.classList.add(`hidden`)})})):u&&(u.innerHTML=`<div class="p-3 text-xs text-slate-400 text-center">No matching locations found</div>`,u.classList.remove(`hidden`))}catch(e){console.error(`Drawer search error:`,e)}},250)}),document.getElementById(`drawer-use-gps`)?.addEventListener(`click`,async()=>{f();let t=document.getElementById(`use-my-location-btn`);if(t)t.click();else try{let t=await e();window.dispatchEvent(new CustomEvent(`mausam-location-selected`,{detail:{name:t.name,admin1:t.region,country:t.country,latitude:t.lat,longitude:t.lon}}))}catch(e){console.warn(`GPS detection failed:`,e)}}),document.getElementById(`drawer-install-pwa`)?.addEventListener(`click`,()=>{f(),window.dispatchEvent(new CustomEvent(`trigger-install-prompt`))}),window.addEventListener(`open-saved-locations`,d);