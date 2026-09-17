/* =========================================================
   RaceMarket V4.35
   Race simulation + broadcast, trading, and WebGL 3D visuals
========================================================= */

const HORSE_UNIVERSE = [
  { id:1, name:"Golden Tempo", age:5, sex:"Horse", baseRating:84, dirt:87, sprint:82, route:85, earlySpeed:83, lateSpeed:80, classRating:84, form:[3,1,4,2,5] },
  { id:2, name:"Renegade", age:6, sex:"Horse", baseRating:81, dirt:84, sprint:79, route:83, earlySpeed:88, lateSpeed:75, classRating:82, form:[2,6,1,5,3] },
  { id:3, name:"Skippylongstocking", age:6, sex:"Horse", baseRating:88, dirt:91, sprint:72, route:94, earlySpeed:81, lateSpeed:93, classRating:90, form:[1,2,3,1,4] },
  { id:4, name:"White Abarrio", age:6, sex:"Horse", baseRating:92, dirt:95, sprint:84, route:95, earlySpeed:90, lateSpeed:91, classRating:96, form:[1,1,2,4,1] },
  { id:5, name:"Napoleon Solo", age:5, sex:"Horse", baseRating:78, dirt:80, sprint:76, route:79, earlySpeed:75, lateSpeed:84, classRating:77, form:[5,3,7,2,6] },
  { id:6, name:"Counting Stars", age:4, sex:"Horse", baseRating:76, dirt:78, sprint:88, route:70, earlySpeed:91, lateSpeed:69, classRating:74, form:[2,4,1,8,2] },
  { id:7, name:"Commandment", age:5, sex:"Horse", baseRating:83, dirt:85, sprint:86, route:79, earlySpeed:85, lateSpeed:82, classRating:81, form:[4,2,2,6,3] },
  { id:8, name:"Magnitude", age:4, sex:"Horse", baseRating:87, dirt:89, sprint:76, route:92, earlySpeed:78, lateSpeed:95, classRating:87, form:[2,1,5,2,1] },
  { id:9, name:"Always a Runner", age:5, sex:"Horse", baseRating:74, dirt:76, sprint:90, route:68, earlySpeed:92, lateSpeed:68, classRating:72, form:[6,4,3,7,2] },
  { id:10, name:"Further Ado", age:6, sex:"Horse", baseRating:79, dirt:82, sprint:80, route:81, earlySpeed:73, lateSpeed:88, classRating:79, form:[3,5,2,4,5] },
  { id:11, name:"Sovereignty", age:4, sex:"Horse", baseRating:94, dirt:96, sprint:70, route:98, earlySpeed:80, lateSpeed:97, classRating:98, form:[1,1,2,1,3] },
  { id:12, name:"Silent Tactic", age:5, sex:"Horse", baseRating:80, dirt:83, sprint:78, route:84, earlySpeed:82, lateSpeed:86, classRating:80, form:[4,3,6,1,4] },
  { id:13, name:"Nitrogen", age:3, sex:"Horse", baseRating:86, dirt:88, sprint:82, route:90, earlySpeed:84, lateSpeed:88, classRating:85, form:[2,1,3,1,4] },
  { id:14, name:"Chip Honcho", age:3, sex:"Horse", baseRating:80, dirt:82, sprint:84, route:78, earlySpeed:89, lateSpeed:76, classRating:79, form:[4,2,5,1,6] },
  { id:15, name:"Kathynmarissa", age:4, sex:"Horse", baseRating:79, dirt:84, sprint:87, route:75, earlySpeed:86, lateSpeed:80, classRating:80, form:[2,5,1,3,4] },
  { id:16, name:"Ted Noffey", age:3, sex:"Horse", baseRating:78, dirt:80, sprint:83, route:77, earlySpeed:82, lateSpeed:86, classRating:77, form:[3,4,2,7,1] },
  { id:17, name:"The Puma", age:3, sex:"Horse", baseRating:84, dirt:86, sprint:80, route:88, earlySpeed:79, lateSpeed:91, classRating:84, form:[1,3,2,5,4] },
  { id:18, name:"Baeza", age:3, sex:"Horse", baseRating:88, dirt:92, sprint:71, route:96, earlySpeed:79, lateSpeed:94, classRating:91, form:[2,2,1,3,5] },
  { id:19, name:"Journalism", age:4, sex:"Horse", baseRating:91, dirt:94, sprint:76, route:96, earlySpeed:85, lateSpeed:95, classRating:94, form:[1,1,1,2,3] },
  { id:20, name:"Forever Young", age:6, sex:"Horse", baseRating:93, dirt:95, sprint:74, route:97, earlySpeed:83, lateSpeed:96, classRating:96, form:[1,2,1,1,2] }
];

const RACE_PROFILES = [

  /* ======================================================
     DIRT TRACKS
     ====================================================== */

  {
    track:"Churchill Downs",
    distance:"1 1/8 Miles",
    surface:"Dirt",
    raceType:"Stakes",
    style:"Strong Favorite",
    minHorses:7,
    maxHorses:8,
    volatility:.75,
    favoriteBoost:7,
    routeWeight:1.15,
    raceSecondsMin:80,
    raceSecondsMax:100
  },

  {
    track:"Gulfstream Park",
    distance:"6 Furlongs",
    surface:"Dirt",
    raceType:"Allowance",
    style:"Wide Open",
    minHorses:6,
    maxHorses:7,
    volatility:1.25,
    favoriteBoost:1,
    sprintWeight:1.2,
    raceSecondsMin:55,
    raceSecondsMax:75
  },

  {
    track:"Keeneland",
    distance:"1 1/8 Miles",
    surface:"Dirt",
    raceType:"Stakes",
    style:"Late Speed",
    minHorses:8,
    maxHorses:14,
    volatility:1.1,
    favoriteBoost:2,
    routeWeight:1.2,
    lateWeight:1.2,
    raceSecondsMin:95,
    raceSecondsMax:120
  },

  {
    track:"Saratoga",
    distance:"1 1/16 Miles",
    surface:"Dirt",
    raceType:"Handicap",
    style:"Speed Duel",
    minHorses:7,
    maxHorses:14,
    volatility:1.35,
    favoriteBoost:2,
    earlyWeight:1.2,
    raceSecondsMin:85,
    raceSecondsMax:105
  },

  {
    track:"Santa Anita",
    distance:"6.5 Furlongs",
    surface:"Dirt",
    raceType:"Allowance",
    style:"Front Runner",
    minHorses:6,
    maxHorses:8,
    volatility:1.15,
    favoriteBoost:4,
    sprintWeight:1.1,
    earlyWeight:1.25,
    raceSecondsMin:60,
    raceSecondsMax:80
  },

  {
    track:"Belmont at the Big A",
    distance:"1 1/4 Miles",
    surface:"Dirt",
    raceType:"Stakes",
    style:"Big Field",
    minHorses:10,
    maxHorses:20,
    volatility:1.3,
    favoriteBoost:1,
    routeWeight:1.25,
    lateWeight:1.15,
    raceSecondsMin:105,
    raceSecondsMax:130
  },


  /* ======================================================
     TURF TRACKS
     ====================================================== */

  {
    track:"Gulfstream Park",
    distance:"1 Mile",
    surface:"Turf",
    raceType:"Allowance",
    style:"Wide Open",
    minHorses:8,
    maxHorses:12,
    volatility:1.18,
    favoriteBoost:2,
    routeWeight:1.25,
    lateWeight:1.12,
    raceSecondsMin:82,
    raceSecondsMax:100
  },

  {
    track:"Keeneland Turf Course",
    distance:"1 1/8 Miles",
    surface:"Turf",
    raceType:"Stakes",
    style:"Late Speed",
    minHorses:8,
    maxHorses:14,
    volatility:1.12,
    favoriteBoost:2,
    routeWeight:1.25,
    lateWeight:1.22,
    raceSecondsMin:92,
    raceSecondsMax:116
  },

  {
    track:"Saratoga Turf",
    distance:"1 1/16 Miles",
    surface:"Turf",
    raceType:"Stakes",
    style:"Tactical",
    minHorses:8,
    maxHorses:12,
    volatility:1.20,
    favoriteBoost:2,
    routeWeight:1.22,
    lateWeight:1.20,
    raceSecondsMin:88,
    raceSecondsMax:108
  },

  {
    track:"Santa Anita Turf",
    distance:"1 Mile",
    surface:"Turf",
    raceType:"Allowance",
    style:"Stalker Friendly",
    minHorses:7,
    maxHorses:11,
    volatility:1.12,
    favoriteBoost:2,
    routeWeight:1.18,
    lateWeight:1.14,
    raceSecondsMin:78,
    raceSecondsMax:94
  },

  {
    track:"Belmont Turf",
    distance:"1 1/8 Miles",
    surface:"Turf",
    raceType:"Stakes",
    style:"Big Field",
    minHorses:9,
    maxHorses:16,
    volatility:1.25,
    favoriteBoost:1,
    routeWeight:1.28,
    lateWeight:1.25,
    raceSecondsMin:94,
    raceSecondsMax:118
  }

];

const SILK_PALETTE = [
  { silk:"#d95f59", body:"#50392d" },
  { silk:"#5b8def", body:"#604b3b" },
  { silk:"#7acb7a", body:"#3f3027" },
  { silk:"#d6a84f", body:"#5a4030" },
  { silk:"#b77be0", body:"#4b352b" },
  { silk:"#f08a57", body:"#523a2e" },
  { silk:"#4fc1b0", body:"#604635" },
  { silk:"#e8e8e8", body:"#392c28" },
  { silk:"#e16f9a", body:"#684a38" },
  { silk:"#8ca2b8", body:"#47342b" },
  { silk:"#e6c75c", body:"#493328" },
  { silk:"#7aa2ff", body:"#4a382d" }
];


const POST_COLORS = {
  1:"#cf3c36", 2:"#f1eee7", 3:"#2f69bd", 4:"#e5be38",
  5:"#2e8a4b", 6:"#191919", 7:"#ef7c28", 8:"#e38bb2",
  9:"#23a4a5", 10:"#8d57b5", 11:"#8b8b8b", 12:"#79a84b",
  13:"#a95e36", 14:"#4a7cbe", 15:"#d45a86", 16:"#5c7f62",
  17:"#c59a3c", 18:"#5f5f8f", 19:"#b65c43", 20:"#3d9d85"
};

const HORSE_COATS = [
  {name:"Bay",main:"#6f4933",light:"#a87550",dark:"#2b1812",muzzle:"#362117"},
  {name:"Dark Bay",main:"#4c3024",light:"#744936",dark:"#1c100d",muzzle:"#251510"},
  {name:"Chestnut",main:"#914e2f",light:"#c1774f",dark:"#32170f",muzzle:"#3d1d14"},
  {name:"Flaxen Chestnut",main:"#985d38",light:"#d08a59",dark:"#351b12",muzzle:"#412319"},
  {name:"Black",main:"#262522",light:"#4a4841",dark:"#090908",muzzle:"#171615"},
  {name:"Gray",main:"#77766e",light:"#b5b4aa",dark:"#35342f",muzzle:"#4d4b45"},
  {name:"Steel Gray",main:"#5d6261",light:"#939a97",dark:"#252827",muzzle:"#3c403e"},
  {name:"Mahogany",main:"#633425",light:"#92523a",dark:"#210f0b",muzzle:"#301610"}
];

const RACE_WEATHER = [
  {name:"Sunny",className:"weather-sunny",atmosphere:"Clear skies"},
  {name:"Overcast",className:"weather-overcast",atmosphere:"Overcast"},
  {name:"Golden Hour",className:"weather-golden",atmosphere:"Late afternoon light"},
  {name:"Morning Haze",className:"weather-haze",atmosphere:"Cool morning haze"},
  {name:"Light Rain",className:"weather-rain",atmosphere:"Light rain"}
];

const TRACK_CONDITIONS = {
  Dirt:[
    {name:"Fast",wetness:0,spray:.18,darkness:0},
    {name:"Good",wetness:.18,spray:.30,darkness:.06},
    {name:"Muddy",wetness:.62,spray:.68,darkness:.25},
    {name:"Sloppy",wetness:.88,spray:.95,darkness:.40}
  ],
  Turf:[
    {name:"Firm",wetness:.04,spray:.12,darkness:0},
    {name:"Good",wetness:.20,spray:.20,darkness:.05},
    {name:"Yielding",wetness:.58,spray:.34,darkness:.22}
  ]
};

const VENUE_VISUALS = {
  "Churchill Downs":{
    short:"CD",
    className:"venue-churchill",
    skyline:"Twin Spires"
  },
  "Gulfstream Park":{
    short:"GP",
    className:"venue-gulfstream",
    skyline:"Palm Skyline"
  },
  "Keeneland":{
    short:"KEE",
    className:"venue-keeneland",
    skyline:"Kentucky Green"
  },
  "Keeneland Turf Course":{
    short:"KEE",
    className:"venue-keeneland",
    skyline:"Kentucky Green"
  },
  "Saratoga":{
    short:"SAR",
    className:"venue-saratoga",
    skyline:"Historic Grandstand"
  },
  "Saratoga Turf":{
    short:"SAR",
    className:"venue-saratoga",
    skyline:"Historic Grandstand"
  },
  "Santa Anita":{
    short:"SA",
    className:"venue-santa-anita",
    skyline:"Mountain Backdrop"
  },
  "Santa Anita Turf":{
    short:"SA",
    className:"venue-santa-anita",
    skyline:"Mountain Backdrop"
  },
  "Belmont at the Big A":{
    short:"BEL",
    className:"venue-belmont",
    skyline:"Long Stretch"
  },
  "Belmont Turf":{
    short:"BEL",
    className:"venue-belmont",
    skyline:"Long Stretch"
  }
};

const state = {
  phase:"countdown",
  openCountdown:15,
  raceT:0,
  raceDuration:90,

  cash:10000,

  selected:1,
  side:"buy",

  positions:{},
  history:{},
  lastPrices:{},

  winner:null,
  timer:null,

  profile:null,
  horses:[],

  raceNumber:1,

  finishAt:null,
  raceDistance:100,
  finishOrder:[],

  marketSuspended:false,

  pacePlan:"mixed",
  separationFactor:1,

  specialRunnerId:null,
  specialAbilityName:null,

  weather:null,
  weatherClass:"",
  trackCondition:null,
  environment:null,

  visualLoopStarted:false,
  visualEnvironmentOffset:0,
  visualEnvironmentLastTs:null,
  visualTargets:{},
  visualPositions:{},

  /* Broadcast presentation state. None of these values affect
     the race simulation, prices, finish order, or settlement. */
  runnerNodes:{},
  raceVisualToken:0,

  cameraMode:"auto",
  cameraShot:"wide",
  cameraFocusRunnerId:null,
  cameraLockedRunnerId:null,
  cameraTarget:{
    x:0,
    y:0,
    zoom:1,
    originX:50,
    originY:58,
    sceneryX:0,
    sceneryY:0,
    sceneryZoom:1
  },
  cameraCurrent:{
    x:0,
    y:0,
    zoom:1,
    originX:50,
    originY:58,
    sceneryX:0,
    sceneryY:0,
    sceneryZoom:1
  },

  hudOpen:true,

  broadcastEvents:[],
  broadcastEventCounter:0,
  broadcastLastByKey:{},
  broadcastFlags:{},
  broadcastCaptionEventId:null,
  broadcastCaptionUntil:0,

  audioEnabled:false,

  /* Full WebGL renderer preferences. Presentation only. */
  renderMode:"webgl",
  renderQuality:"auto",
  race3dInitialized:false
};


/* =========================================================
   UTILITIES
========================================================= */

function money(v){
  return `$${Number(v).toFixed(2)}`;
}

function cents(p){
  return `${Math.round(Number(p)*100)}¢`;
}

function clamp(v,min,max){
  return Math.max(
    min,
    Math.min(
      max,
      v
    )
  );
}

function randomBetween(min,max){
  return Math.floor(
    Math.random()*
    (max-min+1)
  )+
    min;
}

function randomFloat(min,max){
  return Math.random()*
    (max-min)+
    min;
}

function fmt(seconds){

  const safe=
    Math.max(
      0,
      Number(seconds)||0
    );

  return `${Math.floor(
    safe/60
  ).toString().padStart(2,"0")}:${Math.floor(
    safe%60
  ).toString().padStart(2,"0")}`;
}

function shuffle(items){
  return [...items].sort(
    ()=>Math.random()-.5
  );
}

function sample(items,count){
  return shuffle(items).slice(
    0,
    count
  );
}

function logistic(x){
  return 1/
    (
      1+
      Math.exp(-x)
    );
}



/* =========================================================
   BROADCAST UPGRADE
   Camera direction, live telemetry, race calls, and opt-in
   procedural audio. Presentation only; race logic is unchanged.
========================================================= */

const BROADCAST_CAMERA_MODES=
  new Set([
    "auto",
    "wide",
    "leader",
    "selected",
    "finish",
    "topdown",
    "free"
  ]);

const broadcastAudio={
  context:null,
  masterGain:null,
  crowdGain:null,
  crowdSource:null,
  nextHoofAt:0,
  hoofSide:0,
  unavailable:false
};

function broadcastNow(){
  return(
    typeof performance!=="undefined"&&
    typeof performance.now==="function"
  )
    ?performance.now()
    :Date.now();
}

function broadcastKicker(type){
  return({
    preflight:"RACE CONTROL",
    start:"GATES OPEN",
    lead:"LEAD CHANGE",
    move:"MOVING UP",
    duel:"DUEL",
    stretch:"FINAL STRETCH",
    ability:"SPECIAL ABILITY",
    finish:"WINNER",
    official:"OFFICIAL"
  })[type]||
  "RACE CALL";
}

function emitBroadcastEvent(
  text,
  type="call",
  key="",
  cooldownMs=2500,
  options={}
){
  if(!text){
    return null;
  }

  const now=
    broadcastNow();

  const eventKey=
    key||
    `${type}:${text}`;

  const last=
    state.broadcastLastByKey[
      eventKey
    ];

  if(
    !options.force&&
    Number.isFinite(last)&&
    now-last<
      Math.max(
        0,
        cooldownMs
      )
  ){
    return null;
  }

  state.broadcastLastByKey[
    eventKey
  ]=
    now;

  const event={
    id:
      ++state.broadcastEventCounter,
    text,
    type,
    kicker:
      options.kicker||
      broadcastKicker(
        type
      ),
    createdAt:now,
    raceSecond:
      state.raceT,
    phase:
      state.phase
  };

  state.broadcastEvents.unshift(
    event
  );

  state.broadcastEvents=
    state.broadcastEvents.slice(
      0,
      8
    );

  state.broadcastCaptionEventId=
    event.id;

  state.broadcastCaptionUntil=
    now+
    (
      options.duration||
      (
        type==="finish"
          ?6500
          :4300
      )
    );

  renderBroadcastOverlay();

  return event;
}

function resetBroadcastPresentation(){
  state.runnerNodes={};
  state.raceVisualToken++;

  state.cameraMode="auto";
  state.cameraShot="wide";
  state.cameraFocusRunnerId=null;
  state.cameraLockedRunnerId=null;

  state.cameraTarget={
    x:0,
    y:0,
    zoom:1,
    originX:50,
    originY:58,
    sceneryX:0,
    sceneryY:0,
    sceneryZoom:1
  };

  state.cameraCurrent={
    ...state.cameraTarget
  };

  state.hudOpen=true;

  state.broadcastEvents=[];
  state.broadcastEventCounter=0;
  state.broadcastLastByKey={};
  state.broadcastFlags={};
  state.broadcastCaptionEventId=null;
  state.broadcastCaptionUntil=0;

  broadcastAudio.nextHoofAt=0;

  const layer=
    document.getElementById(
      "visualRunnerLayer"
    );

  if(layer){
    layer.replaceChildren();
  }
}

function renderBroadcastOverlay(){
  const caption=
    document.getElementById(
      "broadcastCaption"
    );

  const captionText=
    document.getElementById(
      "broadcastCaptionText"
    );

  const captionKicker=
    document.getElementById(
      "broadcastCaptionKicker"
    );

  const feed=
    document.getElementById(
      "broadcastEventFeed"
    );

  const latest=
    state.broadcastEvents[0];

  if(
    caption&&
    captionText&&
    captionKicker&&
    latest
  ){
    const eventId=
      String(
        latest.id
      );

    if(
      caption.dataset.eventId!==
      eventId
    ){
      caption.dataset.eventId=
        eventId;

      caption.dataset.type=
        latest.type;

      captionKicker.textContent=
        latest.kicker;

      captionText.textContent=
        latest.text;
    }

    caption.classList.toggle(
      "is-visible",
      broadcastNow()<
        state.broadcastCaptionUntil
    );
  }else if(caption){
    caption.classList.remove(
      "is-visible"
    );
  }

  if(feed){
    const signature=
      state.broadcastEvents
        .slice(
          0,
          3
        )
        .map(
          event=>
            event.id
        )
        .join(
          ","
        );

    if(
      feed.dataset.signature!==
      signature
    ){
      feed.dataset.signature=
        signature;

      const fragment=
        document.createDocumentFragment();

      state.broadcastEvents
        .slice(
          0,
          3
        )
        .forEach(
          event=>{

            const row=
              document.createElement(
                "div"
              );

            row.className=
              `broadcast-feed-row type-${event.type}`;

            const time=
              document.createElement(
                "span"
              );

            time.textContent=
              event.phase==="countdown"
                ?"PRE"
                :fmt(
                    event.raceSecond
                  );

            const call=
              document.createElement(
                "strong"
              );

            call.textContent=
              event.text;

            row.append(
              time,
              call
            );

            fragment.appendChild(
              row
            );
          }
        );

      feed.replaceChildren(
        fragment
      );
    }
  }
}

function updateBroadcastCaptionFrame(
  now=
    broadcastNow()
){
  const caption=
    document.getElementById(
      "broadcastCaption"
    );

  if(!caption){
    return;
  }

  caption.classList.toggle(
    "is-visible",
    Boolean(
      state.broadcastCaptionEventId
    )&&
    now<
      state.broadcastCaptionUntil
  );
}

function currentBroadcastLeader(){
  const ranked=
    fieldRanks();

  return(
    ranked.find(
      horse=>
        !horse.finished
    )||
    state.horses.find(
      horse=>
        horse.id===
        state.winner
    )||
    ranked[0]||
    null
  );
}

function visualPositionForHorse(
  horse
){
  if(!horse){
    return{
      x:50,
      y:58
    };
  }

  const current=
    state.visualPositions[
      horse.id
    ];

  const target=
    state.visualTargets[
      horse.id
    ];

  return{
    x:
      current?.x??
      target?.x??
      visualTrackPercent(
        horse
      ),
    y:
      current?.y??
      target?.y??
      visualLaneTop(
        horse
      )
  };
}

function cameraPlanForShot(
  shot,
  focusHorses=[]
){
  const valid=
    focusHorses.filter(
      Boolean
    );

  const positions=
    valid.map(
      visualPositionForHorse
    );

  const focusX=
    positions.length
      ?positions.reduce(
          (
            total,
            item
          )=>
            total+
            item.x,
          0
        )/
        positions.length
      :50;

  const focusY=
    positions.length
      ?positions.reduce(
          (
            total,
            item
          )=>
            total+
            item.y,
          0
        )/
        positions.length
      :58;

  const presets={
    wide:{
      targetX:50,
      targetY:58,
      zoom:1,
      originX:50,
      originY:58,
      maxX:0,
      maxY:0
    },

    pack:{
      targetX:52,
      targetY:58,
      zoom:1.025,
      originX:52,
      originY:58,
      maxX:8,
      maxY:3
    },

    leader:{
      targetX:56,
      targetY:57,
      zoom:1.065,
      originX:57,
      originY:57,
      maxX:14,
      maxY:4
    },

    selected:{
      targetX:55,
      targetY:58,
      zoom:1.11,
      originX:55,
      originY:58,
      maxX:18,
      maxY:6
    },

    duel:{
      targetX:58,
      targetY:58,
      zoom:1.09,
      originX:59,
      originY:58,
      maxX:14,
      maxY:5
    },

    stretch:{
      targetX:66,
      targetY:58,
      zoom:1.085,
      originX:68,
      originY:58,
      maxX:12,
      maxY:4
    },

    finish:{
      targetX:80,
      targetY:58,
      zoom:1.115,
      originX:82,
      originY:58,
      maxX:8,
      maxY:3
    },

    topdown:{
      targetX:50,
      targetY:57,
      zoom:1.0,
      originX:50,
      originY:50,
      maxX:0,
      maxY:0
    },

    free:{
      targetX:50,
      targetY:58,
      zoom:1.0,
      originX:50,
      originY:58,
      maxX:0,
      maxY:0
    }
  };

  const preset=
    presets[shot]||
    presets.wide;

  const x=
    preset.maxX
      ?clamp(
          preset.targetX-
          focusX,
          -preset.maxX,
          preset.maxX
        )
      :0;

  const y=
    preset.maxY
      ?clamp(
          preset.targetY-
          focusY,
          -preset.maxY,
          preset.maxY
        )
      :0;

  return{
    shot,
    x,
    y,
    zoom:
      preset.zoom,
    originX:
      preset.originX,
    originY:
      preset.originY,
    sceneryX:
      x*
      .26,
    sceneryY:
      y*
      .12,
    sceneryZoom:
      1+
      (
        preset.zoom-
        1
      )*
      .34,
    focusRunnerId:
      valid[0]?.id||
      null
  };
}

