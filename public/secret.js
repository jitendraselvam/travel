'use strict';
const SECRET=[
  {
    "name": "1930s Holiday Nostalgia Train",
    "place": "Second Avenue subway station, East Houston Street, Manhattan, NY",
    "area": "Lower East Side",
    "kind": "Seasonal",
    "price": "Regular subway fare",
    "booking": "No booking",
    "desc": "Ride vintage subway cars with wicker seats, ceiling fans and period advertisements.",
    "timing": "Nov 29: previously listed 10 AM, noon, 2 PM and 4 PM departures from Second Avenue. Verify schedule and boarding station.",
    "url": "https://www.nytransitmuseum.org/holiday-nostalgia-rides/",
    "day": 4
  },
  {
    "name": "Grand Central Holiday Train Show",
    "place": "New York Transit Museum Gallery Annex, Grand Central Terminal, Manhattan, NY",
    "area": "Midtown",
    "kind": "Seasonal",
    "price": "Free",
    "booking": "No booking",
    "desc": "Miniature trains pass through a model New York on the way to the North Pole.",
    "timing": "Combine with your Nov 29 Grand Central stop; check gallery hours.",
    "url": "https://grandcentralterminal.com/event/new-york-transit-museums-holiday-train-show/",
    "day": 4
  },
  {
    "name": "The Back Room",
    "place": "102 Norfolk Street, Manhattan, NY",
    "area": "Lower East Side",
    "kind": "Nightlife",
    "price": "Drinks extra; check cover",
    "booking": "RSVP recommended · 21+",
    "desc": "Prohibition-era speakeasy with cocktails served in teacups, tucked behind a discreet entrance.",
    "timing": "Monday Nov 30: check whether live jazz is running and confirm start time and RSVP.",
    "url": "https://backroomnyc.com/",
    "day": 5
  },
  {
    "name": "Speakeasy Magick",
    "place": "Overlook Bar, New York, NY",
    "area": "Manhattan",
    "kind": "Nightlife",
    "price": "Previously listed $179/person",
    "booking": "Advance tickets · 21+",
    "desc": "Intimate close-up magic and illusions performed around the tables.",
    "timing": "Nov 28 or 29 were suggested; confirm venue, show dates and availability.",
    "url": "https://speakeasymagick.com/",
    "day": 3
  },
  {
    "name": "Dream House",
    "place": "275 Church Street, Manhattan, NY",
    "area": "Tribeca",
    "kind": "Curiosities",
    "price": "Previously listed $10",
    "booking": "Check opening hours",
    "desc": "Immersive magenta light and sustained sound installation. Move around to hear the frequencies change; can be loud.",
    "timing": "Allow 30 minutes; combine with downtown Nov 28.",
    "url": "https://melafoundation.org/calendar.htm",
    "day": 3
  },
  {
    "name": "Mmuseumm",
    "place": "4 Cortlandt Alley, Manhattan, NY",
    "area": "Chinatown / Tribeca",
    "kind": "Curiosities",
    "price": "Free / donation (check)",
    "booking": "Check opening hours",
    "desc": "Tiny museum of unusual everyday objects inside a former freight elevator. Viewing windows may be accessible when closed.",
    "timing": "Allow 15 minutes; try during the Nov 28 downtown route.",
    "url": "https://www.mmuseumm.com/",
    "day": 3
  },
  {
    "name": "The New York Earth Room",
    "place": "141 Wooster Street, Manhattan, NY",
    "area": "SoHo",
    "kind": "Curiosities",
    "price": "Free",
    "booking": "Check opening hours",
    "desc": "A loft filled with 280,000 pounds of earth, an installation by Walter De Maria dating to 1977.",
    "timing": "Allow 15 minutes; combine with SoHo on Nov 28.",
    "url": "https://www.diaart.org/visit/visit-our-locations-sites/walter-de-maria-the-new-york-earth-room-new-york-united-states",
    "day": 3
  },
  {
    "name": "Tannen’s Magic Shop",
    "place": "45 West 34th Street, Manhattan, NY",
    "area": "Midtown",
    "kind": "Curiosities",
    "price": "Free to browse; show extra",
    "booking": "Book show separately",
    "desc": "Historic magic shop on the sixth floor of an office building; props, cards and illusions.",
    "timing": "Check store hours; possible Nov 30 detour.",
    "url": "https://www.tannens.com/pages/magic-after-hours",
    "day": 5
  },
  {
    "name": "The City Reliquary",
    "place": "370 Metropolitan Avenue, Brooklyn, NY",
    "area": "Williamsburg",
    "kind": "Museums",
    "price": "Previously listed $10",
    "booking": "Check opening hours",
    "desc": "Tiny neighborhood museum with subway tokens, architectural fragments and NYC memorabilia.",
    "timing": "Allow 30–45 minutes; Williamsburg detour, not on the current main route.",
    "url": "https://www.cityreliquary.org/",
    "day": 3
  },
  {
    "name": "Merchant’s House Museum",
    "place": "29 East 4th Street, Manhattan, NY",
    "area": "NoHo",
    "kind": "Museums",
    "price": "Previously listed $15.50–20.50",
    "booking": "Check tours / tickets",
    "desc": "Preserved 1832 home with original furnishings and a reputation for being haunted.",
    "timing": "Combine with Washington Square Park on Nov 30 if open.",
    "url": "https://merchantshouse.org/",
    "day": 5
  },
  {
    "name": "New York Transit Museum",
    "place": "99 Schermerhorn Street, Brooklyn, NY",
    "area": "Downtown Brooklyn",
    "kind": "Museums",
    "price": "Previously listed $15",
    "booking": "Advance booking recommended",
    "desc": "Explore a former subway station and historic train carriages from different decades.",
    "timing": "Allow 60–90 minutes; optional Brooklyn detour on Nov 28.",
    "url": "https://www.nytransitmuseum.org/know-before-you-visit/",
    "day": 3
  },
  {
    "name": "Elevated Acre",
    "place": "55 Water Street, Manhattan, NY",
    "area": "Financial District",
    "kind": "Hidden spaces",
    "price": "Free",
    "booking": "No booking; check access",
    "desc": "Elevated garden between skyscrapers with waterfront views. Look for the escalator at 55 Water Street.",
    "timing": "Allow 20 minutes; combine with Wall Street on Nov 28.",
    "url": "",
    "day": 3
  },
  {
    "name": "Queens Museum",
    "place": "New York City Building, Flushing Meadows Corona Park, Queens, NY",
    "area": "Queens",
    "kind": "Museums",
    "price": "Pay what you wish; suggested $8 (check)",
    "booking": "Check opening hours",
    "desc": "See the enormous Panorama of the City of New York, a scale model of all five boroughs.",
    "timing": "Allow 60–90 minutes plus travel; pair with Flushing food if you choose a Queens detour.",
    "url": "https://queensmuseum.org/",
    "day": 5
  },
  {
    "name": "69 Atlantic",
    "place": "69 Atlantic Avenue, Brooklyn, NY",
    "area": "Brooklyn Heights",
    "kind": "Nightlife",
    "price": "Previously listed $125–200",
    "booking": "Check waitlist · 21+",
    "desc": "Small magic theater hidden behind a curiosity shop with puzzles, games and optical illusions.",
    "timing": "Previously described as waitlist only; check current availability. Shop may be a separate visit.",
    "url": "https://69atlantic.com/",
    "day": 3
  }
];
let secretFilter='All';
function iTrainName(name){return name==='1930s Holiday Nostalgia Train'?'Holiday Nostalgia Train':name;}
function secretRecord(i){const r=SECRET[i];return r?{name:r.name,place:r.place,desc:r.desc,day:'Secret NYC',type:'secret'}:null;}
function renderSecret(){const kinds=['All',...new Set(SECRET.map(r=>r.kind))];return `<section class="panel secret-intro"><p class="eyebrow">THE OTHER SIDE OF NEW YORK · 14 DISCOVERIES</p><h2 class="page-title">Secret NYC.</h2><p>Vintage trains, hidden rooms, magic and the city’s curious little corners.</p><p class="small">Optional ideas only. Nothing is added to the main schedule until you choose a day and save. Prices and dates are planning notes from our earlier shortlist, not live ticket or opening-hour checks. Confirm holiday hours, exact venues and availability before going.</p><div class="action-row">${kinds.map(k=>`<button class="action ${secretFilter===k?'secret-active':''}" data-secret-filter="${attr(k)}" aria-pressed="${secretFilter===k}">${esc(k)}</button>`).join('')}</div></section><section class="panel"><div class="panel-head"><h3>Discover something different</h3><span class="muted">${SECRET.filter(r=>secretFilter==='All'||r.kind===secretFilter).length} places</span></div><div class="cards secret-cards">${SECRET.map((r,i)=>secretFilter!=='All'&&r.kind!==secretFilter?'':`<article class="place-card secret-card"><div class="eyebrow">${esc(r.kind)} · ${esc(r.area)}</div><h4>${esc(r.name)}</h4><div class="address">${esc(r.place)}</div><p>${esc(r.desc)}</p><div class="secret-meta"><span class="chip">${esc(r.price)}</span><span class="chip">${esc(r.booking)}</span></div><p class="getting"><strong>When:</strong> ${esc(r.timing)}</p><div class="action-row">${link(map(r.place),'Map ↗')}${link(dir(r.place),'Directions ↗')}${r.url?link(r.url,'Official site / tickets ↗'):''}<button class="action" data-secret-vote="${i}">★ Group vote</button><button class="action star ${state.favorites['secret:0:'+i]?'saved':''}" data-fav="secret:0:${i}" aria-label="${state.favorites['secret:0:'+i]?'Remove from saved':'Save place'}">${state.favorites['secret:0:'+i]?'♥':'♡'}</button></div><div class="secret-add"><label>Choose a day<select aria-label="Choose day for ${attr(r.name)}" data-secret-day="${i}">${TRIP.map((d,j)=>`<option value="${j}" ${j===r.day?'selected':''}>${esc(d.label)}</option>`).join('')}</select></label><button class="action" data-secret-add="${i}">+ Add to itinerary</button></div></article>`).join('')}</div></section>`;}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset;if('secretFilter'in a){secretFilter=a.secretFilter;rerenderKeepScroll();}else if('secretVote'in a){const r=SECRET[Number(a.secretVote)];if(!r)return;boardFilter='place';boardStatus='all';boardSearch=iTrainName(r.name);pendingIdea=null;setView('board');if(previewMode)toast('Group voting is available on the deployed website.');}else if('secretAdd'in a){if(editing||busyEdit||b.disabled)return;const i=Number(a.secretAdd),r=SECRET[i],target=Number(document.querySelector(`[data-secret-day="${i}"]`).value);if(!r||!TRIP[target])return;b.disabled=true;try{await beginEdit({target,row:['Time TBD',r.name,r.place,r.desc+' '+r.timing,'transit','optional']});}finally{b.disabled=false;}}});
