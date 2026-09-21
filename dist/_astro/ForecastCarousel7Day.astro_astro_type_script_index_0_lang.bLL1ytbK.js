import{t as e}from"./i18n.service.Ber3Lkiq.js";var t=document.getElementById(`forecast-days-container`),n=document.getElementById(`forecast-carousel-prev`),r=document.getElementById(`forecast-carousel-next`),i=[],a=0;function o(n){if(!t)return;i=n,t.innerHTML=``;let r=e.t(`today`,`TODAY`).toUpperCase();n.forEach((n,s)=>{let c=s===a,l=document.createElement(`button`);l.type=`button`,l.className=`forecast-day-card spotlight-card framer-spring-hover framer-spring-press shrink-0 snap-start w-[130px] sm:w-[160px] p-3 sm:p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${c?`bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)] border-t-cyan-300 ring-2 ring-cyan-400/30 scale-[1.02]`:`bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-white/25 hover:bg-slate-900/80 border-t-white/15`}`,l.setAttribute(`data-day-index`,String(s));let u=`🌤️`;n.icon===`sunny`?u=`☀️`:n.icon===`rainy`?u=`🌧️`:n.icon===`cloudy`?u=`⛅`:n.icon===`stormy`?u=`⛈️`:n.icon===`moon`&&(u=`🌙`);let d=n.isToday?e.t(`today`,n.label):e.t(n.label,n.label),f=e.translateWeather(n.condition);l.innerHTML=`
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-xs tracking-apple-tight ${c?`text-cyan-300 font-extrabold`:`text-slate-200`}">${d}</span>
          ${n.isToday?`<span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">${r}</span>`:``}
          ${!n.isToday&&n.rain_chance_pct>30?`<span class="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">💧 ${n.rain_chance_pct}%</span>`:``}
        </div>

        <div class="flex items-center gap-2.5 my-2">
          <span class="text-2xl sm:text-3xl drop-shadow-sm">${u}</span>
          <div class="flex flex-col">
            <span class="text-base sm:text-lg font-black text-white leading-none">${n.temp_max_c}°</span>
            <span class="text-[11px] text-slate-400 font-medium mt-0.5">${n.temp_min_c}°</span>
          </div>
        </div>

        <!-- 21st.dev Mini Temperature Range Sparkline Bar -->
        <div class="w-full bg-slate-950/80 rounded-full h-1 overflow-hidden my-1 relative border border-white/5">
          <div class="spectrum-bar-thermal h-full rounded-full w-full opacity-80"></div>
        </div>

        <div class="text-[11px] text-slate-300 truncate font-light mt-0.5">
          ${f}
        </div>
      `,l.addEventListener(`click`,()=>{a=s,o(i),window.dispatchEvent(new CustomEvent(`mausam-forecast-day-selected`,{detail:{dayIndex:s,dayData:n}}))}),t.appendChild(l)})}n?.addEventListener(`click`,()=>{t?.scrollBy({left:-220,behavior:`smooth`})}),r?.addEventListener(`click`,()=>{t?.scrollBy({left:220,behavior:`smooth`})}),window.addEventListener(`mausam-weather-updated`,e=>{e.detail?.forecast7Day&&Array.isArray(e.detail.forecast7Day)&&(a=0,o(e.detail.forecast7Day))}),window.addEventListener(`mausam-language-changed`,()=>{let t=document.getElementById(`forecast-carousel-section`);t&&e.translateDocument(t),i.length>0&&o(i)});