function getBroadcastCameraPlan(){
  const ranking=
    fieldRanks();

  const active=
    ranking.filter(
      horse=>
        !horse.finished
    );

  const leader=
    active[0]||
    state.horses.find(
      horse=>
        horse.id===
        state.winner
    )||
    ranking[0]||
    null;

  const second=
    active[1]||
    null;

  const selected=
    state.horses.find(
      horse=>
        horse.id===
        (
          state.cameraLockedRunnerId??
          state.selected
        )
    )||
    state.horses.find(
      horse=>
        horse.id===
        state.selected
    )||
    leader;

  const requested=
    BROADCAST_CAMERA_MODES.has(
      state.cameraMode
    )
      ?state.cameraMode
      :"auto";

  if(requested==="wide"){
    return cameraPlanForShot(
      "wide",
      []
    );
  }

  if(requested==="leader"){
    return cameraPlanForShot(
      "leader",
      [
        leader
      ]
    );
  }

  if(requested==="selected"){
    return cameraPlanForShot(
      "selected",
      [
        selected
      ]
    );
  }

  if(requested==="finish"){
    return cameraPlanForShot(
      "finish",
      [
        leader
      ]
    );
  }

  if(requested==="topdown"){
    return cameraPlanForShot(
      "topdown",
      []
    );
  }

  if(requested==="free"){
    return cameraPlanForShot(
      "free",
      []
    );
  }

  if(
    state.phase==="countdown"
  ){
    return cameraPlanForShot(
      "wide",
      []
    );
  }

  if(
    state.phase==="finished"||
    state.phase==="settled"
  ){
    return cameraPlanForShot(
      "finish",
      [
        leader
      ]
    );
  }

  const remaining=
    secondsRemaining();

  const progress=
    raceProgress();

  const duelGap=
    leader&&
    second
      ?lengthsBehind(
          leader,
          second
        )
      :Infinity;

  if(remaining<=8){
    return cameraPlanForShot(
      "finish",
      [
        leader,
        second
      ]
    );
  }

  if(
    remaining<=20&&
    duelGap<=1.35
  ){
    return cameraPlanForShot(
      "duel",
      [
        leader,
        second
      ]
    );
  }

  if(remaining<=20){
    return cameraPlanForShot(
      "stretch",
      [
        leader,
        second
      ]
    );
  }

  if(progress<.13){
    return cameraPlanForShot(
      "wide",
      active.slice(
        0,
        6
      )
    );
  }

  if(
    progress<.52||
    duelGap<=1.10
  ){
    return cameraPlanForShot(
      "pack",
      active.slice(
        0,
        5
      )
    );
  }

  return cameraPlanForShot(
    "leader",
    [
      leader
    ]
  );
}

function updateBroadcastCameraDirector(){
  const previousShot=
    state.cameraShot;

  const previousFocus=
    state.cameraFocusRunnerId;

  const plan=
    getBroadcastCameraPlan();

  state.cameraTarget={
    x:plan.x,
    y:plan.y,
    zoom:plan.zoom,
    originX:plan.originX,
    originY:plan.originY,
    sceneryX:plan.sceneryX,
    sceneryY:plan.sceneryY,
    sceneryZoom:plan.sceneryZoom
  };

  state.cameraShot=
    plan.shot;

  state.cameraFocusRunnerId=
    plan.focusRunnerId;

  if(
    previousShot!==
      state.cameraShot||
    previousFocus!==
      state.cameraFocusRunnerId
  ){
    updateCameraControls();

    applyCameraShotClasses(
      document.getElementById(
        "visualTrack"
      )
    );

    syncRunnerFocusClasses();
  }

  return plan;
}

function applyBroadcastCameraFrame(
  track,
  frameDelta
){
  const target=
    state.cameraTarget;

  const current=
    state.cameraCurrent;

  if(
    !target||
    !current
  ){
    return;
  }

  const reducedMotion=
    typeof window!=="undefined"&&
    window.matchMedia&&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const alpha=
    reducedMotion
      ?1
      :1-
        Math.exp(
          -5.6*
          (
            Math.max(
              1,
              frameDelta
            )/
            1000
          )
        );

  [
    "x",
    "y",
    "zoom",
    "originX",
    "originY",
    "sceneryX",
    "sceneryY",
    "sceneryZoom"
  ].forEach(
    key=>{
      current[key]+=
        (
          target[key]-
          current[key]
        )*
        alpha;
    }
  );

  const viewportWidth=
    Math.max(
      1,
      track.clientWidth||
      1
    );

  const viewportHeight=
    Math.max(
      1,
      track.clientHeight||
      1
    );

  track.style.setProperty(
    "--broadcast-camera-x",
    `${(
      current.x/
      100*
      viewportWidth
    ).toFixed(
      3
    )}px`
  );

  track.style.setProperty(
    "--broadcast-camera-y",
    `${(
      current.y/
      100*
      viewportHeight
    ).toFixed(
      3
    )}px`
  );

  track.style.setProperty(
    "--broadcast-camera-zoom",
    current.zoom.toFixed(
      4
    )
  );

  track.style.setProperty(
    "--broadcast-camera-origin-x",
    `${current.originX.toFixed(3)}%`
  );

  track.style.setProperty(
    "--broadcast-camera-origin-y",
    `${current.originY.toFixed(3)}%`
  );

  track.style.setProperty(
    "--broadcast-scenery-x",
    `${(
      current.sceneryX/
      100*
      viewportWidth
    ).toFixed(
      3
    )}px`
  );

  track.style.setProperty(
    "--broadcast-scenery-y",
    `${(
      current.sceneryY/
      100*
      viewportHeight
    ).toFixed(
      3
    )}px`
  );

  track.style.setProperty(
    "--broadcast-scenery-zoom",
    current.sceneryZoom.toFixed(
      4
    )
  );
}

function applyCameraShotClasses(
  track
){
  if(!track){
    return;
  }

  [
    "camera-wide",
    "camera-pack",
    "camera-leader",
    "camera-selected",
    "camera-duel",
    "camera-stretch",
    "camera-finish",
    "camera-topdown",
    "camera-free"
  ].forEach(
    className=>
      track.classList.remove(
        className
      )
  );

  track.classList.add(
    `camera-${state.cameraShot}`
  );

  track.classList.toggle(
    "camera-mid",
    state.cameraShot==="pack"
  );

  track.classList.toggle(
    "camera-tight",
    [
      "leader",
      "selected",
      "duel",
      "stretch"
    ].includes(
      state.cameraShot
    )
  );

  track.classList.toggle(
    "camera-finish",
    state.cameraShot==="finish"
  );

  track.dataset.cameraShot=
    state.cameraShot;
}

function setCameraMode(
  mode
){
  if(
    !BROADCAST_CAMERA_MODES.has(
      mode
    )
  ){
    return;
  }

  state.cameraMode=
    mode;

  if(mode==="selected"){
    state.cameraLockedRunnerId=
      state.selected;

    state.hudOpen=true;
  }

  updateBroadcastCameraDirector();

  const track=
    document.getElementById(
      "visualTrack"
    );

  applyCameraShotClasses(
    track
  );

  updateCameraControls();
  renderRunnerHud();
  syncRunnerFocusClasses();
}

function cameraShotDisplayName(
  shot
){
  return({
    wide:"WIDE",
    pack:"FIELD",
    leader:"LEADER",
    selected:"RUNNER",
    duel:"DUEL",
    stretch:"STRETCH",
    finish:"FINISH",
    topdown:"TOP DOWN",
    free:"FREE CAM"
  })[shot]||
  String(
    shot||
    "wide"
  ).toUpperCase();
}

function updateCameraControls(){
  const controls=
    document.getElementById(
      "broadcastCameraControls"
    );

  if(controls){
    controls
      .querySelectorAll(
        "[data-camera-mode]"
      )
      .forEach(
        button=>{

          const active=
            button.dataset.cameraMode===
            state.cameraMode;

          button.classList.toggle(
            "active",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );
        }
      );
  }

  const label=
    document.getElementById(
      "cameraShotLabel"
    );

  if(label){
    label.textContent=
      `${
        state.cameraMode==="auto"
          ?"AUTO"
          :"MANUAL"
      } • ${
        cameraShotDisplayName(
          state.cameraShot
        )
      }`;
  }

  const freeHint=
    document.getElementById(
      "freeCameraHint"
    );

  if(freeHint){
    freeHint.hidden=
      state.cameraMode!=="free";
  }
}

function syncRunnerFocusClasses(){
  Object.values(
    state.runnerNodes
  ).forEach(
    node=>{
      if(!node){
        return;
      }

      node.classList.toggle(
        "camera-focus-runner",
        Number(
          node.dataset.runnerId
        )===
        state.cameraFocusRunnerId
      );
    }
  );
}

function ordinal(
  value
){
  const number=
    Math.max(
      0,
      Math.floor(
        Number(
          value
        )||
        0
      )
    );

  const remainder100=
    number%
    100;

  if(
    remainder100>=11&&
    remainder100<=13
  ){
    return `${number}th`;
  }

  return `${number}${
    {
      1:"st",
      2:"nd",
      3:"rd"
    }[
      number%
      10
    ]||
    "th"
  }`;
}

function renderRunnerHud(){
  const hud=
    document.getElementById(
      "runnerHud"
    );

  if(!hud){
    return;
  }

  const horse=
    state.horses.find(
      item=>
        item.id===
        state.selected
    );

  hud.classList.toggle(
    "is-open",
    Boolean(
      state.hudOpen&&
      horse
    )
  );

  hud.setAttribute(
    "aria-hidden",
    String(
      !state.hudOpen||
      !horse
    )
  );

  if(!horse){
    return;
  }

  const leader=
    currentBroadcastLeader();

  const gap=
    leader&&
    leader.id!==
      horse.id
      ?`${lengthsBehind(
          leader,
          horse
        ).toFixed(
          1
        )} L`
      :"LEADER";

  const speed=
    state.phase==="countdown"
      ?"—"
      :`${(
          (
            horse.currentSpeed||
            0
          )*
          37.4
        ).toFixed(
          1
        )} MPH`;

  const ability=
    horse.specialAbility
      ?horse.specialAbilityActive
        ?"ACTIVE"
        :horse.specialAbilityUsed
          ?"USED"
          :"READY"
      :"—";

  const values={
    runnerHudName:
      `#${horse.post} ${horse.name}`,
    runnerHudPosition:
      state.phase==="countdown"
        ?"—"
        :horse.finished
          ?ordinal(
              horse.finishPosition
            )
          :ordinal(
              horse.position
            ),
    runnerHudGap:
      state.phase==="countdown"
        ?"—"
        :gap,
    runnerHudSpeed:
      speed,
    runnerHudEnergy:
      `${Math.round(
        horse.energy
      )}%`,
    runnerHudPrice:
      cents(
        currentPrice(
          horse
        )
      ),
    runnerHudAbility:
      ability
  };

  Object.entries(
    values
  ).forEach(
    (
      [
        id,
        value
      ]
    )=>{
      const element=
        document.getElementById(
          id
        );

      if(element){
        element.textContent=
          value;
      }
    }
  );

  const follow=
    document.getElementById(
      "runnerHudFollow"
    );

  if(follow){
    const active=
      state.cameraMode===
      "selected";

    follow.classList.toggle(
      "active",
      active
    );

    follow.textContent=
      active
        ?"FOLLOWING RUNNER"
        :"FOLLOW RUNNER";

    follow.setAttribute(
      "aria-pressed",
      String(
        active
      )
    );
  }
}

function selectBroadcastRunner(
  horseId,
  follow=false
){
  const horse=
    state.horses.find(
      item=>
        item.id===
        Number(
          horseId
        )
    );

  if(!horse){
    return;
  }

  state.selected=
    horse.id;

  state.cameraLockedRunnerId=
    horse.id;

  state.hudOpen=true;

  if(follow){
    state.cameraMode=
      "selected";
  }

  render();
  updateCameraControls();
}

function wireBroadcastEvents(){
  const controls=
    document.getElementById(
      "broadcastCameraControls"
    );

  if(controls){
    controls
      .querySelectorAll(
        "[data-camera-mode]"
      )
      .forEach(
        button=>{
          button.addEventListener(
            "click",
            ()=>{
              setCameraMode(
                button.dataset.cameraMode
              );
            }
          );
        }
      );
  }

  const sound=
    document.getElementById(
      "broadcastSoundToggle"
    );

  if(sound){
    sound.addEventListener(
      "click",
      ()=>{
        setBroadcastAudioEnabled(
          !state.audioEnabled
        );
      }
    );
  }

  const close=
    document.getElementById(
      "runnerHudClose"
    );

  if(close){
    close.addEventListener(
      "click",
      ()=>{
        state.hudOpen=false;
        renderRunnerHud();
      }
    );
  }

  const follow=
    document.getElementById(
      "runnerHudFollow"
    );

  if(follow){
    follow.addEventListener(
      "click",
      ()=>{
        state.hudOpen=true;
        state.cameraLockedRunnerId=
          state.selected;
        setCameraMode(
          "selected"
        );
      }
    );
  }

  document.addEventListener(
    "keydown",
    event=>{
      if(
        event.key==="Escape"&&
        state.cameraMode!=="auto"
      ){
        setCameraMode(
          "auto"
        );
      }
    }
  );

  updateCameraControls();
  updateBroadcastSoundControl();
}

function createBroadcastNoiseBuffer(
  context,
  duration=2
){
  const sampleRate=
    context.sampleRate;

  const frameCount=
    Math.max(
      1,
      Math.floor(
        sampleRate*
        duration
      )
    );

  const buffer=
    context.createBuffer(
      1,
      frameCount,
      sampleRate
    );

  const data=
    buffer.getChannelData(
      0
    );

  let previous=0;

  for(
    let index=0;
    index<frameCount;
    index++
  ){
    const white=
      Math.random()*
      2-
      1;

    previous=
      previous*
      .84+
      white*
      .16;

    data[index]=
      previous;
  }

  return buffer;
}

function ensureBroadcastAudio(){
  if(
    broadcastAudio.context||
    broadcastAudio.unavailable
  ){
    return broadcastAudio.context;
  }

  const AudioContextClass=
    typeof window!=="undefined"
      ?window.AudioContext||
       window.webkitAudioContext
      :null;

  if(!AudioContextClass){
    broadcastAudio.unavailable=true;
    updateBroadcastSoundControl();
    return null;
  }

  try{
    const context=
      new AudioContextClass();

    const master=
      context.createGain();

    master.gain.value=
      .72;

    master.connect(
      context.destination
    );

    const crowdGain=
      context.createGain();

    crowdGain.gain.value=
      0;

    const crowdFilter=
      context.createBiquadFilter();

    crowdFilter.type=
      "lowpass";

    crowdFilter.frequency.value=
      720;

    crowdFilter.Q.value=
      .45;

    const crowdSource=
      context.createBufferSource();

    crowdSource.buffer=
      createBroadcastNoiseBuffer(
        context,
        2.5
      );

    crowdSource.loop=true;

    crowdSource
      .connect(
        crowdFilter
      )
      .connect(
        crowdGain
      )
      .connect(
        master
      );

    crowdSource.start();

    broadcastAudio.context=
      context;

    broadcastAudio.masterGain=
      master;

    broadcastAudio.crowdGain=
      crowdGain;

    broadcastAudio.crowdSource=
      crowdSource;

    return context;

  }catch(error){
    console.warn(
      "Race audio is unavailable:",
      error
    );

    broadcastAudio.unavailable=true;
    updateBroadcastSoundControl();

    return null;
  }
}

function updateBroadcastSoundControl(){
  const button=
    document.getElementById(
      "broadcastSoundToggle"
    );

  if(!button){
    return;
  }

  const icon=
    button.querySelector(
      "span"
    );

  const label=
    button.querySelector(
      "b"
    );

  button.classList.toggle(
    "active",
    state.audioEnabled
  );

  button.setAttribute(
    "aria-pressed",
    String(
      state.audioEnabled
    )
  );

  button.setAttribute(
    "aria-label",
    state.audioEnabled
      ?"Disable race sound"
      :"Enable race sound"
  );

  if(icon){
    icon.textContent=
      state.audioEnabled
        ?"🔊"
        :"🔇";
  }

  if(label){
    label.textContent=
      broadcastAudio.unavailable
        ?"UNAVAILABLE"
        :state.audioEnabled
          ?"SOUND ON"
          :"SOUND";
  }

  button.disabled=
    broadcastAudio.unavailable;
}

async function setBroadcastAudioEnabled(
  enabled
){
  const context=
    ensureBroadcastAudio();

  if(!context){
    state.audioEnabled=false;
    updateBroadcastSoundControl();
    return;
  }

  try{
    if(enabled){
      await context.resume();
    }

    state.audioEnabled=
      Boolean(
        enabled
      );

    const now=
      context.currentTime;

    broadcastAudio.masterGain.gain
      .cancelScheduledValues(
        now
      );

    broadcastAudio.masterGain.gain
      .setTargetAtTime(
        state.audioEnabled
          ?.72
          :0,
        now,
        .035
      );

    broadcastAudio.nextHoofAt=
      0;

    updateBroadcastSoundControl();

    if(
      state.audioEnabled&&
      state.phase==="live"
    ){
      playBroadcastCue(
        "resume"
      );
    }

  }catch(error){
    console.warn(
      "Unable to change race audio:",
      error
    );

    state.audioEnabled=false;
    updateBroadcastSoundControl();
  }
}

function playBroadcastTone(
  frequency,
  duration,
  gain=.04,
  type="sine",
  endFrequency=null,
  delay=0
){
  if(
    !state.audioEnabled||
    !broadcastAudio.context
  ){
    return;
  }

  const context=
    broadcastAudio.context;

  const start=
    context.currentTime+
    delay;

  const oscillator=
    context.createOscillator();

  const envelope=
    context.createGain();

  oscillator.type=
    type;

  oscillator.frequency.setValueAtTime(
    Math.max(
      20,
      frequency
    ),
    start
  );

  if(endFrequency){
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(
        20,
        endFrequency
      ),
      start+
      duration
    );
  }

  envelope.gain.setValueAtTime(
    .0001,
    start
  );

  envelope.gain.exponentialRampToValueAtTime(
    Math.max(
      .0002,
      gain
    ),
    start+
    .012
  );

  envelope.gain.exponentialRampToValueAtTime(
    .0001,
    start+
    duration
  );

  oscillator
    .connect(
      envelope
    )
    .connect(
      broadcastAudio.masterGain
    );

  oscillator.start(
    start
  );

  oscillator.stop(
    start+
    duration+
    .03
  );
}

function playBroadcastNoiseHit(
  duration=.055,
  gain=.025,
  lowpass=900
){
  if(
    !state.audioEnabled||
    !broadcastAudio.context
  ){
    return;
  }

  const context=
    broadcastAudio.context;

  const source=
    context.createBufferSource();

  source.buffer=
    createBroadcastNoiseBuffer(
      context,
      Math.max(
        .08,
        duration
      )
    );

  const filter=
    context.createBiquadFilter();

  filter.type=
    "lowpass";

  filter.frequency.value=
    lowpass;

  const envelope=
    context.createGain();

  const now=
    context.currentTime;

  envelope.gain.setValueAtTime(
    gain,
    now
  );

  envelope.gain.exponentialRampToValueAtTime(
    .0001,
    now+
    duration
  );

  source
    .connect(
      filter
    )
    .connect(
      envelope
    )
    .connect(
      broadcastAudio.masterGain
    );

  source.start(
    now
  );

  source.stop(
    now+
    duration+
    .02
  );
}

function playHoofBeat(
  intensity=.8
){
  const safe=
    clamp(
      intensity,
      .25,
      1.25
    );

  broadcastAudio.hoofSide=
    1-
    broadcastAudio.hoofSide;

  playBroadcastTone(
    broadcastAudio.hoofSide
      ?92
      :108,
    .095,
    .027*
      safe,
    "sine",
    48
  );

  playBroadcastNoiseHit(
    .045,
    .010*
      safe,
    640
  );
}

function playBroadcastCue(
  cue
){
  if(
    !state.audioEnabled||
    !broadcastAudio.context
  ){
    return;
  }

  if(cue==="gate"){
    playBroadcastTone(
      880,
      .34,
      .045,
      "triangle",
      340
    );

    playBroadcastTone(
      1180,
      .18,
      .020,
      "sine",
      620,
      .05
    );

    playBroadcastNoiseHit(
      .085,
      .032,
      1500
    );

  }else if(cue==="ability"){
    [
      440,
      660,
      880
    ].forEach(
      (
        frequency,
        index
      )=>
        playBroadcastTone(
          frequency,
          .20,
          .026,
          "triangle",
          frequency*
          1.12,
          index*
          .07
        )
    );

  }else if(cue==="finish"){
    [
      392,
      523.25,
      659.25
    ].forEach(
      (
        frequency,
        index
      )=>
        playBroadcastTone(
          frequency,
          .70,
          .032,
          "triangle",
          frequency*
          1.04,
          index*
          .04
        )
    );

  }else if(cue==="resume"){
    playBroadcastTone(
      440,
      .15,
      .016,
      "sine",
      520
    );
  }
}

function updateBroadcastAudio(
  timestamp
){
  const context=
    broadcastAudio.context;

  if(
    !state.audioEnabled||
    !context
  ){
    return;
  }

  const now=
    context.currentTime;

  let crowdTarget=0;

  if(state.phase==="countdown"){
    crowdTarget=.007;

  }else if(state.phase==="live"){
    const progress=
      raceProgress();

    const stretch=
      clamp(
        (
          22-
          secondsRemaining()
        )/
        22,
        0,
        1
      );

    crowdTarget=
      .014+
      progress*
      .018+
      Math.pow(
        stretch,
        1.6
      )*
      .055;

  }else if(state.phase==="finished"){
    crowdTarget=.052;

  }else{
    crowdTarget=.012;
  }

  broadcastAudio.crowdGain.gain
    .setTargetAtTime(
      crowdTarget,
      now,
      .12
    );

  if(state.phase!=="live"){
    broadcastAudio.nextHoofAt=
      timestamp+
      250;
    return;
  }

  if(
    timestamp<
    broadcastAudio.nextHoofAt
  ){
    return;
  }

  const fastest=
    Math.max(
      .55,
      ...state.horses
        .filter(
          horse=>
            !horse.finished
        )
        .map(
          horse=>
            horse.currentSpeed||
            .55
        )
    );

  const normalized=
    clamp(
      (
        fastest-
        .55
      )/
      1,
      0,
      1
    );

  const interval=
    520-
    normalized*
    205;

  const foreground=
    [...state.horses]
      .filter(
        horse=>
          !horse.finished
      )
      .sort(
        (
          a,
          b
        )=>
          visualLaneDepth(
            b
          )-
          visualLaneDepth(
            a
          )
      )[0];

  const depth=
    foreground
      ?visualLaneDepth(
          foreground
        )
      :.6;

  playHoofBeat(
    .52+
    depth*
    .42+
    normalized*
    .18
  );

  broadcastAudio.nextHoofAt=
    timestamp+
    interval;
}

function processBroadcastRaceEvents(
  before,
  ranking
){
  if(
    !before||
    !ranking?.length
  ){
    return;
  }

  const active=
    ranking.filter(
      horse=>
        !horse.finished
    );

  const leader=
    active[0];

  const second=
    active[1];

  if(
    state.phase==="live"&&
    leader&&
    before.leaderId&&
    before.leaderId!==
      leader.id&&
    state.raceT>1
  ){
    emitBroadcastEvent(
      `#${leader.post} ${leader.name} takes the lead.`,
      "lead",
      `leader-${leader.id}`,
      2200
    );
  }

  if(state.phase==="live"){
    const mover=
      active
        .map(
          horse=>({
            horse,
            gain:
              (
                before.positions[
                  horse.id
                ]||
                horse.position
              )-
              horse.position
          })
        )
        .filter(
          item=>
            item.gain>=2&&
            item.horse.position<=5
        )
        .sort(
          (
            a,
            b
          )=>
            b.gain-
            a.gain
        )[0];

    if(mover){
      emitBroadcastEvent(
        `#${mover.horse.post} ${mover.horse.name} surges into ${ordinal(
          mover.horse.position
        )}.`,
        "move",
        `move-${mover.horse.id}`,
        5000
      );
    }

    if(
      leader&&
      second
    ){
      const gap=
        lengthsBehind(
          leader,
          second
        );

      if(
        gap<=.85&&
        secondsRemaining()<=35
      ){
        emitBroadcastEvent(
          `#${leader.post} ${leader.name} and #${second.post} ${second.name} are locked together.`,
          "duel",
          "close-duel",
          7000
        );
      }

      if(
        gap>=2.75&&
        secondsRemaining()<=18
      ){
        emitBroadcastEvent(
          `#${leader.post} ${leader.name} opens a ${gap.toFixed(
            1
          )}-length lead.`,
          "lead",
          "clear-lead",
          6500
        );
      }
    }

    if(
      secondsRemaining()<=20&&
      !state.broadcastFlags.finalStretch
    ){
      state.broadcastFlags.finalStretch=true;

      emitBroadcastEvent(
        `The field turns for the final stretch at ${state.profile?.track||"the racecourse"}.`,
        "stretch",
        "final-stretch",
        0,
        {
          force:true,
          duration:5200
        }
      );
    }
  }
}


/* =========================================================
   RACE MODEL
========================================================= */

function suitability(horse,profile){

  let score=
    horse.baseRating;

  if(profile.sprintWeight){
    score+=
      (horse.sprint-80)*
      profile.sprintWeight;
  }

  if(profile.routeWeight){
    score+=
      (horse.route-80)*
      profile.routeWeight;
  }

  if(profile.earlyWeight){
    score+=
      (horse.earlySpeed-80)*
      profile.earlyWeight;
  }

  if(profile.lateWeight){
    score+=
      (horse.lateSpeed-80)*
      profile.lateWeight;
  }

  return score+
    randomFloat(
      -3.5,
      3.5
    );
}

