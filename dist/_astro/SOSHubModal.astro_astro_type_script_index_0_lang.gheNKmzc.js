import{t as e}from"./i18n.service.Ber3Lkiq.js";import{t}from"./storage.service.DpZMG_4C.js";import{n}from"./survival-guides.service.DsRqSUVN.js";var r=class{static isBeaconActive=!1;static peers=[];static listeners=[];static startBeacon(){return this.isBeaconActive=!0,this.peers=[{id:`relay-101`,name:`NDRF Relay Node Alpha`,distanceMeters:45,rssi:-62,lastSeen:Date.now(),batteryPct:92,isRelay:!0},{id:`peer-408`,name:`Civil Defense Scout #4`,distanceMeters:110,rssi:-78,lastSeen:Date.now(),batteryPct:74,isRelay:!1},{id:`peer-812`,name:`Mausam User Device`,distanceMeters:230,rssi:-86,lastSeen:Date.now(),batteryPct:61,isRelay:!1}],this.notify(),!0}static stopBeacon(){this.isBeaconActive=!1,this.peers=[],this.notify()}static isBroadcasting(){return this.isBeaconActive}static getPeers(){return this.peers}static subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}static notify(){this.listeners.forEach(e=>e(this.peers))}},i=class{static getNearbyShelters(e=`New Delhi`){let t=e.toLowerCase().includes(`mumbai`)||e.toLowerCase().includes(`chennai`)||e.toLowerCase().includes(`puri`);return[{id:`sh-1`,name:t?`Coastal Disaster Relief Cyclone Shelter #12`:`District Emergency Relief Camp (Community Center)`,type:t?`cyclone_shelter`:`relief_camp`,address:`Sector 4 Disaster Zone Safe Enclave`,distanceKm:1.2,bearingDeg:45,capacity:1200,currentOccupancy:340,hasPower:!0,hasMedical:!0,contact:`1077 / 011-23456789`},{id:`sh-2`,name:`Government Multi-Specialty General Hospital`,type:`hospital`,address:`Main Health Corridor, Gate #3`,distanceKm:2.8,bearingDeg:135,capacity:800,currentOccupancy:520,hasPower:!0,hasMedical:!0,contact:`102 / 108`},{id:`sh-3`,name:`Red Cross Flood Resiliency Shelter Center`,type:`community_hall`,address:`High-Ground Elevated Sports Complex`,distanceKm:4.1,bearingDeg:280,capacity:2500,currentOccupancy:610,hasPower:!0,hasMedical:!0,contact:`1800-112-233`}]}static getDirectionLabel(e){return[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`][Math.round(e/45)%8]}},a=document.getElementById(`sos-hub-modal`),o=document.getElementById(`close-sos-hub-btn`),s=document.getElementById(`btn-toggle-ble-beacon`),c=document.getElementById(`ble-mesh-status-panel`),l=document.getElementById(`sos-shelters-list`),u=document.getElementById(`sos-survival-guides-list`),d=!1;function f(){if(!l)return;let e=t.getLastLocation();l.innerHTML=i.getNearbyShelters(e).map(e=>{let t=i.getDirectionLabel(e.bearingDeg);return`
        <div class="p-3.5 rounded-xl bg-[#1E293B]/80 border border-white/[0.08] flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0" style="transform: rotate(${e.bearingDeg}deg);">
              ➤
            </div>
            <div>
              <div class="text-xs font-bold text-white">${e.name}</div>
              <div class="text-[11px] text-slate-400 font-light mt-0.5">${e.address} • Occupancy: ${e.currentOccupancy}/${e.capacity}</div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-xs font-extrabold text-cyan-300">${e.distanceKm} km</div>
            <div class="text-[10px] text-slate-400 font-bold">${t} (${e.bearingDeg}°)</div>
          </div>
        </div>
      `}).join(``)}function p(){u&&(u.innerHTML=n.getAllGuides().map(e=>`
      <details class="group p-3 rounded-xl bg-[#1E293B]/70 border border-white/[0.08] cursor-pointer">
        <summary class="flex items-center justify-between text-xs font-bold text-white list-none">
          <div class="flex items-center gap-2">
            <span>${e.icon}</span> <span>${e.title}</span>
          </div>
          <span class="text-slate-400 text-xs group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div class="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2">
          <div>
            <span class="text-[10px] font-bold text-emerald-400 uppercase">Immediate DOs:</span>
            <ul class="list-disc list-inside text-slate-300 mt-1 space-y-0.5">
              ${e.dos.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
          </div>
          <div>
            <span class="text-[10px] font-bold text-rose-400 uppercase">DON'Ts:</span>
            <ul class="list-disc list-inside text-slate-300 mt-1 space-y-0.5">
              ${e.donts.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
          </div>
          <div class="text-[11px] text-slate-400 font-light">
            <span class="font-semibold text-white">Emergency Go-Bag:</span> ${e.goBagItems.join(`, `)}
          </div>
        </div>
      </details>
    `).join(``))}s?.addEventListener(`click`,()=>{d=!d,d?(r.startBeacon(),s.textContent=e.t(`stopBeacon`,`Stop SOS Beacon`),s.className=`px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer`,c?.classList.remove(`hidden`)):(r.stopBeacon(),s.textContent=e.t(`startBeacon`,`Start SOS Beacon`),s.className=`px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all active-scale cursor-pointer shadow-lg`,c?.classList.add(`hidden`))}),o?.addEventListener(`click`,()=>{a?.classList.add(`hidden`)}),window.addEventListener(`mausam-open-sos-hub`,()=>{f(),p(),a&&e.translateDocument(a),a?.classList.remove(`hidden`)}),window.addEventListener(`mausam-language-changed`,()=>{a&&e.translateDocument(a),!d&&s?s.textContent=e.t(`startBeacon`,`Start SOS Beacon`):d&&s&&(s.textContent=e.t(`stopBeacon`,`Stop SOS Beacon`))});