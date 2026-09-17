import{t as e}from"./ai.service.srFoyyyu.js";import{t}from"./storage.service.CLMgyCBK.js";import{t as n}from"./profileControls.YjBTPcN8.js";var r=document.getElementById(`kpi-cards-container`),i=document.getElementById(`ai-advisory-main-text`),a=document.getElementById(`ai-primary-rec-text`),o=document.getElementById(`ai-crop-stage-tag`),s=document.getElementById(`ai-status-badge`),c=document.getElementById(`ai-offline-notice-bar`),l=document.getElementById(`operations-checklist-items`),u=document.getElementById(`checklist-progress-text`),d=document.getElementById(`hazards-alerts-items`),f=document.getElementById(`btn-generate-ai-advisory`),p=new Set;function m(e,t){if(!r)return;let i=n[e]||n.farmer;r.innerHTML=``;let a=t?.current?.temp_c?`${t.current.temp_c}°C`:i.kpiCards[2]?.defaultVal||`29.6°C`,o=t?.agriculture?.rainfall_prediction_24h_mm===void 0?i.kpiCards[1]?.defaultVal||`4.5 mm`:`${t.agriculture.rainfall_prediction_24h_mm} mm`,s=t?.agriculture?.soil_moisture_pct?`${t.agriculture.soil_moisture_pct}%`:i.kpiCards[0]?.defaultVal||`58.5%`;i.kpiCards.forEach((e,t)=>{let n=e.defaultVal;t===0?n=s:t===1?n=o:t===2&&(n=a);let i=document.createElement(`div`);i.className=`glass-card-interactive rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-white/10 shadow-glass`,i.innerHTML=`
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>${e.icon}</span> ${e.label}
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            ${e.defaultBadge}
          </span>
        </div>
        <div>
          <div class="text-3xl font-extrabold text-white tracking-apple-tight mb-2">
            ${n}
          </div>
          <div class="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden mb-2">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${e.defaultProgress}%;"></div>
          </div>
          <p class="text-xs text-slate-300 font-light leading-relaxed">
            ${e.description}
          </p>
        </div>
      `,r.appendChild(i)})}function h(e){let t=n[e]||n.farmer;l&&(l.innerHTML=``,!t.defaultOperations||t.defaultOperations.length===0?l.innerHTML=`<p class="text-xs text-slate-400">All standard protocols completed for this profile.</p>`:(t.defaultOperations.forEach(t=>{let n=p.has(t.id),r=document.createElement(`label`);r.className=`flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950/90 border border-white/10 cursor-pointer transition-all`,r.innerHTML=`
            <input type="checkbox" ${n?`checked`:``} class="mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-slate-900" />
            <div class="flex-1 min-w-0">
              <span class="text-xs font-semibold ${n?`line-through text-slate-500`:`text-slate-200`}">${t.task}</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">${t.category}</span>
            </div>
            <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${t.status===`urgent`?`bg-amber-500/20 text-amber-300`:`bg-emerald-500/20 text-emerald-300`}">${t.status}</span>
          `;let i=r.querySelector(`input`);i?.addEventListener(`change`,()=>{i.checked?p.add(t.id):p.delete(t.id),h(e)}),l.appendChild(r)}),u&&(u.textContent=`${p.size} of ${t.defaultOperations.length} Completed`))),d&&(d.innerHTML=``,!t.hazards||t.hazards.length===0?d.innerHTML=`
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-300 flex items-center gap-2">
            <span>🛡️</span> <span>No active weather hazards for this profile. Conditions nominal.</span>
          </div>
        `:t.hazards.forEach(e=>{let t=document.createElement(`div`);t.className=`p-3.5 rounded-xl bg-slate-950/80 border border-white/10`,t.innerHTML=`
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span>⚠️</span> ${e.title}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">${e.severity}</span>
            </div>
            <p class="text-xs text-slate-300 font-light mt-1 leading-relaxed">${e.desc}</p>
          `,d.appendChild(t)}))}async function g(n){let r=navigator.onLine,l=t.getLastLocation();c&&(r?c.classList.add(`hidden`):c.classList.remove(`hidden`)),s&&(s.textContent=r?`Gemini AI Active`:`AI OFFLINE`,s.className=r?`text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30`:`text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10`);let u=t.getProfileCustomSettings(n);o&&(o.textContent=`${u.target_crop||`Wheat`} • ${u.growth_stage||`Vegetative`} Phase`);try{let t=await e(n,`current_location`,l);i&&(i.textContent=t.recommendation),a&&(a.textContent=t.recommendation)}catch{i&&(i.textContent=`Select your target options above and click 'Generate Live AI' to view tailored recommendations.`)}}f?.addEventListener(`click`,()=>{g(t.getActivePersona())});var _=document.getElementById(`tab-btn-advisory`),v=document.getElementById(`tab-btn-curve`),y=document.getElementById(`tab-btn-sensors`);_?.addEventListener(`click`,()=>{document.getElementById(`ai-advisory-container`)?.scrollIntoView({behavior:`smooth`})}),v?.addEventListener(`click`,()=>{document.getElementById(`hourly-overview-graph-card`)?.scrollIntoView({behavior:`smooth`})}),y?.addEventListener(`click`,()=>{document.getElementById(`weather-diagnostics-section`)?.scrollIntoView({behavior:`smooth`})}),window.addEventListener(`mausam-persona-changed`,e=>{let n=e.detail?.personaId||t.getActivePersona();p.clear(),m(n),h(n),g(n)}),window.addEventListener(`mausam-profile-option-selected`,e=>{g(e.detail?.personaId||t.getActivePersona())}),window.addEventListener(`mausam-weather-updated`,e=>{m(t.getActivePersona(),e.detail)});var b=t.getActivePersona();m(b),h(b),g(b);