function morningLine(p){

  const odds=
    clamp(
      1/
      clamp(
        p,
        .025,
        .55
      )*
      .92,

      1.2,
      80
    );

  if(odds<=2.1)return"1-1";
  if(odds<=3.1)return"2-1";
  if(odds<=4.1)return"3-1";
  if(odds<=5.1)return"4-1";
  if(odds<=6.1)return"5-1";
  if(odds<=8.1)return"6-1";
  if(odds<=10.1)return"8-1";
  if(odds<=13.1)return"10-1";
  if(odds<=17.1)return"12-1";
  if(odds<=21.1)return"15-1";
  if(odds<=28.1)return"20-1";
  if(odds<=36.1)return"25-1";
  if(odds<=51.1)return"30-1";

  return"40-1";
}


/* =========================================================
   BUILD FIELD
========================================================= */

function buildRaceHorses(profile){

  const count=
    randomBetween(
      profile.minHorses,
      profile.maxHorses
    );

  const selected=
    sample(
      HORSE_UNIVERSE,
      count
    );

  const scored=
    selected.map(
      horse=>({

        ...horse,

        raceRating:
          suitability(
            horse,
            profile
          )

      })
    );

  if(
    profile.style===
    "Strong Favorite"
  ){

    scored.sort(
      (a,b)=>
        b.raceRating-
        a.raceRating
    );

  }else{

    scored.sort(
      ()=>Math.random()-.5
    );
  }

  const raw=
    scored.map(
      horse=>{

        let weight=
          Math.max(
            .15,
            horse.raceRating-
            55
          );

        if(
          profile.favoriteBoost&&
          horse.raceRating>=88
        ){

          weight+=
            profile.favoriteBoost;
        }

        return weight;
      }
    );

  const total=
    raw.reduce(
      (a,b)=>
        a+b,
      0
    );

  const stylePool=[
    "Front Runner",
    "Pace Presser",
    "Stalker",
    "Closer",
    "Deep Closer"
  ];

  return scored.map(
    (
      horse,
      index
    )=>{

      const probability=
        raw[index]/
        total;

      let runningStyle=
        stylePool[
          Math.floor(
            Math.random()*
            stylePool.length
          )
        ];

      if(
        horse.earlySpeed>=92&&
        Math.random()<.72
      ){

        runningStyle=
          "Front Runner";

      }else if(
        horse.earlySpeed>=87&&
        Math.random()<.60
      ){

        runningStyle=
          "Pace Presser";

      }else if(
        horse.lateSpeed>=94&&
        Math.random()<.78
      ){

        runningStyle=
          Math.random()<.5
            ?"Closer"
            :"Deep Closer";
      }

      const styleTraits={

        "Front Runner":{
          early:1.10,
          mid:1.01,
          late:.86,
          stamina:.90
        },

        "Pace Presser":{
          early:1.06,
          mid:1.04,
          late:.94,
          stamina:.96
        },

        "Stalker":{
          early:.98,
          mid:1.05,
          late:1.03,
          stamina:1.03
        },

        "Closer":{
          early:.89,
          mid:.97,
          late:1.16,
          stamina:1.07
        },

        "Deep Closer":{
          early:.82,
          mid:.92,
          late:1.24,
          stamina:1.10
        }

      }[runningStyle];

      return{

        ...horse,

        post:index+1,

        postColor:
          POST_COLORS[
            index+1
          ],

        coat:
          HORSE_COATS[
            (horse.id-1)%
            HORSE_COATS.length
          ],

        modelProbability:
          probability,

        morningLine:
          morningLine(
            probability
          ),

        runningStyle,

        styleTraits,

        energy:100,

        distanceTravelled:0,

        distanceRemaining:100,

        position:index+1,

        previousPosition:
          index+1,

        finishTime:null,

        finishPosition:null,

        finished:false,

        currentSpeed:0,

        paceScore:0,

        acceleration:
          randomFloat(
            .93,
            1.07
          ),

        consistency:
          randomFloat(
            .88,
            1.08
          ),

        breakStrength:
          randomFloat(
            -1,
            1
          ),

        raceMomentum:
          randomFloat(
            -1,
            1
          ),

        surgeTimer:0,
        surgeStrength:0,

        fadeTimer:0,
        fadeStrength:0,

        confidence:
          randomFloat(
            .88,
            1.12
          ),

        marketMomentum:0,
        marketShock:0,

        recentMove:0,
        recentEnergy:100,

        upsetPotential:0,
        duelPressure:0,

        breakoutAbility:
          randomFloat(
            .75,
            1.35
          ),

        collapseRisk:
          randomFloat(
            .70,
            1.30
          ),

        staminaReserve:
          randomFloat(
            .90,
            1.10
          ),

        tacticalPatience:
          randomFloat(
            .80,
            1.20
          ),

        pacePreference:
          randomFloat(
            .90,
            1.10
          ),

        frontRunner:
          runningStyle===
          "Front Runner",

        specialAbility:null,
        specialAbilityActive:false,
        specialAbilityUsed:false,
        specialAbilityTriggerT:null,
        specialAbilitySeconds:0,
        specialAbilityDuration:0,
        specialAbilitySpeed:null
      };
    }
  );
}


/* =========================================================
   CREATE RACE
========================================================= */


const SPECIAL_ABILITY_NAME="Flash Kick";

function assignSpecialAbility(){
  state.specialRunnerId=null;
  state.specialAbilityName=null;

  if(!state.horses.length){
    return;
  }

  const runner=
    state.horses[
      Math.floor(
        Math.random()*
        state.horses.length
      )
    ];

  runner.specialAbility=
    SPECIAL_ABILITY_NAME;

  state.specialRunnerId=
    runner.id;

  state.specialAbilityName=
    SPECIAL_ABILITY_NAME;
}

function specialAbilityDuration(energy){
  /*
    3–7 seconds determined from energy at the
    instant the ability activates.
  */
  return clamp(
    3+
    (energy/100)*4,
    3,
    7
  );
}

function specialAbilityEligibleToFire(horse,t){
  if(
    !horse.specialAbility||
    horse.specialAbilityUsed||
    horse.specialAbilityActive||
    horse.finished
  ){
    return false;
  }

  /*
    Random activation trigger is assigned when
    the race is created.
  */
  return(
    horse.specialAbilityTriggerT!==null&&
    state.raceT>=
      horse.specialAbilityTriggerT&&
    t>=.20&&
    t<=.86
  );
}

function activateSpecialAbility(horse){
  if(
    horse.specialAbilityUsed||
    horse.specialAbilityActive
  ){
    return;
  }

  const leader=
    fieldRanks().find(
      h=>
        !h.finished&&
        h.id!==horse.id
    );

  if(!leader){
    return;
  }

  horse.specialAbilityUsed=true;
  horse.specialAbilityActive=true;

  horse.specialAbilityDuration=
    specialAbilityDuration(
      horse.energy
    );

  horse.specialAbilitySeconds=
    Math.ceil(
      horse.specialAbilityDuration
    );

  /*
    Match the leader's CURRENT speed. The boost
    is temporary and does not change the horse's
    base rating.
  */
  horse.specialAbilitySpeed=
    Math.max(
      .01,
      leader.currentSpeed||
      1
    );

  emitBroadcastEvent(
    `#${horse.post} ${horse.name} activates ${horse.specialAbility}.`,
    "ability",
    `ability-${horse.id}`,
    0,
    {
      force:true,
      duration:5200
    }
  );

  playBroadcastCue(
    "ability"
  );
}

function createRace(){

  if(state.timer){
    clearInterval(
      state.timer
    );
  }

  state.timer=null;

  state.visualEnvironmentOffset=0;
  state.visualEnvironmentLastTs=null;

  state.visualTargets={};
  state.visualPositions={};

  resetBroadcastPresentation();

  state.weather=null;
  state.weatherClass="";
  state.trackCondition=null;
  state.environment=null;

  state.profile=
    RACE_PROFILES[
      Math.floor(
        Math.random()*
        RACE_PROFILES.length
      )
    ];

  state.weather=
    RACE_WEATHER[
      Math.floor(
        Math.random()*
        RACE_WEATHER.length
      )
    ];

  state.weatherClass=
    state.weather.className;

  const conditionChoices=
    TRACK_CONDITIONS[
      state.profile.surface
    ]||
    TRACK_CONDITIONS.Dirt;

  state.trackCondition=
    conditionChoices[
      Math.floor(
        Math.random()*
        conditionChoices.length
      )
    ];

  const venueVisual=
    VENUE_VISUALS[
      state.profile.track
    ]||
    {
      short:"RACE",
      className:"venue-default",
      skyline:"Racecourse"
    };

  state.environment={
    venue:state.profile.track,
    surface:state.profile.surface,
    condition:state.trackCondition.name,
    weather:state.weather.name,
    venueClass:venueVisual.className,
    cameraIntensity:0
  };

  state.raceNumber=
    randomBetween(
      2,
      10
    );

  const pacePlans=[
    "fastEarly",
    "slowEarly",
    "mixed",
    "stretch",
    "compressed",
    "erratic"
  ];

  state.pacePlan=
    pacePlans[
      Math.floor(
        Math.random()*
        pacePlans.length
      )
    ];

  state.separationFactor=
    randomFloat(
      .72,
      1.38
    );

  state.openCountdown=
    15;

  state.raceT=
    0;

  state.finishAt=
    null;

  state.finishOrder=
    [];

  state.marketSuspended=
    false;

  state.raceDistance=
    100;

  state.raceDuration=
    randomBetween(
      state.profile.raceSecondsMin,
      state.profile.raceSecondsMax
    );

  state.phase=
    "countdown";

  state.winner=
    null;

  state.positions=
    state.positions||
    {};

  state.history=
    {};

  state.lastPrices=
    {};

  state.horses=
    buildRaceHorses(
      state.profile
    );

  assignSpecialAbility();

  state.horses.forEach(
    horse=>{
      horse.specialAbilityTriggerT=null;

      if(
        horse.id===
        state.specialRunnerId
      ){
        horse.specialAbilityTriggerT=
          randomBetween(
            Math.max(
              1,
              Math.round(
                state.raceDuration*
                .20
              )
            ),
            Math.max(
              1,
              Math.round(
                state.raceDuration*
                .86
              )
            )
          );
      }
    }
  );

  state.selected=
    state.horses[0]?.id||
    1;

  state.horses.forEach(
    horse=>{

      state.history[
        horse.id
      ]=[
        {
          t:0,
          p:
            horse.modelProbability
        }
      ];

      state.lastPrices[
        horse.id
      ]=
        horse.modelProbability;
    }
  );

  state.cameraLockedRunnerId=
    state.selected;

  emitBroadcastEvent(
    `${state.profile.track} • ${state.profile.distance} • ${state.horses.length} runners ready.`,
    "preflight",
    "preflight",
    0,
    {
      force:true,
      duration:5200
    }
  );

  updateRaceHeader();

  render();

  state.timer=
    setInterval(
      tick,
      1000
    );
}


/* =========================================================
   HEADER
========================================================= */

function updateRaceHeader(){

  if(!state.profile){
    return;
  }

  const values={

    trackName:
      state.profile.track.toUpperCase(),

    raceNumber:
      `Race ${state.raceNumber}`,

    raceDistance:
      `🏇 ${state.profile.distance}`,

    surface:
      state.profile.surface,

    raceType:
      state.profile.raceType,

    horseCount:
      `${state.horses.length} Horses`,

    raceStyle:
      state.profile.style
  };

  Object.entries(
    values
  ).forEach(
    (
      [id,value]
    )=>{

      const el=
        document.getElementById(
          id
        );

      if(el){
        el.textContent=
          value;
      }
    }
  );
}


/* =========================================================
   PROGRESS
========================================================= */

function raceProgress(){

  return clamp(
    state.raceDuration>0

      ?state.raceT/
       state.raceDuration

      :0,

    0,
    1
  );
}

function secondsRemaining(){

  return Math.max(
    0,
    state.raceDuration-
    state.raceT
  );
}

function fieldRanks(){

  return[
    ...state.horses
  ].sort(
    (a,b)=>
      b.distanceTravelled-
      a.distanceTravelled
  );
}


/* =========================================================
   RACE ENGINE
========================================================= */

function percentileNormalized(
  value,
  min,
  max
){

  if(max===min){
    return .5;
  }

  return clamp(
    (
      value-
      min
    )/
    (
      max-
      min
    ),
    0,
    1
  );
}

function updateHorseState(
  horse,
  t
){

  if(
    specialAbilityEligibleToFire(
      horse,
      t
    )
  ){
    activateSpecialAbility(
      horse
    );
  }

  const profile=
    state.profile;

  const style=
    horse.styleTraits;

  const earlyShare=
    clamp(
      1-
      t/.36,
      0,
      1
    );

  const midShare=
    clamp(
      1-
      Math.abs(
        t-.50
      )/
      .32,
      0,
      1
    );

  const lateShare=
    clamp(
      (
        t-.46
      )/
      .54,
      0,
      1
    );

  const ranking=
    fieldRanks();

  const nearby=
    ranking.filter(
      rival=>
        rival.id!==
          horse.id&&
        !rival.finished&&
        Math.abs(
          rival.distanceTravelled-
          horse.distanceTravelled
        )<
        1.35
    ).length;

  let shapeEffect=0;

  switch(
    state.pacePlan
  ){

    case "fastEarly":

      shapeEffect=
        earlyShare*.070-
        lateShare*.018;

      break;

    case "slowEarly":

      shapeEffect=
        earlyShare*.010+
        lateShare*.060;

      break;

    case "stretch":

      shapeEffect=
        t<.45
          ?.008
          :.085;

      break;

    case "compressed":

      shapeEffect=
        -.018+
        lateShare*.105;

      break;

    case "erratic":

      shapeEffect=
        Math.sin(
          state.raceT*.49+
          horse.id*1.73
        )*.048;

      break;

    default:

      shapeEffect=
        Math.sin(
          state.raceT*.13+
          horse.id
        )*.017;
  }

  const ability=
    horse.raceRating*.27+
    horse.baseRating*.10+
    horse.classRating*.10+
    horse.dirt*.055+
    horse.route*
      (profile.routeWeight||1)*
      .035+
    horse.sprint*
      (profile.sprintWeight||1)*
      .025;

  const earlyComponent=
    (
      horse.earlySpeed-
      80
    )*
    .070*
    earlyShare*
    style.early;

  const midComponent=
    (
      horse.baseRating-
      80
    )*
    .023*
    midShare*
    style.mid;

  const lateComponent=
    (
      horse.lateSpeed-
      80
    )*
    .092*
    lateShare*
    style.late;

  let energyCost=
    .15+
    nearby*.075;

  if(
    horse.position===
    1
  ){

    energyCost+=
      .42*
      earlyShare+
      .14*
      midShare;

  }else if(
    horse.position<=3
  ){

    energyCost+=
      .19*
      earlyShare;

  }else{

    energyCost-=
      .03*
      earlyShare;
  }

  if(
    state.pacePlan===
      "fastEarly"&&
    t<.40
  ){

    energyCost+=
      .22*
      horse.pacePreference;
  }

  energyCost/=
    style.stamina*
    horse.staminaReserve;

  horse.recentEnergy=
    horse.energy;

  horse.energy=
    clamp(
      horse.energy-
      energyCost,
      4,
      100
    );

  const fatigue=
    horse.energy<52

      ?Math.pow(
          (
            52-
            horse.energy
          )/
          40,
          1.25
        )*
        .070*
        horse.collapseRisk

      :0;

  const timeLeft=
    secondsRemaining();

  const lateEventFactor=
    timeLeft<=15
      ?1.70
      :timeLeft<=30
        ?1.28
        :1;

  const rhythmNoise=
    randomFloat(
      -.046,
      .046
    )*
    profile.volatility*
    horse.consistency;

  if(
    horse.surgeTimer<=0&&
    horse.fadeTimer<=0&&
    Math.random()<
      .048*
      profile.volatility*
      lateEventFactor*
      horse.breakoutAbility
  ){

    horse.surgeTimer=
      randomBetween(
        2,
        7
      );

    horse.surgeStrength=
      randomFloat(
        .028,
        .115
      )*
      profile.volatility*
      horse.breakoutAbility;
  }

  if(
    horse.surgeTimer<=0&&
    horse.fadeTimer<=0&&
    Math.random()<
      .020*
      profile.volatility*
      lateEventFactor*
      horse.collapseRisk
  ){

    horse.fadeTimer=
      randomBetween(
        2,
        6
      );

    horse.fadeStrength=
      randomFloat(
        .030,
        .120
      )*
      profile.volatility*
      horse.collapseRisk;
  }

  let surge=0;
  let fade=0;

  if(
    horse.surgeTimer>0
  ){

    surge=
      horse.surgeStrength*
      (
        .65+
        lateShare
      );

    horse.surgeTimer--;
  }

  if(
    horse.fadeTimer>0
  ){

    fade=
      horse.fadeStrength*
      (
        .75+
        earlyShare*.45
      );

    horse.fadeTimer--;
  }

  const nearestAhead=
    ranking
      .filter(
        rival=>
          rival.id!==
            horse.id&&
          !rival.finished&&
          rival.distanceTravelled>
            horse.distanceTravelled
      )
      .sort(
        (a,b)=>
          a.distanceTravelled-
          b.distanceTravelled
      )[0];

  let passingOpportunity=0;

  if(nearestAhead){

    const gap=
      nearestAhead.distanceTravelled-
      horse.distanceTravelled;

    if(gap<1.50){

      passingOpportunity=
        horse.breakoutAbility*
        (
          .018+
          .022*
          lateShare
        );
    }
  }

  const closingKick=
    horse.lateSpeed>=88

      ?lateShare*.108*
       (
         .70+
         Math.random()*.68
       )

      :0;

  const currentLeader=
    ranking.find(
      h=>
        !h.finished
    )||
    ranking[0];

  const leaderFade=
    horse.position===1

      ?Math.max(
          0,
          t-.33
        )*
        .095*
        (
          1+
          nearby*.13
        )

      :0;

  const momentumSwing=
    (
      horse.marketMomentum||
      0
    )*
    .018;

  const separation=
    state.separationFactor*
    (
      horse.position===1
        ?.015
        :horse.position>=5
          ?-.008
          :0
    );

  let movement=
    (
      ability/
      86
    )*
    (
      1+
      earlyComponent*.011+
      midComponent*.010+
      lateComponent*.012+
      shapeEffect+
      rhythmNoise+
      surge+
      passingOpportunity+
      closingKick+
      momentumSwing+
      separation-
      leaderFade-
      fade-
      fatigue
    )*
    horse.acceleration;

  movement*=
    clamp(
      .84+
      horse.energy/
      100*.23,
      .68,
      1.09
    );

  movement*=
    horse.consistency;

  /*
    Flash Kick temporarily matches the speed of
    the leader at activation. The rest of the
    simulation still applies before/after it.
  */
  if(
    horse.specialAbilityActive
  ){
    movement=
      horse.specialAbilitySpeed;
  }

  movement=
    clamp(
      movement,
      .55,
      1.55
    );

  horse.currentSpeed=
    movement;

  horse.distanceTravelled+=
    movement;

  if(
    horse.specialAbilityActive
  ){
    horse.specialAbilitySeconds--;

    if(
      horse.specialAbilitySeconds<=0
    ){
      horse.specialAbilityActive=false;
      horse.specialAbilitySeconds=0;
      horse.specialAbilitySpeed=null;
    }
  }

  horse.distanceRemaining=
    Math.max(
      0,
      state.raceDistance-
      horse.distanceTravelled
    );

  horse.recentMove=
    movement;

  horse.paceScore=
    state.raceT>0
      ?horse.distanceTravelled/
       state.raceT*
       100
      :0;
}


/* =========================================================
   MARKET MODEL
========================================================= */

function lengthsBehind(
  leader,
  horse
){

  if(
    !leader||
    !horse
  ){

    return 0;
  }

  return Math.max(
    0,
    (
      leader.distanceTravelled-
      horse.distanceTravelled
    )*.32
  );
}

function updateMarketState(){

  const active=
    state.horses.filter(
      horse=>
        !horse.finished
    );

  if(!active.length){
    return;
  }

  const ranking=
    [
      ...active
    ].sort(
      (a,b)=>
        b.distanceTravelled-
        a.distanceTravelled
    );

  const leader=
    ranking[0];

  const remaining=
    secondsRemaining();

  active.forEach(
    horse=>{

      const gap=
        lengthsBehind(
          leader,
          horse
        );

      const timeFactor=
        clamp(
          remaining/15,
          0,
          1
        );

      const closingStrength=
        clamp(
          (
            horse.lateSpeed-
            horse.earlySpeed+
            20
          )/
          40,
          0,
          1
        );

      horse.upsetPotential=
        clamp(
          closingStrength*
          (
            horse.energy/
            100
          )*
          (
            .25+
            .75*
            timeFactor
          )*
          (
            1/
            (
              1+
              gap*.22
            )
          ),
          0,
          1
        );

      const second=
        ranking[1];

      horse.duelPressure=0;

      if(
        second&&
        leader
      ){

        const duelGap=
          lengthsBehind(
            leader,
            second
          );

        if(
          duelGap<=1.30&&
          (
            horse.id===
              leader.id||
            horse.id===
              second.id
          )
        ){

          horse.duelPressure=
            clamp(
              (
                15-
                remaining
              )/
              15,
              .15,
              1
            );
        }
      }

      const recent=
        horse.recentMove||
        0;

      const energyChange=
        horse.energy-
        horse.recentEnergy;

      horse.marketMomentum=
        (
          horse.marketMomentum||
          0
        )*
        .62+
        (
          recent-
          1+
          energyChange*.015
        )*
        .38;

      horse.marketShock=
        (
          horse.marketShock||
          0
        )*
        .82+
        randomFloat(
          -.006,
          .006
        );
    }
  );
}

function liveProbability(horse){

  if(
    horse.finished
  ){

    return horse.id===
      state.winner
      ?1
      :0;
  }

  if(
    state.phase===
    "countdown"
  ){

    return horse.modelProbability;
  }

  const remaining=
    secondsRemaining();

  const t=
    raceProgress();

  const active=
    state.horses.filter(
      h=>
        !h.finished
    );

  const ranking=
    [
      ...active
    ].sort(
      (a,b)=>
        b.distanceTravelled-
        a.distanceTravelled
    );

  const leader=
    ranking[0];

  const rankIndex=
    Math.max(
      0,
      ranking.findIndex(
        h=>
          h.id===
          horse.id
      )
    );

  const rankScore=
    1-
    rankIndex/
    Math.max(
      1,
      ranking.length-1
    );

  const gap=
    leader
      ?lengthsBehind(
          leader,
          horse
        )
      :0;

  const energy=
    clamp(
      horse.energy/
      100,
      .04,
      1
    );

  const momentum=
    logistic(
      (
        horse.marketMomentum||
        0
      )*
      3.2
    );

  const closing=
    clamp(
      (
        horse.lateSpeed-
        68
      )/
      38,
      0,
      1
    );

  const priorWeight=
    clamp(
      1-
      t*.84,
      .08,
      1
    );

  const timeWeight=
    clamp(
      t*.96,
      .05,
      .92
    );

  const requiredGap=
    Math.max(
      0,
      gap-
      remaining*.28
    );

  const catchupPenalty=
    clamp(
      requiredGap/
      4.5,
      0,
      1
    );

  const comeback=
    horse.upsetPotential*
    (
      .14+
      .58*
      clamp(
        remaining/15,
        0,
        1
      )
    )*
    (
      .70+
      closing*.60
    );

  let probability=
    horse.modelProbability*
      priorWeight+

    rankScore*
      .30*
      timeWeight+

    energy*
      .07*
      timeWeight+

    momentum*
      .11*
      t+

    comeback;

  probability-=
    catchupPenalty*
    (
      .18+
      .50*
      clamp(
        (
          15-
          remaining
        )/
        15,
        0,
        1
      )
    );

  if(
    leader&&
    ranking[1]&&
    remaining<=15
  ){

    const second=
      ranking[1];

    const duelGap=
      lengthsBehind(
        leader,
        second
      );

    if(
      duelGap<=1.30&&
      (
        horse.id===
          leader.id||
        horse.id===
          second.id
      )
    ){

      const duelStrength=
        (
          1-
          duelGap/
          1.30
        )*
        clamp(
          (
            16-
            remaining
          )/
          16,
          .20,
          1
        );

      probability+=
        .11*
        duelStrength;

      if(
        horse.id===
          second.id&&
        (
          horse.marketMomentum||
          0
        )>
        (
          leader.marketMomentum||
          0
        )
      ){

        probability+=
          .11*
          clamp(
            (
              15-
              remaining
            )/
            15,
            0,
            1
          );
      }
    }
  }

  if(
    horse.id===
      leader?.id&&
    remaining<=15
  ){

    const second=
      ranking[1];

    const leadGap=
      second
        ?lengthsBehind(
            leader,
            second
          )
        :0;

    if(
      leadGap>=2
    ){

      probability+=
        .13*
        clamp(
          leadGap/
          5,
          0,
          1
        )*
        clamp(
          (
            16-
            remaining
          )/
          16,
          .20,
          1
        );
    }

    if(
      leadGap>=4
    ){

      probability+=
        .15;
    }
  }

  probability+=
    (
      horse.marketShock||
      0
    )+
    Math.sin(
      horse.id*4.31+
      state.raceT*.77
    )*
    .010*
    state.profile.volatility;

  return clamp(
    probability,
    .0025,
    .995
  );
}

function marketIsClosed(){

  return(
    state.marketSuspended===
    true
  );
}

function winnerName(){

  const winner=
    state.horses.find(
      horse=>
        horse.id===
        state.winner
    );

  return winner
    ?`#${winner.post} ${winner.name}`
    :"Official winner";
}

function settleWinnerMarket(){

  state.marketSuspended=
    true;
}

