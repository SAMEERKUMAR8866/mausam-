import{n as e,r as t,t as n}from"./storage.service.CLMgyCBK.js";import{t as r}from"./profileControls.YjBTPcN8.js";var i=document.getElementById(`profile-banner-icon`),a=document.getElementById(`profile-banner-title`),o=document.getElementById(`profile-banner-subtitle`),s=document.getElementById(`quick-switch-pills-container`),c=document.getElementById(`dynamic-controls-container`),l=document.getElementById(`btn-switch-profile-modal`),u=document.getElementById(`btn-profile-settings-tune`);l?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`mausam-open-profile-settings`))}),u?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`mausam-open-profile-settings`))});function d(e){s&&(s.innerHTML=``,t.forEach(t=>{let r=t.id===e,i=document.createElement(`button`);i.type=`button`,i.className=`px-3 py-1 rounded-full text-xs font-medium transition-all active-scale cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${r?`bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold shadow-glow-emerald`:`bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/10`}`,i.innerHTML=`<span>${t.icon}</span> <span>${t.name.split(`/`)[0].trim()}</span>`,i.addEventListener(`click`,()=>{n.setActivePersona(t.id),p(t.id),window.dispatchEvent(new CustomEvent(`mausam-persona-changed`,{detail:{personaId:t.id}}))}),s.appendChild(i)}))}function f(e){if(!c)return;c.innerHTML=``;let t=r[e]||r.farmer;!t.controls||t.controls.length===0||t.controls.forEach(t=>{let r=document.createElement(`div`);r.className=`glass-panel rounded-2xl p-4 sm:p-5 border border-white/10`;let i=n.getProfileCustomSettings(e)[t.groupId]||t.options[0]?.id,a=``;a=t.groupId===`target_crop`?`
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
            ${t.options.map(e=>{let n=e.id===i;return`
                <button type="button" data-group="${t.groupId}" data-opt="${e.id}" class="control-opt-btn active-scale p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden ${n?`bg-slate-900/90 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50`:`bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60`}">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">${e.icon||`🌱`}</span>
                    ${e.badge?`<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">${e.badge}</span>`:``}
                  </div>
                  <div class="font-bold text-sm text-white">${e.label}</div>
                  <div class="text-xs text-slate-400 font-normal">${e.subLabel||``}</div>
                </button>
              `}).join(``)}
          </div>
        `:`
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            ${t.options.map(e=>{let n=e.id===i;return`
                <button type="button" data-group="${t.groupId}" data-opt="${e.id}" class="control-opt-btn active-scale p-3 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${n?`bg-slate-900/90 border-emerald-400 shadow-glow-emerald ring-1 ring-emerald-400/50`:`bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60`}">
                  <span class="font-bold text-xs ${n?`text-emerald-300`:`text-slate-200`}">${e.label}</span>
                  <span class="text-[11px] text-slate-400 font-light mt-0.5">${e.subLabel||``}</span>
                </button>
              `}).join(``)}
          </div>
        `,r.innerHTML=`
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>${t.icon}</span> ${t.title}
          </span>
          <span class="text-xs text-slate-400 font-light">${t.subTitle}</span>
        </div>
        ${a}
      `,r.querySelectorAll(`.control-opt-btn`).forEach(t=>{t.addEventListener(`click`,()=>{let r=t.getAttribute(`data-group`)||``,i=t.getAttribute(`data-opt`)||``;n.setProfileCustomSetting(e,r,i),f(e),window.dispatchEvent(new CustomEvent(`mausam-profile-option-selected`,{detail:{personaId:e,groupId:r,optionId:i}}))})}),c.appendChild(r)})}function p(t){let n=e[t]||e.farmer,s=r[t]||r.farmer;i&&(i.textContent=n.icon),a&&(a.textContent=s.title),o&&(o.textContent=s.subtitle),d(t),f(t)}window.addEventListener(`mausam-persona-changed`,e=>{p(e.detail?.personaId||n.getActivePersona())}),p(n.getActivePersona());