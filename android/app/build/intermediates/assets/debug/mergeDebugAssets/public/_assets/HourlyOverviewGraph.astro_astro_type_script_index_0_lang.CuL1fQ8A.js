var e=`actual`,t=[],n=`06:03 AM`,r=`06:28 PM`,i=null,a=null,o=`Clear`,s=`sunny`,c=10,l=60,u=!0,d=document.getElementById(`btn-temp-actual`),f=document.getElementById(`btn-temp-feels`),p=document.getElementById(`spline-area-path`),m=document.getElementById(`spline-stroke-path`),h=document.getElementById(`svg-points-group`),g=document.getElementById(`hourly-columns-overlay`),_=document.getElementById(`graph-interactive-readout`),v=document.getElementById(`legend-sunrise-time`),y=document.getElementById(`legend-sunset-time`),b=document.getElementById(`moon-phase-icon`),x=document.getElementById(`moon-phase-name`),S=document.getElementById(`moon-illumination-val`),C=document.getElementById(`hourly-active-day-badge`);function w(){if(!t||t.length===0)return;let e=new Date().getHours();t.forEach(t=>{u&&t.hour===e?(t.isCurrentHour=!0,i!==null&&(t.temp_c=i),a!==null&&(t.feels_like_c=a),o&&(t.condition=o),s&&(t.icon=s),c&&(t.wind_kph=c),l&&(t.humidity=l)):t.isCurrentHour=!1})}function T(e){if(e.length===0)return``;if(e.length===1)return`M ${e[0].x} ${e[0].y}`;let t=`M ${e[0].x} ${e[0].y}`;for(let n=0;n<e.length-1;n++){let r=e[n===0?n:n-1],i=e[n],a=e[n+1],o=e[n+2<e.length?n+2:n+1],s=i.x+(a.x-r.x)/6,c=i.y+(a.y-r.y)/6,l=a.x-(o.x-i.x)/6,u=a.y-(o.y-i.y)/6;t+=` C ${s.toFixed(1)} ${c.toFixed(1)}, ${l.toFixed(1)} ${u.toFixed(1)}, ${a.x.toFixed(1)} ${a.y.toFixed(1)}`}return t}function E(){if(!t||t.length===0||!m||!p||!g)return;w();let i=1e3,a=t.map(t=>e===`actual`?t.temp_c:t.feels_like_c),o=Math.min(...a)-2,s=Math.max(...a)+2,c=Math.max(1,s-o),l=i/(t.length-1),d=a.map((e,t)=>({x:t*l,y:160-(e-o)/c*125})),f=e===`actual`?`#06b6d4`:`#f59e0b`,v=T(d);m.setAttribute(`d`,v),m.setAttribute(`stroke`,f);let y=`${v} L ${i} 160 L 0 160 Z`;p.setAttribute(`d`,y),p.setAttribute(`fill`,e===`actual`?`url(#tempSplineGradient)`:`url(#feelsSplineGradient)`);let b=t.findIndex(e=>e.hour===6),x=t.findIndex(e=>e.hour===18),S=b>=0?d[b].x:250,C=b>=0?d[b].y:80,E=x>=0?d[x].x:750,D=x>=0?d[x].y:80,O=document.getElementById(`svg-sunrise-line`),k=document.getElementById(`svg-sunrise-dot`),A=document.getElementById(`svg-sunset-line`),j=document.getElementById(`svg-sunset-dot`);if(O&&(O.setAttribute(`x1`,String(S)),O.setAttribute(`x2`,String(S))),k&&(k.setAttribute(`cx`,String(S)),k.setAttribute(`cy`,String(C))),A&&(A.setAttribute(`x1`,String(E)),A.setAttribute(`x2`,String(E))),j&&(j.setAttribute(`cx`,String(E)),j.setAttribute(`cy`,String(D))),h){let n=new Date().getHours(),r=``;d.forEach((i,a)=>{let o=t[a],s=u&&(o.isCurrentHour||o.hour===n),c=e===`actual`?o.temp_c:o.feels_like_c,l=Math.round(c);r+=s?`
            <g class="current-hour-node-group">
              <circle cx="${i.x.toFixed(1)}" cy="${i.y.toFixed(1)}" r="10" fill="${f}" opacity="0.35" class="animate-ping" />
              <circle cx="${i.x.toFixed(1)}" cy="${i.y.toFixed(1)}" r="6" fill="${f}" stroke="#ffffff" stroke-width="2" class="filter drop-shadow-[0_0_8px_${f}]" />
              <circle cx="${i.x.toFixed(1)}" cy="${i.y.toFixed(1)}" r="2.5" fill="#ffffff" />
              
              <!-- Floating Live Badge -->
              <g transform="translate(${i.x.toFixed(1)}, ${Math.max(16,i.y-18).toFixed(1)})">
                <rect x="-27" y="-11" width="54" height="18" rx="5" fill="#090d16" stroke="${f}" stroke-width="1.2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.6))" />
                <text x="0" y="2" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">LIVE ${l}°</text>
              </g>
            </g>
          `:`
            <circle cx="${i.x.toFixed(1)}" cy="${i.y.toFixed(1)}" r="2.5" fill="${f}" opacity="0.45" />
          `}),h.innerHTML=r}g.innerHTML=``;let M=new Date().getHours(),N=null;if(t.forEach(t=>{let i=document.createElement(`div`),a=u&&(t.isCurrentHour||t.hour===M);a&&(N=t),i.className=`flex flex-col justify-between items-center py-2 h-full transition-all group cursor-pointer relative ${a?`bg-cyan-500/15 rounded-xl border border-cyan-400/50 shadow-glow-cyan ring-1 ring-cyan-400/30`:`hover:bg-white/[0.04]`}`;let o=Math.max(4,Math.round(t.rain_chance_pct/100*35)),s=e===`actual`?t.temp_c:t.feels_like_c;i.innerHTML=`
        <!-- Top: Temperature Value & Weather Icon -->
        <div class="flex flex-col items-center">
          <div class="flex items-center gap-1">
            <span class="text-[11px] font-bold ${a?`text-cyan-300 text-xs font-black`:`text-white`}">
              ${Math.round(s)}°
            </span>
            ${a?`
              <span class="text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-cyan-400/25 text-cyan-200 border border-cyan-400/40">
                NOW
              </span>
            `:``}
          </div>
          <span class="text-xs my-0.5" title="${t.condition}">
            ${t.icon===`sunny`?`☀️`:t.icon===`rainy`?`🌧️`:t.icon===`moon`?`🌙`:`⛅`}
          </span>
        </div>

        <!-- Solar event pill badges if sunrise/sunset -->
        ${t.hour===6?`
          <div class="absolute top-[85px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[9px] font-bold z-10 whitespace-nowrap shadow-sm animate-pulse">
            🌅 ${n}
          </div>
        `:t.hour===18?`
          <div class="absolute top-[85px] px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40 text-[9px] font-bold z-10 whitespace-nowrap shadow-sm animate-pulse">
            🌇 ${r}
          </div>
        `:``}

        <!-- Bottom: Precipitation Percentage Bar & Time Slot Label -->
        <div class="w-full flex flex-col items-center pt-1 border-t border-white/5">
          <div class="w-2.5 bg-slate-800 rounded-full h-[36px] flex items-end overflow-hidden mb-1">
            <div class="w-full bg-blue-500/80 transition-all rounded-full" style="height: ${o}px;"></div>
          </div>
          <span class="text-[9px] font-semibold text-blue-300 mb-0.5">
            ${t.rain_chance_pct>0?`${t.rain_chance_pct}%`:`0%`}
          </span>
          <span class="text-[10px] font-medium ${a?`text-cyan-300 font-bold`:`text-slate-400`}">
            ${t.time}
          </span>
        </div>
      `;let c=()=>{_&&(_.textContent=`${a?`⚡ NOW • `:``}${t.time}: ${t.temp_c}°C (Feels like ${t.feels_like_c}°C) • ${t.condition} • Rain: ${t.rain_chance_pct}% • Wind: ${t.wind_kph} kph`)};i.addEventListener(`mouseenter`,c),i.addEventListener(`click`,c),g.appendChild(i)}),_&&N){let e=N;_.textContent=`⚡ Live (${e.time}): ${e.temp_c}°C (Feels like ${e.feels_like_c}°C) • ${e.condition} • Rain: ${e.rain_chance_pct}% • Wind: ${e.wind_kph} kph`}}d?.addEventListener(`click`,()=>{e=`actual`,d.className=`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer bg-cyan-500 text-slate-950 shadow-sm`,f?.setAttribute(`class`,`px-3.5 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer`),E()}),f?.addEventListener(`click`,()=>{e=`feels`,f.className=`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm`,d?.setAttribute(`class`,`px-3.5 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer`),E()}),window.addEventListener(`mausam-forecast-day-selected`,e=>{let n=e.detail?.dayData,r=e.detail?.dayIndex??0;n&&(u=r===0||n.isToday===!0,t=(n.hourly||[]).map(e=>({...e})),C&&(C.textContent=n.label,C.className=u?`text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30`:`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10`),E())}),window.addEventListener(`mausam-weather-updated`,e=>{let u=e.detail;if(u){let e=Number(u.current?.temp_c??u.current_temperature??u.details?.temp_current_c);isNaN(e)||(i=e);let d=Number(u.details?.feels_like_c??u.current?.feels_like_c??i);isNaN(d)||(a=d),u.current?.condition?.text&&(o=u.current.condition.text),u.current?.condition?.icon&&(s=u.current.condition.icon),u.current?.wind_kph!==void 0&&(c=u.current.wind_kph),u.current?.humidity!==void 0&&(l=u.current.humidity),u.hourlyForecast&&Array.isArray(u.hourlyForecast)&&(t=u.hourlyForecast.map(e=>({...e}))),u.astronomy&&(n=u.astronomy.sunrise||`06:03 AM`,r=u.astronomy.sunset||`06:28 PM`,v&&(v.textContent=n),y&&(y.textContent=r),b&&(b.textContent=u.astronomy.moon_icon||`🌘`),x&&(x.textContent=u.astronomy.moon_phase||`Waxing Crescent`),S&&(S.textContent=`${u.astronomy.moon_illumination||38}% Illumination`)),E()}});try{let e=localStorage.getItem(`mausam_last_weather_data`);if(e){let u=JSON.parse(e);if(u){let e=Number(u.current?.temp_c??u.current_temperature??u.details?.temp_current_c);isNaN(e)||(i=e);let d=Number(u.details?.feels_like_c??u.current?.feels_like_c??i);isNaN(d)||(a=d),u.current?.condition?.text&&(o=u.current.condition.text),u.current?.condition?.icon&&(s=u.current.condition.icon),u.current?.wind_kph!==void 0&&(c=u.current.wind_kph),u.current?.humidity!==void 0&&(l=u.current.humidity),u.hourlyForecast&&(t=u.hourlyForecast.map(e=>({...e}))),u.astronomy&&(n=u.astronomy.sunrise||`06:03 AM`,r=u.astronomy.sunset||`06:28 PM`,v&&(v.textContent=n),y&&(y.textContent=r),b&&(b.textContent=u.astronomy.moon_icon||`🌘`),x&&(x.textContent=u.astronomy.moon_phase||`Waxing Crescent`),S&&(S.textContent=`${u.astronomy.moon_illumination||38}% Illumination`)),E()}}}catch{}