function currentPrice(horse){

  /*
    Winner market mark.

    V4.23 fixes a key calibration issue:
    late-race physical certainty is applied LAST,
    after all generic momentum/probability smoothing,
    so a clearly runaway leader cannot fall back
    toward 50¢.
  */

  if(state.marketSuspended){
    return horse.id===state.winner
      ?1
      :0;
  }

  if(state.phase==="countdown"){
    return clamp(
      horse.modelProbability,
      .01,
      .99
    );
  }

  if(horse.finished){
    return horse.id===state.winner
      ?1
      :0;
  }

  const remaining=
    Math.max(
      0,
      state.raceDuration-
      state.raceT
    );

  const probability=
    liveProbability(
      horse
    );

  const ranking=
    fieldRanks();

  const leader=
    ranking.find(
      h=>!h.finished
    )||
    ranking[0];

  const second=
    ranking.find(
      h=>
        !h.finished&&
        h.id!==
        leader?.id
    );

  const gap=
    leader
      ?Math.max(
          0,
          (
            leader.distanceTravelled-
            horse.distanceTravelled
          )*.32
        )
      :0;

  const sensitivity=
    remaining<=2
      ?2.20
      :remaining<=5
        ?1.90
        :remaining<=10
          ?1.60
          :remaining<=20
            ?1.28
            :remaining<=35
              ?1.05
              :.90;

  let price=
    probability+

    (
      horse.marketMomentum||
      0
    )*
    .070*
    sensitivity+

    (
      horse.marketShock||
      0
    )*
    sensitivity+

    (
      horse.duelPressure||
      0
    )*
    .045*
    sensitivity;

  /*
    Generic smoothing happens first.
  */
  if(remaining<=5){
    price=
      price*.60+
      probability*.40;
  }

  if(remaining<=2){
    price=
      price*.48+
      probability*.52;
  }

  /*
    --------------------------------------------------------
    FINAL PHYSICAL CERTAINTY FLOOR
    --------------------------------------------------------

    The market should not be allowed to contradict
    an obvious race state.

    Lead gap is measured against the nearest active
    challenger. This is separate from the horse's
    own gap variable.
  */
  let leadGap=0;

  if(
    horse.id===leader?.id
  ){

    leadGap=
      second
        ?Math.max(
            0,
            (
              leader.distanceTravelled-
              second.distanceTravelled
            )*.32
          )
        :12;

    /*
      A large lead late in the race.

      <=10s:
        4L  -> >= .90
        6L  -> >= .95
        8L  -> >= .975
        10L -> >= .985

      <=5s:
        4L  -> >= .96
        6L  -> >= .98
        8L  -> >= .99
        10L -> >= .995
    */
    if(remaining<=10){

      let certaintyFloor=.0;

      if(leadGap>=4){
        certaintyFloor=
          remaining<=5
            ?.96
            :.90;
      }

      if(leadGap>=6){
        certaintyFloor=
          remaining<=5
            ?.98
            :.95;
      }

      if(leadGap>=8){
        certaintyFloor=
          remaining<=5
            ?.99
            :.975;
      }

      if(leadGap>=10){
        certaintyFloor=
          remaining<=5
            ?.995
            :.985;
      }

      /*
        Final 2 seconds:
        a 6L+ leader is essentially resolved.
      */
      if(
        remaining<=2&&
        leadGap>=6
      ){
        certaintyFloor=
          .995;
      }

      if(
        remaining<=2&&
        leadGap>=8
      ){
        certaintyFloor=
          .998;
      }

      price=
        Math.max(
          price,
          certaintyFloor
        );
    }
  }

  /*
    --------------------------------------------------------
    TRAILING HORSE FLOOR
    --------------------------------------------------------

    Once the field gap exceeds what can physically
    be made up in the available time, force the quote
    down rather than letting generic model probability
    keep it artificially high.
  */
  if(
    horse.id!==leader?.id&&
    remaining<=10
  ){

    const catchable=
      remaining*
      (
        .25+
        clamp(
          (
            horse.lateSpeed-
            80
          )/100,
          0,
          .18
        )
      );

    const gapRatio=
      gap/
      Math.max(
        .5,
        catchable
      );

    let ceiling=null;

    if(gapRatio>=2){
      ceiling=
        remaining<=5
          ?.10
          :.16;
    }

    if(gapRatio>=3){
      ceiling=
        remaining<=5
          ?.025
          :.07;
    }

    if(gapRatio>=4){
      ceiling=
        remaining<=5
          ?.01
          :.035;
    }

    if(
      gap>=10&&
      remaining<=5
    ){
      ceiling=.008;
    }

    if(
      ceiling!==null
    ){
      price=
        Math.min(
          price,
          ceiling
        );
    }
  }

  /*
    --------------------------------------------------------
    HEAD-TO-HEAD EXCEPTION
    --------------------------------------------------------

    A tight duel keeps both contracts alive.
    We never apply the runaway floor unless the
    leader is actually separated from the challenger.
  */
  if(
    horse.id===leader?.id&&
    second&&
    remaining<=15
  ){

    const duelGap=
      lengthsBehind(
        leader,
        second
      );

    if(
      duelGap<=1.30
    ){

      /*
        Remove the runaway certainty floor for a
        genuine close duel.
      */
      const duelCap=
        remaining<=3
          ?.88
          :remaining<=7
            ?.82
            :.76;

      price=
        Math.min(
          price,
          duelCap
        );
    }
  }

  return clamp(
    price,
    .001,
    .998
  );
}

function bookFor(horse){

  if(
    marketIsClosed()
  ){

    const settled=
      horse.id===
        state.winner
        ?1
        :0;

    return{

      asks:[
        settled,
        settled,
        settled
      ],

      bids:[
        settled,
        settled,
        settled
      ]
    };
  }

  const price=
    Math.round(
      currentPrice(
        horse
      )*
      100
    )/
    100;

  const spread=
    state.phase===
      "live"
      ?.02
      :.03;

  return{

    asks:[
      clamp(
        price+
        spread/2,
        .01,
        .99
      ),

      clamp(
        price+
        spread*.9,
        .01,
        .99
      ),

      clamp(
        price+
        spread*1.35,
        .01,
        .99
      )
    ].sort(
      (a,b)=>
        a-b
    ),

    bids:[
      clamp(
        price-
        spread/2,
        .01,
        .99
      ),

      clamp(
        price-
        spread*.9,
        .01,
        .99
      ),

      clamp(
        price-
        spread*1.35,
        .01,
        .99
      )
    ].sort(
      (a,b)=>
        b-a
    )
  };
}


/* =========================================================
   HORSE VISUAL — RICHER RUNNER
========================================================= */

function horseVisualSVG(horse){

  const silk=
    SILK_PALETTE[
      (horse.id-1)%
      SILK_PALETTE.length
    ];

  return `

    <div
      class="horse-art"

      style="
        --silk:${silk.silk};
        --post-color:${horse.postColor||silk.silk};
        --horse-body:${silk.body};
        --horse-main:${horse.coat?.main||silk.body};
        --horse-light:${horse.coat?.light||silk.body};
        --horse-dark:${horse.coat?.dark||"#241915"};
        --horse-muzzle:${horse.coat?.muzzle||"#30211a"};
      "

      aria-label="${horse.name}"
    >

      <div
        class="horse-dust"
        aria-hidden="true"
      >
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>

      <div
        class="horse-tail"
        aria-hidden="true"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div
        class="
          horse-leg
          rear-leg
          rear-one
        "
      >
        <span
          class="hoof"
        ></span>
      </div>

      <div
        class="
          horse-leg
          rear-leg
          rear-two
        "
      >
        <span
          class="hoof"
        ></span>
      </div>

      <div
        class="horse-body"
      >

        <div
          class="body-sheen"
        ></div>

        <div
          class="shoulder-detail"
        ></div>

        <div
          class="horse-girth"
        ></div>

        <div
          class="horse-saddlecloth"
          data-post="${horse.post}"
        >
          <span
            class="saddle-number"
          >
            ${horse.post}
          </span>
        </div>

        <div
          class="horse-saddle"
        ></div>

      </div>

      <div
        class="horse-neck"
      >

        <div
          class="mane"
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

      <div
        class="horse-head"
      >

        <div
          class="
            horse-ear
            ear-one
          "
        ></div>

        <div
          class="
            horse-ear
            ear-two
          "
        ></div>

        <div
          class="horse-eye"
        ></div>

        <div
          class="horse-blaze"
        ></div>

        <div
          class="horse-muzzle"
        ></div>

        <div
          class="horse-nostril"
        ></div>

        <div
          class="horse-bridle"
        ></div>

        <div
          class="horse-reins"
        ></div>

      </div>

      <div
        class="
          horse-leg
          front-leg
          front-one
        "
      >
        <span
          class="hoof"
        ></span>
      </div>

      <div
        class="
          horse-leg
          front-leg
          front-two
        "
      >
        <span
          class="hoof"
        ></span>
      </div>

      <div
        class="jockey-body"
      >

        <div
          class="jockey-arm"
        ></div>

        <div
          class="jockey-glove"
        ></div>

      </div>

      <div
        class="jockey-head"
      ></div>

      <div
        class="jockey-helmet"
      ></div>

      <div
        class="horse-aura"
      ></div>

    </div>
  `;
}


/* =========================================================
   VISUAL POSITION
========================================================= */

function visualLaneDepth(horse){

  const count=
    Math.max(
      1,
      state.horses.length
    );

  if(count===1){
    return .55;
  }

  const postIndex=
    clamp(
      (
        horse.post||
        1
      )-
      1,
      0,
      count-
      1
    );

  return postIndex/
    Math.max(
      1,
      count-
      1
    );
}

function projectedTrackTop(depth){

  const d=
    clamp(
      depth,
      0,
      1
    );

  /*
    The farther lanes are compressed toward the horizon.
    The nearest lane is allowed to spread toward the camera.
  */
  return 31+
    Math.pow(
      d,
      1.12
    )*
    61;
}

function visualRunnerScale(horse){

  const depth=
    visualLaneDepth(
      horse
    );

  /*
    Perspective scale is presentation-only. It never affects
    distance travelled, race order, pricing, or finish logic.
  */
  return .62+
    Math.pow(
      depth,
      .92
    )*
    .54;
}

function visualRunnerZ(horse){

  return 200+
    Math.round(
      visualLaneDepth(
        horse
      )*
      1000
    );
}

function visualTrackPercent(horse){

  /*
    The race still advances from actual simulation distance.

    A lane-dependent start/finish span widens toward the
    camera, creating a diagonal broadcast perspective while
    preserving the underlying race result.
  */

  const depth=
    visualLaneDepth(
      horse
    );

  const progress=
    state.phase===
      "countdown"
      ?0
      :clamp(
          horse.distanceTravelled/
          Math.max(
            1,
            state.raceDistance
          ),
          0,
          1
        );

  const projectedStart=
    10.5-
    depth*
    3.5;

  const projectedFinish=
    87+
    depth*
    5.2;

  return projectedStart+
    (
      projectedFinish-
      projectedStart
    )*
    progress;
}

function visualLaneTop(horse){

  return projectedTrackTop(
    visualLaneDepth(
      horse
    )
  );
}


/* =========================================================
   VISUAL TRACK
========================================================= */


function setupRaceEnvironment(){

  const track=
    document.getElementById(
      "visualTrack"
    );

  if(!track){
    return;
  }

  const surface=
    state.profile?.surface||
    "Dirt";

  const condition=
    state.trackCondition?.name||
    "Good";

  const weatherClass=
    state.weatherClass||
    "weather-sunny";

  const wetness=
    state.trackCondition?.wetness||
    0;

  const venueVisual=
    VENUE_VISUALS[
      state.profile?.track
    ]||
    {
      short:"RACE",
      className:"venue-default",
      skyline:"Racecourse"
    };

  track.classList.add(
    "perspective-3d"
  );

  track.dataset.surface=
    surface;

  track.dataset.condition=
    condition;

  track.dataset.weather=
    weatherClass;

  track.dataset.venueClass=
    venueVisual.className;

  [
    "surface-dirt",
    "surface-turf"
  ].forEach(
    className=>
      track.classList.remove(
        className
      )
  );

  track.classList.add(
    surface==="Turf"
      ?"surface-turf"
      :"surface-dirt"
  );

  [
    "weather-sunny",
    "weather-overcast",
    "weather-golden",
    "weather-haze",
    "weather-rain"
  ].forEach(
    className=>
      track.classList.remove(
        className
      )
  );

  track.classList.add(
    weatherClass
  );

  [
    "venue-churchill",
    "venue-gulfstream",
    "venue-keeneland",
    "venue-saratoga",
    "venue-santa-anita",
    "venue-belmont",
    "venue-default"
  ].forEach(
    className=>
      track.classList.remove(
        className
      )
  );

  track.classList.add(
    venueVisual.className
  );

  if(state.environment){
    state.environment.cameraIntensity=
      clamp(
        raceProgress()*.72+
        (
          (
            1-
            secondsRemaining()/
            Math.max(
              1,
              state.raceDuration
            )
          )*.28
        ),
        0,
        1
      );
  }

  track.style.setProperty(
    "--race-progress",
    raceProgress().toFixed(
      4
    )
  );

  track.style.setProperty(
    "--camera-intensity",
    (
      state.environment?.cameraIntensity||
      0
    ).toFixed(
      4
    )
  );

  track.style.setProperty(
    "--condition-wetness",
    String(
      wetness
    )
  );

  track.style.setProperty(
    "--condition-spray",
    String(
      state.trackCondition?.spray||
      0
    )
  );

  track.style.setProperty(
    "--track-sheen-opacity",
    (
      .08+
      wetness*
      .46
    ).toFixed(
      3
    )
  );

  track.style.setProperty(
    "--surface-texture-opacity",
    (
      .05+
      wetness*
      .34
    ).toFixed(
      3
    )
  );

  track.style.setProperty(
    "--rain-opacity",
    (
      .66+
      wetness*
      .30
    ).toFixed(
      3
    )
  );

  track.style.setProperty(
    "--speed-opacity",
    (
      .08+
      (
        state.environment?.cameraIntensity||
        0
      )*
      .40
    ).toFixed(
      3
    )
  );

  track.style.setProperty(
    "--field-size",
    String(
      state.horses.length
    )
  );

  let atmosphere=
    track.querySelector(
      ".track-atmosphere-3d"
    );

  if(!atmosphere){
    atmosphere=
      document.createElement(
        "div"
      );

    atmosphere.className=
      "track-atmosphere-3d";

    atmosphere.setAttribute(
      "aria-hidden",
      "true"
    );

    atmosphere.innerHTML=`
      <div class="track-sky-gradient"></div>
      <div class="track-horizon-glow"></div>
      <div class="track-aerial-haze"></div>
      <div class="track-foreground-shade"></div>
    `;

    track.prepend(
      atmosphere
    );
  }

  let scenery=
    track.querySelector(
      ".track-scenery"
    );

  if(!scenery){
    scenery=
      document.createElement(
        "div"
      );

    scenery.className=
      "track-scenery";

    scenery.setAttribute(
      "aria-hidden",
      "true"
    );

    scenery.innerHTML=`
      <div class="venue-backdrop"></div>

      <div class="grandstand">
        <div class="grandstand-roof"></div>
        <div class="grandstand-tier"></div>
        <div class="grandstand-seats">
          <i></i><i></i><i></i><i></i><i></i>
          <i></i><i></i><i></i><i></i><i></i>
        </div>
      </div>

      <div class="venue-landmarks"></div>

      <div class="track-lighting">
        <span></span><span></span><span></span><span></span>
      </div>

      <div class="tree-line">
        <i></i><i></i><i></i><i></i><i></i>
        <i></i><i></i>
      </div>
    `;

    track.prepend(
      scenery
    );
  }

  let surfacePlane=
    track.querySelector(
      ".track-surface-3d"
    );

  if(!surfacePlane){
    surfacePlane=
      document.createElement(
        "div"
      );

    surfacePlane.className=
      "track-surface-3d";

    surfacePlane.setAttribute(
      "aria-hidden",
      "true"
    );

    surfacePlane.innerHTML=`
      <div class="track-surface-base"></div>
      <div class="track-perspective-sections">
        ${Array.from(
          {length:9},
          (_,index)=>
            `<i style="--section-index:${index};"></i>`
        ).join("")}
      </div>
      <div class="track-perspective-lanes"></div>
      <div class="track-racing-sheen"></div>
      <div class="track-near-grain"></div>
    `;

    const runnerLayer=
      track.querySelector(
        "#visualRunnerLayer"
      );

    track.insertBefore(
      surfacePlane,
      runnerLayer||
      null
    );
  }

  const laneLayer=
    surfacePlane.querySelector(
      ".track-perspective-lanes"
    );

  const laneCount=
    Math.max(
      1,
      state.horses.length
    );

  if(
    laneLayer&&
    laneLayer.dataset.count!==
      String(
        laneCount
      )
  ){
    laneLayer.dataset.count=
      String(
        laneCount
      );

    laneLayer.innerHTML=
      Array.from(
        {
          length:
            laneCount+
            1
        },
        (_,index)=>{

          const depth=
            index/
            laneCount;

          const y=
            6+
            Math.pow(
              depth,
              1.12
            )*
            80;

          const inset=
            11-
            depth*
            8;

          const alpha=
            .10+
            depth*
            .17;

          return`
            <span
              style="
                --lane-y:${y.toFixed(3)}%;
                --lane-inset:${inset.toFixed(3)}%;
                --lane-alpha:${alpha.toFixed(3)};
              "
            ></span>
          `;
        }
      ).join("");
  }

  let gate=
    track.querySelector(
      ".enhanced-start-gate"
    );

  if(!gate){
    gate=
      document.createElement(
        "div"
      );

    gate.className=
      "enhanced-start-gate";

    gate.setAttribute(
      "aria-hidden",
      "true"
    );

    track.appendChild(
      gate
    );
  }

  gate.innerHTML=`
    <div class="gate-frame"></div>
    <div class="gate-stalls">
      ${Array.from(
        {
          length:
            Math.min(
              20,
              state.horses.length
            )
        },
        ()=>
          `<span aria-hidden="true"></span>`
      ).join("")}
    </div>
    <div class="gate-bar"></div>
    <div class="gate-post left"></div>
    <div class="gate-post right"></div>
  `;

  [
    ["25%","1/4"],
    ["50%","1/2"],
    ["75%","3/4"],
    ["88.5%","FINAL"]
  ].forEach(
    (
      [
        position,
        label
      ]
    )=>{
      if(
        !track.querySelector(
          `.distance-marker[data-position="${position}"]`
        )
      ){
        const marker=
          document.createElement(
            "div"
          );

        marker.className=
          "distance-marker";

        marker.dataset.position=
          position;

        marker.style.left=
          position;

        marker.innerHTML=`
          <span
            class="distance-pole"
            aria-label="${label}"
          ></span>
        `;

        track.appendChild(
          marker
        );
      }
    }
  );

  let finishPlane=
    track.querySelector(
      ".finish-plane-3d"
    );

  if(!finishPlane){
    finishPlane=
      document.createElement(
        "div"
      );

    finishPlane.className=
      "finish-plane-3d";

    finishPlane.setAttribute(
      "aria-hidden",
      "true"
    );

    finishPlane.innerHTML=`
      <span></span>
      <b>FINISH</b>
    `;

    track.appendChild(
      finishPlane
    );
  }

  let broadcast=
    track.querySelector(
      ".race-broadcast"
    );

  if(!broadcast){
    broadcast=
      document.createElement(
        "div"
      );

    broadcast.className=
      "race-broadcast";

    track.appendChild(
      broadcast
    );
  }

  broadcast.innerHTML=`
    <span class="broadcast-live-dot"></span>
    <strong>
      ${state.profile?.track||"RACECOURSE"}
    </strong>
    <span class="broadcast-separator">•</span>
    <span>
      ${state.profile?.distance||""}
    </span>
    <span class="broadcast-separator">•</span>
    <span>
      ${surface}
    </span>
    <span class="broadcast-separator">•</span>
    <span>
      ${condition}
    </span>
    <span class="broadcast-separator">•</span>
    <span class="broadcast-weather">
      ${state.weather?.atmosphere||"Clear skies"}
    </span>
  `;

  let venueLabel=
    track.querySelector(
      ".venue-scene-label"
    );

  if(!venueLabel){
    venueLabel=
      document.createElement(
        "div"
      );

    venueLabel.className=
      "venue-scene-label";

    track.appendChild(
      venueLabel
    );
  }

  venueLabel.innerHTML=`
    <span>${venueVisual.short}</span>
    <div>
      <b>${state.profile?.track||"Racecourse"}</b>
      <em>${venueVisual.skyline}</em>
    </div>
  `;

  if(
    !track.querySelector(
      ".weather-layer"
    )
  ){
    const weather=
      document.createElement(
        "div"
      );

    weather.className=
      "weather-layer";

    weather.setAttribute(
      "aria-hidden",
      "true"
    );

    weather.innerHTML=
      Array.from(
        {
          length:28
        },
        (_,index)=>{

          const left=
            (
              index*
              37
            )%
            101;

          const delay=
            (
              index*
              .067
            )%
            .85;

          const duration=
            .58+
            (
              index%
              5
            )*
            .09;

          return`
            <i
              style="
                --rain-x:${left}%;
                --rain-delay:-${delay.toFixed(2)}s;
                --rain-duration:${duration.toFixed(2)}s;
              "
            ></i>
          `;
        }
      ).join("");

    track.appendChild(
      weather
    );
  }

  if(
    !track.querySelector(
      ".surface-texture"
    )
  ){
    const texture=
      document.createElement(
        "div"
      );

    texture.className=
      "surface-texture";

    texture.setAttribute(
      "aria-hidden",
      "true"
    );

    track.appendChild(
      texture
    );
  }

  const oldVenueBadge=
    track.querySelector(
      ".venue-identity"
    );

  if(oldVenueBadge){
    oldVenueBadge.remove();
  }
}


function createRunnerVisualNode(
  horse
){
  const node=
    document.createElement(
      "div"
    );

  node.className=
    "runner-visual";

  node.dataset.runnerId=
    String(
      horse.id
    );

  node.dataset.visualToken=
    String(
      state.raceVisualToken
    );

  node.setAttribute(
    "role",
    "button"
  );

  node.setAttribute(
    "tabindex",
    "0"
  );

  node.setAttribute(
    "aria-pressed",
    "false"
  );

  node.innerHTML=`
    <div class="runner-motion-trail" aria-hidden="true"></div>
    ${horseVisualSVG(horse)}

    <div
      class="special-ability-badge"
      data-runner-part="special"
      hidden
    ></div>

    <div class="runner-label">
      <strong>
        <span data-runner-part="name"></span>
        <span
          class="finished-check"
          data-runner-part="finished"
          hidden
        >✓</span>
      </strong>
      <span class="runner-label-status">
        <span data-runner-part="position"></span>
        <span
          class="position-change"
          data-runner-part="change"
        ></span>
      </span>
    </div>
  `;

  const select=
    ()=>{
      selectBroadcastRunner(
        horse.id,
        true
      );
    };

  node.addEventListener(
    "click",
    event=>{
      event.stopPropagation();
      select();
    }
  );

  node.addEventListener(
    "keydown",
    event=>{
      if(
        event.key==="Enter"||
        event.key===" "
      ){
        event.preventDefault();
        select();
      }
    }
  );

  state.runnerNodes[
    horse.id
  ]=
    node;

  return node;
}

