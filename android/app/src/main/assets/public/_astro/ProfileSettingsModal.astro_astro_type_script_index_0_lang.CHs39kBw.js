import{r as e,t}from"./storage.service.CLMgyCBK.js";var n=[{code:`en`,name:`English`,nativeName:`English`,flag:`🇬🇧`},{code:`hi`,name:`Hindi`,nativeName:`हिन्दी`,flag:`🇮🇳`},{code:`bn`,name:`Bengali`,nativeName:`বাংলা`,flag:`🇮🇳`},{code:`te`,name:`Telugu`,nativeName:`తెలుగు`,flag:`🇮🇳`},{code:`mr`,name:`Marathi`,nativeName:`मराठी`,flag:`🇮🇳`},{code:`ta`,name:`Tamil`,nativeName:`தமிழ்`,flag:`🇮🇳`},{code:`gu`,name:`Gujarati`,nativeName:`ગુજરાતી`,flag:`🇮🇳`},{code:`kn`,name:`Kannada`,nativeName:`ಕನ್ನಡ`,flag:`🇮🇳`},{code:`ml`,name:`Malayalam`,nativeName:`മലയാളം`,flag:`🇮🇳`},{code:`pa`,name:`Punjabi`,nativeName:`ਪੰਜਾਬੀ`,flag:`🇮🇳`},{code:`or`,name:`Odia`,nativeName:`ଓଡ଼ିଆ`,flag:`🇮🇳`},{code:`as`,name:`Assamese`,nativeName:`অসমীয়া`,flag:`🇮🇳`}],r=document.getElementById(`profile-settings-modal`),i=document.getElementById(`close-profile-settings-btn`),a=document.getElementById(`modal-personas-grid`),o=document.getElementById(`modal-languages-grid`);function s(){let i=t.getActivePersona(),c=t.getLanguage();a&&(a.innerHTML=e.map(e=>{let t=e.id===i;return`
          <button type="button" data-modal-persona="${e.id}" class="modal-persona-opt p-3 rounded-xl border text-left transition-all active-scale cursor-pointer flex items-center gap-2.5 ${t?`bg-emerald-500/20 text-emerald-300 border-emerald-400/60 font-bold shadow-glow-emerald`:`bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/10`}">
            <span class="text-xl">${e.icon}</span>
            <div class="truncate">
              <span class="text-xs block font-bold text-white truncate">${e.name.split(`/`)[0].trim()}</span>
              <span class="text-[10px] text-slate-400 block truncate">${e.category}</span>
            </div>
          </button>
        `}).join(``),a.querySelectorAll(`.modal-persona-opt`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.getAttribute(`data-modal-persona`)||`farmer`;t.setActivePersona(n),s(),r?.classList.add(`hidden`),window.dispatchEvent(new CustomEvent(`mausam-persona-changed`,{detail:{personaId:n}}))})})),o&&(o.innerHTML=n.map(e=>{let t=e.code===c;return`
          <button type="button" data-modal-lang="${e.code}" class="modal-lang-opt p-2.5 rounded-xl border text-left transition-all active-scale cursor-pointer flex items-center justify-between ${t?`bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-bold shadow-glow-cyan`:`bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/10`}">
            <div class="truncate">
              <span class="text-xs font-bold text-white block">${e.name}</span>
              <span class="text-[10px] text-slate-400 block">${e.nativeName}</span>
            </div>
            <span class="text-xs shrink-0">${e.flag}</span>
          </button>
        `}).join(``),o.querySelectorAll(`.modal-lang-opt`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.getAttribute(`data-modal-lang`)||`en`;t.setLanguage(n),s(),r?.classList.add(`hidden`),window.dispatchEvent(new CustomEvent(`mausam-language-changed`,{detail:{langCode:n}}))})}))}i?.addEventListener(`click`,()=>{r?.classList.add(`hidden`)}),window.addEventListener(`mausam-open-profile-settings`,()=>{s(),r?.classList.remove(`hidden`)});