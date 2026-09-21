import{n as e,t}from"./i18n.service.Ber3Lkiq.js";import{r as n,t as r}from"./storage.service.DpZMG_4C.js";var i=document.getElementById(`profile-settings-modal`),a=document.getElementById(`close-profile-settings-btn`),o=document.getElementById(`modal-personas-grid`),s=document.getElementById(`modal-languages-grid`);function c(){let a=r.getActivePersona(),l=r.getLanguage();i&&t.translateDocument(i),o&&(o.innerHTML=n.map(e=>{let n=e.id===a,r=e.name.split(`/`)[0].trim(),i=t.t(r,r),o=t.t(e.category,e.category);return`
          <button type="button" data-modal-persona="${e.id}" class="modal-persona-opt p-3 rounded-xl border text-left transition-all active-scale cursor-pointer flex items-center gap-2.5 ${n?`bg-emerald-500/20 text-emerald-300 border-emerald-400/60 font-bold shadow-glow-emerald`:`bg-[#1E293B]/70 hover:bg-[#1E293B] text-slate-300 border-white/[0.08]`}">
            <span class="text-xl">${e.icon}</span>
            <div class="truncate">
              <span class="text-xs block font-bold text-white truncate">${i}</span>
              <span class="text-[10px] text-slate-400 block truncate">${o}</span>
            </div>
          </button>
        `}).join(``),o.querySelectorAll(`.modal-persona-opt`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-modal-persona`)||`farmer`;r.setActivePersona(t),c(),i?.classList.add(`hidden`),window.dispatchEvent(new CustomEvent(`mausam-persona-changed`,{detail:{personaId:t}}))})})),s&&(s.innerHTML=e.map(e=>{let t=e.code===l;return`
          <button type="button" data-modal-lang="${e.code}" class="modal-lang-opt p-2.5 rounded-xl border text-left transition-all active-scale cursor-pointer flex items-center justify-between ${t?`bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-bold shadow-glow-cyan`:`bg-[#1E293B]/70 hover:bg-[#1E293B] text-slate-300 border-white/[0.08]`}">
            <div class="truncate">
              <span class="text-xs font-bold text-white block">${e.name}</span>
              <span class="text-[10px] text-slate-400 block">${e.nativeName}</span>
            </div>
            <span class="text-xs shrink-0">${e.flag}</span>
          </button>
        `}).join(``),s.querySelectorAll(`.modal-lang-opt`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-modal-lang`)||`en`;r.setLanguage(t),c(),i?.classList.add(`hidden`),window.dispatchEvent(new CustomEvent(`mausam-language-changed`,{detail:{langCode:t}}))})}))}a?.addEventListener(`click`,()=>{i?.classList.add(`hidden`)}),window.addEventListener(`mausam-open-profile-settings`,()=>{c(),i?.classList.remove(`hidden`)}),window.addEventListener(`mausam-language-changed`,()=>{i&&!i.classList.contains(`hidden`)&&c()});