function updateRunnerVisualNode(
  node,
  horse,
  maxSpeed
){
  const targetX=
    visualTrackPercent(
      horse
    );

  const targetY=
    visualLaneTop(
      horse
    );

  const targetDepth=
    visualLaneDepth(
      horse
    );

  const targetScale=
    visualRunnerScale(
      horse
    );

  const targetZ=
    visualRunnerZ(
      horse
    );

  if(
    state.visualTargets[
      horse.id
    ]===
    undefined
  ){
    state.visualTargets[
      horse.id
    ]={
      x:targetX,
      y:targetY,
      scale:targetScale,
      depth:targetDepth,
      z:targetZ
    };
  }else{
    Object.assign(
      state.visualTargets[
        horse.id
      ],
      {
        x:targetX,
        y:targetY,
        scale:targetScale,
        depth:targetDepth,
        z:targetZ
      }
    );
  }

  if(
    state.visualPositions[
      horse.id
    ]===
    undefined
  ){
    state.visualPositions[
      horse.id
    ]={
      x:targetX,
      y:targetY,
      scale:targetScale,
      depth:targetDepth,
      z:targetZ
    };
  }

  const visualPosition=
    state.visualPositions[
      horse.id
    ];

  const relativeSpeed=
    clamp(
      (
        horse.currentSpeed||
        0
      )/
      Math.max(
        1,
        maxSpeed
      ),
      .55,
      1
    );

  const runnerAnimation=
    state.phase==="countdown"
      ?"runner-pre"
      :state.phase==="live"
        ?"runner-gallop"
        :state.phase==="finished"
          ?"runner-finish"
          :"runner-settled";

  const speedClass=
    relativeSpeed>=.88
      ?"runner-fast"
      :relativeSpeed>=.72
        ?"runner-cruise"
        :"runner-slow";

  const classes=[
    "runner-visual",
    runnerAnimation,
    speedClass
  ];

  if(
    state.phase==="live"&&
    (
      horse.currentSpeed||
      0
    )>=.97
  ){
    classes.push(
      "runner-dust"
    );
  }

  if(horse.finished){
    classes.push(
      "finished-runner"
    );
  }

  if(
    horse.id===
    state.selected
  ){
    classes.push(
      "selected-runner",
      "tracking-runner"
    );
  }

  if(
    state.phase==="live"&&
    horse.position===1
  ){
    classes.push(
      "leading"
    );
  }

  if(
    state.phase==="live"&&
    horse.previousPosition&&
    horse.position<
      horse.previousPosition
  ){
    classes.push(
      "passing"
    );
  }

  if(horse.specialAbilityActive){
    classes.push(
      "special-active"
    );
  }

  if(targetX>=78){
    classes.push(
      "near-finish"
    );
  }

  if(
    horse.id===
    state.cameraFocusRunnerId
  ){
    classes.push(
      "camera-focus-runner"
    );
  }

  node.className=
    classes.join(
      " "
    );

  node.dataset.laneDepth=
    targetDepth.toFixed(
      3
    );

  node.style.left=
    `${visualPosition.x}%`;

  node.style.top=
    `${visualPosition.y}%`;

  node.style.setProperty(
    "--runner-scale",
    visualPosition.scale.toFixed(
      4
    )
  );

  node.style.setProperty(
    "--lane-depth",
    visualPosition.depth.toFixed(
      4
    )
  );

  node.style.setProperty(
    "--runner-opacity",
    (
      .82+
      visualPosition.depth*
      .18
    ).toFixed(
      4
    )
  );

  node.style.setProperty(
    "--runner-brightness",
    (
      .86+
      visualPosition.depth*
      .14
    ).toFixed(
      4
    )
  );

  node.style.setProperty(
    "--runner-saturation",
    (
      .88+
      visualPosition.depth*
      .12
    ).toFixed(
      4
    )
  );

  node.style.setProperty(
    "--runner-shadow-scale",
    (
      .72+
      visualPosition.depth*
      .28
    ).toFixed(
      4
    )
  );

  node.style.setProperty(
    "--runner-shadow-blur",
    `${(
      1+
      visualPosition.depth
    ).toFixed(
      3
    )}px`
  );

  node.style.setProperty(
    "--runner-z",
    String(
      Math.round(
        targetZ
      )
    )
  );

  node.style.zIndex=
    String(
      Math.round(
        targetZ
      )
    );

  const name=
    node.querySelector(
      '[data-runner-part="name"]'
    );

  if(name){
    name.textContent=
      `#${horse.post} ${
        horse.name.split(
          " "
        )[0]
      }`;
  }

  const finished=
    node.querySelector(
      '[data-runner-part="finished"]'
    );

  if(finished){
    finished.hidden=
      !horse.finished;
  }

  const position=
    node.querySelector(
      '[data-runner-part="position"]'
    );

  if(position){
    position.textContent=
      state.phase==="countdown"
        ?horse.morningLine
        :horse.finished
          ?`P${horse.finishPosition}`
          :`P${horse.position}`;
  }

  const change=
    node.querySelector(
      '[data-runner-part="change"]'
    );

  if(change){
    const movement=
      state.phase==="live"&&
      horse.previousPosition
        ?horse.position<
          horse.previousPosition
          ?"↑"
          :horse.position>
            horse.previousPosition
            ?"↓"
            :""
        :"";

    change.textContent=
      movement;

    change.classList.toggle(
      "shift-up",
      movement==="↑"
    );

    change.classList.toggle(
      "shift-down",
      movement==="↓"
    );
  }

  const special=
    node.querySelector(
      '[data-runner-part="special"]'
    );

  if(special){
    special.hidden=
      !horse.specialAbility;

    special.textContent=
      horse.specialAbility
        ?`⚡ ${horse.specialAbility}`
        :"";

    special.classList.toggle(
      "active",
      horse.specialAbilityActive
    );
  }

  node.setAttribute(
    "aria-pressed",
    String(
      horse.id===
      state.selected
    )
  );

  node.setAttribute(
    "aria-label",
    `Track runner #${horse.post}, ${horse.name}. ${
      state.phase==="countdown"
        ?`Morning line ${horse.morningLine}.`
        :horse.finished
          ?`Finished ${ordinal(
              horse.finishPosition
            )}.`
          :`Currently ${ordinal(
              horse.position
            )}.`
    } Select and follow this runner.`
  );
}

function syncRunnerVisualNodes(
  layer,
  maxSpeed
){
  const activeIds=
    new Set(
      state.horses.map(
        horse=>
          String(
            horse.id
          )
      )
    );

  Object.entries(
    state.runnerNodes
  ).forEach(
    (
      [
        id,
        node
      ]
    )=>{
      if(
        !activeIds.has(
          String(
            id
          )
        )||
        node.dataset.visualToken!==
          String(
            state.raceVisualToken
          )
      ){
        node.remove();

        delete state.runnerNodes[
          id
        ];
      }
    }
  );

  state.horses.forEach(
    horse=>{

      let node=
        state.runnerNodes[
          horse.id
        ];

      if(!node){
        node=
          createRunnerVisualNode(
            horse
          );

        layer.appendChild(
          node
        );
      }

      updateRunnerVisualNode(
        node,
        horse,
        maxSpeed
      );
    }
  );
}

function renderVisualTrack(){

  setupRaceEnvironment();

  const layer=
    document.getElementById(
      "visualRunnerLayer"
    );

  const status=
    document.getElementById(
      "visualTrackStatus"
    );

  const track=
    document.getElementById(
      "visualTrack"
    );

  if(
    !layer||
    !track
  ){
    return;
  }

  track.classList.toggle(
    "large-field",
    state.horses.length>=14
  );

  track.classList.toggle(
    "mega-field",
    state.horses.length>=18
  );

  track.classList.remove(
    "race-pre",
    "race-live",
    "race-finished",
    "race-settled"
  );

  if(state.phase==="countdown"){
    track.classList.add(
      "race-pre"
    );

  }else if(state.phase==="live"){
    track.classList.add(
      "race-live"
    );

  }else if(state.phase==="finished"){
    track.classList.add(
      "race-finished"
    );

  }else{
    track.classList.add(
      "race-settled"
    );
  }

  if(state.profile){
    track.dataset.venue=
      state.profile.track;

    track.dataset.surface=
      state.profile.surface;
  }

  updateBroadcastCameraDirector();

  applyCameraShotClasses(
    track
  );

  if(status){
    status.textContent=
      state.phase==="countdown"
        ?"PREFLIGHT"
        :state.phase==="live"
          ?`LIVE • ${cameraShotDisplayName(
              state.cameraShot
            )}`
          :state.phase==="finished"
            ?"OFFICIAL"
            :"SETTLED";
  }

  const maxSpeed=
    Math.max(
      1,
      ...state.horses.map(
        horse=>
          horse.currentSpeed||
          0
      )
    );

  syncRunnerVisualNodes(
    layer,
    maxSpeed
  );

  renderRunnerHud();
  renderBroadcastOverlay();
  updateCameraControls();
}

/* =========================================================
   MARKET STATUS
========================================================= */

function renderMarketStatus(){

  const pill=
    document.getElementById(
      "marketPill"
    );

  const pillText=
    document.getElementById(
      "marketPillText"
    );

  const banner=
    document.getElementById(
      "marketClosedBanner"
    );

  const bannerText=
    document.getElementById(
      "marketClosedText"
    );

  const orderCard=
    document.querySelector(
      ".order-card"
    );

  const closed=
    marketIsClosed();

  if(pill){

    pill.classList.toggle(
      "market-closed",
      closed
    );
  }

  if(pillText){

    pillText.textContent=
      closed
        ?"MARKET CLOSED"
        :"PRICES LIVE";
  }

  if(banner){

    banner.classList.toggle(
      "hidden",
      !closed
    );
  }

  if(
    bannerText&&
    closed
  ){

    bannerText.textContent=
      `${winnerName()} has crossed the finish line. All Winner contracts are settled.`;
  }

  if(orderCard){

    orderCard.classList.toggle(
      "order-locked",
      closed
    );
  }
}


/* =========================================================
   TICKET
========================================================= */

function updateTicketSummary(){

  const price=
    Number(
      document.getElementById(
        "priceInput"
      )?.value
    )||
    0;

  const qty=
    Number(
      document.getElementById(
        "qtyInput"
      )?.value
    )||
    0;

  const label=
    document.getElementById(
      "priceLabel"
    );

  const notional=
    document.getElementById(
      "notional"
    );

  const payout=
    document.getElementById(
      "payout"
    );

  const button=
    document.getElementById(
      "placeBtn"
    );

  if(label){

    label.textContent=
      `(${money(price)})`;
  }

  if(notional){

    notional.textContent=
      money(
        price*
        qty
      );
  }

  if(payout){

    payout.textContent=
      money(qty);
  }

  if(button){

    button.textContent=
      `PLACE ${
        state.side.toUpperCase()
      } YES ORDER`;
  }
}


/* =========================================================
   HORSE TABLE
========================================================= */

function renderRaceCard(){

  const body=
    document.getElementById(
      "raceCardBody"
    );

  if(!body){
    return;
  }

  body.innerHTML=
    state.horses.map(
      horse=>`

      <tr
        class="
          runner-row
          ${
            horse.id===
            state.selected
              ?"selected"
              :""
          }
        "
        data-id="${horse.id}"
      >

        <td>

          <span
            class="post-pill"
          >
            ${horse.post}
          </span>

        </td>

        <td
          class="horse-cell"
        >

          ${horse.name}

          <small>

            ${horse.runningStyle}

          </small>

        </td>

        <td
          class="ml"
        >
          ${horse.morningLine}
        </td>

        <td
          class="rating"
        >
          ${Math.round(
            horse.raceRating
          )}
        </td>

        <td
          class="style-chip"
        >

          ${
            horse.specialAbility
              ?`⚡ ${horse.specialAbility}`
              :horse.position===1&&
               state.phase==="live"
                ?"LEADING"
                :horse.lateSpeed>
                  horse.earlySpeed+5
                  ?"Closer"
                  :horse.earlySpeed>
                    horse.lateSpeed+5
                    ?"Speed"
                    :"Balanced"
          }

        </td>

      </tr>

    `
    ).join("");

  body
    .querySelectorAll(
      ".runner-row"
    )
    .forEach(
      row=>{

        row.onclick=
          ()=>{
            selectBroadcastRunner(
              Number(
                row.dataset.id
              ),
              false
            );
          };
      }
    );
}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile(){

  const horse=
    state.horses.find(
      h=>
        h.id===
        state.selected
    );

  const title=
    document.getElementById(
      "profileTitle"
    );

  const badge=
    document.getElementById(
      "profileBadge"
    );

  const profile=
    document.getElementById(
      "horseProfile"
    );

  if(
    !title||
    !badge||
    !profile
  ){

    return;
  }

  if(!horse){

    title.textContent=
      "Select a runner";

    badge.textContent=
      "RUNNER PROFILE";

    profile.className=
      "horse-profile empty";

    profile.textContent=
      "No runner selected.";

    return;
  }

  title.textContent=
    `#${horse.post} ${horse.name}`;

  badge.textContent=
    state.phase===
      "live"

      ?`LIVE • ${
          horse.position===
            1
            ?"LEADING"
            :`#${horse.position}`
        }`

      :"SIMULATION PROFILE";

  profile.className=
    "horse-profile";

  profile.innerHTML=`

    <div
      class="profile-grid"
    >

      <div
        class="profile-main"
      >

        <div
          class="profile-name"
        >
          #${horse.post}
          ${horse.name}
        </div>

        <div
          class="profile-tag"
        >
          ${horse.age}yo •
          ${horse.sex} •
          Simulation profile
        </div>

        <div
          class="profile-stats"
        >

          <div
            class="stat"
          >
            <span>
              BASE RATING
            </span>

            <strong>
              ${horse.baseRating}
            </strong>
          </div>

          <div
            class="stat"
          >
            <span>
              RACE RATING
            </span>

            <strong>
              ${Math.round(
                horse.raceRating
              )}
            </strong>
          </div>

          <div
            class="stat"
          >
            <span>
              LIVE PROBABILITY
            </span>

            <strong>
              ${Math.round(
                liveProbability(
                  horse
                )*
                100
              )}%
            </strong>
          </div>

          <div
            class="stat"
          >
            <span>
              POSITION
            </span>

            <strong>
              ${
                state.phase===
                  "countdown"
                  ?"—"
                  :`#${horse.position}`
              }
            </strong>
          </div>

          <div
            class="stat"
          >
            <span>
              EARLY SPEED
            </span>

            <strong>
              ${horse.earlySpeed}
            </strong>
          </div>

          <div
            class="stat"
          >
            <span>
              LATE SPEED
            </span>

            <strong>
              ${horse.lateSpeed}
            </strong>
          </div>

        </div>

      </div>

      <div
        class="profile-side"
      >

        <h3>
          Runner Notes
        </h3>

        <div
          class="profile-list"
        >

          <div>
            <span>
              Current form
            </span>

            <strong>
              ${horse.form.join(" • ")}
            </strong>
          </div>

          <div>
            <span>
              Dirt rating
            </span>

            <strong>
              ${horse.dirt}
            </strong>
          </div>

          <div>
            <span>
              Sprint rating
            </span>

            <strong>
              ${horse.sprint}
            </strong>
          </div>

          <div>
            <span>
              Route rating
            </span>

            <strong>
              ${horse.route}
            </strong>
          </div>

          <div>
            <span>
              Class rating
            </span>

            <strong>
              ${horse.classRating}
            </strong>
          </div>

          <div>
            <span>
              Energy
            </span>

            <strong>
              ${Math.round(
                horse.energy
              )}%
            </strong>
          </div>

          <div>
            <span>
              Running style
            </span>

            <strong>
              ${horse.runningStyle}
            </strong>
          </div>

          <div>
            <span>
              Special ability
            </span>

            <strong>
              ${
                horse.specialAbility
                  ?`⚡ ${horse.specialAbility}${
                      horse.specialAbilityActive
                        ?" • ACTIVE"
                        :horse.specialAbilityUsed
                          ?" • USED"
                          :" • READY"
                    }`
                  :"—"
              }
            </strong>
          </div>

        </div>

      </div>

    </div>

  `;
}


/* =========================================================
   MARKET CARDS
========================================================= */

function renderHorses(){

  const element=
    document.getElementById(
      "horseList"
    );

  if(!element){
    return;
  }

  element.innerHTML=
    state.horses.map(
      horse=>{

        const price=
          currentPrice(
            horse
          );

        const last=
          state.lastPrices[
            horse.id
          ]??
          price;

        const diff=
          price-
          last;

        const moveClass=
          diff>.002
            ?"up"
            :diff<-.002
              ?"down"
              :"neutral";

        return`

          <div

            class="
              horse-card
              ${
                horse.id===
                state.selected
                  ?"selected"
                  :""
              }
            "

            data-id="${horse.id}"
          >

            <div
              class="horse-row"
            >

              <div
                class="horse-id"
              >
                #${horse.post}
              </div>

              <div
                class="horse-name"
              >
                ${horse.name}
              </div>

              <div>

                <div
                  class="price"
                >
                  ${cents(price)}
                </div>

                <div
                  class="
                    move
                    ${moveClass}
                  "
                >

                  ${
                    diff>0
                      ?"+"
                      :""
                  }

                  ${Math.round(
                    diff*
                    100
                  )}¢

                </div>

              </div>

            </div>

            <div
              class="bar"
            >
              <span
                style="
                  width:${Math.round(
                    price*
                    100
                  )}%
                "
              ></span>
            </div>

            <div
              class="subline"
            >

              <span>

                ${
                  state.phase===
                    "countdown"

                    ?`ML ${horse.morningLine}`

                    :`LIVE #${horse.position}`
                }

              </span>

              <span>

                ${
                  state.phase===
                    "countdown"

                    ?`${Math.round(
                        horse.modelProbability*
                        100
                      )}%`

                    :`${Math.round(
                        liveProbability(
                          horse
                        )*
                        100
                      )}%`
                }

              </span>

            </div>

          </div>

        `;
      }
    ).join("");

  element
    .querySelectorAll(
      ".horse-card"
    )
    .forEach(
      card=>{

        card.onclick=
          ()=>{

            selectBroadcastRunner(
              Number(
                card.dataset.id
              ),
              false
            );
          };
      }
    );
}


/* =========================================================
   SELECTED MARKET
========================================================= */

function renderSelected(){

  const horse=
    state.horses.find(
      h=>
        h.id===
        state.selected
    );

  if(!horse){
    return;
  }

  const price=
    currentPrice(
      horse
    );

  const book=
    bookFor(
      horse
    );

  [
    "selectedHorseTitle",
    "bookTitle",
    "ticketTitle"
  ].forEach(
    id=>{

      const el=
        document.getElementById(
          id
        );

      if(el){

        el.textContent=
          `#${horse.post} ${horse.name}`;
      }
    }
  );

  const selectedPrice=
    document.getElementById(
      "selectedPrice"
    );

  if(selectedPrice){

    selectedPrice.textContent=
      money(price);
  }

  const asks=
    document.getElementById(
      "asks"
    );

  if(asks){

    asks.innerHTML=
      book.asks.map(
        (
          p,
          i
        )=>`

          <div
            class="book-line"
          >

            <strong
              class="ask"
            >
              ${cents(p)}
            </strong>

            <span>
              ${[18,42,65][i]}
            </span>

          </div>

        `
      ).join("");
  }

  const bids=
    document.getElementById(
      "bids"
    );

  if(bids){

    bids.innerHTML=
      book.bids.map(
        (
          p,
          i
        )=>`

          <div
            class="book-line"
          >

            <strong
              class="bid"
            >
              ${cents(p)}
            </strong>

            <span>
              ${[25,52,88][i]}
            </span>

          </div>

        `
      ).join("");
  }

  const input=
    document.getElementById(
      "priceInput"
    );

  if(
    input&&
    !input.matches(
      ":focus"
    )
  ){

    input.value=
      price.toFixed(2);
  }

  updateTicketSummary();
}


/* =========================================================
   POSITIONS
========================================================= */

function renderPositions(){

  const wrapper=
    document.getElementById(
      "positions"
    );

  if(!wrapper){
    return;
  }

  const ids=
    Object.keys(
      state.positions
    )
    .map(Number)
    .filter(
      id=>
        state.positions[id]?.qty
    );

  if(
    !ids.length
  ){

    wrapper.innerHTML=`

      <div
        class="empty"
      >
        No open positions yet.
        Trade the live field to build a portfolio.
      </div>

    `;

    return;
  }

  let total=0;

  wrapper.innerHTML=
    ids.map(
      id=>{

        const horse=
          state.horses.find(
            h=>
              h.id===
              id
          );

        if(!horse){
          return "";
        }

        const pos=
          state.positions[id];

        const value=
          pos.qty*
          currentPrice(
            horse
          );

        const pnl=
          value-
          pos.cost;

        total+=
          pnl;

        return`

          <div
            class="position-row"
          >

            <div
              class="position-meta"
            >

              #${horse.post}
              ${horse.name}

              <span>
                ${pos.qty}
                YES @
                ${cents(pos.avg)}
              </span>

            </div>

            <div
              class="pos-extra"
            >

              <small>
                Current
              </small>

              <strong>
                ${money(value)}
              </strong>

            </div>

            <div
              class="pos-extra"
            >

              <small>
                Cost
              </small>

              <strong>
                ${money(pos.cost)}
              </strong>

            </div>

            <div
              class="pos-val"
            >

              <small>
                P/L
              </small>

              <strong
                class="${
                  pnl>=0
                    ?"up"
                    :"down"
                }"
              >

                ${
                  pnl>=0
                    ?"+"
                    :""
                }

                ${money(pnl)}

              </strong>

            </div>

          </div>

        `;
      }
    ).join("");

  const pnl=
    document.getElementById(
      "portfolioPnl"
    );

  if(pnl){

    pnl.textContent=
      `${total>=0?"+":""}${money(total)}`;

    pnl.className=
      `portfolio-pnl ${
        total>=0
          ?"up"
          :"down"
      }`;
  }
}


/* =========================================================
   LIVE BOARD
========================================================= */

function renderLiveRaceState(){

  const summary=
    document.getElementById(
      "liveRaceSummary"
    );

  const board=
    document.getElementById(
      "liveRaceState"
    );

  if(
    !summary||
    !board
  ){

    return;
  }

  if(
    state.phase===
    "countdown"
  ){

    summary.textContent=
      "WAITING FOR START";

    board.className=
      "live-race-state empty";

    board.textContent=
      "The live race board will populate when the gates open.";

    return;
  }

  const ranking=
    [
      ...state.horses
    ].sort(
      (a,b)=>
        b.distanceTravelled-
        a.distanceTravelled
    );

  summary.textContent=
    state.phase===
      "live"

      ?"LIVE RACE"

      :state.phase===
        "finished"

        ?"FINISH"

        :"SETTLED";

  board.className=
    "live-race-state";

  board.innerHTML=
    ranking.map(
      (
        horse,
        index
      )=>{

        const gap=
          index===0

            ?"LEADER"

            :`${Math.max(
                0,
                ranking[0].distanceTravelled-
                horse.distanceTravelled
              ).toFixed(1)}L`;

        return`

          <div
            class="live-row"
          >

            <div
              class="live-rank"
            >
              ${index+1}
            </div>

            <div
              class="live-horse"
            >

              <strong>
                #${horse.post}
                ${horse.name}
              </strong>

              <span>

                ${
                  horse.finished
                    ?"Finished"
                    :horse.position===
                      1
                      ?"On the lead"
                      :horse.runningStyle
                }

              </span>

            </div>

            <div
              class="live-stat"
            >

              <small>
                POS
              </small>

              <strong>
                #${horse.position}
              </strong>

            </div>

            <div
              class="live-stat"
            >

              <small>
                ENERGY
              </small>

              <strong>
                ${Math.round(
                  horse.energy
                )}%
              </strong>

            </div>

            <div
              class="live-gap"
            >
              ${gap}
            </div>

          </div>
        `;
      }
    ).join("");
}


/* =========================================================
   RESULTS
========================================================= */

function renderResults(){

  const card=
    document.getElementById(
      "resultsCard"
    );

  const body=
    document.getElementById(
      "resultsBody"
    );

  const summary=
    document.getElementById(
      "resultsSummary"
    );

  const badge=
    document.getElementById(
      "resultWinnerBadge"
    );

  if(
    !card||
    !body||
    !summary||
    !badge
  ){

    return;
  }

  if(
    state.phase!=="finished"&&
    state.phase!=="settled"
  ){

    card.classList.add(
      "hidden"
    );

    return;
  }

  card.classList.remove(
    "hidden"
  );

  const ordered=
    [
      ...state.horses
    ].sort(
      (a,b)=>{

        if(
          a.finished&&
          b.finished
        ){

          return(
            a.finishPosition-
            b.finishPosition
          );
        }

        if(a.finished){
          return -1;
        }

        if(b.finished){
          return 1;
        }

        return(
          b.distanceTravelled-
          a.distanceTravelled
        );
      }
    );

  const winner=
    state.horses.find(
      horse=>
        horse.id===
        state.winner
    );

  const finishers=
    ordered.filter(
      horse=>
        horse.finished
    );

  const winnerTime=
    winner?.finishTime??
    0;

  badge.textContent=
    winner
      ?`WINNER #${winner.post}`
      :"FINISHED";

  summary.innerHTML=`

    <div
      class="result-stat"
    >

      <span>
        WINNER
      </span>

      <strong>

        ${
          winner
            ?`#${winner.post} ${winner.name}`
            :"—"
        }

      </strong>

    </div>

    <div
      class="result-stat"
    >

      <span>
        WINNING TIME
      </span>

      <strong>
        ${fmt(winnerTime)}
        elapsed
      </strong>

    </div>

    <div
      class="result-stat"
    >

      <span>
        RUNNERS
      </span>

      <strong>
        ${finishers.length}/
        ${state.horses.length}
      </strong>

    </div>

    <div
      class="result-stat"
    >

      <span>
        MARKET STATUS
      </span>

      <strong>
        SETTLED
      </strong>

    </div>

  `;

  body.innerHTML=
    ordered.map(
      (
        horse,
        index
      )=>{

        const position=
          horse.finished
            ?horse.finishPosition
            :index+1;

        const margin=
          position===1

            ?"—"

            :horse.finishTime!==null

              ?`+${Math.max(
                  0,
                  horse.finishTime-
                  winnerTime
                )}s`

              :"—";

        const isWinner=
          horse.id===
          state.winner;

        return`

          <tr
            class="${
              isWinner
                ?"winner-row"
                :""
            }"
          >

            <td
              class="result-pos"
            >
              ${position}
            </td>

            <td>

              <span
                class="post-pill"
              >
                ${horse.post}
              </span>

            </td>

            <td
              class="result-horse"
            >

              ${horse.name}

              <small>
                ML ${horse.morningLine}
              </small>

            </td>

            <td
              class="result-time"
            >

              ${
                horse.finishTime!==null
                  ?fmt(
                      horse.finishTime
                    )
                  :"—"
              }

            </td>

            <td
              class="result-margin"
            >
              ${margin}
            </td>

            <td>

              ${
                isWinner

                  ?'<span class="result-win">🏆 WINNER</span>'

                  :horse.finished

                    ?'<span class="result-finish">FINISHED</span>'

                    :'<span class="result-finish">PENDING</span>'
              }

            </td>

          </tr>

        `;
      }
    ).join("");
}


/* =========================================================
   CHART
========================================================= */

function drawChart(){

  const canvas=
    document.getElementById(
      "chart"
    );

  if(!canvas){
    return;
  }

  const ctx=
    canvas.getContext(
      "2d"
    );

  if(!ctx){
    return;
  }

  const w=
    canvas.width;

  const h=
    canvas.height;

  ctx.clearRect(
    0,
    0,
    w,
    h
  );

  ctx.strokeStyle=
    "#294034";

  ctx.lineWidth=1;

  for(
    let i=1;
    i<4;
    i++
  ){

    const y=
      h*i/4;

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      w,
      y
    );

    ctx.stroke();
  }

  const history=
    state.history[
      state.selected
    ]||
    [];

  if(
    history.length<
    2
  ){

    return;
  }

  ctx.beginPath();

  history.forEach(
    (
      point,
      index
    )=>{

      const x=
        (
          index/
          Math.max(
            1,
            history.length-
            1
          )
        )*
        w;

      const y=
        h-
        point.p*
        h*
        .88-
        h*
        .05;

      if(index===0){

        ctx.moveTo(
          x,
          y
        );

      }else{

        ctx.lineTo(
          x,
          y
        );
      }
    }
  );

  const gradient=
    ctx.createLinearGradient(
      0,
      0,
      w,
      0
    );

  gradient.addColorStop(
    0,
    "#5f8ff5"
  );

  gradient.addColorStop(
    1,
    "#7ee787"
  );

  ctx.strokeStyle=
    gradient;

  ctx.lineWidth=3;

  ctx.stroke();
}


/* =========================================================
   ORDERS
========================================================= */

function placeOrder(){

  if(
    state.phase===
    "countdown"
  ){

    flash(
      "Market is not open yet."
    );

    return;
  }

  if(
    state.phase!=="live"||
    state.marketSuspended
  ){

    flash(
      "Trading is suspended — a horse has crossed the finish line."
    );

    return;
  }

  const price=
    clamp(
      Number(
        document.getElementById(
          "priceInput"
        )?.value
      )||
      0,

      .01,
      .99
    );

  const qty=
    Math.max(
      1,
      Math.floor(
        Number(
          document.getElementById(
            "qtyInput"
          )?.value
        )||
        0
      )
    );

  const horse=
    state.horses.find(
      h=>
        h.id===
        state.selected
    );

  if(!horse){
    return;
  }

  if(
    state.side===
    "buy"
  ){

    const cost=
      price*
      qty;

    if(
      cost>
      state.cash
    ){

      flash(
        "Insufficient paper balance."
      );

      return;
    }

    state.cash-=
      cost;

    const position=
      state.positions[
        horse.id
      ]||
      {
        qty:0,
        cost:0,
        avg:0
      };

    position.qty+=
      qty;

    position.cost+=
      cost;

    position.avg=
      position.cost/
      position.qty;

    state.positions[
      horse.id
    ]=
      position;

    flash(
      `Bought ${qty} YES on #${horse.post} at ${cents(price)}.`
    );

  }else{

    const position=
      state.positions[
        horse.id
      ];

    if(
      !position||
      position.qty<
      qty
    ){

      flash(
        "You don't have enough YES contracts to sell."
      );

      return;
    }

    state.cash+=
      price*
      qty;

    position.qty-=
      qty;

    position.cost-=
      position.avg*
      qty;

    if(
      position.qty<=0
    ){

      delete state.positions[
        horse.id
      ];
    }

    flash(
      `Sold ${qty} YES on #${horse.post} at ${cents(price)}.`
    );
  }

  render();
}

function settlePositions(){

  for(
    const [
      id,
      pos
    ]
    of Object.entries(
      state.positions
    )
  ){

    if(
      Number(id)===
      state.winner
    ){

      state.cash+=
        pos.qty;
    }
  }
}

function flash(message){

  const el=
    document.getElementById(
      "tradeMsg"
    );

  if(!el){
    return;
  }

  el.textContent=
    message;

  if(el.animate){

    el.animate(
      [
        {
          opacity:.45
        },

        {
          opacity:1
        }
      ],

      {
        duration:180
      }
    );
  }
}


/* =========================================================
   RACE SECOND
========================================================= */

function simulateOneSecond(){

  const beforeRanking=
    fieldRanks().filter(
      horse=>
        !horse.finished
    );

  const broadcastBefore={
    leaderId:
      beforeRanking[0]?.id||
      null,
    positions:{}
  };

  state.horses.forEach(
    horse=>{
      broadcastBefore.positions[
        horse.id
      ]=
        horse.position;
    }
  );

  const t=
    raceProgress();

  const active=
    state.horses.filter(
      horse=>
        !horse.finished
    );

  shuffle(
    active
  ).forEach(
    horse=>{

      updateHorseState(
        horse,
        t
      );
    }
  );

  updateMarketState();

  const crossers=
    active
      .filter(
        horse=>
          !horse.finished&&
          horse.distanceTravelled>=
            state.raceDistance
      )
      .map(
        horse=>{

          const overshoot=
            horse.distanceTravelled-
            state.raceDistance;

          const secondFraction=
            clamp(
              overshoot/
              Math.max(
                .01,
                horse.currentSpeed
              ),
              0,
              1
            );

          return{

            horse,

            finishFraction:
              1-
              secondFraction
          };
        }
      )
      .sort(
        (a,b)=>
          a.finishFraction-
          b.finishFraction
      );

  crossers.forEach(
    item=>{

      const horse=
        item.horse;

      horse.distanceTravelled=
        state.raceDistance;

      horse.distanceRemaining=
        0;

      horse.finished=
        true;

      horse.finishTime=
        Math.max(
          0,
          state.raceT-
          (
            1-
            item.finishFraction
          )
        );

      horse.finishPosition=
        state.finishOrder.length+
        1;

      state.finishOrder.push(
        horse.id
      );

      if(
        state.winner===
        null
      ){

        state.winner=
          horse.id;

        state.finishAt=
          Date.now();

        state.marketSuspended=
          true;

        state.phase=
          "finished";

        emitBroadcastEvent(
          `#${horse.post} ${horse.name} wins at ${state.profile?.track||"the racecourse"}.`,
          "finish",
          "winner",
          0,
          {
            force:true,
            duration:6800
          }
        );

        playBroadcastCue(
          "finish"
        );
      }
    }
  );

  if(
    state.phase===
      "finished"&&
    state.horses.some(
      horse=>
        !horse.finished
    )
  ){

    const remaining=
      state.horses.filter(
        horse=>
          !horse.finished
      );

    shuffle(
      remaining
    ).forEach(
      horse=>{

        updateHorseState(
          horse,
          t
        );
      }
    );

    const lateCrossers=
      remaining
        .filter(
          horse=>
            !horse.finished&&
            horse.distanceTravelled>=
              state.raceDistance
        )
        .map(
          horse=>{

            const overshoot=
              horse.distanceTravelled-
              state.raceDistance;

            return{

              horse,

              finishFraction:
                1-
                clamp(
                  overshoot/
                  Math.max(
                    .01,
                    horse.currentSpeed
                  ),
                  0,
                  1
                )
            };
          }
        )
        .sort(
          (a,b)=>
            a.finishFraction-
            b.finishFraction
        );

    lateCrossers.forEach(
      item=>{

        const horse=
          item.horse;

        horse.distanceTravelled=
          state.raceDistance;

        horse.distanceRemaining=
          0;

        horse.finished=
          true;

        horse.finishTime=
          Math.max(
            0,
            state.raceT-
            (
              1-
              item.finishFraction
            )
          );

        horse.finishPosition=
          state.finishOrder.length+
          1;

        state.finishOrder.push(
          horse.id
        );
      }
    );
  }

  const ranking=
    [
      ...state.horses
    ].sort(
      (a,b)=>{

        if(
          a.finished&&
          b.finished
        ){

          return(
            a.finishPosition-
            b.finishPosition
          );
        }

        if(a.finished){
          return -1;
        }

        if(b.finished){
          return 1;
        }

        return(
          b.distanceTravelled-
          a.distanceTravelled
        );
      }
    );

  ranking.forEach(
    (
      horse,
      index
    )=>{

      if(
        !horse.finished
      ){

        horse.previousPosition=
          horse.position;

        horse.position=
          index+1;
      }
    }
  );

  processBroadcastRaceEvents(
    broadcastBefore,
    ranking
  );

  if(
    state.horses.length>0&&
    state.horses.every(
      horse=>
        horse.finished
    )
  ){

    state.phase=
      "settled";

    const winner=
      state.horses.find(
        horse=>
          horse.id===
          state.winner
      );

    emitBroadcastEvent(
      winner
        ?`Results are official: #${winner.post} ${winner.name}.`
        :"Results are official.",
      "official",
      "official",
      0,
      {
        force:true,
        duration:5200
      }
    );
  }
}


/* =========================================================
   TICK
========================================================= */

function tick(){

  if(
    state.phase===
    "countdown"
  ){

    state.openCountdown--;

    if(
      state.openCountdown<=0
    ){

      state.openCountdown=
        0;

      state.phase=
        "live";

      state.raceT=
        0;

      emitBroadcastEvent(
        `They're off at ${state.profile?.track||"the racecourse"}!`,
        "start",
        "race-start",
        0,
        {
          force:true,
          duration:5000
        }
      );

      playBroadcastCue(
        "gate"
      );
    }

  }else if(
    state.phase===
      "live"||
    state.phase===
      "finished"
  ){

    state.raceT++;

    simulateOneSecond();

    state.horses.forEach(
      horse=>{

        const price=
          currentPrice(
            horse
          );

        if(
          state.history[
            horse.id
          ]
        ){

          state.history[
            horse.id
          ].push(
            {
              t:
                state.raceT,

              p:
                price
            }
          );
        }

        state.lastPrices[
          horse.id
        ]=
          price;
      }
    );

    if(
      state.phase===
        "settled"&&
      state.timer
    ){

      clearInterval(
        state.timer
      );

      state.timer=
        null;

      settlePositions();
    }
  }

  render();
}


/* =========================================================
   EVENTS
========================================================= */

function wireEvents(){

  const place=
    document.getElementById(
      "placeBtn"
    );

  const price=
    document.getElementById(
      "priceInput"
    );

  const qty=
    document.getElementById(
      "qtyInput"
    );

  const restart=
    document.getElementById(
      "restartBtn"
    );

  const buy=
    document.getElementById(
      "buyTab"
    );

  const sell=
    document.getElementById(
      "sellTab"
    );

  const flip=
    document.getElementById(
      "flipSide"
    );

  if(place){
    place.onclick=
      placeOrder;
  }

  if(price){
    price.oninput=
      updateTicketSummary;
  }

  if(qty){
    qty.oninput=
      updateTicketSummary;
  }

  if(restart){
    restart.onclick=
      restartRace;
  }

  if(buy){

    buy.onclick=
      ()=>{

        state.side=
          "buy";

        buy.classList.add(
          "active"
        );

        if(sell){

          sell.classList.remove(
            "active"
          );
        }

        updateTicketSummary();
      };
  }

  if(sell){

    sell.onclick=
      ()=>{

        state.side=
          "sell";

        sell.classList.add(
          "active"
        );

        if(buy){

          buy.classList.remove(
            "active"
          );
        }

        updateTicketSummary();
      };
  }

  if(flip){

    flip.onclick=
      ()=>{

        if(
          state.side===
          "buy"
        ){

          if(sell){
            sell.click();
          }

        }else{

          if(buy){
            buy.click();
          }
        }
      };
  }

  wireBroadcastEvents();
}

function restartRace(){

  createRace();
}


/* =========================================================
   MAIN RENDER
========================================================= */


function smoothVisualLoop(timestamp=0){

  let frameDelta=16;

  const track=
    document.getElementById(
      "visualTrack"
    );

  if(track){

    if(
      state.visualEnvironmentLastTs===
      null
    ){
      state.visualEnvironmentLastTs=
        timestamp;
    }

    const dt=
      Math.min(
        48,
        Math.max(
          0,
          timestamp-
          state.visualEnvironmentLastTs
        )
      );

    state.visualEnvironmentLastTs=
      timestamp;

    frameDelta=
      dt||
      16;

    const intensity=
      state.phase==="live"
        ?state.environment?.cameraIntensity||
          0
        :0;

    /*
      Only texture coordinates move. The projected track plane
      itself remains locked to the viewport, so no layer can
      slide out of frame.
    */
    const targetVelocity=
      state.phase==="live"
        ?8+
          Math.pow(
            intensity,
            1.35
          )*
          44
        :0;

    state.visualEnvironmentOffset+=
      targetVelocity*
      (
        dt/
        1000
      );

    if(
      state.visualEnvironmentOffset>
      100000
    ){
      state.visualEnvironmentOffset%=
        480;
    }

    track.style.setProperty(
      "--environment-offset",
      `${state.visualEnvironmentOffset.toFixed(3)}px`
    );

    track.style.setProperty(
      "--environment-x",
      `${(
        state.visualEnvironmentOffset*
        -1.1
      ).toFixed(3)}px`
    );

    track.style.setProperty(
      "--environment-fast-x",
      `${(
        state.visualEnvironmentOffset*
        -2.2
      ).toFixed(3)}px`
    );

    track.style.setProperty(
      "--speed-line-x",
      `${(
        state.visualEnvironmentOffset*
        -2.8
      ).toFixed(3)}px`
    );

    track.style.setProperty(
      "--camera-intensity",
      intensity.toFixed(
        4
      )
    );

    track.style.setProperty(
      "--speed-opacity",
      (
        .08+
        intensity*
        .40
      ).toFixed(
        3
      )
    );

    track.style.setProperty(
      "--camera-bob",
      (
        Math.sin(
          timestamp*
          .0021
        )*
        intensity
      ).toFixed(
        4
      )
    );

    updateBroadcastCameraDirector();

    applyBroadcastCameraFrame(
      track,
      frameDelta
    );
  }

  const layer=
    document.getElementById(
      "visualRunnerLayer"
    );

  if(layer){

    /*
      A frame-rate-independent chase keeps the one-second
      simulation smooth without changing any race calculations.
    */
    const alpha=
      1-
      Math.exp(
        -11*
        (
          frameDelta/
          1000
        )
      );

    Object.keys(
      state.visualTargets
    ).forEach(
      id=>{

        const target=
          state.visualTargets[id];

        const current=
          state.visualPositions[id];

        if(!target||!current){
          return;
        }

        current.x+=
          (
            target.x-
            current.x
          )*
          alpha;

        current.y+=
          (
            target.y-
            current.y
          )*
          alpha;

        current.scale+=
          (
            target.scale-
            current.scale
          )*
          alpha;

        current.depth+=
          (
            target.depth-
            current.depth
          )*
          alpha;

        current.z=
          target.z;

        const runner=
          state.runnerNodes[
            id
          ]||
          layer.querySelector(
            `[data-runner-id="${id}"]`
          );

        if(runner){

          runner.style.left=
            `${current.x}%`;

          runner.style.top=
            `${current.y}%`;

          runner.style.setProperty(
            "--runner-scale",
            current.scale.toFixed(
              4
            )
          );

          runner.style.setProperty(
            "--lane-depth",
            current.depth.toFixed(
              4
            )
          );

          runner.style.setProperty(
            "--runner-opacity",
            (
              .82+
              current.depth*
              .18
            ).toFixed(
              4
            )
          );

          runner.style.setProperty(
            "--runner-brightness",
            (
              .86+
              current.depth*
              .14
            ).toFixed(
              4
            )
          );

          runner.style.setProperty(
            "--runner-saturation",
            (
              .88+
              current.depth*
              .12
            ).toFixed(
              4
            )
          );

          runner.style.setProperty(
            "--runner-shadow-scale",
            (
              .72+
              current.depth*
              .28
            ).toFixed(
              4
            )
          );

          runner.style.setProperty(
            "--runner-shadow-blur",
            `${(
              1+
              current.depth
            ).toFixed(
              3
            )}px`
          );

          runner.style.setProperty(
            "--runner-z",
            String(
              Math.round(
                current.z
              )
            )
          );

          runner.style.zIndex=
            String(
              Math.round(
                current.z
              )
            );
        }
      }
    );
  }

  updateBroadcastAudio(
    timestamp
  );

  updateBroadcastCaptionFrame(
    timestamp
  );

  /*
    The WebGL renderer consumes the same interpolated simulation
    state as the DOM presentation. It never writes race or market
    values, so switching renderers cannot affect an outcome.
  */
  if(
    window.RaceMarket3D&&
    typeof window.RaceMarket3D.update==="function"
  ){
    window.RaceMarket3D.update(
      state,
      timestamp
    );
  }

  requestAnimationFrame(
    smoothVisualLoop
  );
}


function startSmoothVisualLoop(){
  if(
    state.visualLoopStarted
  ){
    return;
  }

  state.visualLoopStarted=true;

  requestAnimationFrame(
    smoothVisualLoop
  );
}

function render(){

  const cash=
    document.getElementById(
      "cash"
    );

  if(cash){

    cash.textContent=
      money(
        state.cash
      );
  }

  const status=
    document.getElementById(
      "raceStatus"
    );

  if(status){

    status.textContent=

      state.phase===
        "countdown"

        ?`OPENS IN ${fmt(
            state.openCountdown
          )}`

        :state.phase===
          "live"

          ?"🔴 LIVE"

          :state.phase===
            "finished"

            ?"OFFICIAL"

            :"SETTLED";
  }

  const clock=
    document.getElementById(
      "raceClock"
    );

  const timeLabel=
    document.getElementById(
      "raceTimeLabel"
    );

  const timeSubtext=
    document.getElementById(
      "raceTimeSubtext"
    );

  if(clock){

    if(
      state.phase===
      "countdown"
    ){

      clock.textContent=
        fmt(
          state.openCountdown
        );

      if(timeLabel){

        timeLabel.textContent=
          "MARKET OPENS IN";
      }

      if(timeSubtext){

        timeSubtext.textContent=
          "COUNTDOWN TO MARKET OPEN";
      }

    }else if(
      state.phase===
      "live"
    ){

      clock.textContent=
        fmt(
          Math.max(
            0,
            state.raceDuration-
            state.raceT
          )
        );

      if(timeLabel){

        timeLabel.textContent=
          "RACE TIME REMAINING";
      }

      if(timeSubtext){

        timeSubtext.textContent=
          "LIVE SIMULATED RACE";
      }

    }else if(
      state.phase===
      "finished"
    ){

      clock.textContent=
        "00:00";

      if(timeLabel){

        timeLabel.textContent=
          "RACE FINISHED";
      }

      if(timeSubtext){

        timeSubtext.textContent=
          "AWAITING OFFICIAL SETTLEMENT";
      }

    }else{

      clock.textContent=
        "00:00";

      if(timeLabel){

        timeLabel.textContent=
          "SETTLED";
      }

      if(timeSubtext){

        timeSubtext.textContent=
          "MARKET CLOSED";
      }
    }
  }

  renderMarketStatus();

  renderRaceCard();

  renderProfile();

  renderVisualTrack();

  renderLiveRaceState();

  renderResults();

  renderHorses();

  renderSelected();

  renderPositions();

  drawChart();
}



/* =========================================================
   RaceMarket V4.34 — TRADING UPGRADE
   Dynamic depth, market/limit orders, GTC/IOC handling,
   partial fills, order management, trade tape, and complete
   position accounting. The race model remains unchanged.
========================================================= */

Object.assign(
  state,
  {
    orderType:"market",
    timeInForce:"gtc",
    orders:[],
    tradeHistory:[],
    nextOrderId:1,
    nextTradeId:1,
    realizedPnl:0,
    tradingRaceSerial:0,
    lastSettledRaceSerial:null,
    marketDepthRevision:0,
    marketDepthBooks:{},
    limitDrafts:{},
    tradingEventsWired:false,
    startingEquity:10000
  }
);

const TRADING_OPEN_STATUSES=
  new Set([
    "open",
    "partially_filled"
  ]);

function roundCash(value){
  return Math.round(
    (
      Number(value)||
      0
    )*
    100
  )/
  100;
}

function roundPrice(value){
  return clamp(
    Math.round(
      (
        Number(value)||
        0
      )*
      100
    )/
    100,
    .01,
    .99
  );
}

function orderIsOpen(order){
  return Boolean(
    order&&
    TRADING_OPEN_STATUSES.has(
      order.status
    )&&
    order.remaining>0
  );
}

function openTradingOrders(){
  return state.orders.filter(
    order=>
      orderIsOpen(
        order
      )
  );
}

function selectedTradingHorse(){
  return state.horses.find(
    horse=>
      horse.id===
      state.selected
  )||
  null;
}

function limitDraftKey(
  horseId,
  side=
    state.side
){
  return `${horseId}:${side}`;
}

function invalidateTradingDepth(){
  state.marketDepthRevision++;
  state.marketDepthBooks={};
}

function deterministicDepthNoise(seed){
  const value=
    Math.sin(
      seed*
      12.9898+
      78.233
    )*
    43758.5453;

  return value-
    Math.floor(
      value
    );
}

function marketDepthQuantity(
  horse,
  side,
  level
){
  const sideSeed=
    side==="ask"
      ?37.17
      :83.41;

  const pulse=
    deterministicDepthNoise(
      horse.id*
      11.7+
      state.raceT*
      .83+
      level*
      19.13+
      sideSeed+
      state.tradingRaceSerial*
      5.9
    );

  const remainingFactor=
    state.phase==="live"
      ?clamp(
          secondsRemaining()/
          32,
          .42,
          1
        )
      :.84;

  const lateLiquidity=
    state.phase==="live"&&
    secondsRemaining()<=8
      ?.72
      :1;

  return Math.max(
    3,
    Math.floor(
      (
        20+
        pulse*
        72+
        level*
        12
      )*
      remainingFactor*
      lateLiquidity
    )
  );
}

function buildTradingBook(horse){

  const settled=
    marketIsClosed();

  if(settled){
    const price=
      horse.id===
      state.winner
        ?1
        :0;

    return{
      mid:price,
      spread:0,
      askLevels:[
        {
          price,
          qty:0,
          remaining:0
        }
      ],
      bidLevels:[
        {
          price,
          qty:0,
          remaining:0
        }
      ]
    };
  }

  const mid=
    clamp(
      currentPrice(
        horse
      ),
      .01,
      .99
    );

  const remaining=
    secondsRemaining();

  const spreadCents=
    state.phase==="live"
      ?remaining<=5
        ?3
        :remaining<=15
          ?2
          :2
      :3;

  let bestBid=
    Math.floor(
      (
        mid*
        100-
        spreadCents/
        2
      )
    )/
    100;

  let bestAsk=
    Math.ceil(
      (
        mid*
        100+
        spreadCents/
        2
      )
    )/
    100;

  bestBid=
    clamp(
      bestBid,
      .01,
      .98
    );

  bestAsk=
    clamp(
      bestAsk,
      .02,
      .99
    );

  if(bestAsk<=bestBid){
    bestAsk=
      clamp(
        bestBid+
        .01,
        .02,
        .99
      );
  }

  const askLevels=
    Array.from(
      {
        length:5
      },
      (_,level)=>{

        const price=
          clamp(
            bestAsk+
            level*
            (
              level>=3
                ?.02
                :.01
            ),
            .01,
            .99
          );

        const qty=
          marketDepthQuantity(
            horse,
            "ask",
            level
          );

        return{
          price:
            roundPrice(
              price
            ),
          qty,
          remaining:qty
        };
      }
    );

  const bidLevels=
    Array.from(
      {
        length:5
      },
      (_,level)=>{

        const price=
          clamp(
            bestBid-
            level*
            (
              level>=3
                ?.02
                :.01
            ),
            .01,
            .99
          );

        const qty=
          marketDepthQuantity(
            horse,
            "bid",
            level
          );

        return{
          price:
            roundPrice(
              price
            ),
          qty,
          remaining:qty
        };
      }
    );

  return{
    mid,
    spread:
      Math.max(
        0,
        askLevels[0].price-
        bidLevels[0].price
      ),
    askLevels,
    bidLevels
  };
}

function tradingBookFor(horse){

  if(!horse){
    return{
      mid:0,
      spread:0,
      askLevels:[],
      bidLevels:[]
    };
  }

  const key=
    [
      state.tradingRaceSerial,
      state.marketDepthRevision,
      state.phase,
      state.raceT,
      horse.id,
      state.marketSuspended
        ?1
        :0
    ].join(
      ":"
    );

  if(
    !state.marketDepthBooks[
      key
    ]
  ){
    state.marketDepthBooks[
      key
    ]=
      buildTradingBook(
        horse
      );
  }

  return state.marketDepthBooks[
    key
  ];
}

/*
  Keep the original public shape expected by the existing
  renderer while exposing full depth levels to the upgraded UI.
*/
bookFor=
  function upgradedBookFor(
    horse
  ){

    const book=
      tradingBookFor(
        horse
      );

    return{
      asks:
        book.askLevels
          .slice(
            0,
            3
          )
          .map(
            level=>
              level.price
          ),
      bids:
        book.bidLevels
          .slice(
            0,
            3
          )
          .map(
            level=>
              level.price
          ),
      askLevels:
        book.askLevels,
      bidLevels:
        book.bidLevels,
      mid:
        book.mid,
      spread:
        book.spread
    };
  };

function reservedCashTotal(){
  return roundCash(
    openTradingOrders()
      .reduce(
        (
          total,
          order
        )=>
          total+
          (
            order.reservedCash||
            0
          ),
        0
      )
  );
}

function reservedSellQuantity(
  horseId,
  excludedOrderId=null
){
  return openTradingOrders()
    .filter(
      order=>
        order.horseId===
          horseId&&
        order.side===
          "sell"&&
        order.id!==
          excludedOrderId
    )
    .reduce(
      (
        total,
        order
      )=>
        total+
        order.remaining,
      0
    );
}

function availableSellQuantity(
  horseId,
  excludedOrderId=null
){
  const position=
    state.positions[
      horseId
    ];

  if(!position){
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      position.qty-
      reservedSellQuantity(
        horseId,
        excludedOrderId
      )
    )
  );
}

function orderLimitMatches(
  order,
  price
){
  if(
    order.type===
    "market"
  ){
    return true;
  }

  return order.side===
    "buy"
    ?price<=
      order.limitPrice+
      .0001
    :price>=
      order.limitPrice-
      .0001;
}

function createTradingOrder({
  horse,
  side,
  type,
  qty,
  limitPrice=null,
  timeInForce="gtc"
}){

  const now=
    Date.now();

  return{
    id:
      state.nextOrderId++,
    raceSerial:
      state.tradingRaceSerial,
    raceNumber:
      state.raceNumber,
    horseId:
      horse.id,
    horseName:
      horse.name,
    post:
      horse.post,
    side,
    type,
    timeInForce:
      type==="market"
        ?"ioc"
        :timeInForce,
    qty,
    remaining:qty,
    filledQty:0,
    filledNotional:0,
    averageFillPrice:null,
    limitPrice:
      type==="limit"
        ?roundPrice(
            limitPrice
          )
        :null,
    reservedCash:0,
    status:"open",
    createdAt:now,
    updatedAt:now,
    cancelReason:"",
    cancelledQty:0
  };
}

function trimTradingHistory(){

  if(
    state.orders.length>
    180
  ){
    const open=
      state.orders.filter(
        order=>
          orderIsOpen(
            order
          )
      );

    const closed=
      state.orders
        .filter(
          order=>
            !orderIsOpen(
              order
            )
        )
        .slice(
          -120
        );

    state.orders=[
      ...closed,
      ...open
    ].sort(
      (
        a,
        b
      )=>
        a.id-
        b.id
    );
  }

  state.tradeHistory=
    state.tradeHistory.slice(
      0,
      140
    );
}

function recordTradeActivity(
  activity
){

  state.tradeHistory.unshift(
    {
      id:
        state.nextTradeId++,
      createdAt:
        Date.now(),
      raceSerial:
        state.tradingRaceSerial,
      raceNumber:
        state.raceNumber,
      ...activity
    }
  );

  trimTradingHistory();
}

function addPositionFill(
  horseId,
  qty,
  price
){

  const position=
    state.positions[
      horseId
    ]||
    {
      qty:0,
      cost:0,
      avg:0
    };

  position.qty+=
    qty;

  position.cost=
    roundCash(
      position.cost+
      price*
      qty
    );

  position.avg=
    position.qty>0
      ?position.cost/
       position.qty
      :0;

  state.positions[
    horseId
  ]=
    position;
}

function removePositionFill(
  horseId,
  qty,
  price
){

  const position=
    state.positions[
      horseId
    ];

  if(
    !position||
    position.qty<
      qty
  ){
    return false;
  }

  const averageCost=
    position.qty>0
      ?position.cost/
       position.qty
      :0;

  const basis=
    roundCash(
      averageCost*
      qty
    );

  const proceeds=
    roundCash(
      price*
      qty
    );

  position.qty-=
    qty;

  position.cost=
    roundCash(
      Math.max(
        0,
        position.cost-
        basis
      )
    );

  position.avg=
    position.qty>0
      ?position.cost/
       position.qty
      :0;

  state.cash=
    roundCash(
      state.cash+
      proceeds
    );

  state.realizedPnl=
    roundCash(
      state.realizedPnl+
      proceeds-
      basis
    );

  if(
    position.qty<=0
  ){
    delete state.positions[
      horseId
    ];
  }

  return true;
}

function applyOrderFill(
  order,
  requestedQty,
  executionPrice
){

  if(
    !orderIsOpen(
      order
    )
  ){
    return 0;
  }

  const price=
    roundPrice(
      executionPrice
    );

  let fillQty=
    Math.max(
      0,
      Math.min(
        Math.floor(
          requestedQty
        ),
        order.remaining
      )
    );

  if(fillQty<=0){
    return 0;
  }

  if(
    order.side===
    "buy"
  ){

    if(
      order.type===
      "market"
    ){
      const affordable=
        Math.floor(
          state.cash/
          Math.max(
            .01,
            price
          )
        );

      fillQty=
        Math.min(
          fillQty,
          affordable
        );

      if(fillQty<=0){
        return 0;
      }

      state.cash=
        roundCash(
          state.cash-
          price*
          fillQty
        );

    }else{

      const reservedAtLimit=
        roundCash(
          order.limitPrice*
          fillQty
        );

      order.reservedCash=
        roundCash(
          Math.max(
            0,
            order.reservedCash-
            reservedAtLimit
          )
        );

      const priceImprovement=
        roundCash(
          Math.max(
            0,
            (
              order.limitPrice-
              price
            )*
            fillQty
          )
        );

      state.cash=
        roundCash(
          state.cash+
          priceImprovement
        );
    }

    addPositionFill(
      order.horseId,
      fillQty,
      price
    );

  }else{

    const available=
      Math.min(
        order.remaining,
        availableSellQuantity(
          order.horseId,
          order.id
        )
      );

    fillQty=
      Math.min(
        fillQty,
        available
      );

    if(fillQty<=0){
      return 0;
    }

    if(
      !removePositionFill(
        order.horseId,
        fillQty,
        price
      )
    ){
      return 0;
    }
  }

  order.filledQty+=
    fillQty;

  order.remaining-=
    fillQty;

  order.filledNotional=
    roundCash(
      order.filledNotional+
      price*
      fillQty
    );

  order.averageFillPrice=
    order.filledQty>0
      ?order.filledNotional/
       order.filledQty
      :null;

  order.updatedAt=
    Date.now();

  order.status=
    order.remaining>0
      ?"partially_filled"
      :"filled";

  if(
    order.status===
    "filled"&&
    order.reservedCash>
      0
  ){
    state.cash=
      roundCash(
        state.cash+
        order.reservedCash
      );

    order.reservedCash=0;
  }

  recordTradeActivity(
    {
      kind:"fill",
      orderId:
        order.id,
      horseId:
        order.horseId,
      horseName:
        order.horseName,
      post:
        order.post,
      side:
        order.side,
      qty:
        fillQty,
      price,
      notional:
        roundCash(
          price*
          fillQty
        ),
      orderType:
        order.type
    }
  );

  return fillQty;
}

function matchOrderAgainstBook(
  order,
  {
    resting=false
  }={}
){

  if(
    !orderIsOpen(
      order
    )||
    state.phase!=="live"||
    state.marketSuspended
  ){
    return 0;
  }

  const horse=
    state.horses.find(
      runner=>
        runner.id===
        order.horseId
    );

  if(!horse){
    return 0;
  }

  const book=
    tradingBookFor(
      horse
    );

  const levels=
    order.side===
    "buy"
      ?book.askLevels
      :book.bidLevels;

  let totalFilled=0;

  for(
    const level
    of levels
  ){

    if(
      !orderIsOpen(
        order
      )
    ){
      break;
    }

    if(
      !orderLimitMatches(
        order,
        level.price
      )
    ){
      continue;
    }

    if(
      level.remaining<=0
    ){
      continue;
    }

    let available=
      Math.min(
        order.remaining,
        level.remaining
      );

    if(resting){
      const participation=
        .28+
        deterministicDepthNoise(
          order.id*
          17.31+
          state.raceT*
          8.71+
          level.price*
          100
        )*
        .52;

      available=
        Math.max(
          1,
          Math.floor(
            available*
            participation
          )
        );
    }

    if(
      order.side===
      "sell"
    ){
      available=
        Math.min(
          available,
          availableSellQuantity(
            order.horseId,
            order.id
          )
        );
    }

    const filled=
      applyOrderFill(
        order,
        available,
        level.price
      );

    if(filled<=0){
      break;
    }

    level.remaining=
      Math.max(
        0,
        level.remaining-
        filled
      );

    totalFilled+=
      filled;
  }

  return totalFilled;
}

function cancelTradingOrder(
  orderId,
  reason="Cancelled"
){

  const order=
    state.orders.find(
      item=>
        item.id===
        Number(
          orderId
        )
    );

  if(
    !order||
    !orderIsOpen(
      order
    )
  ){
    return false;
  }

  if(
    order.side===
      "buy"&&
    order.reservedCash>
      0
  ){
    state.cash=
      roundCash(
        state.cash+
        order.reservedCash
      );

    order.reservedCash=0;
  }

  order.cancelledQty=
    order.remaining;

  order.remaining=0;
  order.status="cancelled";
  order.cancelReason=reason;
  order.updatedAt=Date.now();

  return true;
}

function cancelAllTradingOrders(
  reason="Cancelled"
){

  let count=0;

  openTradingOrders()
    .forEach(
      order=>{
        if(
          cancelTradingOrder(
            order.id,
            reason
          )
        ){
          count++;
        }
      }
    );

  return count;
}

function processRestingOrders(){

  if(
    state.phase!=="live"||
    state.marketSuspended
  ){
    cancelAllTradingOrders(
      state.marketSuspended
        ?"Market closed"
        :"Race is not live"
    );

    return;
  }

  let orderCount=0;
  let fillCount=0;

  openTradingOrders()
    .filter(
      order=>
        order.type===
          "limit"&&
        order.timeInForce===
          "gtc"&&
        order.raceSerial===
          state.tradingRaceSerial
    )
    .sort(
      (
        a,
        b
      )=>
        a.createdAt-
        b.createdAt
    )
    .forEach(
      order=>{

        const before=
          order.filledQty;

        matchOrderAgainstBook(
          order,
          {
            resting:true
          }
        );

        if(
          order.filledQty>
          before
        ){
          orderCount++;
          fillCount+=
            order.filledQty-
            before;
        }
      }
    );

  if(fillCount>0){
    flash(
      `${fillCount} contract${
        fillCount===1
          ?""
          :"s"
      } filled across ${orderCount} resting order${
        orderCount===1
          ?""
          :"s"
      }.`
    );
  }
}

function estimatedOrderFill({
  horse,
  side,
  type,
  qty,
  limitPrice
}){

  if(!horse){
    return{
      qty:0,
      notional:0,
      averagePrice:null,
      levels:0
    };
  }

  const book=
    tradingBookFor(
      horse
    );

  const levels=
    side==="buy"
      ?book.askLevels
      :book.bidLevels;

  let remaining=
    Math.max(
      0,
      Math.floor(
        qty
      )
    );

  let cashBudget=
    Math.max(
      0,
      state.cash
    );

  let shareBudget=
    side==="sell"
      ?availableSellQuantity(
          horse.id
        )
      :Number.POSITIVE_INFINITY;

  let filled=0;
  let notional=0;
  let usedLevels=0;

  for(
    const level
    of levels
  ){

    if(remaining<=0){
      break;
    }

    const matches=
      type==="market"||
      (
        side==="buy"
          ?level.price<=
            limitPrice+
            .0001
          :level.price>=
            limitPrice-
            .0001
      );

    if(!matches){
      continue;
    }

    let levelQty=
      Math.min(
        remaining,
        level.remaining
      );

    if(side==="buy"){
      levelQty=
        Math.min(
          levelQty,
          Math.floor(
            cashBudget/
            Math.max(
              .01,
              level.price
            )
          )
        );
    }else{
      levelQty=
        Math.min(
          levelQty,
          shareBudget
        );
    }

    if(levelQty<=0){
      continue;
    }

    filled+=
      levelQty;

    remaining-=
      levelQty;

    notional+=
      levelQty*
      level.price;

    if(side==="buy"){
      cashBudget-=
        levelQty*
        level.price;
    }else{
      shareBudget-=
        levelQty;
    }

    usedLevels++;
  }

  return{
    qty:filled,
    notional:
      roundCash(
        notional
      ),
    averagePrice:
      filled>0
        ?notional/
         filled
        :null,
    levels:
      usedLevels
  };
}

function setOrderType(
  type,
  {
    initializePrice=true
  }={}
){

  if(
    type!=="market"&&
    type!=="limit"
  ){
    return;
  }

  state.orderType=
    type;

  const horse=
    selectedTradingHorse();

  if(
    type==="limit"&&
    initializePrice&&
    horse
  ){
    const book=
      tradingBookFor(
        horse
      );

    const initial=
      state.side==="buy"
        ?book.askLevels[0]?.price
        :book.bidLevels[0]?.price;

    if(
      Number.isFinite(
        initial
      )
    ){
      state.limitDrafts[
        limitDraftKey(
          horse.id
        )
      ]=
        roundPrice(
          initial
        );
    }
  }

  updateTicketSummary();
}

function setTimeInForce(value){

  if(
    value!=="gtc"&&
    value!=="ioc"
  ){
    return;
  }

  state.timeInForce=
    value;

  updateTicketSummary();
}

function setLimitPriceFromBook(
  value
){

  const horse=
    selectedTradingHorse();

  if(!horse){
    return;
  }

  const price=
    roundPrice(
      value
    );

  state.limitDrafts[
    limitDraftKey(
      horse.id
    )
  ]=
    price;

  setOrderType(
    "limit",
    {
      initializePrice:false
    }
  );

  const input=
    document.getElementById(
      "priceInput"
    );

  if(input){
    input.value=
      price.toFixed(
        2
      );
  }

  updateTicketSummary();
}

function tradingOrderDescription(
  order
){

  if(!order){
    return "";
  }

  const side=
    order.side===
    "buy"
      ?"Bought"
      :"Sold";

  const fill=
    order.filledQty>0
      ?`${order.filledQty}/${order.qty}`
      :`0/${order.qty}`;

  const price=
    order.averageFillPrice!==null
      ?cents(
          order.averageFillPrice
        )
      :order.limitPrice!==null
        ?cents(
            order.limitPrice
          )
        :"market";

  return `${side} ${fill} #${order.post} at ${price}`;
}

placeOrder=
  function upgradedPlaceOrder(){

    if(
      state.phase===
      "countdown"
    ){
      flash(
        "Market is not open yet."
      );

      return;
    }

    if(
      state.phase!=="live"||
      state.marketSuspended
    ){
      flash(
        "Trading is suspended because the winner market is closed."
      );

      return;
    }

    const horse=
      selectedTradingHorse();

    if(!horse){
      flash(
        "Select a runner first."
      );

      return;
    }

    const qtyInput=
      document.getElementById(
        "qtyInput"
      );

    const priceInput=
      document.getElementById(
        "priceInput"
      );

    const rawQty=
      Number(
        qtyInput?.value
      );

    if(
      !Number.isFinite(
        rawQty
      )||
      rawQty<1||
      rawQty>1000
    ){
      flash(
        "Enter a contract quantity between 1 and 1,000."
      );

      return;
    }

    const qty=
      Math.floor(
        rawQty
      );

    const type=
      state.orderType;

    const side=
      state.side;

    const rawLimitPrice=
      type==="limit"
        ?Number(
            priceInput?.value
          )
        :null;

    if(
      type==="limit"&&
      (
        !Number.isFinite(
          rawLimitPrice
        )||
        rawLimitPrice<.01||
        rawLimitPrice>.99
      )
    ){
      flash(
        "Enter a valid limit price between $0.01 and $0.99."
      );

      return;
    }

    const limitPrice=
      type==="limit"
        ?roundPrice(
            rawLimitPrice
          )
        :null;

    if(
      side==="sell"
    ){

      const available=
        availableSellQuantity(
          horse.id
        );

      if(
        available<
        qty
      ){
        flash(
          `Only ${available} unreserved YES contract${
            available===1
              ?" is"
              :"s are"
          } available to sell.`
        );

        return;
      }
    }

    const order=
      createTradingOrder(
        {
          horse,
          side,
          type,
          qty,
          limitPrice,
          timeInForce:
            state.timeInForce
        }
      );

    if(
      side==="buy"&&
      type==="limit"
    ){

      const required=
        roundCash(
          order.limitPrice*
          qty
        );

      if(
        required>
        state.cash
      ){
        flash(
          `Insufficient available cash. This order requires ${money(required)}.`
        );

        return;
      }

      state.cash=
        roundCash(
          state.cash-
          required
        );

      order.reservedCash=
        required;
    }

    if(
      side==="buy"&&
      type==="market"
    ){

      const book=
        tradingBookFor(
          horse
        );

      const bestAsk=
        book.askLevels[0]?.price||
        1;

      if(
        state.cash<
        bestAsk
      ){
        flash(
          "Insufficient available cash for one contract at the best ask."
        );

        return;
      }
    }

    state.orders.push(
      order
    );

    const immediatelyFilled=
      matchOrderAgainstBook(
        order,
        {
          resting:false
        }
      );

    if(
      orderIsOpen(
        order
      )&&
      (
        order.type===
          "market"||
        order.timeInForce===
          "ioc"
      )
    ){
      cancelTradingOrder(
        order.id,
        order.type==="market"
          ?"Unfilled market quantity cancelled"
          :"IOC remainder cancelled"
      );
    }

    trimTradingHistory();

    if(
      immediatelyFilled>0
    ){

      const remainder=
        order.qty-
        order.filledQty;

      flash(
        remainder>0&&
        orderIsOpen(
          order
        )
          ?`${tradingOrderDescription(order)}; ${remainder} resting at ${cents(order.limitPrice)}.`
          :`${tradingOrderDescription(order)}.`
      );

    }else if(
      orderIsOpen(
        order
      )
    ){

      flash(
        `Limit order #${order.id} is resting: ${qty} ${
          side.toUpperCase()
        } at ${cents(order.limitPrice)}.`
      );

    }else{

      flash(
        order.cancelReason||
        "The order did not receive a fill."
      );
    }

    render();
  };

function closePositionAtMarket(
  horseId,
  requestedQty=null
){

  if(
    state.phase!=="live"||
    state.marketSuspended
  ){
    flash(
      "Positions can only be closed while the market is live."
    );

    return;
  }

  const position=
    state.positions[
      horseId
    ];

  if(!position){
    return;
  }

  const available=
    availableSellQuantity(
      horseId
    );

  const qty=
    Math.min(
      available,
      requestedQty===null
        ?available
        :Math.max(
            1,
            Math.floor(
              requestedQty
            )
          )
    );

  if(qty<=0){
    flash(
      "All contracts in this position are reserved by open sell orders."
    );

    return;
  }

  const previousSelected=
    state.selected;

  const previousSide=
    state.side;

  const previousType=
    state.orderType;

  state.selected=
    horseId;

  state.side="sell";
  state.orderType="market";

  const qtyInput=
    document.getElementById(
      "qtyInput"
    );

  if(qtyInput){
    qtyInput.value=
      String(
        qty
      );
  }

  placeOrder();

  state.selected=
    previousSelected;

  state.side=
    previousSide;

  state.orderType=
    previousType;

  render();
}

function closeAllPositionsAtMarket(){

  if(
    state.phase!=="live"||
    state.marketSuspended
  ){
    flash(
      "Positions can only be closed while the market is live."
    );

    return;
  }

  const ids=
    Object.keys(
      state.positions
    )
      .map(
        Number
      );

  if(!ids.length){
    return;
  }

  ids.forEach(
    horseId=>
      closePositionAtMarket(
        horseId
      )
  );
}

function settleTradingPositions(){

  if(
    state.lastSettledRaceSerial===
    state.tradingRaceSerial
  ){
    return;
  }

  cancelAllTradingOrders(
    "Market settled"
  );

  const entries=
    Object.entries(
      state.positions
    );

  entries.forEach(
    (
      [
        id,
        position
      ]
    )=>{

      const horseId=
        Number(
          id
        );

      const horse=
        state.horses.find(
          runner=>
            runner.id===
            horseId
        );

      const won=
        horseId===
        state.winner;

      const payout=
        won
          ?position.qty
          :0;

      const pnl=
        roundCash(
          payout-
          position.cost
        );

      state.cash=
        roundCash(
          state.cash+
          payout
        );

      state.realizedPnl=
        roundCash(
          state.realizedPnl+
          pnl
        );

      recordTradeActivity(
        {
          kind:"settlement",
          horseId,
          horseName:
            horse?.name||
            `Runner ${id}`,
          post:
            horse?.post||
            "—",
          side:
            won
              ?"win"
              :"loss",
          qty:
            position.qty,
          price:
            won
              ?1
              :0,
          notional:
            payout,
          pnl
        }
      );
    }
  );

  state.positions={};

  state.lastSettledRaceSerial=
    state.tradingRaceSerial;

  renderTradingUpgrade();
}

settlePositions=
  settleTradingPositions;

function liquidateForRaceReset(){

  cancelAllTradingOrders(
    "Race reset"
  );

  Object.entries(
    state.positions
  ).forEach(
    (
      [
        id,
        position
      ]
    )=>{

      const horseId=
        Number(
          id
        );

      const horse=
        state.horses.find(
          runner=>
            runner.id===
            horseId
        );

      const mark=
        horse
          ?currentPrice(
              horse
            )
          :0;

      const value=
        roundCash(
          position.qty*
          mark
        );

      const pnl=
        roundCash(
          value-
          position.cost
        );

      state.cash=
        roundCash(
          state.cash+
          value
        );

      state.realizedPnl=
        roundCash(
          state.realizedPnl+
          pnl
        );

      recordTradeActivity(
        {
          kind:"reset",
          horseId,
          horseName:
            horse?.name||
            `Runner ${id}`,
          post:
            horse?.post||
            "—",
          side:"close",
          qty:
            position.qty,
          price:
            mark,
          notional:
            value,
          pnl
        }
      );
    }
  );

  state.positions={};
}

function marketValueOfPositions(){

  return Object.entries(
    state.positions
  )
    .reduce(
      (
        total,
        [
          id,
          position
        ]
      )=>{

        const horse=
          state.horses.find(
            runner=>
              runner.id===
              Number(
                id
              )
          );

        const price=
          horse
            ?currentPrice(
                horse
              )
            :0;

        return total+
          position.qty*
          price;
      },
      0
    );
}

function costBasisOfPositions(){

  return Object.values(
    state.positions
  )
    .reduce(
      (
        total,
        position
      )=>
        total+
        position.cost,
      0
    );
}

function tradingAccountMetrics(){

  const reserved=
    reservedCashTotal();

  const marketValue=
    roundCash(
      marketValueOfPositions()
    );

  const costBasis=
    roundCash(
      costBasisOfPositions()
    );

  const unrealized=
    roundCash(
      marketValue-
      costBasis
    );

  const equity=
    roundCash(
      state.cash+
      reserved+
      marketValue
    );

  return{
    availableCash:
      roundCash(
        state.cash
      ),
    reserved,
    marketValue,
    costBasis,
    unrealized,
    realized:
      roundCash(
        state.realizedPnl
      ),
    equity,
    equityChange:
      roundCash(
        equity-
        state.startingEquity
      )
  };
}

function setMetricValue(
  id,
  value,
  {
    pnl=false
  }={}
){

  const element=
    document.getElementById(
      id
    );

  if(!element){
    return;
  }

  element.textContent=
    pnl
      ?`${value>0?"+":""}${money(value)}`
      :money(
          value
        );

  if(pnl){
    element.classList.remove(
      "up",
      "down",
      "neutral"
    );

    element.classList.add(
      value>0
        ?"up"
        :value<0
          ?"down"
          :"neutral"
    );
  }
}

function renderTradingAccount(){

  const metrics=
    tradingAccountMetrics();

  setMetricValue(
    "accountEquity",
    metrics.equity
  );

  setMetricValue(
    "availableCash",
    metrics.availableCash
  );

  setMetricValue(
    "reservedCash",
    metrics.reserved
  );

  setMetricValue(
    "positionMarketValue",
    metrics.marketValue
  );

  setMetricValue(
    "unrealizedPnl",
    metrics.unrealized,
    {
      pnl:true
    }
  );

  setMetricValue(
    "realizedPnl",
    metrics.realized,
    {
      pnl:true
    }
  );

  setMetricValue(
    "accountEquityChange",
    metrics.equityChange,
    {
      pnl:true
    }
  );
}

function ownOrderQuantityAt(
  horseId,
  side,
  price
){

  return openTradingOrders()
    .filter(
      order=>
        order.horseId===
          horseId&&
        order.side===
          side&&
        order.type===
          "limit"&&
        Math.abs(
          order.limitPrice-
          price
        )<
        .001
    )
    .reduce(
      (
        total,
        order
      )=>
        total+
        order.remaining,
      0
    );
}

function renderDepthSide(
  levels,
  {
    side,
    horseId
  }
){

  const maxQty=
    Math.max(
      1,
      ...levels.map(
        level=>
          level.remaining
      )
    );

  return levels.map(
    (
      level,
      index
    )=>{

      const ownQty=
        ownOrderQuantityAt(
          horseId,
          side==="ask"
            ?"sell"
            :"buy",
          level.price
        );

      const actionSide=
        side==="ask"
          ?"buy"
          :"sell";

      const disabled=
        state.marketSuspended||
        state.phase!=="live"
          ?"disabled"
          :"";

      return`
        <button
          type="button"
          class="depth-row ${side}-row ${
            index===0
              ?"best-level"
              :""
          }"
          data-depth-side="${actionSide}"
          data-depth-price="${level.price.toFixed(2)}"
          ${disabled}
          aria-label="${
            actionSide==="buy"
              ?"Buy"
              :"Sell"
          } at ${money(level.price)}, ${level.remaining} contracts available"
        >
          <i
            aria-hidden="true"
            style="--depth-width:${
              Math.max(
                4,
                level.remaining/
                maxQty*
                100
              ).toFixed(
                1
              )
            }%"
          ></i>
          <span class="depth-price">${cents(level.price)}</span>
          ${
            ownQty>0
              ?`<span class="own-order-badge">YOU ${ownQty}</span>`
              :""
          }
          <strong>${level.remaining}</strong>
        </button>
      `;
    }
  ).join(
    ""
  );
}

function renderEnhancedOrderBook(){

  const horse=
    selectedTradingHorse();

  const asks=
    document.getElementById(
      "asks"
    );

  const bids=
    document.getElementById(
      "bids"
    );

  if(
    !horse||
    !asks||
    !bids
  ){
    return;
  }

  const book=
    tradingBookFor(
      horse
    );

  asks.innerHTML=
    renderDepthSide(
      book.askLevels,
      {
        side:"ask",
        horseId:
          horse.id
      }
    );

  bids.innerHTML=
    renderDepthSide(
      book.bidLevels,
      {
        side:"bid",
        horseId:
          horse.id
      }
    );

  const bestAsk=
    document.getElementById(
      "bestAskPrice"
    );

  const bestBid=
    document.getElementById(
      "bestBidPrice"
    );

  const spread=
    document.getElementById(
      "orderBookSpread"
    );

  if(bestAsk){
    bestAsk.textContent=
      book.askLevels[0]
        ?cents(
            book.askLevels[0].price
          )
        :"—";
  }

  if(bestBid){
    bestBid.textContent=
      book.bidLevels[0]
        ?cents(
            book.bidLevels[0].price
          )
        :"—";
  }

  if(spread){
    spread.textContent=
      `${Math.round(
        book.spread*
        100
      )}¢`;
  }
}

function renderOpenOrders(){

  const container=
    document.getElementById(
      "openOrders"
    );

  const count=
    document.getElementById(
      "openOrderCount"
    );

  const cancelAll=
    document.getElementById(
      "cancelAllOrdersBtn"
    );

  const orders=
    openTradingOrders()
      .sort(
        (
          a,
          b
        )=>
          b.createdAt-
          a.createdAt
      );

  if(count){
    count.textContent=
      String(
        orders.length
      );
  }

  if(cancelAll){
    cancelAll.disabled=
      orders.length===
      0;
  }

  if(!container){
    return;
  }

  if(!orders.length){
    container.className=
      "open-orders-list empty";

    container.textContent=
      "No open orders.";

    return;
  }

  container.className=
    "open-orders-list";

  container.innerHTML=
    orders.map(
      order=>{

        const progress=
          order.qty>0
            ?order.filledQty/
             order.qty*
             100
            :0;

        return`
          <article class="open-order-row" data-order-id="${order.id}">
            <div class="order-side-badge ${order.side}">
              ${order.side.toUpperCase()}
            </div>

            <div class="open-order-main">
              <strong>#${order.post} ${order.horseName}</strong>
              <span>
                LIMIT ${cents(order.limitPrice)}
                • ${order.timeInForce.toUpperCase()}
                • ORDER #${order.id}
              </span>
              <div class="order-fill-progress" aria-label="${order.filledQty} of ${order.qty} contracts filled">
                <i style="width:${progress.toFixed(1)}%"></i>
              </div>
            </div>

            <div class="open-order-fill">
              <span>FILLED</span>
              <strong>${order.filledQty}/${order.qty}</strong>
              <small>
                ${
                  order.averageFillPrice!==null
                    ?`AVG ${cents(order.averageFillPrice)}`
                    :"WAITING"
                }
              </small>
            </div>

            <button
              type="button"
              class="cancel-order-button"
              data-cancel-order="${order.id}"
              aria-label="Cancel order ${order.id}"
            >
              CANCEL
            </button>
          </article>
        `;
      }
    ).join(
      ""
    );
}

function formatActivityTime(timestamp){

  try{
    return new Date(
      timestamp
    ).toLocaleTimeString(
      [],
      {
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
      }
    );
  }catch(_error){
    return "—";
  }
}

function renderTradeTape(){

  const container=
    document.getElementById(
      "tradeTape"
    );

  const fillCount=
    document.getElementById(
      "sessionFillCount"
    );

  const activities=
    state.tradeHistory.slice(
      0,
      12
    );

  const fills=
    state.tradeHistory.filter(
      activity=>
        activity.kind===
        "fill"
    ).length;

  if(fillCount){
    fillCount.textContent=
      `${fills} FILL${
        fills===1
          ?""
          :"S"
      }`;
  }

  if(!container){
    return;
  }

  if(!activities.length){
    container.className=
      "trade-tape empty";

    container.textContent=
      "Fills and settlements will appear here.";

    return;
  }

  container.className=
    "trade-tape";

  container.innerHTML=
    activities.map(
      activity=>{

        const isFill=
          activity.kind===
          "fill";

        const label=
          activity.kind===
            "settlement"
            ?activity.side===
              "win"
              ?"SETTLED WIN"
              :"SETTLED LOSS"
            :activity.kind===
              "reset"
              ?"RACE RESET"
              :activity.side.toUpperCase();

        const price=
          Number.isFinite(
            activity.price
          )
            ?cents(
                activity.price
              )
            :"—";

        const pnl=
          Number.isFinite(
            activity.pnl
          )
            ?`<em class="${
                activity.pnl>=0
                  ?"up"
                  :"down"
              }">${
                activity.pnl>0
                  ?"+"
                  :""
              }${money(activity.pnl)}</em>`
            :"";

        return`
          <div class="trade-tape-row ${activity.kind}">
            <span class="trade-time">${formatActivityTime(activity.createdAt)}</span>
            <span class="trade-action ${activity.side||""}">${label}</span>
            <strong>#${activity.post} ${activity.horseName}</strong>
            <span class="trade-details">
              ${activity.qty} @ ${price}
            </span>
            ${
              isFill
                ?`<em>${money(activity.notional)}</em>`
                :pnl
            }
          </div>
        `;
      }
    ).join(
      ""
    );
}

function renderTradingPositions(){

  const wrapper=
    document.getElementById(
      "positions"
    );

  const closeAll=
    document.getElementById(
      "closeAllPositionsBtn"
    );

  if(!wrapper){
    return;
  }

  const entries=
    Object.entries(
      state.positions
    )
      .filter(
        (
          [
            ,
            position
          ]
        )=>
          position.qty>
          0
      );

  if(closeAll){
    closeAll.disabled=
      !entries.length||
      state.phase!=="live"||
      state.marketSuspended;
  }

  if(!entries.length){

    wrapper.innerHTML=`
      <div class="empty">
        No open positions yet. Completed fills will appear here.
      </div>
    `;

    const pnl=
      document.getElementById(
        "portfolioPnl"
      );

    if(pnl){
      pnl.textContent=
        money(
          0
        );

      pnl.className=
        "portfolio-pnl neutral";
    }

    return;
  }

  let totalPnl=0;

  wrapper.innerHTML=
    entries.map(
      (
        [
          id,
          position
        ]
      )=>{

        const horseId=
          Number(
            id
          );

        const horse=
          state.horses.find(
            runner=>
              runner.id===
              horseId
          );

        if(!horse){
          return "";
        }

        const price=
          currentPrice(
            horse
          );

        const value=
          roundCash(
            position.qty*
            price
          );

        const pnl=
          roundCash(
            value-
            position.cost
          );

        totalPnl+=
          pnl;

        const reserved=
          reservedSellQuantity(
            horseId
          );

        const available=
          Math.max(
            0,
            position.qty-
            reserved
          );

        const closeDisabled=
          available<=0||
          state.phase!=="live"||
          state.marketSuspended
            ?"disabled"
            :"";

        return`
          <article class="position-row enhanced-position-row">
            <div class="position-meta">
              <strong>#${horse.post} ${horse.name}</strong>
              <span>
                ${position.qty} YES @ ${cents(position.avg)}
                • ${available} available
                ${
                  reserved>0
                    ?`• ${reserved} reserved`
                    :""
                }
              </span>
            </div>

            <div class="pos-extra">
              <small>CURRENT</small>
              <strong>${cents(price)}</strong>
            </div>

            <div class="pos-extra">
              <small>MARKET VALUE</small>
              <strong>${money(value)}</strong>
            </div>

            <div class="pos-extra">
              <small>COST BASIS</small>
              <strong>${money(position.cost)}</strong>
            </div>

            <div class="pos-val">
              <small>UNREALIZED</small>
              <strong class="${pnl>=0?"up":"down"}">
                ${pnl>0?"+":""}${money(pnl)}
              </strong>
            </div>

            <button
              type="button"
              class="close-position-button"
              data-close-position="${horseId}"
              ${closeDisabled}
            >
              CLOSE
            </button>
          </article>
        `;
      }
    ).join(
      ""
    );

  const pnl=
    document.getElementById(
      "portfolioPnl"
    );

  if(pnl){
    pnl.textContent=
      `${totalPnl>0?"+":""}${money(totalPnl)}`;

    pnl.className=
      `portfolio-pnl ${
        totalPnl>0
          ?"up"
          :totalPnl<0
            ?"down"
            :"neutral"
      }`;
  }
}

renderPositions=
  renderTradingPositions;

function renderTradingTicket(){

  const horse=
    selectedTradingHorse();

  const input=
    document.getElementById(
      "priceInput"
    );

  const qtyInput=
    document.getElementById(
      "qtyInput"
    );

  if(
    !horse||
    !input||
    !qtyInput
  ){
    return;
  }

  const book=
    tradingBookFor(
      horse
    );

  const key=
    limitDraftKey(
      horse.id
    );

  const isFocused=
    input.matches(
      ":focus"
    );

  if(
    state.orderType===
    "limit"
  ){

    if(isFocused){

      const typed=
        Number(
          input.value
        );

      if(
        Number.isFinite(
          typed
        )&&
        typed>=.01&&
        typed<=.99
      ){
        state.limitDrafts[
          key
        ]=
          roundPrice(
            typed
          );
      }

    }else{

      if(
        !Number.isFinite(
          state.limitDrafts[
            key
          ]
        )
      ){
        state.limitDrafts[
          key
        ]=
          state.side==="buy"
            ?book.askLevels[0]?.price||
             roundPrice(
               book.mid
             )
            :book.bidLevels[0]?.price||
             roundPrice(
               book.mid
             );
      }

      input.value=
        Number(
          state.limitDrafts[
            key
          ]
        ).toFixed(
          2
        );
    }

  }else{

    const marketReference=
      state.side==="buy"
        ?book.askLevels[0]?.price
        :book.bidLevels[0]?.price;

    if(
      Number.isFinite(
        marketReference
      )
    ){
      input.value=
        marketReference.toFixed(
          2
        );
    }
  }

  const qty=
    Math.max(
      1,
      Math.min(
        1000,
        Math.floor(
          Number(
            qtyInput.value
          )||
          1
        )
      )
    );

  const limitPrice=
    state.orderType===
      "limit"
      ?roundPrice(
          Number(
            input.value
          )||
          0
        )
      :null;

  const estimate=
    estimatedOrderFill(
      {
        horse,
        side:
          state.side,
        type:
          state.orderType,
        qty,
        limitPrice
      }
    );

  const referencePrice=
    state.orderType===
      "limit"
      ?limitPrice
      :estimate.averagePrice||
       (
         state.side==="buy"
           ?book.askLevels[0]?.price
           :book.bidLevels[0]?.price
       )||
       book.mid;

  const notional=
    state.orderType===
      "limit"
      ?roundCash(
          referencePrice*
          qty
        )
      :estimate.notional;

  const maxProfit=
    state.side===
      "buy"
      ?roundCash(
          qty-
          notional
        )
      :roundCash(
          notional
        );

  const maxLoss=
    state.side===
      "buy"
      ?notional
      :0;

  const available=
    state.side===
      "buy"
      ?money(
          state.cash
        )
      :`${availableSellQuantity(
          horse.id
        )} YES`;

  const estimated=
    state.orderType===
      "limit"&&
    estimate.qty===
      0
      ?"RESTING"
      :estimate.qty>0
        ?`${estimate.qty}/${qty} @ ${cents(estimate.averagePrice)}`
        :"NO DEPTH";

  const setText=
    (
      id,
      value
    )=>{

      const element=
        document.getElementById(
          id
        );

      if(element){
        element.textContent=
          value;
      }
    };

  setText(
    "notional",
    money(
      notional
    )
  );

  setText(
    "payout",
    money(
      qty
    )
  );

  setText(
    "maxProfit",
    money(
      Math.max(
        0,
        maxProfit
      )
    )
  );

  setText(
    "maxLoss",
    state.side==="buy"
      ?money(
          maxLoss
        )
      :"CLOSING"
  );

  setText(
    "availableToTrade",
    available
  );

  setText(
    "estimatedFill",
    estimated
  );

  const priceLabel=
    document.getElementById(
      "priceLabel"
    );

  const priceTitle=
    document.getElementById(
      "orderPriceTitle"
    );

  const limitField=
    document.getElementById(
      "limitPriceField"
    );

  if(priceLabel){
    priceLabel.textContent=
      state.orderType===
        "market"
        ?state.side==="buy"
          ?`(BEST ASK ${cents(book.askLevels[0]?.price||0)})`
          :`(BEST BID ${cents(book.bidLevels[0]?.price||0)})`
        :`(${money(limitPrice)})`;
  }

  if(priceTitle){
    priceTitle.textContent=
      state.orderType===
        "market"
        ?"Estimated price"
        :"Limit price";
  }

  if(limitField){
    limitField.classList.toggle(
      "is-market",
      state.orderType===
      "market"
    );
  }

  input.disabled=
    state.orderType===
    "market";

  const marketTab=
    document.getElementById(
      "marketOrderTab"
    );

  const limitTab=
    document.getElementById(
      "limitOrderTab"
    );

  if(marketTab){
    const active=
      state.orderType===
      "market";

    marketTab.classList.toggle(
      "active",
      active
    );

    marketTab.setAttribute(
      "aria-pressed",
      String(
        active
      )
    );
  }

  if(limitTab){
    const active=
      state.orderType===
      "limit";

    limitTab.classList.toggle(
      "active",
      active
    );

    limitTab.setAttribute(
      "aria-pressed",
      String(
        active
      )
    );
  }

  const tifControls=
    document.getElementById(
      "timeInForceControls"
    );

  if(tifControls){
    tifControls.classList.toggle(
      "is-hidden",
      state.orderType===
      "market"
    );
  }

  [
    [
      "tifGtc",
      "gtc"
    ],
    [
      "tifIoc",
      "ioc"
    ]
  ].forEach(
    (
      [
        id,
        value
      ]
    )=>{

      const button=
        document.getElementById(
          id
        );

      if(button){
        const active=
          state.timeInForce===
          value;

        button.classList.toggle(
          "active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          String(
            active
          )
        );
      }
    }
  );

  const buy=
    document.getElementById(
      "buyTab"
    );

  const sell=
    document.getElementById(
      "sellTab"
    );

  if(buy){
    buy.classList.toggle(
      "active",
      state.side===
      "buy"
    );
  }

  if(sell){
    sell.classList.toggle(
      "active",
      state.side===
      "sell"
    );
  }

  const place=
    document.getElementById(
      "placeBtn"
    );

  if(place){
    place.textContent=
      `PLACE ${
        state.side.toUpperCase()
      } YES ${
        state.orderType.toUpperCase()
      }${
        state.orderType==="limit"
          ?` ${state.timeInForce.toUpperCase()}`
          :""
      } ORDER`;

    place.disabled=
      state.phase!=="live"||
      state.marketSuspended||
      (
        state.side===
        "sell"&&
        availableSellQuantity(
          horse.id
        )<=0
      );
  }

  const flip=
    document.getElementById(
      "flipSide"
    );

  if(flip){
    flip.textContent=
      state.side==="buy"
        ?"Switch to sell"
        :"Switch to buy";
  }
}

updateTicketSummary=
  renderTradingTicket;

function renderTradingUpgrade(){

  renderEnhancedOrderBook();
  renderTradingTicket();
  renderOpenOrders();
  renderTradeTape();
  renderTradingAccount();
}

function priceShortcutValue(
  source
){

  const horse=
    selectedTradingHorse();

  if(!horse){
    return null;
  }

  const book=
    tradingBookFor(
      horse
    );

  if(source==="bid"){
    return book.bidLevels[0]?.price||
      null;
  }

  if(source==="ask"){
    return book.askLevels[0]?.price||
      null;
  }

  if(source==="mid"){
    const bid=
      book.bidLevels[0]?.price;

    const ask=
      book.askLevels[0]?.price;

    if(
      Number.isFinite(
        bid
      )&&
      Number.isFinite(
        ask
      )
    ){
      return roundPrice(
        (
          bid+
          ask
        )/
        2
      );
    }
  }

  return null;
}

function maximumTicketQuantity(){

  const horse=
    selectedTradingHorse();

  if(!horse){
    return 1;
  }

  if(
    state.side===
    "sell"
  ){
    return Math.max(
      1,
      availableSellQuantity(
        horse.id
      )
    );
  }

  const book=
    tradingBookFor(
      horse
    );

  const reference=
    state.orderType===
      "limit"
      ?Number(
          document.getElementById(
            "priceInput"
          )?.value
        )||
        book.askLevels[0]?.price||
        1
      :book.askLevels[0]?.price||
       1;

  return Math.max(
    1,
    Math.min(
      1000,
      Math.floor(
        state.cash/
        Math.max(
          .01,
          reference
        )
      )
    )
  );
}

function wireTradingUpgradeEvents(){

  if(
    state.tradingEventsWired
  ){
    return;
  }

  state.tradingEventsWired=true;

  const marketTab=
    document.getElementById(
      "marketOrderTab"
    );

  const limitTab=
    document.getElementById(
      "limitOrderTab"
    );

  const tifGtc=
    document.getElementById(
      "tifGtc"
    );

  const tifIoc=
    document.getElementById(
      "tifIoc"
    );

  marketTab?.addEventListener(
    "click",
    ()=>
      setOrderType(
        "market"
      )
  );

  limitTab?.addEventListener(
    "click",
    ()=>
      setOrderType(
        "limit"
      )
  );

  tifGtc?.addEventListener(
    "click",
    ()=>
      setTimeInForce(
        "gtc"
      )
  );

  tifIoc?.addEventListener(
    "click",
    ()=>
      setTimeInForce(
        "ioc"
      )
  );

  document
    .querySelectorAll(
      "[data-price-source]"
    )
    .forEach(
      button=>{

        button.addEventListener(
          "click",
          ()=>{

            const value=
              priceShortcutValue(
                button.dataset.priceSource
              );

            if(
              Number.isFinite(
                value
              )
            ){
              setLimitPriceFromBook(
                value
              );
            }
          }
        );
      }
    );

  document
    .querySelectorAll(
      "[data-qty]"
    )
    .forEach(
      button=>{

        button.addEventListener(
          "click",
          ()=>{

            const qtyInput=
              document.getElementById(
                "qtyInput"
              );

            if(!qtyInput){
              return;
            }

            const value=
              button.dataset.qty===
              "max"
                ?maximumTicketQuantity()
                :Number(
                    button.dataset.qty
                  );

            qtyInput.value=
              String(
                Math.max(
                  1,
                  Math.min(
                    1000,
                    Math.floor(
                      value||
                      1
                    )
                  )
                )
              );

            updateTicketSummary();
          }
        );
      }
    );

  const priceInput=
    document.getElementById(
      "priceInput"
    );

  priceInput?.addEventListener(
    "input",
    ()=>{

      const horse=
        selectedTradingHorse();

      const value=
        Number(
          priceInput.value
        );

      if(
        horse&&
        state.orderType===
          "limit"&&
        Number.isFinite(
          value
        )
      ){
        state.limitDrafts[
          limitDraftKey(
            horse.id
          )
        ]=
          roundPrice(
            value
          );
      }

      renderTradingTicket();
    }
  );

  const qtyInput=
    document.getElementById(
      "qtyInput"
    );

  qtyInput?.addEventListener(
    "input",
    renderTradingTicket
  );

  const buy=
    document.getElementById(
      "buyTab"
    );

  const sell=
    document.getElementById(
      "sellTab"
    );

  const flip=
    document.getElementById(
      "flipSide"
    );

  [
    buy,
    sell,
    flip
  ].forEach(
    element=>
      element?.addEventListener(
        "click",
        ()=>{
          window.setTimeout(
            ()=>{
              const horse=
                selectedTradingHorse();

              if(
                horse&&
                state.orderType===
                "limit"
              ){
                const key=
                  limitDraftKey(
                    horse.id
                  );

                if(
                  !Number.isFinite(
                    state.limitDrafts[
                      key
                    ]
                  )
                ){
                  const book=
                    tradingBookFor(
                      horse
                    );

                  state.limitDrafts[
                    key
                  ]=
                    state.side==="buy"
                      ?book.askLevels[0]?.price||
                       book.mid
                      :book.bidLevels[0]?.price||
                       book.mid;
                }
              }

              renderTradingTicket();
            },
            0
          );
        }
      )
  );

  const asks=
    document.getElementById(
      "asks"
    );

  const bids=
    document.getElementById(
      "bids"
    );

  [
    asks,
    bids
  ].forEach(
    ladder=>
      ladder?.addEventListener(
        "click",
        event=>{

          const button=
            event.target.closest(
              "[data-depth-price]"
            );

          if(!button){
            return;
          }

          const side=
            button.dataset.depthSide;

          const price=
            Number(
              button.dataset.depthPrice
            );

          if(
            side==="buy"
          ){
            buy?.click();
          }else{
            sell?.click();
          }

          setLimitPriceFromBook(
            price
          );
        }
      )
  );

  const openOrders=
    document.getElementById(
      "openOrders"
    );

  openOrders?.addEventListener(
    "click",
    event=>{

      const button=
        event.target.closest(
          "[data-cancel-order]"
        );

      if(!button){
        return;
      }

      const orderId=
        Number(
          button.dataset.cancelOrder
        );

      if(
        cancelTradingOrder(
          orderId,
          "Cancelled by user"
        )
      ){
        flash(
          `Order #${orderId} cancelled.`
        );

        render();
      }
    }
  );

  const cancelAll=
    document.getElementById(
      "cancelAllOrdersBtn"
    );

  cancelAll?.addEventListener(
    "click",
    ()=>{

      const count=
        cancelAllTradingOrders(
          "Cancelled by user"
        );

      if(count>0){
        flash(
          `${count} open order${
            count===1
              ?""
              :"s"
          } cancelled.`
        );

        render();
      }
    }
  );

  const positions=
    document.getElementById(
      "positions"
    );

  positions?.addEventListener(
    "click",
    event=>{

      const button=
        event.target.closest(
          "[data-close-position]"
        );

      if(!button){
        return;
      }

      closePositionAtMarket(
        Number(
          button.dataset.closePosition
        )
      );
    }
  );

  const closeAll=
    document.getElementById(
      "closeAllPositionsBtn"
    );

  closeAll?.addEventListener(
    "click",
    closeAllPositionsAtMarket
  );

  document.addEventListener(
    "keydown",
    event=>{

      const target=
        event.target;

      const isTyping=
        target instanceof
          HTMLInputElement||
        target instanceof
          HTMLTextAreaElement||
        target instanceof
          HTMLSelectElement;

      if(
        (
          event.ctrlKey||
          event.metaKey
        )&&
        event.key===
        "Enter"
      ){
        event.preventDefault();
        placeOrder();
        return;
      }

      if(
        isTyping||
        !event.shiftKey||
        event.ctrlKey||
        event.metaKey||
        event.altKey
      ){
        return;
      }

      const key=
        event.key.toLowerCase();

      if(key==="b"){
        event.preventDefault();
        buy?.click();
      }else if(key==="s"){
        event.preventDefault();
        sell?.click();
      }else if(key==="m"){
        event.preventDefault();
        setOrderType(
          "market"
        );
      }else if(key==="l"){
        event.preventDefault();
        setOrderType(
          "limit"
        );
      }
    }
  );
}

/* Hook the upgraded trading lifecycle into the existing app. */

const tradingBaseSimulateOneSecond=
  simulateOneSecond;

simulateOneSecond=
  function tradingAwareSimulateOneSecond(){

    const result=
      tradingBaseSimulateOneSecond();

    invalidateTradingDepth();

    if(state.marketSuspended){
      cancelAllTradingOrders(
        "Market closed"
      );
    }else{
      processRestingOrders();
    }

    return result;
  };

const tradingBaseCreateRace=
  createRace;

createRace=
  function tradingAwareCreateRace(){

    state.tradingRaceSerial++;
    state.lastSettledRaceSerial=null;

    invalidateTradingDepth();

    const result=
      tradingBaseCreateRace();

    renderTradingUpgrade();

    return result;
  };

restartRace=
  function tradingAwareRestartRace(){

    if(
      state.marketSuspended&&
      Object.keys(
        state.positions
      ).length
    ){
      settleTradingPositions();
    }else{
      liquidateForRaceReset();
    }

    createRace();

    flash(
      "New race created. Prior open orders were cancelled and any open exposure was closed at its current mark."
    );
  };

const tradingBaseRender=
  render;

render=
  function tradingAwareRender(){

    tradingBaseRender();

    renderTradingUpgrade();
  };

const tradingBaseWireEvents=
  wireEvents;

wireEvents=
  function tradingAwareWireEvents(){

    tradingBaseWireEvents();

    wireTradingUpgradeEvents();
  };


/* =========================================================
   FULL WEBGL 3D RENDERER INTEGRATION
   The renderer is an optional presentation layer. Classic 3D
   remains available automatically when WebGL is unsupported.
========================================================= */

function initializeRace3DRenderer(){

  const renderer=
    window.RaceMarket3D;

  if(
    !renderer||
    typeof renderer.init!=="function"
  ){
    const fallback=
      document.getElementById(
        "race3dFallback"
      );

    if(fallback){
      fallback.hidden=false;
      fallback.textContent=
        "The WebGL renderer did not load. The classic 3D view remains available.";
    }

    state.renderMode=
      "classic";

    return;
  }

  const result=
    renderer.init({
      canvas:
        document.getElementById(
          "race3dCanvas"
        ),

      overlay:
        document.getElementById(
          "race3dOverlay"
        ),

      track:
        document.getElementById(
          "visualTrack"
        ),

      onSelectRunner:
        (
          horseId,
          follow=false
        )=>{
          selectBroadcastRunner(
            horseId,
            follow
          );
        },

      getPrice:
        horse=>
          currentPrice(
            horse
          ),

      onModeChange:
        mode=>{
          state.renderMode=
            mode;
        },

      onQualityChange:
        quality=>{
          state.renderQuality=
            quality;
        }
    });

  state.renderMode=
    result?.mode||
    "classic";

  state.renderQuality=
    result?.quality||
    "auto";

  state.race3dInitialized=
    true;
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    wireEvents();

    initializeRace3DRenderer();

    startSmoothVisualLoop();

    createRace();
  }
);
