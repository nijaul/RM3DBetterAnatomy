/* =========================================================
   RaceMarket — WebGL 3D Race Renderer
   ---------------------------------------------------------
   A dependency-free WebGL 1 renderer for the existing race
   simulation. It reads presentation state only and never
   changes race outcomes, prices, orders, or settlement.
========================================================= */

(function installRaceMarket3D(global){
  "use strict";

  const MODE_KEY="racemarket-render-mode-v1";
  const QUALITY_KEY="racemarket-render-quality-v1";
  const VALID_MODES=new Set(["webgl","classic"]);
  const VALID_QUALITY=new Set(["auto","high","eco"]);
  const PI=Math.PI;
  const EPSILON=1e-6;

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const expAlpha=(rate,seconds)=>1-Math.exp(-Math.max(0,rate)*Math.max(0,seconds));

  function storageGet(key){
    try{
      return global.localStorage?.getItem(key)||null;
    }catch(error){
      return null;
    }
  }

  function storageSet(key,value){
    try{
      global.localStorage?.setItem(key,value);
    }catch(error){
      /* Preferences remain optional in privacy-restricted modes. */
    }
  }

  function hexToRgb(value,fallback=[.5,.5,.5]){
    if(typeof value!=="string"){
      return [...fallback];
    }

    const source=value.trim().replace("#","");

    if(/^[0-9a-f]{3}$/i.test(source)){
      return[
        parseInt(source[0]+source[0],16)/255,
        parseInt(source[1]+source[1],16)/255,
        parseInt(source[2]+source[2],16)/255
      ];
    }

    if(/^[0-9a-f]{6}$/i.test(source)){
      return[
        parseInt(source.slice(0,2),16)/255,
        parseInt(source.slice(2,4),16)/255,
        parseInt(source.slice(4,6),16)/255
      ];
    }

    return [...fallback];
  }

  function mixColor(a,b,t){
    const amount=clamp(t,0,1);
    return[
      lerp(a[0],b[0],amount),
      lerp(a[1],b[1],amount),
      lerp(a[2],b[2],amount)
    ];
  }

  function scaleColor(color,amount){
    return[
      clamp(color[0]*amount,0,1),
      clamp(color[1]*amount,0,1),
      clamp(color[2]*amount,0,1)
    ];
  }

  function hashString(value){
    let hash=2166136261;

    for(let index=0;index<value.length;index++){
      hash^=value.charCodeAt(index);
      hash=Math.imul(hash,16777619);
    }

    return hash>>>0;
  }

  function seededUnit(seed){
    let value=seed>>>0;
    value^=value<<13;
    value^=value>>>17;
    value^=value<<5;
    return (value>>>0)/4294967295;
  }

  function subtract3(a,b){
    return[
      a[0]-b[0],
      a[1]-b[1],
      a[2]-b[2]
    ];
  }

  function normalize3(value){
    const length=Math.hypot(value[0],value[1],value[2])||1;
    return[
      value[0]/length,
      value[1]/length,
      value[2]/length
    ];
  }

  function cross3(a,b){
    return[
      a[1]*b[2]-a[2]*b[1],
      a[2]*b[0]-a[0]*b[2],
      a[0]*b[1]-a[1]*b[0]
    ];
  }

  function dot3(a,b){
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  }

  function mat4Multiply(a,b){
    const out=new Float32Array(16);

    for(let column=0;column<4;column++){
      for(let row=0;row<4;row++){
        out[column*4+row]=
          a[row+0]*b[column*4+0]+
          a[row+4]*b[column*4+1]+
          a[row+8]*b[column*4+2]+
          a[row+12]*b[column*4+3];
      }
    }

    return out;
  }

  function mat4Perspective(fovRadians,aspect,near,far){
    const f=1/Math.tan(fovRadians/2);
    const inverseRange=1/(near-far);
    const out=new Float32Array(16);

    out[0]=f/Math.max(EPSILON,aspect);
    out[5]=f;
    out[10]=(far+near)*inverseRange;
    out[11]=-1;
    out[14]=2*far*near*inverseRange;

    return out;
  }

  function mat4LookAt(eye,target,up=[0,1,0]){
    const z=normalize3(subtract3(eye,target));
    const x=normalize3(cross3(up,z));
    const y=cross3(z,x);
    const out=new Float32Array(16);

    out[0]=x[0];
    out[1]=y[0];
    out[2]=z[0];
    out[3]=0;

    out[4]=x[1];
    out[5]=y[1];
    out[6]=z[1];
    out[7]=0;

    out[8]=x[2];
    out[9]=y[2];
    out[10]=z[2];
    out[11]=0;

    out[12]=-dot3(x,eye);
    out[13]=-dot3(y,eye);
    out[14]=-dot3(z,eye);
    out[15]=1;

    return out;
  }

  function mat4TRS(
    x,y,z,
    rotationX=0,
    rotationY=0,
    rotationZ=0,
    scaleX=1,
    scaleY=1,
    scaleZ=1
  ){
    const hx=rotationX*.5;
    const hy=rotationY*.5;
    const hz=rotationZ*.5;

    const sx=Math.sin(hx);
    const cx=Math.cos(hx);
    const sy=Math.sin(hy);
    const cy=Math.cos(hy);
    const sz=Math.sin(hz);
    const cz=Math.cos(hz);

    const qx=sx*cy*cz+cx*sy*sz;
    const qy=cx*sy*cz-sx*cy*sz;
    const qz=cx*cy*sz+sx*sy*cz;
    const qw=cx*cy*cz-sx*sy*sz;

    const xx=qx*qx;
    const yy=qy*qy;
    const zz=qz*qz;
    const xy=qx*qy;
    const xz=qx*qz;
    const yz=qy*qz;
    const wx=qw*qx;
    const wy=qw*qy;
    const wz=qw*qz;

    const out=new Float32Array(16);

    out[0]=(1-2*(yy+zz))*scaleX;
    out[1]=2*(xy+wz)*scaleX;
    out[2]=2*(xz-wy)*scaleX;
    out[3]=0;

    out[4]=2*(xy-wz)*scaleY;
    out[5]=(1-2*(xx+zz))*scaleY;
    out[6]=2*(yz+wx)*scaleY;
    out[7]=0;

    out[8]=2*(xz+wy)*scaleZ;
    out[9]=2*(yz-wx)*scaleZ;
    out[10]=(1-2*(xx+yy))*scaleZ;
    out[11]=0;

    out[12]=x;
    out[13]=y;
    out[14]=z;
    out[15]=1;

    return out;
  }

  function normalMatrixFromTRS(model){
    const sx=Math.hypot(model[0],model[1],model[2])||1;
    const sy=Math.hypot(model[4],model[5],model[6])||1;
    const sz=Math.hypot(model[8],model[9],model[10])||1;

    /*
      For M = R·S, the normal transform is
      transpose(inverse(M)) = R·inverse(S). Model columns already
      include one scale factor, so divide by scale squared.
    */
    return new Float32Array([
      model[0]/(sx*sx),model[1]/(sx*sx),model[2]/(sx*sx),
      model[4]/(sy*sy),model[5]/(sy*sy),model[6]/(sy*sy),
      model[8]/(sz*sz),model[9]/(sz*sz),model[10]/(sz*sz)
    ]);
  }

  function transformClip(matrix,point){
    const x=point[0];
    const y=point[1];
    const z=point[2];

    return[
      matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12],
      matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13],
      matrix[2]*x+matrix[6]*y+matrix[10]*z+matrix[14],
      matrix[3]*x+matrix[7]*y+matrix[11]*z+matrix[15]
    ];
  }

  function createCubeGeometry(){
    const positions=[];
    const normals=[];
    const indices=[];

    const faces=[
      {normal:[1,0,0],corners:[[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5]]},
      {normal:[-1,0,0],corners:[[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5]]},
      {normal:[0,1,0],corners:[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]]},
      {normal:[0,-1,0],corners:[[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]]},
      {normal:[0,0,1],corners:[[.5,-.5,.5],[-.5,-.5,.5],[-.5,.5,.5],[.5,.5,.5]]},
      {normal:[0,0,-1],corners:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]]}
    ];

    faces.forEach(face=>{
      const start=positions.length/3;

      face.corners.forEach(corner=>{
        positions.push(...corner);
        normals.push(...face.normal);
      });

      indices.push(
        start,start+1,start+2,
        start,start+2,start+3
      );
    });

    return{positions,normals,indices};
  }

  function createPlaneGeometry(){
    return{
      positions:[
        -.5,0,-.5,
        .5,0,-.5,
        .5,0,.5,
        -.5,0,.5
      ],
      normals:[
        0,1,0,
        0,1,0,
        0,1,0,
        0,1,0
      ],
      indices:[0,1,2,0,2,3]
    };
  }

  function createDiscGeometry(segments=24){
    const positions=[0,0,0];
    const normals=[0,1,0];
    const indices=[];

    for(let index=0;index<=segments;index++){
      const angle=index/segments*PI*2;
      positions.push(Math.cos(angle)*.5,0,Math.sin(angle)*.5);
      normals.push(0,1,0);
    }

    for(let index=1;index<=segments;index++){
      indices.push(0,index,index+1);
    }

    return{positions,normals,indices};
  }

  function createSphereGeometry(latitudeBands=8,longitudeBands=12){
    const positions=[];
    const normals=[];
    const indices=[];

    for(let latitude=0;latitude<=latitudeBands;latitude++){
      const theta=latitude*PI/latitudeBands;
      const sinTheta=Math.sin(theta);
      const cosTheta=Math.cos(theta);

      for(let longitude=0;longitude<=longitudeBands;longitude++){
        const phi=longitude*PI*2/longitudeBands;
        const normal=[
          Math.cos(phi)*sinTheta,
          cosTheta,
          Math.sin(phi)*sinTheta
        ];

        positions.push(normal[0]*.5,normal[1]*.5,normal[2]*.5);
        normals.push(...normal);
      }
    }

    for(let latitude=0;latitude<latitudeBands;latitude++){
      for(let longitude=0;longitude<longitudeBands;longitude++){
        const first=latitude*(longitudeBands+1)+longitude;
        const second=first+longitudeBands+1;

        indices.push(
          first,second,first+1,
          second,second+1,first+1
        );
      }
    }

    return{positions,normals,indices};
  }

  function createCylinderGeometry(segments=12){
    const positions=[];
    const normals=[];
    const indices=[];

    for(let index=0;index<=segments;index++){
      const angle=index/segments*PI*2;
      const cosine=Math.cos(angle);
      const sine=Math.sin(angle);

      positions.push(cosine*.5,-.5,sine*.5);
      normals.push(cosine,0,sine);
      positions.push(cosine*.5,.5,sine*.5);
      normals.push(cosine,0,sine);
    }

    for(let index=0;index<segments;index++){
      const base=index*2;
      indices.push(
        base,base+1,base+2,
        base+1,base+3,base+2
      );
    }

    const bottomCenter=positions.length/3;
    positions.push(0,-.5,0);
    normals.push(0,-1,0);

    const topCenter=positions.length/3;
    positions.push(0,.5,0);
    normals.push(0,1,0);

    const capStart=positions.length/3;

    for(let index=0;index<=segments;index++){
      const angle=index/segments*PI*2;
      const cosine=Math.cos(angle);
      const sine=Math.sin(angle);

      positions.push(cosine*.5,-.5,sine*.5);
      normals.push(0,-1,0);
      positions.push(cosine*.5,.5,sine*.5);
      normals.push(0,1,0);
    }

    for(let index=0;index<segments;index++){
      const lower=capStart+index*2;
      const upper=lower+1;
      const nextLower=capStart+(index+1)*2;
      const nextUpper=nextLower+1;

      indices.push(
        bottomCenter,nextLower,lower,
        topCenter,upper,nextUpper
      );
    }

    return{positions,normals,indices};
  }

  function createConeGeometry(segments=12){
    const positions=[];
    const normals=[];
    const indices=[];

    for(let index=0;index<=segments;index++){
      const angle=index/segments*PI*2;
      const cosine=Math.cos(angle);
      const sine=Math.sin(angle);
      const normal=normalize3([cosine,.5,sine]);

      positions.push(cosine*.5,-.5,sine*.5);
      normals.push(...normal);
      positions.push(0,.5,0);
      normals.push(...normal);
    }

    for(let index=0;index<segments;index++){
      const base=index*2;
      indices.push(base,base+2,base+1);
    }

    const center=positions.length/3;
    positions.push(0,-.5,0);
    normals.push(0,-1,0);

    const ringStart=positions.length/3;

    for(let index=0;index<=segments;index++){
      const angle=index/segments*PI*2;
      positions.push(Math.cos(angle)*.5,-.5,Math.sin(angle)*.5);
      normals.push(0,-1,0);
    }

    for(let index=0;index<segments;index++){
      indices.push(center,ringStart+index+1,ringStart+index);
    }

    return{positions,normals,indices};
  }

  function createShader(gl,type,source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
      const message=gl.getShaderInfoLog(shader)||"Unknown shader compilation error";
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  function createProgram(gl,vertexSource,fragmentSource){
    const vertex=createShader(gl,gl.VERTEX_SHADER,vertexSource);
    const fragment=createShader(gl,gl.FRAGMENT_SHADER,fragmentSource);
    const program=gl.createProgram();

    gl.attachShader(program,vertex);
    gl.attachShader(program,fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
      const message=gl.getProgramInfoLog(program)||"Unknown shader link error";
      gl.deleteProgram(program);
      throw new Error(message);
    }

    return program;
  }

  function createMesh(gl,geometry){
    const vertexCount=geometry.positions.length/3;
    const interleaved=new Float32Array(vertexCount*6);

    for(let index=0;index<vertexCount;index++){
      interleaved[index*6+0]=geometry.positions[index*3+0];
      interleaved[index*6+1]=geometry.positions[index*3+1];
      interleaved[index*6+2]=geometry.positions[index*3+2];
      interleaved[index*6+3]=geometry.normals[index*3+0];
      interleaved[index*6+4]=geometry.normals[index*3+1];
      interleaved[index*6+5]=geometry.normals[index*3+2];
    }

    /*
      Normalize triangle winding from the supplied vertex normals.
      This keeps culling correct for every generated primitive,
      including horizontal planes and cap geometry.
    */
    const correctedIndices=[...geometry.indices];

    for(let index=0;index<correctedIndices.length;index+=3){
      const i0=correctedIndices[index];
      const i1=correctedIndices[index+1];
      const i2=correctedIndices[index+2];

      const p0=[
        geometry.positions[i0*3+0],
        geometry.positions[i0*3+1],
        geometry.positions[i0*3+2]
      ];
      const p1=[
        geometry.positions[i1*3+0],
        geometry.positions[i1*3+1],
        geometry.positions[i1*3+2]
      ];
      const p2=[
        geometry.positions[i2*3+0],
        geometry.positions[i2*3+1],
        geometry.positions[i2*3+2]
      ];

      const edgeA=[
        p1[0]-p0[0],
        p1[1]-p0[1],
        p1[2]-p0[2]
      ];
      const edgeB=[
        p2[0]-p0[0],
        p2[1]-p0[1],
        p2[2]-p0[2]
      ];
      const faceNormal=cross3(edgeA,edgeB);
      const expectedNormal=[
        geometry.normals[i0*3+0]+
          geometry.normals[i1*3+0]+
          geometry.normals[i2*3+0],
        geometry.normals[i0*3+1]+
          geometry.normals[i1*3+1]+
          geometry.normals[i2*3+1],
        geometry.normals[i0*3+2]+
          geometry.normals[i1*3+2]+
          geometry.normals[i2*3+2]
      ];

      if(dot3(faceNormal,expectedNormal)<0){
        correctedIndices[index+1]=i2;
        correctedIndices[index+2]=i1;
      }
    }

    const vertexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,interleaved,gl.STATIC_DRAW);

    const indexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(correctedIndices),
      gl.STATIC_DRAW
    );

    return{
      vertexBuffer,
      indexBuffer,
      count:correctedIndices.length,
      type:gl.UNSIGNED_SHORT
    };
  }


  function roundedRectPath(context,x,y,width,height,radius){
    const r=Math.min(Math.max(0,radius),Math.min(width,height)/2);

    context.beginPath();
    context.moveTo(x+r,y);
    context.lineTo(x+width-r,y);
    context.quadraticCurveTo(x+width,y,x+width,y+r);
    context.lineTo(x+width,y+height-r);
    context.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
    context.lineTo(x+r,y+height);
    context.quadraticCurveTo(x,y+height,x,y+height-r);
    context.lineTo(x,y+r);
    context.quadraticCurveTo(x,y,x+r,y);
    context.closePath();
  }


  class RaceMarketWebGLRenderer{
    constructor(){
      this.canvas=null;
      this.overlay=null;
      this.overlayContext=null;
      this.track=null;
      this.notice=null;
      this.status=null;

      this.gl=null;
      this.program=null;
      this.lineProgram=null;
      this.particleProgram=null;
      this.meshes={};
      this.locations={};
      this.lineLocations={};
      this.particleLocations={};
      this.particleBuffer=null;
      this.rainBuffer=null;

      this.instanceExtension=null;
      this.instancedProgram=null;
      this.instancedLocations={};
      this.instanceBuffer=null;
      this.instanceBatches=null;
      this.currentTransparentPass=false;
      this.activePalette=null;

      this.initialized=false;
      this.supported=false;
      this.contextLost=false;
      this.mode=VALID_MODES.has(storageGet(MODE_KEY))
        ?storageGet(MODE_KEY)
        :"webgl";
      this.quality=VALID_QUALITY.has(storageGet(QUALITY_KEY))
        ?storageGet(QUALITY_KEY)
        :"auto";
      this.effectiveQuality="high";
      this.adaptiveEco=false;
      this.lowFpsSamples=0;
      this.gpuRenderer="";
      this.lastRenderedAt=null;

      this.callbacks={
        onSelectRunner:null,
        onModeChange:null,
        onQualityChange:null,
        getPrice:null
      };

      this.appState=null;
      this.fieldKey="";
      this.sceneSeed=1;
      this.horseVisuals=new Map();
      this.screenHorses=[];
      this.dustParticles=[];
      this.dustAccumulator=0;
      this.rainSeeds=[];
      this.labelPositions=new Map();

      this.freeCamera={
        yaw:-0.62,
        pitch:0.48,
        distance:58,
        target:[2,1.8,0],
        minDistance:22,
        maxDistance:120
      };

      this.pointerState={
        down:false,
        dragging:false,
        startX:0,
        startY:0,
        lastX:0,
        lastY:0,
        button:0
      };

      this.cssWidth=1;
      this.cssHeight=1;
      this.pixelRatio=1;
      this.lastTimestamp=null;
      this.frameCounter=0;
      this.fps=0;
      this.fpsStartedAt=0;

      this.camera={
        eye:[0,25,58],
        target:[0,2,0],
        fov:45
      };
      this.cameraTarget={
        eye:[0,25,58],
        target:[0,2,0],
        fov:45
      };
      this.viewProjection=null;

      this.resizeObserver=null;
      this.reducedMotion=false;
      this.boundPointerDown=event=>this.handlePointerDown(event);
      this.boundPointerMove=event=>this.handlePointerMove(event);
      this.boundPointerLeave=()=>this.handlePointerLeave();
      this.boundPointerUp=event=>this.handlePointerUp(event);
      this.boundWheel=event=>this.handleWheel(event);
      this.boundKeyDown=event=>this.handleKeyDown(event);
      this.boundContextLost=event=>this.handleContextLost(event);
      this.boundContextRestored=()=>this.handleContextRestored();
    }

    init(options={}){
      if(this.initialized){
        return this.getStatus();
      }

      this.canvas=options.canvas||
        global.document?.getElementById("race3dCanvas")||
        null;
      this.overlay=options.overlay||
        global.document?.getElementById("race3dOverlay")||
        null;
      this.track=options.track||
        global.document?.getElementById("visualTrack")||
        null;
      this.notice=global.document?.getElementById("race3dFallback")||null;
      this.status=global.document?.getElementById("race3dStatus")||null;

      this.callbacks.onSelectRunner=
        typeof options.onSelectRunner==="function"
          ?options.onSelectRunner
          :null;
      this.callbacks.onModeChange=
        typeof options.onModeChange==="function"
          ?options.onModeChange
          :null;
      this.callbacks.onQualityChange=
        typeof options.onQualityChange==="function"
          ?options.onQualityChange
          :null;
      this.callbacks.getPrice=
        typeof options.getPrice==="function"
          ?options.getPrice
          :null;

      this.reducedMotion=Boolean(
        global.matchMedia&&
        global.matchMedia("(prefers-reduced-motion: reduce)").matches
      );

      if(!this.canvas||!this.overlay||!this.track){
        this.mode="classic";
        this.supported=false;
        this.initialized=true;
        this.updateModeUI();
        return this.getStatus();
      }

      this.overlayContext=this.overlay.getContext("2d");

      try{
        this.initializeGL();
        this.supported=true;
      }catch(error){
        console.warn("RaceMarket WebGL renderer unavailable:",error);
        this.supported=false;
        this.mode="classic";
        this.showNotice(
          "WebGL is unavailable on this device. The classic 3D view is active.",
          false
        );
      }

      this.canvas.addEventListener("pointerdown",this.boundPointerDown);
      this.canvas.addEventListener("pointermove",this.boundPointerMove);
      this.canvas.addEventListener("pointerleave",this.boundPointerLeave);
      this.canvas.addEventListener("pointerup",this.boundPointerUp);
      this.canvas.addEventListener("pointercancel",this.boundPointerUp);
      this.canvas.addEventListener("wheel",this.boundWheel,{passive:false});
      this.canvas.addEventListener("keydown",this.boundKeyDown);
      this.canvas.addEventListener("webglcontextlost",this.boundContextLost,false);
      this.canvas.addEventListener("webglcontextrestored",this.boundContextRestored,false);

      this.wireControls();

      if("ResizeObserver" in global){
        this.resizeObserver=new ResizeObserver(()=>this.resize(true));
        this.resizeObserver.observe(this.track);
      }else{
        global.addEventListener("resize",()=>this.resize(true),{passive:true});
      }

      this.initialized=true;
      this.setMode(this.mode,{persist:false,notify:false});
      this.setQuality(this.quality,{persist:false,notify:false});
      this.resize(true);
      this.updateModeUI();
      this.updateQualityUI();

      return this.getStatus();
    }

    initializeGL(){
      const attributes={
        alpha:false,
        antialias:true,
        depth:true,
        stencil:false,
        premultipliedAlpha:false,
        preserveDrawingBuffer:false,
        powerPreference:"high-performance"
      };

      const gl=
        this.canvas.getContext("webgl",attributes)||
        this.canvas.getContext("experimental-webgl",attributes);

      if(!gl){
        throw new Error("A WebGL context could not be created.");
      }

      this.gl=gl;

      /*
        Auto quality starts conservatively on software renderers.
        A user-selected High setting still overrides this choice.
      */
      try{
        const debugInfo=
          gl.getExtension(
            "WEBGL_debug_renderer_info"
          );

        this.gpuRenderer=
          debugInfo
            ?String(
                gl.getParameter(
                  debugInfo.UNMASKED_RENDERER_WEBGL
                )||
                ""
              )
            :"";

        if(
          /swiftshader|llvmpipe|software/i.test(
            this.gpuRenderer
          )
        ){
          this.adaptiveEco=true;
        }
      }catch(error){
        this.gpuRenderer="";
      }

      const vertexSource=`
        attribute vec3 aPosition;
        attribute vec3 aNormal;

        uniform mat4 uModel;
        uniform mat4 uViewProjection;
        uniform mat3 uNormalMatrix;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main(){
          vec4 worldPosition=uModel*vec4(aPosition,1.0);
          vWorldPosition=worldPosition.xyz;
          vNormal=normalize(uNormalMatrix*aNormal);
          gl_Position=uViewProjection*worldPosition;
        }
      `;

      const fragmentSource=`
        precision mediump float;

        uniform vec3 uColor;
        uniform vec3 uLightDirection;
        uniform vec3 uLightColor;
        uniform vec3 uAmbientColor;
        uniform vec3 uFogColor;
        uniform vec3 uCameraPosition;
        uniform vec3 uRimColor;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform float uAlpha;
        uniform float uEmissive;
        uniform float uRimAmount;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main(){
          vec3 normal=normalize(vNormal);
          vec3 lightDirection=normalize(-uLightDirection);
          float diffuse=max(dot(normal,lightDirection),0.0);
          float hemisphere=.5+.5*normal.y;

          vec3 viewDirection=normalize(uCameraPosition-vWorldPosition);
          float rim=pow(
            1.0-max(dot(viewDirection,normal),0.0),
            2.4
          )*uRimAmount;

          vec3 lighting=
            uAmbientColor+
            uLightColor*diffuse*.78+
            vec3(.10,.12,.10)*hemisphere;

          vec3 litColor=
            uColor*lighting+
            uRimColor*rim;

          litColor=mix(litColor,uColor,uEmissive);

          float distanceToCamera=
            length(uCameraPosition-vWorldPosition);

          float fogAmount=smoothstep(
            uFogNear,
            uFogFar,
            distanceToCamera
          );

          gl_FragColor=vec4(
            mix(litColor,uFogColor,fogAmount),
            uAlpha
          );
        }
      `;

      const lineVertexSource=`
        attribute vec3 aPosition;
        uniform mat4 uViewProjection;

        void main(){
          gl_Position=uViewProjection*vec4(aPosition,1.0);
        }
      `;

      const lineFragmentSource=`
        precision mediump float;
        uniform vec4 uColor;

        void main(){
          gl_FragColor=uColor;
        }
      `;

      const particleVertexSource=`
        attribute vec3 aPosition;
        attribute vec4 aColor;
        attribute float aSize;

        uniform mat4 uViewProjection;
        uniform float uPixelRatio;

        varying vec4 vColor;

        void main(){
          vec4 clip=uViewProjection*vec4(aPosition,1.0);
          gl_Position=clip;
          gl_PointSize=
            clamp(
              aSize*uPixelRatio*(34.0/max(8.0,clip.w)),
              1.0,
              24.0
            );
          vColor=aColor;
        }
      `;

      const particleFragmentSource=`
        precision mediump float;
        varying vec4 vColor;

        void main(){
          vec2 point=gl_PointCoord*2.0-1.0;
          float radius=dot(point,point);

          if(radius>1.0){
            discard;
          }

          float feather=1.0-smoothstep(.28,1.0,radius);
          gl_FragColor=vec4(vColor.rgb,vColor.a*feather);
        }
      `;

      const instancedVertexSource=`
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        attribute mat4 aInstanceModel;
        attribute vec4 aInstanceColor;
        attribute vec2 aInstanceParams;

        uniform mat4 uViewProjection;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec4 vColorAlpha;
        varying vec2 vParams;

        void main(){
          vec4 worldPosition=
            aInstanceModel*
            vec4(aPosition,1.0);

          vec3 column0=
            aInstanceModel[0].xyz;
          vec3 column1=
            aInstanceModel[1].xyz;
          vec3 column2=
            aInstanceModel[2].xyz;

          float scaleSquared0=
            max(dot(column0,column0),.000001);
          float scaleSquared1=
            max(dot(column1,column1),.000001);
          float scaleSquared2=
            max(dot(column2,column2),.000001);

          mat3 normalMatrix=mat3(
            column0/scaleSquared0,
            column1/scaleSquared1,
            column2/scaleSquared2
          );

          vNormal=
            normalize(
              normalMatrix*
              aNormal
            );
          vWorldPosition=
            worldPosition.xyz;
          vColorAlpha=
            aInstanceColor;
          vParams=
            aInstanceParams;

          gl_Position=
            uViewProjection*
            worldPosition;
        }
      `;

      const instancedFragmentSource=`
        precision mediump float;

        uniform vec3 uLightDirection;
        uniform vec3 uLightColor;
        uniform vec3 uAmbientColor;
        uniform vec3 uFogColor;
        uniform vec3 uCameraPosition;
        uniform vec3 uRimColor;
        uniform float uFogNear;
        uniform float uFogFar;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec4 vColorAlpha;
        varying vec2 vParams;

        void main(){
          vec3 normal=
            normalize(vNormal);
          vec3 lightDirection=
            normalize(-uLightDirection);
          float diffuse=
            max(
              dot(
                normal,
                lightDirection
              ),
              0.0
            );
          float hemisphere=
            .5+
            .5*
            normal.y;

          vec3 viewDirection=
            normalize(
              uCameraPosition-
              vWorldPosition
            );
          float rim=
            pow(
              1.0-
              max(
                dot(
                  viewDirection,
                  normal
                ),
                0.0
              ),
              2.4
            )*
            vParams.y;

          vec3 lighting=
            uAmbientColor+
            uLightColor*
              diffuse*
              .78+
            vec3(.10,.12,.10)*
              hemisphere;

          vec3 litColor=
            vColorAlpha.rgb*
              lighting+
            uRimColor*
              rim;

          litColor=
            mix(
              litColor,
              vColorAlpha.rgb,
              vParams.x
            );

          float distanceToCamera=
            length(
              uCameraPosition-
              vWorldPosition
            );

          float fogAmount=
            smoothstep(
              uFogNear,
              uFogFar,
              distanceToCamera
            );

          gl_FragColor=
            vec4(
              mix(
                litColor,
                uFogColor,
                fogAmount
              ),
              vColorAlpha.a
            );
        }
      `;

      this.program=createProgram(gl,vertexSource,fragmentSource);
      this.lineProgram=createProgram(gl,lineVertexSource,lineFragmentSource);
      this.particleProgram=createProgram(
        gl,
        particleVertexSource,
        particleFragmentSource
      );

      this.instanceExtension=
        gl.getExtension(
          "ANGLE_instanced_arrays"
        );

      const maximumAttributes=
        Number(
          gl.getParameter(
            gl.MAX_VERTEX_ATTRIBS
          )
        )||
        0;

      if(
        this.instanceExtension&&
        maximumAttributes>=8
      ){
        try{
          this.instancedProgram=
            createProgram(
              gl,
              instancedVertexSource,
              instancedFragmentSource
            );

          this.instancedLocations={
            position:
              gl.getAttribLocation(
                this.instancedProgram,
                "aPosition"
              ),
            normal:
              gl.getAttribLocation(
                this.instancedProgram,
                "aNormal"
              ),
            model:
              gl.getAttribLocation(
                this.instancedProgram,
                "aInstanceModel"
              ),
            color:
              gl.getAttribLocation(
                this.instancedProgram,
                "aInstanceColor"
              ),
            params:
              gl.getAttribLocation(
                this.instancedProgram,
                "aInstanceParams"
              ),
            viewProjection:
              gl.getUniformLocation(
                this.instancedProgram,
                "uViewProjection"
              ),
            lightDirection:
              gl.getUniformLocation(
                this.instancedProgram,
                "uLightDirection"
              ),
            lightColor:
              gl.getUniformLocation(
                this.instancedProgram,
                "uLightColor"
              ),
            ambientColor:
              gl.getUniformLocation(
                this.instancedProgram,
                "uAmbientColor"
              ),
            fogColor:
              gl.getUniformLocation(
                this.instancedProgram,
                "uFogColor"
              ),
            cameraPosition:
              gl.getUniformLocation(
                this.instancedProgram,
                "uCameraPosition"
              ),
            rimColor:
              gl.getUniformLocation(
                this.instancedProgram,
                "uRimColor"
              ),
            fogNear:
              gl.getUniformLocation(
                this.instancedProgram,
                "uFogNear"
              ),
            fogFar:
              gl.getUniformLocation(
                this.instancedProgram,
                "uFogFar"
              )
          };

          /*
            A mat4 consumes four consecutive attributes. Together
            with position, normal, color, and parameters this uses
            the WebGL 1 minimum of eight attribute slots.
          */
          const locations=[
            this.instancedLocations.position,
            this.instancedLocations.normal,
            this.instancedLocations.model,
            this.instancedLocations.model+1,
            this.instancedLocations.model+2,
            this.instancedLocations.model+3,
            this.instancedLocations.color,
            this.instancedLocations.params
          ];

          if(
            locations.some(
              location=>
                location<0
            )||
            new Set(
              locations
            ).size!==
              locations.length
          ){
            throw new Error(
              "Instanced attribute layout is not supported."
            );
          }
        }catch(error){
          console.warn(
            "RaceMarket instanced rendering unavailable; using the compatible draw path.",
            error
          );
          this.instanceExtension=null;
          this.instancedProgram=null;
          this.instancedLocations={};
        }
      }else{
        this.instanceExtension=null;
        this.instancedProgram=null;
        this.instancedLocations={};
      }

      this.locations={
        position:gl.getAttribLocation(this.program,"aPosition"),
        normal:gl.getAttribLocation(this.program,"aNormal"),
        model:gl.getUniformLocation(this.program,"uModel"),
        viewProjection:gl.getUniformLocation(this.program,"uViewProjection"),
        normalMatrix:gl.getUniformLocation(this.program,"uNormalMatrix"),
        color:gl.getUniformLocation(this.program,"uColor"),
        lightDirection:gl.getUniformLocation(this.program,"uLightDirection"),
        lightColor:gl.getUniformLocation(this.program,"uLightColor"),
        ambientColor:gl.getUniformLocation(this.program,"uAmbientColor"),
        fogColor:gl.getUniformLocation(this.program,"uFogColor"),
        cameraPosition:gl.getUniformLocation(this.program,"uCameraPosition"),
        rimColor:gl.getUniformLocation(this.program,"uRimColor"),
        fogNear:gl.getUniformLocation(this.program,"uFogNear"),
        fogFar:gl.getUniformLocation(this.program,"uFogFar"),
        alpha:gl.getUniformLocation(this.program,"uAlpha"),
        emissive:gl.getUniformLocation(this.program,"uEmissive"),
        rimAmount:gl.getUniformLocation(this.program,"uRimAmount")
      };

      this.lineLocations={
        position:gl.getAttribLocation(this.lineProgram,"aPosition"),
        viewProjection:gl.getUniformLocation(this.lineProgram,"uViewProjection"),
        color:gl.getUniformLocation(this.lineProgram,"uColor")
      };

      this.particleLocations={
        position:gl.getAttribLocation(this.particleProgram,"aPosition"),
        color:gl.getAttribLocation(this.particleProgram,"aColor"),
        size:gl.getAttribLocation(this.particleProgram,"aSize"),
        viewProjection:gl.getUniformLocation(
          this.particleProgram,
          "uViewProjection"
        ),
        pixelRatio:gl.getUniformLocation(this.particleProgram,"uPixelRatio")
      };

      this.meshes={
        cube:createMesh(gl,createCubeGeometry()),
        plane:createMesh(gl,createPlaneGeometry()),
        disc:createMesh(gl,createDiscGeometry(28)),
        sphere:createMesh(gl,createSphereGeometry(9,14)),
        cylinder:createMesh(gl,createCylinderGeometry(12)),
        cone:createMesh(gl,createConeGeometry(12))
      };

      this.particleBuffer=gl.createBuffer();
      this.rainBuffer=gl.createBuffer();
      this.instanceBuffer=
        this.instanceExtension
          ?gl.createBuffer()
          :null;

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.frontFace(gl.CCW);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

      this.buildRainSeeds();
    }

    buildRainSeeds(){
      this.rainSeeds=[];

      for(let index=0;index<220;index++){
        this.rainSeeds.push({
          x:seededUnit(index*9127+17),
          y:seededUnit(index*5279+41),
          z:seededUnit(index*3571+73),
          speed:.82+seededUnit(index*1867+97)*.42
        });
      }
    }

    wireControls(){
      const controls=global.document?.getElementById("raceRenderControls");

      controls
        ?.querySelectorAll("[data-render-mode]")
        .forEach(button=>{
          button.addEventListener("click",()=>{
            this.setMode(button.dataset.renderMode);
          });
        });

      const qualityButton=
        global.document?.getElementById("race3dQuality");

      qualityButton?.addEventListener("click",()=>{
        const order=["auto","high","eco"];
        const index=order.indexOf(this.quality);
        this.setQuality(order[(index+1)%order.length]);
      });
    }

    setMode(mode,options={}){
      const settings={
        persist:true,
        notify:true,
        ...options
      };

      let requested=VALID_MODES.has(mode)
        ?mode
        :"webgl";

      if(requested==="webgl"&&!this.supported){
        requested="classic";
        this.showNotice(
          "WebGL is unavailable on this device. The classic 3D view is active.",
          false
        );
      }

      this.mode=requested;

      if(settings.persist){
        storageSet(MODE_KEY,requested);
      }

      const active=
        requested==="webgl"&&
        this.supported&&
        !this.contextLost;

      this.track?.classList.toggle("webgl-3d-active",active);
      this.track?.classList.toggle("classic-3d-active",!active);

      if(this.canvas){
        this.canvas.hidden=!active;
        this.canvas.setAttribute("aria-hidden",String(!active));
      }

      if(this.overlay){
        this.overlay.hidden=!active;
        this.overlay.setAttribute("aria-hidden",String(!active));
      }

      this.updateModeUI();

      if(active){
        this.resize(true);
      }

      if(settings.notify&&this.callbacks.onModeChange){
        this.callbacks.onModeChange(requested);
      }

      return requested;
    }

    setQuality(quality,options={}){
      const settings={
        persist:true,
        notify:true,
        ...options
      };

      this.quality=VALID_QUALITY.has(quality)
        ?quality
        :"auto";

      if(settings.persist){
        storageSet(QUALITY_KEY,this.quality);
      }

      this.resolveEffectiveQuality();
      this.updateQualityUI();
      this.resize(true);

      if(settings.notify&&this.callbacks.onQualityChange){
        this.callbacks.onQualityChange(this.quality);
      }

      return this.quality;
    }

    resolveEffectiveQuality(){
      if(this.quality!=="auto"){
        this.effectiveQuality=this.quality;
        return this.effectiveQuality;
      }

      const memory=Number(global.navigator?.deviceMemory)||8;
      const cores=Number(global.navigator?.hardwareConcurrency)||8;
      const compact=
        Math.min(
          global.innerWidth||1200,
          global.innerHeight||800
        )<620;

      this.effectiveQuality=
        this.adaptiveEco||
        memory<=4||
        cores<=4||
        compact
          ?"eco"
          :"high";

      return this.effectiveQuality;
    }

    qualitySettings(){
      this.resolveEffectiveQuality();

      if(this.effectiveQuality==="eco"){
        return{
          dpr:1,
          treeCount:8,
          railStep:12,
          rainCount:70,
          horseDetail:0,
          dustLimit:90
        };
      }

      return{
        dpr:2,
        treeCount:16,
        railStep:7,
        rainCount:170,
        horseDetail:2,
        dustLimit:220
      };
    }

    updateModeUI(){
      global.document
        ?.querySelectorAll("[data-render-mode]")
        .forEach(button=>{
          const active=button.dataset.renderMode===this.mode;
          button.classList.toggle("active",active);
          button.setAttribute("aria-pressed",String(active));
        });

      this.updateStatus();
    }

    updateQualityUI(){
      const button=global.document?.getElementById("race3dQuality");

      if(button){
        button.dataset.quality=this.quality;
        button.textContent=`QUALITY • ${this.quality.toUpperCase()}`;
        button.setAttribute(
          "aria-label",
          `Rendering quality ${this.quality}. Activate to change quality.`
        );
      }

      this.updateStatus();
    }

    updateStatus(){
      if(!this.status){
        return;
      }

      if(this.mode!=="webgl"||!this.supported){
        this.status.textContent="CLASSIC 3D";
        this.status.dataset.state="classic";
        return;
      }

      const fps=this.fps>0
        ?` • ${Math.round(this.fps)} FPS`
        :"";

      this.status.textContent=
        `WEBGL 3D • ${this.effectiveQuality.toUpperCase()}${fps}`;
      this.status.dataset.state="webgl";
    }

    showNotice(message,persistent=false){
      if(!this.notice){
        return;
      }

      this.notice.textContent=message;
      this.notice.hidden=false;
      this.notice.classList.toggle("is-persistent",persistent);

      if(!persistent){
        global.setTimeout(()=>{
          if(this.notice&&!this.notice.classList.contains("is-persistent")){
            this.notice.hidden=true;
          }
        },3600);
      }
    }

    resize(force=false){
      if(!this.canvas||!this.overlay||!this.track){
        return false;
      }

      const bounds=this.track.getBoundingClientRect();
      const width=Math.max(1,Math.round(bounds.width));
      const height=Math.max(1,Math.round(bounds.height));
      const settings=this.qualitySettings();
      const deviceRatio=Math.max(1,global.devicePixelRatio||1);
      const ratio=Math.min(deviceRatio,settings.dpr);

      const pixelWidth=Math.max(1,Math.round(width*ratio));
      const pixelHeight=Math.max(1,Math.round(height*ratio));

      if(
        !force&&
        this.canvas.width===pixelWidth&&
        this.canvas.height===pixelHeight
      ){
        return true;
      }

      this.cssWidth=width;
      this.cssHeight=height;
      this.pixelRatio=ratio;

      this.canvas.width=pixelWidth;
      this.canvas.height=pixelHeight;
      this.overlay.width=pixelWidth;
      this.overlay.height=pixelHeight;

      if(this.gl){
        this.gl.viewport(0,0,pixelWidth,pixelHeight);
      }

      return true;
    }

    getStatus(){
      return{
        initialized:this.initialized,
        supported:this.supported,
        mode:this.mode,
        quality:this.quality,
        effectiveQuality:this.effectiveQuality,
        instanced:Boolean(
          this.instanceExtension&&
          this.instancedProgram
        ),
        renderer:this.gpuRenderer,
        contextLost:this.contextLost,
        fps:this.fps
      };
    }

    handleContextLost(event){
      event.preventDefault();
      this.contextLost=true;
      this.track?.classList.remove("webgl-3d-active");
      this.track?.classList.add("classic-3d-active");
      this.showNotice(
        "The 3D graphics context was interrupted. The classic view is active while it recovers.",
        true
      );
      this.updateStatus();
    }

    handleContextRestored(){
      try{
        this.initializeGL();
        this.contextLost=false;
        this.notice?.classList.remove("is-persistent");

        if(this.notice){
          this.notice.hidden=true;
        }

        this.setMode(this.mode,{persist:false,notify:false});
      }catch(error){
        console.warn("RaceMarket WebGL context recovery failed:",error);
        this.supported=false;
        this.setMode("classic",{persist:false});
      }
    }

    resetScene(appState){
      this.appState=appState;
      this.horseVisuals.clear();
      this.screenHorses=[];
      this.labelPositions.clear();
      this.dustParticles=[];
      this.dustAccumulator=0;
      this.lastTimestamp=null;
      this.lastRenderedAt=null;

      const key=[
        appState?.tradingRaceSerial||0,
        appState?.raceNumber||0,
        appState?.profile?.track||"",
        appState?.profile?.surface||"",
        ...(appState?.horses||[]).map(horse=>horse.id)
      ].join(":");

      this.fieldKey=key;
      this.sceneSeed=hashString(key)||1;

      (appState?.horses||[]).forEach(horse=>{
        const target=this.worldPositionForHorse(horse,appState);
        const seed=this.sceneSeed+horse.id*137.17;

        this.horseVisuals.set(horse.id,{
          x:target.x,
          z:target.z,
          targetX:target.x,
          targetZ:target.z,

          /* Initialize every animation parameter here too.
             createRace() calls render() immediately after resetting
             the scene, so the first live frame can arrive before
             updateHorseVisuals() has a chance to create a new record. */
          phase:seededUnit(seed)*Math.PI*2,
          cadence:.91+seededUnit(seed+11)*.18,
          stride:.92+seededUnit(seed+23)*.18,
          bounce:.84+seededUnit(seed+37)*.34,
          neckMotion:.78+seededUnit(seed+41)*.34,
          tailMotion:.80+seededUnit(seed+53)*.42,
          jockeyMotion:.82+seededUnit(seed+67)*.26,
          foreBias:seededUnit(seed+79)*.16-.08,
          bodyRoll:.88+seededUnit(seed+91)*.28
        });
      });
    }

    worldPositionForHorse(horse,appState=this.appState){
      const count=Math.max(1,appState?.horses?.length||1);
      const laneIndex=clamp((horse.post||1)-1,0,count-1);
      const laneFraction=count===1
        ?.5
        :laneIndex/(count-1);

      const progress=
        appState?.phase==="countdown"
          ?0
          :clamp(
              (Number(horse.distanceTravelled)||0)/
              Math.max(1,Number(appState?.raceDistance)||100),
              0,
              1
            );

      return{
        x:-67+progress*137,
        z:-18+laneFraction*36,
        laneFraction
      };
    }

    currentLeader(appState=this.appState){
      return[...(appState?.horses||[])]
        .sort(
          (a,b)=>
            (Number(b.distanceTravelled)||0)-
            (Number(a.distanceTravelled)||0)
        )[0]||
        null;
    }

    cameraPlan(appState){
      const horses=appState?.horses||[];
      const leader=this.currentLeader(appState);
      const selected=
        horses.find(horse=>horse.id===appState?.selected)||
        leader;

      const worldFor=horse=>{
        if(!horse){
          return{x:0,z:0};
        }

        return this.horseVisuals.get(horse.id)||
          this.worldPositionForHorse(horse,appState);
      };

      const leaderWorld=worldFor(leader);
      const selectedWorld=worldFor(selected);
      const ranking=[...horses].sort(
        (a,b)=>
          (Number(b.distanceTravelled)||0)-
          (Number(a.distanceTravelled)||0)
      );

      const front=ranking.slice(0,Math.min(5,ranking.length));
      const packX=front.length
        ?front.reduce(
            (sum,horse)=>sum+worldFor(horse).x,
            0
          )/front.length
        :0;
      const packZ=front.length
        ?front.reduce(
            (sum,horse)=>sum+worldFor(horse).z,
            0
          )/front.length
        :0;

      let shot=appState?.cameraShot||"wide";

      if(appState?.cameraMode==="wide"){
        shot="wide";
      }else if(appState?.cameraMode==="leader"){
        shot="leader";
      }else if(appState?.cameraMode==="selected"){
        shot="selected";
      }else if(appState?.cameraMode==="finish"){
        shot="finish";
      }else if(appState?.cameraMode==="topdown"){
        shot="topdown";
      }else if(appState?.cameraMode==="free"){
        shot="free";
      }

      const aspect=this.cssWidth/Math.max(1,this.cssHeight);
      const narrow=aspect<1.15;
      const distanceBoost=narrow?1.22:1;

      if(
        appState?.phase==="countdown"&&
        appState?.cameraMode==="auto"
      ){
        return{
          eye:[
            -45,
            22*distanceBoost,
            57*distanceBoost
          ],
          target:[-60,1.8,0],
          fov:narrow?54:43
        };
      }

      switch(shot){
        case "selected":
          return{
            eye:[
              selectedWorld.x-10,
              11*distanceBoost,
              selectedWorld.z+30*distanceBoost
            ],
            target:[
              selectedWorld.x+5,
              1.65,
              selectedWorld.z
            ],
            fov:narrow?49:39
          };

        case "leader":
          return{
            eye:[
              leaderWorld.x-13,
              13*distanceBoost,
              38*distanceBoost
            ],
            target:[
              leaderWorld.x+6,
              1.7,
              leaderWorld.z*.28
            ],
            fov:narrow?50:41
          };

        case "duel":
          return{
            eye:[
              packX-12,
              12.5*distanceBoost,
              35*distanceBoost
            ],
            target:[
              packX+6,
              1.7,
              packZ*.35
            ],
            fov:narrow?51:40
          };

        case "stretch":
          return{
            eye:[
              packX-15,
              13.5*distanceBoost,
              39*distanceBoost
            ],
            target:[
              packX+8,
              1.7,
              packZ*.25
            ],
            fov:narrow?51:41
          };

        case "finish":
          return{
            eye:[
              61,
              13*distanceBoost,
              36*distanceBoost
            ],
            target:[69,1.7,0],
            fov:narrow?48:36
          };

        case "topdown":
          return{
            eye:[
              2,
              70*distanceBoost,
              6
            ],
            target:[
              2,
              0,
              0
            ],
            fov:narrow?64:58
          };

        case "free":{
          const free=this.freeCamera;
          const cosPitch=Math.cos(free.pitch);
          const eyeX=
            free.target[0]+
            Math.cos(free.yaw)*
            cosPitch*
            free.distance;
          const eyeZ=
            free.target[2]+
            Math.sin(free.yaw)*
            cosPitch*
            free.distance;
          const eyeY=
            free.target[1]+
            Math.sin(free.pitch)*
            free.distance;
          return{
            eye:[
              eyeX,
              eyeY,
              eyeZ
            ],
            target:[
              free.target[0],
              free.target[1],
              free.target[2]
            ],
            fov:narrow?52:47
          };
        }

        case "pack":
          return{
            eye:[
              packX-10,
              16*distanceBoost,
              48*distanceBoost
            ],
            target:[
              packX+4,
              1.8,
              packZ*.24
            ],
            fov:narrow?53:44
          };

        case "wide":
        default:
          return{
            eye:[
              0,
              27*distanceBoost,
              67*distanceBoost
            ],
            target:[1,1.6,0],
            fov:narrow?58:47
          };
      }
    }

    updateCamera(appState,deltaSeconds){
      this.cameraTarget=this.cameraPlan(appState);

      const alpha=this.reducedMotion
        ?1
        :expAlpha(2.7,deltaSeconds);

      for(let index=0;index<3;index++){
        this.camera.eye[index]=lerp(
          this.camera.eye[index],
          this.cameraTarget.eye[index],
          alpha
        );

        this.camera.target[index]=lerp(
          this.camera.target[index],
          this.cameraTarget.target[index],
          alpha
        );
      }

      this.camera.fov=lerp(
        this.camera.fov,
        this.cameraTarget.fov,
        alpha
      );

      const projection=mat4Perspective(
        this.camera.fov*PI/180,
        this.canvas.width/Math.max(1,this.canvas.height),
        .15,
        280
      );

      const view=mat4LookAt(
        this.camera.eye,
        this.camera.target,
        [0,1,0]
      );

      this.viewProjection=mat4Multiply(projection,view);
    }

    updateHorseVisuals(appState,deltaSeconds){
      const fieldIds=new Set();

      (appState?.horses||[]).forEach(horse=>{
        fieldIds.add(horse.id);

        const target=this.worldPositionForHorse(horse,appState);
        let visual=this.horseVisuals.get(horse.id);

        if(!visual){
          const seed=this.sceneSeed+horse.id*137.17;

          visual={
            x:target.x,
            z:target.z,
            targetX:target.x,
            targetZ:target.z,

            /*
              Per-horse animation DNA makes the field feel organic
              instead of every runner moving in lockstep.
            */
            phase:seededUnit(seed)*Math.PI*2,
            cadence:.91+seededUnit(seed+11)*.18,
            stride:.92+seededUnit(seed+23)*.18,
            bounce:.84+seededUnit(seed+37)*.34,
            neckMotion:.78+seededUnit(seed+41)*.34,
            tailMotion:.80+seededUnit(seed+53)*.42,
            jockeyMotion:.82+seededUnit(seed+67)*.26,
            foreBias:seededUnit(seed+79)*.16-.08,
            bodyRoll:.88+seededUnit(seed+91)*.28
          };

          this.horseVisuals.set(horse.id,visual);
        }else{
          /*
            Defensive migration for visual records created by an
            older/reset scene. Never allow one missing animation
            parameter to propagate NaN into the WebGL transforms.
          */
          const seed=this.sceneSeed+horse.id*137.17;

          if(!Number.isFinite(visual.phase)){
            visual.phase=seededUnit(seed)*Math.PI*2;
          }
          if(!Number.isFinite(visual.cadence)){
            visual.cadence=.91+seededUnit(seed+11)*.18;
          }
          if(!Number.isFinite(visual.stride)){
            visual.stride=.92+seededUnit(seed+23)*.18;
          }
          if(!Number.isFinite(visual.bounce)){
            visual.bounce=.84+seededUnit(seed+37)*.34;
          }
          if(!Number.isFinite(visual.neckMotion)){
            visual.neckMotion=.78+seededUnit(seed+41)*.34;
          }
          if(!Number.isFinite(visual.tailMotion)){
            visual.tailMotion=.80+seededUnit(seed+53)*.42;
          }
          if(!Number.isFinite(visual.jockeyMotion)){
            visual.jockeyMotion=.82+seededUnit(seed+67)*.26;
          }
          if(!Number.isFinite(visual.foreBias)){
            visual.foreBias=seededUnit(seed+79)*.16-.08;
          }
          if(!Number.isFinite(visual.bodyRoll)){
            visual.bodyRoll=.88+seededUnit(seed+91)*.28;
          }
        }

        visual.targetX=target.x;
        visual.targetZ=target.z;

        const alpha=this.reducedMotion
          ?1
          :expAlpha(8.5,deltaSeconds);

        visual.x=lerp(visual.x,visual.targetX,alpha);
        visual.z=lerp(visual.z,visual.targetZ,alpha);

        const speed=clamp(Number(horse.currentSpeed)||0,0,1.6);
        const isRunning=
          (
            appState?.phase==="live"||
            appState?.phase==="finished"
          )&&
          !horse.finished;

        /*
          Cadence is driven by actual race speed while each horse
          retains a slightly different natural stride rate.
        */
        const gaitRate=isRunning
          ?(
            5.15+
            speed*5.15
          )*
          visual.cadence
          :0;

        visual.phase+=deltaSeconds*gaitRate;
      });

      [...this.horseVisuals.keys()].forEach(id=>{
        if(!fieldIds.has(id)){
          this.horseVisuals.delete(id);
        }
      });
    }

    environmentPalette(appState){
      const surface=appState?.profile?.surface||"Dirt";
      const condition=appState?.trackCondition||{};
      const wetness=clamp(Number(condition.wetness)||0,0,1);
      const weather=appState?.weather?.name||"Sunny";

      const baseSurface=
        surface==="Turf"
          ?[.12,.39,.17]
          :[.43,.27,.16];

      const wetSurface=
        surface==="Turf"
          ?[.075,.22,.10]
          :[.22,.15,.11];

      let sky=[.45,.62,.70];
      let fog=[.52,.64,.65];
      let ambient=[.39,.43,.40];
      let light=[1.0,.92,.76];
      let lightDirection=[-.48,-1.0,-.34];

      if(weather==="Overcast"){
        sky=[.35,.42,.45];
        fog=[.46,.52,.52];
        ambient=[.47,.49,.48];
        light=[.76,.80,.79];
        lightDirection=[-.28,-1.0,-.20];
      }else if(weather==="Golden Hour"){
        sky=[.61,.48,.34];
        fog=[.68,.55,.39];
        ambient=[.43,.37,.30];
        light=[1.0,.70,.40];
        lightDirection=[-.76,-.70,-.25];
      }else if(weather==="Morning Haze"){
        sky=[.50,.57,.55];
        fog=[.61,.65,.60];
        ambient=[.48,.50,.46];
        light=[.84,.84,.72];
        lightDirection=[-.30,-.85,-.18];
      }else if(weather==="Light Rain"){
        sky=[.25,.34,.37];
        fog=[.37,.45,.45];
        ambient=[.42,.45,.44];
        light=[.66,.73,.73];
        lightDirection=[-.22,-1.0,-.18];
      }

      return{
        surface,
        wetness,
        track:mixColor(baseSurface,wetSurface,wetness*.82),
        trackLight:mixColor(
          scaleColor(baseSurface,1.14),
          scaleColor(wetSurface,1.12),
          wetness*.75
        ),
        trackDark:mixColor(
          scaleColor(baseSurface,.68),
          scaleColor(wetSurface,.74),
          wetness
        ),
        infield:
          surface==="Turf"
            ?[.09,.27,.12]
            :[.10,.25,.12],
        sky,
        fog,
        ambient,
        light,
        lightDirection,
        rail:[.78,.79,.72],
        architecture:[.22,.24,.22]
      };
    }

    beginMainPass(palette){
      const gl=this.gl;

      this.activePalette=palette;
      this.currentTransparentPass=false;
      this.instanceBatches=
        this.instanceExtension&&
        this.instancedProgram&&
        this.instanceBuffer
          ?{
              opaque:new Map(),
              transparent:new Map()
            }
          :null;

      gl.useProgram(this.program);

      gl.uniformMatrix4fv(
        this.locations.viewProjection,
        false,
        this.viewProjection
      );

      gl.uniform3fv(
        this.locations.lightDirection,
        palette.lightDirection
      );
      gl.uniform3fv(this.locations.lightColor,palette.light);
      gl.uniform3fv(this.locations.ambientColor,palette.ambient);
      gl.uniform3fv(this.locations.fogColor,palette.fog);
      gl.uniform3fv(this.locations.cameraPosition,this.camera.eye);
      gl.uniform3fv(this.locations.rimColor,[.38,.48,.55]);
      gl.uniform1f(this.locations.fogNear,45);
      gl.uniform1f(this.locations.fogFar,150);

      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }

    drawMesh(
      meshName,
      model,
      color,
      options={}
    ){
      const gl=this.gl;
      const mesh=this.meshes[meshName];

      if(!mesh){
        return;
      }

      const alpha=options.alpha===undefined
        ?1
        :clamp(options.alpha,0,1);

      if(this.instanceBatches){
        const transparent=
          this.currentTransparentPass||
          alpha<.999;
        const collection=
          transparent
            ?this.instanceBatches.transparent
            :this.instanceBatches.opaque;
        const instances=
          collection.get(meshName)||
          [];

        instances.push({
          model,
          color,
          alpha,
          emissive:
            clamp(
              options.emissive||0,
              0,
              1
            ),
          rim:
            clamp(
              options.rim||0,
              0,
              1
            )
        });

        collection.set(
          meshName,
          instances
        );

        return;
      }

      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertexBuffer);
      gl.enableVertexAttribArray(this.locations.position);
      gl.vertexAttribPointer(
        this.locations.position,
        3,
        gl.FLOAT,
        false,
        24,
        0
      );
      gl.enableVertexAttribArray(this.locations.normal);
      gl.vertexAttribPointer(
        this.locations.normal,
        3,
        gl.FLOAT,
        false,
        24,
        12
      );

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer);

      gl.uniformMatrix4fv(this.locations.model,false,model);
      gl.uniformMatrix3fv(
        this.locations.normalMatrix,
        false,
        normalMatrixFromTRS(model)
      );
      gl.uniform3fv(this.locations.color,color);
      gl.uniform1f(this.locations.alpha,alpha);
      gl.uniform1f(
        this.locations.emissive,
        clamp(options.emissive||0,0,1)
      );
      gl.uniform1f(
        this.locations.rimAmount,
        clamp(options.rim||0,0,1)
      );

      gl.drawElements(
        gl.TRIANGLES,
        mesh.count,
        mesh.type,
        0
      );
    }

    drawSegment(start,end,radius,color,options={}){
      const dx=end[0]-start[0];
      const dy=end[1]-start[1];
      const dz=end[2]-start[2];
      const length=Math.hypot(dx,dy,dz);

      if(length<EPSILON){
        return;
      }

      /*
        Horse limbs and reins are constrained mostly to the
        X/Y plane. A Y-axis cylinder rotated around Z gives a
        clean low-poly articulated segment without a dependency
        on quaternion libraries.
      */
      const angle=-Math.atan2(dx,dy);
      const midpoint=[
        (start[0]+end[0])*.5,
        (start[1]+end[1])*.5,
        (start[2]+end[2])*.5
      ];

      this.drawMesh(
        "cylinder",
        mat4TRS(
          midpoint[0],
          midpoint[1],
          midpoint[2],
          0,
          0,
          angle,
          radius*2,
          length,
          radius*2
        ),
        color,
        options
      );
    }

    setTransparentPass(enabled){
      this.currentTransparentPass=
        Boolean(enabled);

      if(this.instanceBatches){
        return;
      }

      const gl=this.gl;

      if(enabled){
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);
      }else{
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
      }
    }

    applyInstancedUniforms(palette){
      const gl=this.gl;
      const locations=
        this.instancedLocations;

      gl.uniformMatrix4fv(
        locations.viewProjection,
        false,
        this.viewProjection
      );
      gl.uniform3fv(
        locations.lightDirection,
        palette.lightDirection
      );
      gl.uniform3fv(
        locations.lightColor,
        palette.light
      );
      gl.uniform3fv(
        locations.ambientColor,
        palette.ambient
      );
      gl.uniform3fv(
        locations.fogColor,
        palette.fog
      );
      gl.uniform3fv(
        locations.cameraPosition,
        this.camera.eye
      );
      gl.uniform3fv(
        locations.rimColor,
        [.38,.48,.55]
      );
      gl.uniform1f(
        locations.fogNear,
        45
      );
      gl.uniform1f(
        locations.fogFar,
        150
      );
    }

    flushInstanceCollection(
      collection,
      transparent
    ){
      if(
        !collection||
        !collection.size||
        !this.instanceExtension||
        !this.instancedProgram||
        !this.instanceBuffer
      ){
        return;
      }

      const gl=this.gl;
      const extension=
        this.instanceExtension;
      const locations=
        this.instancedLocations;
      const strideFloats=22;
      const strideBytes=
        strideFloats*
        4;

      gl.useProgram(
        this.instancedProgram
      );
      this.applyInstancedUniforms(
        this.activePalette
      );

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);

      if(transparent){
        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);
      }else{
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
      }

      collection.forEach(
        (
          instances,
          meshName
        )=>{
          const mesh=
            this.meshes[
              meshName
            ];

          if(
            !mesh||
            !instances.length
          ){
            return;
          }

          const values=
            new Float32Array(
              instances.length*
              strideFloats
            );

          instances.forEach(
            (
              instance,
              index
            )=>{
              const offset=
                index*
                strideFloats;

              values.set(
                instance.model,
                offset
              );

              values[
                offset+
                16
              ]=
                instance.color[0];
              values[
                offset+
                17
              ]=
                instance.color[1];
              values[
                offset+
                18
              ]=
                instance.color[2];
              values[
                offset+
                19
              ]=
                instance.alpha;
              values[
                offset+
                20
              ]=
                instance.emissive;
              values[
                offset+
                21
              ]=
                instance.rim;
            }
          );

          gl.bindBuffer(
            gl.ARRAY_BUFFER,
            mesh.vertexBuffer
          );

          gl.enableVertexAttribArray(
            locations.position
          );
          gl.vertexAttribPointer(
            locations.position,
            3,
            gl.FLOAT,
            false,
            24,
            0
          );
          extension.vertexAttribDivisorANGLE(
            locations.position,
            0
          );

          gl.enableVertexAttribArray(
            locations.normal
          );
          gl.vertexAttribPointer(
            locations.normal,
            3,
            gl.FLOAT,
            false,
            24,
            12
          );
          extension.vertexAttribDivisorANGLE(
            locations.normal,
            0
          );

          gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            mesh.indexBuffer
          );

          gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.instanceBuffer
          );
          gl.bufferData(
            gl.ARRAY_BUFFER,
            values,
            gl.DYNAMIC_DRAW
          );

          for(
            let column=0;
            column<4;
            column++
          ){
            const location=
              locations.model+
              column;

            gl.enableVertexAttribArray(
              location
            );
            gl.vertexAttribPointer(
              location,
              4,
              gl.FLOAT,
              false,
              strideBytes,
              column*
              16
            );
            extension.vertexAttribDivisorANGLE(
              location,
              1
            );
          }

          gl.enableVertexAttribArray(
            locations.color
          );
          gl.vertexAttribPointer(
            locations.color,
            4,
            gl.FLOAT,
            false,
            strideBytes,
            64
          );
          extension.vertexAttribDivisorANGLE(
            locations.color,
            1
          );

          gl.enableVertexAttribArray(
            locations.params
          );
          gl.vertexAttribPointer(
            locations.params,
            2,
            gl.FLOAT,
            false,
            strideBytes,
            80
          );
          extension.vertexAttribDivisorANGLE(
            locations.params,
            1
          );

          extension.drawElementsInstancedANGLE(
            gl.TRIANGLES,
            mesh.count,
            mesh.type,
            0,
            instances.length
          );

          for(
            let column=0;
            column<4;
            column++
          ){
            const location=
              locations.model+
              column;

            extension.vertexAttribDivisorANGLE(
              location,
              0
            );
            gl.disableVertexAttribArray(
              location
            );
          }

          extension.vertexAttribDivisorANGLE(
            locations.color,
            0
          );
          extension.vertexAttribDivisorANGLE(
            locations.params,
            0
          );
          gl.disableVertexAttribArray(
            locations.color
          );
          gl.disableVertexAttribArray(
            locations.params
          );
        }
      );
    }

    flushInstanceBatches(){
      if(!this.instanceBatches){
        return;
      }

      this.flushInstanceCollection(
        this.instanceBatches.opaque,
        false
      );
      this.flushInstanceCollection(
        this.instanceBatches.transparent,
        true
      );

      this.instanceBatches=null;
      this.currentTransparentPass=false;

      const gl=this.gl;
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
      gl.useProgram(this.program);
    }

    drawSkyAndHorizon(appState,palette){
      /*
        WebGL clear colors are flat, so three shallow planes
        create a real perspective horizon and atmospheric band.
      */
      this.drawMesh(
        "cube",
        mat4TRS(0,26,-92,0,0,0,520,42,.4),
        palette.sky,
        {emissive:.34}
      );

      this.drawMesh(
        "cube",
        mat4TRS(0,8,-90,0,0,0,520,13,.45),
        mixColor(palette.sky,palette.fog,.72),
        {emissive:.28}
      );

      const weather=appState?.weather?.name||"Sunny";

      if(weather==="Golden Hour"||weather==="Sunny"){
        const sunColor=
          weather==="Golden Hour"
            ?[1.0,.70,.30]
            :[1.0,.92,.66];

        this.drawMesh(
          "sphere",
          mat4TRS(
            weather==="Golden Hour"?-38:36,
            weather==="Golden Hour"?18:25,
            -88,
            0,0,0,
            weather==="Golden Hour"?7:5,
            weather==="Golden Hour"?7:5,
            1.1
          ),
          sunColor,
          {emissive:1}
        );
      }
    }

    drawTrackSurface(appState,palette){
      const surface=palette.surface;
      const wetness=palette.wetness;

      this.drawMesh(
        "plane",
        mat4TRS(0,-.07,0,0,0,0,190,1,100),
        palette.infield
      );

      this.drawMesh(
        "plane",
        mat4TRS(0,0,0,0,0,0,174,1,52),
        palette.track,
        {rim:.04}
      );

      if(surface==="Turf"){
        for(let stripe=-24,index=0;stripe<24;stripe+=4,index++){
          this.drawMesh(
            "plane",
            mat4TRS(
              0,
              .012,
              stripe+2,
              0,0,0,
              172,
              1,
              3.95
            ),
            index%2===0
              ?palette.trackLight
              :scaleColor(palette.track,.91),
            {alpha:.72}
          );
        }
      }else{
        for(let rut=-22;rut<=22;rut+=3.6){
          this.drawMesh(
            "plane",
            mat4TRS(0,.011,rut,0,0,0,170,1,.12),
            palette.trackDark,
            {alpha:.42}
          );
        }

        for(let mark=-78;mark<=78;mark+=13){
          this.drawMesh(
            "plane",
            mat4TRS(
              mark,
              .013,
              0,
              0,0,0,
              .12,
              1,
              49
            ),
            palette.trackLight,
            {alpha:.10}
          );
        }
      }

      const count=Math.max(1,appState?.horses?.length||1);

      for(let lane=1;lane<count;lane++){
        const z=-18+lane/count*36;

        this.drawMesh(
          "plane",
          mat4TRS(0,.025,z,0,0,0,168,1,.055),
          surface==="Turf"
            ?[.72,.80,.62]
            :[.74,.62,.48],
          {alpha:.20}
        );
      }

      if(wetness>.28){
        this.setTransparentPass(true);

        for(let streak=-19;streak<=19;streak+=6.5){
          this.drawMesh(
            "plane",
            mat4TRS(10,.035,streak,0,0,0,130,1,.15),
            [.72,.79,.76],
            {alpha:.025+wetness*.055,emissive:.18}
          );
        }

        this.setTransparentPass(false);
      }
    }

    drawGrandstand(appState,palette){
      const venue=String(appState?.profile?.track||"Racecourse");
      const baseColor=palette.architecture;
      const roofColor=
        venue.includes("Saratoga")
          ?[.34,.16,.13]
          :venue.includes("Churchill")
            ?[.38,.32,.23]
            :[.23,.27,.25];

      const width=venue.includes("Belmont")
        ?144
        :112;

      this.drawMesh(
        "cube",
        mat4TRS(0,5.0,-46,0,0,0,width,8.0,7.0),
        baseColor
      );

      this.drawMesh(
        "cube",
        mat4TRS(0,9.4,-45.5,0,0,-.015,width+8,.55,9.0),
        roofColor,
        {rim:.08}
      );

      for(let row=0;row<4;row++){
        this.drawMesh(
          "cube",
          mat4TRS(
            0,
            2.25+row*1.45,
            -42.9-row*.54,
            0,0,0,
            width-8,
            .36,
            .55
          ),
          row%2===0
            ?[.33,.35,.32]
            :[.26,.29,.27]
        );
      }

      for(let x=-width*.44;x<=width*.44;x+=8.5){
        this.drawMesh(
          "cube",
          mat4TRS(x,5.0,-42.35,0,0,0,.20,7.1,.24),
          [.54,.54,.48]
        );
      }

      const settings=this.qualitySettings();

      if(settings.horseDetail>0){
        for(let x=-width*.42,index=0;x<=width*.42;x+=4.2,index++){
          const crowdColor=
            index%4===0
              ?[.58,.24,.20]
              :index%4===1
                ?[.25,.38,.56]
                :index%4===2
                  ?[.72,.67,.48]
                  :[.34,.45,.31];

          this.drawMesh(
            "sphere",
            mat4TRS(
              x,
              3.1+(index%3)*1.35,
              -42.2-(index%2)*.28,
              0,0,0,
              .35,.46,.28
            ),
            crowdColor
          );
        }
      }
    }

    drawTree(x,z,size,index,palette,palm=false){
      const trunkColor=palm
        ?[.30,.22,.13]
        :[.24,.18,.11];

      this.drawMesh(
        "cylinder",
        mat4TRS(x,size*.46,z,0,0,index*.03,size*.17,size*.92,size*.17),
        trunkColor
      );

      if(palm){
        for(let frond=0;frond<5;frond++){
          const angle=frond/5*PI*2;

          this.drawMesh(
            "sphere",
            mat4TRS(
              x+Math.cos(angle)*size*.44,
              size*.98+Math.sin(angle*2)*size*.06,
              z+Math.sin(angle)*size*.33,
              0,angle,0,
              size*.82,
              size*.22,
              size*.38
            ),
            [.12,.32,.15]
          );
        }
      }else{
        const foliage=
          index%3===0
            ?[.10,.28,.13]
            :index%3===1
              ?[.13,.33,.16]
              :[.09,.24,.12];

        this.drawMesh(
          "sphere",
          mat4TRS(
            x,
            size*1.05,
            z,
            0,0,0,
            size*1.35,
            size*.88,
            size
          ),
          foliage
        );

        this.drawMesh(
          "sphere",
          mat4TRS(
            x-size*.42,
            size*.96,
            z+.06,
            0,0,0,
            size*.86,
            size*.70,
            size*.76
          ),
          scaleColor(foliage,.92)
        );
      }
    }

    drawTrees(appState,palette){
      const settings=this.qualitySettings();
      const venue=String(appState?.profile?.track||"");
      const palm=venue.includes("Gulfstream");
      const count=settings.treeCount;

      for(let index=0;index<count;index++){
        const seed=this.sceneSeed+index*7919;
        const x=-82+index*(164/Math.max(1,count-1))+
          (seededUnit(seed)-.5)*5;
        const z=-34-(seededUnit(seed+31)*4);
        const size=2.8+seededUnit(seed+79)*2.0;

        this.drawTree(x,z,size,index,palette,palm);
      }
    }

    drawVenueLandmarks(appState,palette){
      const venue=String(appState?.profile?.track||"");

      if(venue.includes("Churchill")){
        [-12,12].forEach((x,index)=>{
          this.drawMesh(
            "cube",
            mat4TRS(x,12.2,-43.2,0,0,0,2.3,8.0,2.3),
            [.52,.43,.29]
          );

          this.drawMesh(
            "cone",
            mat4TRS(x,17.4,-43.2,0,0,0,3.0,6.0,3.0),
            [.70,.57,.34],
            {rim:.12}
          );

          this.drawMesh(
            "cone",
            mat4TRS(
              x+(index===0?-.72:.72),
              19.1,
              -43.2,
              0,0,0,
              1.1,3.2,1.1
            ),
            [.82,.72,.48],
            {emissive:.06}
          );
        });
      }

      if(venue.includes("Santa Anita")){
        [
          [-48,13,18],
          [-18,17,25],
          [18,14,21],
          [51,19,28]
        ].forEach((mountain,index)=>{
          this.drawMesh(
            "cone",
            mat4TRS(
              mountain[0],
              mountain[1]*.45,
              -72-index,
              0,0,index*.08,
              mountain[2],
              mountain[1],
              7
            ),
            index%2===0
              ?[.31,.32,.29]
              :[.38,.37,.31]
          );
        });
      }

      if(venue.includes("Keeneland")){
        for(let x=-70;x<=70;x+=10){
          this.drawMesh(
            "sphere",
            mat4TRS(x,2.8,-38,0,0,0,10,5.2,3.3),
            [ .12,.31,.14 ]
          );
        }
      }

      if(venue.includes("Belmont")){
        this.drawMesh(
          "cube",
          mat4TRS(0,10.5,-46,0,0,0,156,.40,5.0),
          [.50,.54,.50]
        );
      }

      if(venue.includes("Saratoga")){
        for(let x=-46;x<=46;x+=23){
          this.drawMesh(
            "cone",
            mat4TRS(x,11.6,-44,0,0,0,5.5,5.6,5.5),
            [.38,.17,.14]
          );
        }
      }
    }

    drawTrackLights(appState,palette){
      const weather=appState?.weather?.name||"Sunny";
      const brightness=
        weather==="Light Rain"||
        weather==="Overcast"
          ?1
          :.65;

      for(let x=-72;x<=72;x+=24){
        this.drawMesh(
          "cylinder",
          mat4TRS(x,7.0,-31.5,0,0,0,.24,14,.24),
          [.32,.34,.31]
        );

        this.drawMesh(
          "sphere",
          mat4TRS(x,14.3,-31.5,0,0,0,1.25,.55,.55),
          [1.0,.91,.66],
          {emissive:brightness}
        );
      }
    }

    drawRails(palette){
      const settings=this.qualitySettings();

      [-25.5,25.5].forEach((z,railIndex)=>{
        const height=railIndex===0?1.65:1.35;

        this.drawMesh(
          "cube",
          mat4TRS(0,height+1.0,z,0,0,0,180,.22,.24),
          palette.rail,
          {rim:.08}
        );

        this.drawMesh(
          "cube",
          mat4TRS(0,height+.35,z,0,0,0,180,.16,.20),
          scaleColor(palette.rail,.82)
        );

        for(let x=-86;x<=86;x+=settings.railStep){
          this.drawMesh(
            "cylinder",
            mat4TRS(x,height*.57,z,0,0,0,.20,height*1.25,.20),
            scaleColor(palette.rail,.72)
          );
        }
      });
    }

    drawDistanceMarkers(){
      const markerData=[
        [-34,[.80,.24,.20]],
        [0,[.94,.92,.84]],
        [34,[.27,.43,.76]],
        [58,[.92,.73,.20]]
      ];

      markerData.forEach(([x,color],index)=>{
        this.drawMesh(
          "cylinder",
          mat4TRS(x,2.6,-24.7,0,0,0,.34,5.2,.34),
          color
        );

        this.drawMesh(
          "sphere",
          mat4TRS(x,5.3,-24.7,0,0,0,1.0,.62,1.0),
          index===1?[.92,.92,.88]:color,
          {emissive:.08}
        );
      });
    }

    drawFinishLine(appState){
      const finishX=70;
      const eco=
        this.qualitySettings().horseDetail===0;
      const rowCount=eco?12:24;
      const rowDepth=48/rowCount;

      for(let column=0;column<2;column++){
        for(let row=0;row<rowCount;row++){
          const white=(column+row)%2===0;

          this.drawMesh(
            "plane",
            mat4TRS(
              finishX-.55+column*.55,
              .045,
              -24+row*rowDepth,
              0,0,0,
              .54,
              1,
              rowDepth-.05
            ),
            white
              ?[.94,.93,.87]
              :[.045,.055,.052],
            {emissive:white?.10:0}
          );
        }
      }

      [-25.2,25.2].forEach(z=>{
        this.drawMesh(
          "cylinder",
          mat4TRS(finishX,4.0,z,0,0,0,.38,8,.38),
          [.90,.89,.82]
        );
      });

      this.drawMesh(
        "cube",
        mat4TRS(finishX,7.65,0,0,0,0,.45,.55,51),
        [.09,.11,.10]
      );

      this.drawMesh(
        "cube",
        mat4TRS(finishX,7.66,0,0,0,0,.48,.28,22),
        appState?.phase==="live"
          ?[.76,.18,.14]
          :[.28,.31,.29],
        {emissive:appState?.phase==="live"?.10:0}
      );
    }

    drawStartGate(appState,palette){
      if(
        appState?.phase!=="countdown"&&
        Number(appState?.raceT)>4
      ){
        return;
      }

      const count=Math.max(1,appState?.horses?.length||1);
      const opacity=appState?.phase==="countdown"?1:.35;

      this.setTransparentPass(opacity<1);

      for(let index=0;index<count;index++){
        const fraction=count===1?.5:index/(count-1);
        const z=-18+fraction*36;

        this.drawMesh(
          "cube",
          mat4TRS(-68.3,2.3,z,0,0,0,.30,4.6,.30),
          [.54,.57,.52],
          {alpha:opacity}
        );

        this.drawMesh(
          "cube",
          mat4TRS(-68.3,4.5,z,0,0,0,2.6,.25,1.35),
          [.32,.35,.32],
          {alpha:opacity}
        );
      }

      this.drawMesh(
        "cube",
        mat4TRS(-68.3,4.8,0,0,0,0,2.7,.36,39),
        [.25,.30,.27],
        {alpha:opacity}
      );

      this.setTransparentPass(false);
    }

    drawEnvironment(appState,palette){
      this.drawSkyAndHorizon(appState,palette);
      this.drawTrackSurface(appState,palette);
      this.drawVenueLandmarks(appState,palette);
      this.drawGrandstand(appState,palette);
      this.drawTrees(appState,palette);
      this.drawTrackLights(appState,palette);
      this.drawRails(palette);
      this.drawDistanceMarkers();
      this.drawFinishLine(appState);
      this.drawStartGate(appState,palette);
    }

    horseColors(horse){
      const main=hexToRgb(
        horse?.coat?.main,
        [.40,.26,.18]
      );
      const light=hexToRgb(
        horse?.coat?.light,
        scaleColor(main,1.25)
      );
      const dark=hexToRgb(
        horse?.coat?.dark,
        scaleColor(main,.42)
      );
      const muzzle=hexToRgb(
        horse?.coat?.muzzle,
        scaleColor(main,.56)
      );
      const silk=hexToRgb(
        horse?.postColor,
        [.45,.62,.88]
      );

      return{main,light,dark,muzzle,silk};
    }

    drawHorseShadow(visual,horse,selected,leader,palette){
      this.setTransparentPass(true);

      if(selected||leader||horse.specialAbilityActive){
        const glowColor=horse.specialAbilityActive
          ?[1.0,.78,.26]
          :selected
            ?[.36,.66,1.0]
            :[.96,.76,.30];

        this.drawMesh(
          "disc",
          mat4TRS(
            visual.x,
            .052,
            visual.z,
            0,0,0,
            selected?6.4:5.5,
            1,
            selected?3.0:2.6
          ),
          glowColor,
          {
            alpha:
              horse.specialAbilityActive
                ?.26
                :.14,
            emissive:.42
          }
        );
      }

      this.drawMesh(
        "disc",
        mat4TRS(
          visual.x-.12,
          .060,
          visual.z,
          0,0,0,
          4.7,
          1,
          1.75
        ),
        [0,0,0],
        {alpha:.31}
      );

      this.setTransparentPass(false);
    }

    drawHorseLeg(
      hipX,
      hipY,
      hipZ,
      phase,
      color,
      darkColor,
      running,
      side,
      role="front",
      strideScale=1
    ){
      /*
        Racehorse gallop pass 2.0

        Each limb follows a real-looking stance/recovery arc:
          1. hoof is planted and swept backward underneath the body
          2. hoof releases from the ground
          3. lower leg folds upward
          4. leg reaches forward and returns to the ground

        The fore/hind limbs use different bend directions and
        proportions. This is still procedural, so it stays light
        enough for large fields on mobile.
      */
      const TAU=Math.PI*2;
      const cycle=((phase%TAU)+TAU)%TAU;
      const u=cycle/TAU;
      const isFront=role==="front";

      const l1=isFront?1.08:1.00;
      const l2=isFront?.96:1.03;

      const stance=.43+(isFront?.015:.025);
      const release=stance;
      const stride=
        strideScale*
        (
          isFront
            ?1.14
            :1.06
        );

      let footForward;
      let lift=0;

      if(u<release){
        const s=u/release;

        /*
          During stance the body passes over the planted hoof,
          so the hoof travels smoothly rearward relative to the body.
        */
        const eased=s*s*(3-2*s);
        footForward=
          (isFront?.56:.48)-
          (
            isFront
              ?1.38
              :1.25
          )*
          eased*
          stride;

      }else{
        const s=
          clamp(
            (u-release)/
            (1-release),
            0,
            1
          );

        const eased=s*s*(3-2*s);
        const arc=Math.sin(Math.PI*s);

        footForward=
          (isFront?-0.82:-0.76)+
          (
            isFront
              ?1.72
              :1.57
          )*
          eased*
          stride;

        lift=
          Math.pow(
            Math.max(0,arc),
            1.16
          )*
          (
            isFront
              ?.72
              :.63
          )*
          strideScale;
      }

      const hip=[
        hipX,
        hipY,
        hipZ
      ];

      const hoofY=
        Math.max(
          .18,
          .17+lift
        );

      const hoof=[
        hipX+
          (
            footForward-
            (
              isFront
                ?0.08
                :-.02
            )
          ),
        hoofY,
        hipZ+
          side*
          (
            .055+
            lift*.055
          )
      ];

      /*
        Two-bone IK places a believable knee/hock between the hip
        and hoof. The bend direction differs between fore and hind
        limbs, which avoids the "four identical sticks" look.
      */
      const dx=hoof[0]-hip[0];
      const dy=hoof[1]-hip[1];
      const dz=hoof[2]-hip[2];

      const planarDistance=
        Math.max(
          .001,
          Math.hypot(
            dx,
            dy
          )
        );

      const maxReach=
        l1+
        l2-
        .035;

      const distance=
        clamp(
          planarDistance,
          Math.abs(l1-l2)+.035,
          maxReach
        );

      const nx=
        dx/planarDistance;
      const ny=
        dy/planarDistance;

      const a=
        (
          l1*l1-
          l2*l2+
          distance*distance
        )/
        (
          2*
          distance
        );

      const h=
        Math.sqrt(
          Math.max(
            .001,
            l1*l1-
            a*a
          )
        );

      const baseX=
        hip[0]+
        nx*a;
      const baseY=
        hip[1]+
        ny*a;

      /*
        Fore knees fold forward. Hind hocks fold subtly backward.
        Alternating the bend side keeps the two sides of the horse
        from looking mirrored or robotic.
      */
      const bendDirection=
        (
          isFront
            ?1
            :-1
        )*
        (
          side>0
            ?1
            :-.88
        );

      const perpX=-ny;
      const perpY=nx;

      const knee=[
        baseX+
          perpX*
          h*
          bendDirection,
        baseY+
          perpY*
          h*
          bendDirection,
        hipZ+
          (
            side*
            (
              .10+
              lift*.10
            )
          )
      ];

      /*
        During stance the fetlock stays compressed. During flight
        it opens, which makes the silhouette noticeably more
        horse-like at speed.
      */
      const fetlockLift=
        lift*
        (
          isFront
            ?.18
            :.12
        );

      const fetlock=[
        hoof[0]+
          (
            isFront
              ?.08
              :-.04
          )*
          strideScale,
        hoof[1]+
          fetlockLift,
        hoof[2]
      ];

      this.drawSegment(
        hip,
        knee,
        isFront?.12:.125,
        color
      );

      this.drawSegment(
        knee,
        fetlock,
        isFront?.088:.094,
        darkColor
      );

      this.drawSegment(
        fetlock,
        hoof,
        isFront?.062:.068,
        darkColor
      );

      /*
        Fetlock and hoof blocks provide a little extra silhouette
        and catch highlights in the closer camera shots.
      */
      this.drawMesh(
        "sphere",
        mat4TRS(
          fetlock[0],
          fetlock[1],
          fetlock[2],
          0,0,0,
          .13,
          .13,
          .115
        ),
        darkColor,
        {
          alpha:1
        }
      );

      this.drawMesh(
        "cube",
        mat4TRS(
          hoof[0]+
            (
              isFront
                ?.08
                :.05
            ),
          .13,
          hoof[2],
          0,
          0,
          isFront
            ?-.08
            :.04,
          .34,
          .12,
          .24
        ),
        [.038,.029,.023]
      );
    }

    drawHorse(horse,visual,appState,palette,timestamp){
      const colors=this.horseColors(horse);
      const selected=horse.id===appState?.selected;
      const leader=
        appState?.phase==="live"&&
        horse.position===1;

      /*
        Animation ownership is per horse. Once a runner crosses
        the line it settles into a compact resting pose while the
        unfinished runners continue through their gallop cycle.
      */
      const running=
        (
          appState?.phase==="live"||
          appState?.phase==="finished"
        )&&
        !horse.finished;

      const speed=clamp(
        Number(horse.currentSpeed)||0,
        0,
        1.6
      );

      const speedFactor=
        clamp(
          speed/1.35,
          0,
          1
        );

      const detail=
        this.qualitySettings().horseDetail;

      const TAU=Math.PI*2;
      const cycle=
        ((visual.phase%TAU)+TAU)%TAU;

      const profile=visual;

      /*
        Realistic motion:
          - suspension lifts the torso before hoof contact
          - the back compresses at landing
          - head/neck counter-bob slightly later than the body
          - the jockey follows the horse's center of gravity
      */
      const drive=Math.sin(cycle);
      const suspensionWave=
        Math.max(
          0,
          Math.sin(
            cycle+
            Math.PI*.32
          )
        );

      const bodyBounce=running
        ?(
          suspensionWave*
          (
            .032+
            .052*
            speedFactor*
            profile.bounce
          )+
          Math.sin(
            cycle*2+
            .22
          )*
          (
            .018+
            .028*
            speedFactor
          )*
          profile.bounce
        )
        :0;

      const bodyLift=
        running
          ?suspensionWave*
           (
             .014+
             .024*
             speedFactor
           )
          :0;

      const bodyY=
        1.88+
        bodyBounce+
        bodyLift;

      const bodyPitch=running
        ?(
          Math.sin(
            cycle*2+
            Math.PI*.20
          )*
          (
            .016+
            .028*
            speedFactor
          )*
          (
            .90+
            profile.stride*.20
          )
        )
        :0;

      const bodyRoll=running
        ?Math.sin(
            cycle+
            Math.PI*.56
          )*
          (
            .009+
            .018*
            speedFactor
          )*
          profile.bodyRoll
        :0;

      const neckBob=running
        ?Math.sin(
            cycle+
            Math.PI*.60
          )*
          (
            .028+
            .050*
            speedFactor
          )*
          profile.neckMotion
        :0;

      const headBob=running
        ?Math.sin(
            cycle+
            Math.PI*.93
          )*
          (
            .018+
            .034*
            speedFactor
          )
        :0;

      const neckDrive=running
        ?Math.sin(
            cycle+
            Math.PI*.72
          )*
          (
            .025+
            .050*
            speedFactor
          )*
          profile.neckMotion
        :0;

      const strideExtension=
        profile.stride*
        (
          .94+
          speedFactor*.16
        );

      this.drawHorseShadow(
        visual,
        horse,
        selected,
        leader,
        palette
      );

      /*
        The four limbs are phase-separated in the order commonly
        seen in a racing gallop. The tiny asymmetries prevent the
        field from looking like duplicated animation clips.
      */
      const legData=[
        {
          x:-1.02,
          z:-.43,
          offset:.00,
          side:-1,
          role:"hind"
        },
        {
          x:-.88,
          z:.38,
          offset:Math.PI*.24,
          side:1,
          role:"hind"
        },
        {
          x:.82,
          z:.40,
          offset:Math.PI*.50,
          side:1,
          role:"front"
        },
        {
          x:1.00,
          z:-.37,
          offset:Math.PI*.77,
          side:-1,
          role:"front"
        }
      ];

      legData.forEach(
        (
          leg,
          index
        )=>{
          const phase=
            visual.phase+
            leg.offset+
            (
              index%2===0
                ?.035
                :-.027
            )*
            profile.stride;

          const legColor=
            index===1||
            index===3
              ?mixColor(
                  colors.main,
                  colors.light,
                  .06
                )
              :scaleColor(
                  colors.main,
                  .76
                );

          const hipShift=
            leg.role==="front"
              ?strideExtension*.055
              :-strideExtension*.045;

          this.drawHorseLeg(
            visual.x+
              leg.x+
              hipShift,
            bodyY-
              .24+
              suspensionWave*
              .018,
            visual.z+
              leg.z,
            phase,
            legColor,
            colors.dark,
            running,
            leg.side,
            leg.role,
            strideExtension
          );
        }
      );

      /*
        Belly volume — the real "barrel" should read as one animal
        rather than a single capsule.
      */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x-.12,
          bodyY,
          visual.z,
          0,
          bodyRoll,
          bodyPitch+
            .005,
          3.72+
            speedFactor*.10,
          1.18+
            speedFactor*.04,
          1.08
        ),
        colors.main,
        {
          rim:
            selected||leader
              ?.30
              :.08
        }
      );

      /*
        Rib cage / barrel highlight.
      */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x-.34,
          bodyY+.04,
          visual.z,
          0,
          bodyRoll*.8,
          bodyPitch*.78,
          2.26,
          1.04,
          1.04
        ),
        mixColor(
          colors.main,
          colors.light,
          .09
        ),
        {rim:.045}
      );

      /*
        Strong hindquarters — important to the silhouette of a
        galloping thoroughbred.
      */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x-1.07,
          bodyY+.08,
          visual.z,
          0,
          bodyRoll*.70,
          bodyPitch*.82,
          1.62,
          1.22,
          1.06
        ),
        mixColor(
          colors.main,
          colors.light,
          .16
        ),
        {rim:.065}
      );

      /* Shoulder / withers */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+.79,
          bodyY+.15,
          visual.z,
          0,
          bodyRoll*.75,
          bodyPitch*1.18,
          1.56,
          1.24,
          1.05
        ),
        mixColor(
          colors.main,
          colors.light,
          .24
        ),
        {rim:.085}
      );

      /* Chest projecting forward */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+1.25,
          bodyY+.01,
          visual.z,
          0,
          bodyRoll,
          bodyPitch+
            .02,
          .74,
          .94,
          .94
        ),
        mixColor(
          colors.main,
          colors.light,
          .18
        )
      );

      /* Underbody shadow/belly edge */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x-.10,
          bodyY-.30,
          visual.z,
          0,
          0,
          bodyPitch*.55,
          2.36,
          .63,
          .92
        ),
        mixColor(
          colors.main,
          colors.dark,
          .22
        )
      );

      /*
        Neck is built as a three-point curve. The lower section is
        thicker at the withers and tapers toward the poll.
      */
      const neckBase=[
        visual.x+1.03,
        bodyY+.31,
        visual.z
      ];

      const neckMid=[
        visual.x+1.43+
          neckDrive*.38,
        bodyY+.78+
          neckBob+
          neckDrive*.20,
        visual.z
      ];

      const neckTop=[
        visual.x+1.82+
          speedFactor*.05+
          neckDrive*.28,
        bodyY+1.22+
          neckBob,
        visual.z
      ];

      this.drawSegment(
        neckBase,
        neckMid,
        .43,
        mixColor(
          colors.main,
          colors.light,
          .12
        ),
        {rim:.12}
      );

      this.drawSegment(
        neckMid,
        neckTop,
        .34,
        mixColor(
          colors.main,
          colors.light,
          .08
        ),
        {rim:.09}
      );

      /*
        Throatlatch / underside plane.
      */
      this.drawSegment(
        [
          neckBase[0]+.08,
          neckBase[1]-.02,
          neckBase[2]
        ],
        [
          neckTop[0]-.06,
          neckTop[1]-.10,
          neckTop[2]
        ],
        .16,
        colors.dark
      );

      /* Head / poll */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+2.17+
            speedFactor*.03+
            neckDrive*.08,
          bodyY+1.37+
            neckBob+
            headBob,
          visual.z,
          0,
          .035,
          -.10,
          1.38,
          .75,
          .70
        ),
        colors.main,
        {rim:.12}
      );

      /* Long tapered muzzle */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+2.67+
            speedFactor*.06+
            neckDrive*.05,
          bodyY+1.22+
            neckBob+
            headBob,
          visual.z,
          0,
          -.025,
          -.07,
          .92,
          .47,
          .56
        ),
        colors.muzzle
      );

      /* Jaw / lower cheek */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+2.37,
          bodyY+1.12+
            neckBob*.75+
            headBob*.7,
          visual.z,
          0,
          0,
          -.03,
          .66,
          .36,
          .53
        ),
        mixColor(
          colors.main,
          colors.dark,
          .22
        )
      );

      if(detail>0){
        /* Ears respond slightly to the gait but stay pointed forward. */
        [-.18,.18].forEach(
          (
            zOffset,
            index
          )=>{
            const earTilt=
              Math.sin(
                cycle+
                index*.50
              )*
              (
                .025+
                speedFactor*.035
              );

            this.drawMesh(
              "cone",
              mat4TRS(
                visual.x+1.92+
                  index*.19+
                  neckDrive*.03,
                bodyY+1.91+
                  neckBob+
                  headBob*.55,
                visual.z+
                  zOffset,
                0,
                0,
                index===0
                  ?-.14+
                    earTilt
                  :.06-
                    earTilt,
                .25,
                .64,
                .23
              ),
              colors.dark
            );
          }
        );

        /* Eye */
        this.drawMesh(
          "sphere",
          mat4TRS(
            visual.x+2.39,
            bodyY+1.52+
              neckBob+
              headBob,
            visual.z+.33,
            0,0,0,
            .09,.09,.07
          ),
          [.012,.012,.010],
          {emissive:.22}
        );

        /* Tiny eye highlight */
        this.drawMesh(
          "sphere",
          mat4TRS(
            visual.x+2.425,
            bodyY+1.545+
              neckBob+
              headBob,
            visual.z+.38,
            0,0,0,
            .025,.025,.018
          ),
          [.78,.78,.70],
          {emissive:.30}
        );

        /* Blaze / facial stripe */
        this.drawSegment(
          [
            visual.x+2.42,
            bodyY+1.74+
              neckBob+
              headBob*.6,
            visual.z+.33
          ],
          [
            visual.x+2.58,
            bodyY+1.30+
              neckBob+
              headBob,
            visual.z+.32
          ],
          .035,
          [.84,.80,.69],
          {alpha:.72}
        );

        /* Layered mane follows speed and airflow. */
        for(let index=0;index<6;index++){
          const wave=
            Math.sin(
              cycle+
              index*.48+
              .4
            )*
            (
              .075+
              speedFactor*.09
            )*
            profile.tailMotion;

          const lean=
            .42+
            speedFactor*.26;

          this.drawMesh(
            "cone",
            mat4TRS(
              visual.x+
                1.05+
                index*.16+
                wave*.08,
              bodyY+
                .54+
                index*.19+
                neckBob*.42,
              visual.z-
                .34+
                wave,
              0,
              0,
              -lean,
              .17,
              .55+
                speedFactor*.08,
              .15
            ),
            colors.dark
          );
        }
      }

      /*
        Tail starts high from the dock and whips outward with
        inertia. The tip lags the base, which creates a much more
        natural silhouette at speed.
      */
      const tailPhase=
        cycle+
        Math.PI*.33;

      const tailWave=running
        ?Math.sin(
            tailPhase
          )*
          (
            .23+
            speedFactor*.26
          )*
          profile.tailMotion
        :0;

      const tailLift=running
        ?Math.max(
            0,
            Math.sin(
              tailPhase+
              .35
            )
          )*
          (
            .10+
            speedFactor*.10
          )
        :0;

      this.drawSegment(
        [
          visual.x-1.72,
          bodyY+.22,
          visual.z
        ],
        [
          visual.x-2.25,
          bodyY+.01+
            tailWave*.15+
            tailLift,
          visual.z+
            tailWave*.72
        ],
        .20,
        colors.dark
      );

      if(detail>0){
        this.drawSegment(
          [
            visual.x-2.21,
            bodyY+.01+
              tailWave*.15+
              tailLift,
            visual.z+
              tailWave*.72
          ],
          [
            visual.x-2.83+
              tailWave*.18,
            bodyY-.24+
              tailWave*.26+
              tailLift,
            visual.z+
              tailWave*1.48
          ],
          .15,
          colors.dark
        );

        this.drawSegment(
          [
            visual.x-2.76+
              tailWave*.16,
            bodyY-.23+
              tailWave*.25+
              tailLift,
            visual.z+
              tailWave*1.44
          ],
          [
            visual.x-3.08+
              tailWave*.10,
            bodyY-.34+
              tailWave*.22+
              tailLift,
            visual.z+
              tailWave*1.72
          ],
          .09,
          colors.dark
        );
      }

      /* Saddle tree and cloth */
      this.drawMesh(
        "cube",
        mat4TRS(
          visual.x-.14,
          bodyY+.61,
          visual.z,
          0,
          bodyRoll,
          bodyPitch,
          1.72,
          .14,
          1.23
        ),
        [.13,.085,.055]
      );

      this.drawMesh(
        "cube",
        mat4TRS(
          visual.x-.24,
          bodyY+.52,
          visual.z,
          0,
          bodyRoll,
          bodyPitch,
          1.55,
          .47,
          1.15
        ),
        colors.silk,
        {
          rim:.16,
          emissive:
            horse.specialAbilityActive
              ?.10
              :0
        }
      );

      /*
        Jockey position follows the horse's center of gravity.
        Faster horses get a lower, more aerodynamic crouch.
      */
      const jockeyBob=running
        ?Math.sin(
            cycle*2+
            Math.PI*.55
          )*
          (
            .018+
            speedFactor*.038
          )*
          profile.jockeyMotion
        :0;

      const crouch=
        .20+
        .105*
        speedFactor;

      const jockeyLean=
        running
          ?-.14-
           speedFactor*.09
          :-.07;

      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x-.10+
            speedFactor*.05,
          bodyY+1.34+
            jockeyBob,
          visual.z,
          0,
          jockeyLean,
          -.05+
            bodyPitch*.35,
          .74,
          1.20+
            speedFactor*.04,
          .70
        ),
        colors.silk,
        {
          rim:
            selected
              ?.28
              :.10
        }
      );

      /*
        Rider torso.
      */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+.25+
            speedFactor*.08,
          bodyY+2.00+
            jockeyBob,
          visual.z,
          0,
          jockeyLean*.72,
          0,
          .53,
          .63,
          .54
        ),
        [.72,.50,.35]
      );

      /* Helmet/head */
      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+.22+
            speedFactor*.08,
          bodyY+2.28+
            jockeyBob,
          visual.z,
          0,
          -.10+
            jockeyLean*.30,
          0,
          .66,
          .36,
          .63
        ),
        colors.silk,
        {rim:.15}
      );

      this.drawMesh(
        "sphere",
        mat4TRS(
          visual.x+1.00+
            speedFactor*.10,
          bodyY+2.26+
            jockeyBob,
          visual.z,
          0,
          0,
          0,
          .35,
          .35,
          .35
        ),
        [.73,.54,.40],
        {rim:.05}
      );

      if(detail>0){
        /*
          Forearm to rein and lower leg contact.
        */
        const hand=[
          visual.x+1.31+
            drive*
            .08*
            speedFactor,
          bodyY+1.22+
            jockeyBob*.70,
          visual.z+.25
        ];

        this.drawSegment(
          [
            visual.x+.18+
              speedFactor*.04,
            bodyY+1.53+
              jockeyBob,
            visual.z+.25
          ],
          hand,
          .09,
          colors.silk
        );

        this.drawSegment(
          hand,
          [
            visual.x+2.12+
              drive*.06,
            bodyY+1.29+
              headBob*.20,
            visual.z+.28
          ],
          .026,
          [.09,.055,.038]
        );

        this.drawSegment(
          [
            visual.x-.22,
            bodyY+.93+
              jockeyBob*.34,
            visual.z+.29
          ],
          [
            visual.x-.90+
              speedFactor*.05,
            bodyY+.29+
              suspensionWave*.10,
            visual.z+.31
          ],
          .105,
          [.12,.095,.073]
        );
      }

      this.screenHorses.push({
        id:horse.id,
        horse,
        world:[
          visual.x+1.02,
          bodyY+2.30+
            headBob,
          visual.z
        ],
        selected,
        leader
      });
    }

    drawHorses(appState,palette,timestamp){
      this.screenHorses=[];

      const horses=[...(appState?.horses||[])].sort((a,b)=>{
        const aVisual=this.horseVisuals.get(a.id);
        const bVisual=this.horseVisuals.get(b.id);

        return (aVisual?.z||0)-(bVisual?.z||0);
      });

      horses.forEach(horse=>{
        const visual=this.horseVisuals.get(horse.id);

        if(visual){
          this.drawHorse(
            horse,
            visual,
            appState,
            palette,
            timestamp
          );
        }
      });
    }

    updateDust(appState,deltaSeconds,palette){
      const settings=this.qualitySettings();

      for(let index=this.dustParticles.length-1;index>=0;index--){
        const particle=this.dustParticles[index];

        particle.life-=deltaSeconds;

        if(particle.life<=0){
          this.dustParticles.splice(index,1);
          continue;
        }

        particle.x+=particle.vx*deltaSeconds;
        particle.y+=particle.vy*deltaSeconds;
        particle.z+=particle.vz*deltaSeconds;
        particle.vy-=.72*deltaSeconds;
        particle.vx*=Math.pow(.32,deltaSeconds);
        particle.vz*=Math.pow(.40,deltaSeconds);
      }

      if(
        appState?.phase!=="live"||
        this.reducedMotion
      ){
        return;
      }

      const spray=clamp(
        Number(appState?.trackCondition?.spray)||.2,
        .08,
        1
      );

      (appState?.horses||[]).forEach(horse=>{
        const visual=this.horseVisuals.get(horse.id);
        const speed=clamp(Number(horse.currentSpeed)||0,0,1.6);

        if(!visual||speed<.72){
          return;
        }

        this.dustAccumulator+=
          deltaSeconds*
          speed*
          (palette.surface==="Dirt"?5.8:2.2)*
          (.65+spray);

        while(
          this.dustAccumulator>=1&&
          this.dustParticles.length<settings.dustLimit
        ){
          this.dustAccumulator-=1;

          const seed=
            this.sceneSeed+
            this.frameCounter*101+
            horse.id*7919+
            this.dustParticles.length*37;
          const lateral=seededUnit(seed)-.5;
          const life=.48+seededUnit(seed+19)*.55;

          this.dustParticles.push({
            x:visual.x-1.65-seededUnit(seed+23)*.7,
            y:.18+seededUnit(seed+29)*.18,
            z:visual.z+lateral*1.4,
            vx:-1.2-seededUnit(seed+31)*1.4,
            vy:.42+seededUnit(seed+43)*.7,
            vz:lateral*1.6,
            life,
            maxLife:life,
            size:
              palette.surface==="Dirt"
                ?16+seededUnit(seed+47)*16
                :9+seededUnit(seed+47)*10
          });
        }
      });
    }

    drawDust(palette){
      if(!this.dustParticles.length){
        return;
      }

      const gl=this.gl;
      const values=new Float32Array(this.dustParticles.length*8);
      const baseColor=
        palette.surface==="Dirt"
          ?mixColor([.62,.43,.27],[.31,.24,.18],palette.wetness)
          :[.30,.47,.22];

      this.dustParticles.forEach((particle,index)=>{
        const progress=clamp(particle.life/particle.maxLife,0,1);
        const offset=index*8;

        values[offset+0]=particle.x;
        values[offset+1]=Math.max(.03,particle.y);
        values[offset+2]=particle.z;
        values[offset+3]=baseColor[0];
        values[offset+4]=baseColor[1];
        values[offset+5]=baseColor[2];
        values[offset+6]=progress*.38;
        values[offset+7]=particle.size*(1+(1-progress)*.45);
      });

      gl.useProgram(this.particleProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.particleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,values,gl.DYNAMIC_DRAW);

      gl.enableVertexAttribArray(this.particleLocations.position);
      gl.vertexAttribPointer(
        this.particleLocations.position,
        3,
        gl.FLOAT,
        false,
        32,
        0
      );

      gl.enableVertexAttribArray(this.particleLocations.color);
      gl.vertexAttribPointer(
        this.particleLocations.color,
        4,
        gl.FLOAT,
        false,
        32,
        12
      );

      gl.enableVertexAttribArray(this.particleLocations.size);
      gl.vertexAttribPointer(
        this.particleLocations.size,
        1,
        gl.FLOAT,
        false,
        32,
        28
      );

      gl.uniformMatrix4fv(
        this.particleLocations.viewProjection,
        false,
        this.viewProjection
      );

      gl.uniform1f(
        this.particleLocations.pixelRatio,
        this.pixelRatio
      );

      gl.enable(gl.BLEND);
      gl.depthMask(false);
      gl.drawArrays(gl.POINTS,0,this.dustParticles.length);
      gl.depthMask(true);
    }

    drawRain(appState,timestamp,palette){
      if(appState?.weather?.name!=="Light Rain"){
        return;
      }

      const gl=this.gl;
      const settings=this.qualitySettings();
      const count=Math.min(settings.rainCount,this.rainSeeds.length);
      const values=new Float32Array(count*6);
      const time=timestamp*.001;

      for(let index=0;index<count;index++){
        const seed=this.rainSeeds[index];
        const x=
          this.camera.target[0]-82+
          ((seed.x*164+time*8*seed.speed)%164);
        const z=-36+seed.z*78;
        const y=32-((seed.y*38+time*24*seed.speed)%39);

        const offset=index*6;
        values[offset+0]=x;
        values[offset+1]=y;
        values[offset+2]=z;

        values[offset+3]=x-.60;
        values[offset+4]=y-2.2;
        values[offset+5]=z+.12;
      }

      gl.useProgram(this.lineProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.rainBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,values,gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.lineLocations.position);
      gl.vertexAttribPointer(
        this.lineLocations.position,
        3,
        gl.FLOAT,
        false,
        12,
        0
      );

      gl.uniformMatrix4fv(
        this.lineLocations.viewProjection,
        false,
        this.viewProjection
      );

      gl.uniform4fv(
        this.lineLocations.color,
        [.76,.86,.89,.34]
      );

      gl.enable(gl.BLEND);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.LINES,0,count*2);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }

    projectWorld(point){
      if(!this.viewProjection){
        return null;
      }

      const clip=transformClip(this.viewProjection,point);

      if(
        Math.abs(clip[3])<EPSILON||
        clip[3]<=0
      ){
        return null;
      }

      const inverseW=1/clip[3];
      const ndcX=clip[0]*inverseW;
      const ndcY=clip[1]*inverseW;
      const ndcZ=clip[2]*inverseW;

      if(ndcZ<-1.4||ndcZ>1.4){
        return null;
      }

      return{
        x:(ndcX*.5+.5)*this.cssWidth,
        y:(1-(ndcY*.5+.5))*this.cssHeight,
        depth:ndcZ
      };
    }

    drawOverlay(appState){
      const context=this.overlayContext;

      if(!context){
        return;
      }

      context.setTransform(1,0,0,1,0,0);
      context.clearRect(0,0,this.overlay.width,this.overlay.height);
      context.setTransform(
        this.pixelRatio,
        0,
        0,
        this.pixelRatio,
        0,
        0
      );

      const fieldSize=Math.max(
        1,
        appState?.horses?.length||1
      );
      const compactField=fieldSize>=14;
      const topDown=appState?.cameraMode==="topdown";
      const freeCam=appState?.cameraMode==="free";

      /*
        Every runner gets a label now. The old renderer only
        labelled the selected horse, leader, and top five, which
        made perfectly valid runners disappear from the broadcast.

        We also avoid dynamic "push until it doesn't overlap" placement.
        That algorithm made labels jump vertically whenever the order
        changed. Instead, every runner has a stable side preference and
        a small, time-smoothed anchor. The connector line keeps the
        label tied to the horse without letting it hop around.
      */
      const candidates=[];

      this.screenHorses.forEach(item=>{
        const screen=this.projectWorld(item.world);

        if(!screen){
          item.screen=null;
          return;
        }

        item.screen=screen;
        item.radius=item.selected?34:26;

        const horse=item.horse;
        const firstName=String(
          horse.name||
          "Runner"
        ).split(" ")[0];

        const price=
          this.callbacks.getPrice
            ?this.callbacks.getPrice(horse)
            :horse.modelProbability||0;

        const position=
          appState?.phase==="countdown"
            ?horse.morningLine||"—"
            :horse.finished
              ?`P${horse.finishPosition||"—"}`
              :`P${horse.position||"—"}`;

        const title=`#${horse.post} ${firstName}`;
        const subtitle=
          `${position} • ${Math.round(clamp(price,0,1)*100)}¢`;

        const titleFont=compactField
          ?"800 7.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
          :"800 8.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
        const subFont=
          "700 6.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";

        context.font=titleFont;
        const titleWidth=context.measureText(title).width;
        context.font=subFont;
        const subtitleWidth=context.measureText(subtitle).width;

        const leaderTag=item.leader
          ?"LEAD"
          :"";

        context.font=
          "900 5.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";

        const tagWidth=leaderTag
          ?context.measureText(leaderTag).width+11
          :0;

        const width=Math.max(
          compactField?61:66,
          Math.ceil(
            Math.max(
              titleWidth+10+tagWidth,
              subtitleWidth
            )+
            12
          )
        );

        const height=
          compactField
            ?26
            :29;

        /*
          Keep each label on a deterministic side of its horse.
          Only the near-finish edge is allowed to flip so the label
          does not leave the viewport.
        */
        let side=
          horse.post%2===0
            ?-1
            :1;

        if(screen.x<width*.90){
          side=1;
        }else if(screen.x>this.cssWidth-width*.25){
          side=-1;
        }

        const verticalOffset=
          (
            (
              Number(horse.post)||1
            )%3-1
          )*
          (compactField?3:4);

        const anchorGap=
          topDown
            ?12
            :freeCam
              ?14
              :15;

        const targetX=clamp(
          screen.x+
            side*
            (
              width*.48+
              anchorGap
            ),
          4,
          this.cssWidth-
            width-
            4
        );

        const targetY=clamp(
          screen.y-
            (
              topDown
                ?height+12
                :height+10
            )+
            verticalOffset,
          56,
          Math.max(
            56,
            this.cssHeight-
              height-
              36
          )
        );

        const previous=
          this.labelPositions.get(horse.id);

        /*
          Temporal smoothing is the key anti-jitter treatment.
          Labels now glide toward the new projected location instead
          of teleporting between collision-resolution slots.
        */
        const smoothing=
          freeCam
            ?.30
            :topDown
              ?.24
              :.18;

        let label;
        if(previous){
          previous.x+=
            (targetX-previous.x)*
            smoothing;
          previous.y+=
            (targetY-previous.y)*
            smoothing;
          label=previous;
        }else{
          label={
            x:targetX,
            y:targetY
          };
          this.labelPositions.set(
            horse.id,
            label
          );
        }

        candidates.push({
          ...item,
          screen,
          title,
          subtitle,
          width,
          height,
          x:label.x,
          y:label.y,
          side,
          priority:
            item.selected
              ?3
              :item.leader
                ?2
                :horse.specialAbilityActive
                  ?1
                  :0
        });
      });

      const visibleIds=new Set(
        candidates.map(
          item=>item.id
        )
      );

      [...this.labelPositions.keys()]
        .forEach(id=>{
          if(
            !this.screenHorses.some(
              item=>item.id===id
            )
          ){
            this.labelPositions.delete(id);
          }
        });

      /*
        Draw labels in depth/priority order. No runner is removed
        from the label set because of an overlap.
      */
      candidates
        .sort(
          (a,b)=>
            a.priority-b.priority||
            a.screen.y-b.screen.y
        )
        .forEach(item=>{
          const horse=item.horse;
          const {
            x,
            y,
            width,
            height
          }=item;

          const accent=hexToRgb(
            horse.postColor,
            [.45,.64,.90]
          );

          const accentCss=
            `rgb(${Math.round(accent[0]*255)},${Math.round(accent[1]*255)},${Math.round(accent[2]*255)})`;

          const leaderColor=
            "rgba(240,211,138,.95)";
          const selectedColor=
            "rgba(145,175,232,.96)";

          const boxX=clamp(
            x,
            4,
            this.cssWidth-width-4
          );
          const boxY=clamp(
            y,
            54,
            this.cssHeight-height-34
          );

          context.save();

          /*
            Use a short leader line to the label edge. This is much
            less visually distracting than a full collision-routing
            tree and remains stable while the horse moves.
          */
          const attachX=
            item.side>0
              ?boxX
              :boxX+width;

          const attachY=
            boxY+
            height*.62;

          context.beginPath();
          context.moveTo(
            item.screen.x,
            item.screen.y-1
          );
          context.lineTo(
            attachX,
            attachY
          );
          context.lineWidth=0.8;
          context.strokeStyle=
            item.leader
              ?leaderColor
              :"rgba(211,221,216,.22)";
          context.stroke();

          const radius=
            compactField
              ?5
              :6;

          roundedRectPath(
            context,
            boxX,
            boxY,
            width,
            height,
            radius
          );

          context.fillStyle=
            item.selected
              ?"rgba(5,12,17,.94)"
              :"rgba(5,10,13,.86)";
          context.shadowColor=
            "rgba(0,0,0,.36)";
          context.shadowBlur=
            compactField?6:8;
          context.shadowOffsetY=
            2;
          context.fill();
          context.shadowColor=
            "transparent";

          context.lineWidth=
            item.selected
              ?1.5
              :1;

          context.strokeStyle=
            item.selected
              ?selectedColor
              :item.leader
                ?leaderColor
                :accentCss;
          context.stroke();

          const titleFont=
            compactField
              ?"800 7.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
              :"800 8.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";

          const subFont=
            "700 6.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";

          context.fillStyle=
            item.leader
              ?leaderColor
              :"rgba(245,247,242,.96)";
          context.font=
            titleFont;
          context.fillText(
            item.title,
            boxX+6,
            boxY+
              (
                compactField
                  ?10
                  :11
              )
          );

          context.fillStyle=
            "rgba(176,188,184,.88)";
          context.font=
            subFont;
          context.fillText(
            item.subtitle,
            boxX+6,
            boxY+
              (
                compactField
                  ?20
                  :22
              )
          );

          if(item.leader){
            context.fillStyle=
              leaderColor;
            context.font=
              "900 5.5px -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";

            const tagWidth=
              context.measureText("LEAD").width+2;

            context.fillText(
              "LEAD",
              boxX+
                width-
                tagWidth-
                5,
              boxY+
                (
                  compactField
                    ?9
                    :10
                )
            );
          }

          context.restore();
        });
    }

    nearestRunnerAt(x,y){
      const nearest=this.screenHorses
        .filter(item=>item.screen)
        .map(item=>({
          item,
          distance:Math.hypot(
            item.screen.x-x,
            item.screen.y-y
          )
        }))
        .sort((a,b)=>a.distance-b.distance)[0];

      if(
        nearest&&
        nearest.distance<=Math.max(
          34,
          nearest.item.radius||26
        )
      ){
        return nearest.item;
      }

      return null;
    }

    handlePointerDown(event){
      if(this.mode!=="webgl"||!this.supported){
        return;
      }

      const bounds=this.canvas.getBoundingClientRect();
      const x=event.clientX-bounds.left;
      const y=event.clientY-bounds.top;

      if(this.appState?.cameraMode==="free"){
        this.pointerState.down=true;
        this.pointerState.dragging=false;
        this.pointerState.startX=event.clientX;
        this.pointerState.startY=event.clientY;
        this.pointerState.lastX=event.clientX;
        this.pointerState.lastY=event.clientY;
        this.pointerState.button=event.button;
        this.pointerState.pointerId=event.pointerId;

        this.canvas.setPointerCapture?.(event.pointerId);
        this.canvas.style.cursor="grabbing";
        event.preventDefault();
        return;
      }

      const nearest=this.nearestRunnerAt(x,y);

      if(nearest){
        event.preventDefault();

        if(this.callbacks.onSelectRunner){
          this.callbacks.onSelectRunner(
            nearest.id,
            event.detail>=2
          );
        }
      }
    }

    handlePointerMove(event){
      if(this.mode!=="webgl"||!this.supported){
        return;
      }

      const bounds=this.canvas.getBoundingClientRect();
      const x=event.clientX-bounds.left;
      const y=event.clientY-bounds.top;

      if(
        this.appState?.cameraMode==="free"&&
        this.pointerState.down
      ){
        const dx=
          event.clientX-
          this.pointerState.lastX;
        const dy=
          event.clientY-
          this.pointerState.lastY;

        const travel=
          Math.hypot(
            event.clientX-
              this.pointerState.startX,
            event.clientY-
              this.pointerState.startY
          );

        if(travel>4){
          this.pointerState.dragging=true;
        }

        if(this.pointerState.dragging){
          this.freeCamera.yaw-=
            dx*.0062;
          this.freeCamera.pitch=
            clamp(
              this.freeCamera.pitch-
                dy*.0052,
              .10,
              1.38
            );
        }

        this.pointerState.lastX=event.clientX;
        this.pointerState.lastY=event.clientY;
        return;
      }

      const nearest=this.nearestRunnerAt(x,y);

      this.canvas.style.cursor=
        nearest
          ?"pointer"
          :"grab";
    }

    handlePointerUp(event){
      if(
        this.appState?.cameraMode==="free"&&
        this.pointerState.down
      ){
        const wasDragging=
          this.pointerState.dragging;

        this.pointerState.down=false;
        this.pointerState.dragging=false;

        try{
          this.canvas.releasePointerCapture?.(
            event.pointerId
          );
        }catch(error){
          /* Pointer capture may already have been released. */
        }

        if(!wasDragging){
          const bounds=
            this.canvas.getBoundingClientRect();

          const x=
            event.clientX-
            bounds.left;
          const y=
            event.clientY-
            bounds.top;

          const nearest=
            this.nearestRunnerAt(
              x,
              y
            );

          if(nearest){
            this.callbacks.onSelectRunner?.(
              nearest.id,
              false
            );
          }
        }

        this.canvas.style.cursor="grab";
      }
    }

    handleWheel(event){
      if(
        this.mode!=="webgl"||
        !this.supported||
        this.appState?.cameraMode!=="free"
      ){
        return;
      }

      event.preventDefault();

      const factor=
        Math.exp(
          event.deltaY*.0015
        );

      this.freeCamera.distance=
        clamp(
          this.freeCamera.distance*
            factor,
          this.freeCamera.minDistance,
          this.freeCamera.maxDistance
        );
    }

    handlePointerLeave(){
      if(
        this.appState?.cameraMode!=="free"||
        !this.pointerState.down
      ){
        if(this.canvas){
          this.canvas.style.cursor="grab";
        }
      }
    }

    handleKeyDown(event){
      const horses=[...(this.appState?.horses||[])].sort(
        (a,b)=>
          (a.position||99)-(b.position||99)
      );

      if(
        this.appState?.cameraMode==="free"
      ){
        let handled=true;

        switch(event.key){
          case "ArrowLeft":
          case "a":
          case "A":
            this.freeCamera.yaw-=.08;
            break;
          case "ArrowRight":
          case "d":
          case "D":
            this.freeCamera.yaw+=.08;
            break;
          case "ArrowUp":
          case "w":
          case "W":
            this.freeCamera.pitch=
              clamp(
                this.freeCamera.pitch+.06,
                .10,
                1.38
              );
            break;
          case "ArrowDown":
          case "s":
          case "S":
            this.freeCamera.pitch=
              clamp(
                this.freeCamera.pitch-.06,
                .10,
                1.38
              );
            break;
          case "+":
          case "=":
            this.freeCamera.distance=
              clamp(
                this.freeCamera.distance*.92,
                this.freeCamera.minDistance,
                this.freeCamera.maxDistance
              );
            break;
          case "-":
          case "_":
            this.freeCamera.distance=
              clamp(
                this.freeCamera.distance*1.09,
                this.freeCamera.minDistance,
                this.freeCamera.maxDistance
              );
            break;
          case "r":
          case "R":
            this.freeCamera.yaw=-.62;
            this.freeCamera.pitch=.48;
            this.freeCamera.distance=58;
            this.freeCamera.target=[2,1.8,0];
            break;
          default:
            handled=false;
        }

        if(handled){
          event.preventDefault();
          return;
        }
      }

      if(!horses.length){
        return;
      }

      const selectedIndex=Math.max(
        0,
        horses.findIndex(
          horse=>horse.id===this.appState?.selected
        )
      );

      if(
        event.key==="ArrowRight"||
        event.key==="ArrowDown"
      ){
        event.preventDefault();
        const horse=horses[(selectedIndex+1)%horses.length];
        this.callbacks.onSelectRunner?.(horse.id,false);
      }else if(
        event.key==="ArrowLeft"||
        event.key==="ArrowUp"
      ){
        event.preventDefault();
        const horse=
          horses[
            (selectedIndex-1+horses.length)%horses.length
          ];
        this.callbacks.onSelectRunner?.(horse.id,false);
      }else if(
        event.key==="Enter"||
        event.key===" "
      ){
        event.preventDefault();
        const horse=horses[selectedIndex];
        this.callbacks.onSelectRunner?.(horse.id,true);
      }
    }

    trackFps(timestamp){
      if(!this.fpsStartedAt){
        this.fpsStartedAt=timestamp;
        this.frameCounter=0;
        return;
      }

      this.frameCounter++;

      const elapsed=timestamp-this.fpsStartedAt;

      if(elapsed>=1000){
        this.fps=this.frameCounter/(elapsed/1000);
        this.frameCounter=0;
        this.fpsStartedAt=timestamp;

        /*
          Auto quality adapts once sustained frame time indicates
          that High is too expensive. It never overrides an
          explicit High choice.
        */
        if(
          this.quality==="auto"&&
          this.effectiveQuality==="high"
        ){
          if(this.fps<26){
            this.lowFpsSamples++;
          }else{
            this.lowFpsSamples=Math.max(
              0,
              this.lowFpsSamples-1
            );
          }

          if(this.lowFpsSamples>=2){
            this.adaptiveEco=true;
            this.lowFpsSamples=0;
            this.resolveEffectiveQuality();
            this.resize(true);
            this.showNotice(
              "3D quality was adjusted automatically to keep the race responsive.",
              false
            );
          }
        }

        this.updateStatus();
      }
    }


    update(appState,timestamp=global.performance?.now?.()||Date.now()){
      this.appState=appState;

      if(
        !this.initialized||
        this.mode!=="webgl"||
        !this.supported||
        this.contextLost||
        !this.gl
      ){
        return;
      }

      this.resolveEffectiveQuality();

      /*
        Eco mode renders at a stable 30 FPS ceiling. Simulation
        updates continue at their normal rate; only redundant
        presentation frames are skipped.
      */
      const minimumFrameMs=
        this.effectiveQuality==="eco"
          ?1000/30
          :0;

      if(
        this.lastRenderedAt!==null&&
        timestamp-this.lastRenderedAt<
          minimumFrameMs
      ){
        return;
      }

      this.lastRenderedAt=
        timestamp;

      const nextFieldKey=[
        appState?.tradingRaceSerial||0,
        appState?.raceNumber||0,
        appState?.profile?.track||"",
        appState?.profile?.surface||"",
        ...(appState?.horses||[]).map(horse=>horse.id)
      ].join(":");

      if(nextFieldKey!==this.fieldKey){
        this.resetScene(appState);
      }

      const deltaSeconds=this.lastTimestamp===null
        ?1/60
        :clamp((timestamp-this.lastTimestamp)/1000,0,1/12);
      this.lastTimestamp=timestamp;

      this.resize(false);
      this.updateHorseVisuals(appState,deltaSeconds);
      this.updateCamera(appState,deltaSeconds);

      const palette=this.environmentPalette(appState);
      const gl=this.gl;

      gl.viewport(0,0,this.canvas.width,this.canvas.height);
      gl.clearColor(
        palette.sky[0],
        palette.sky[1],
        palette.sky[2],
        1
      );
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

      this.beginMainPass(palette);
      this.drawEnvironment(appState,palette);
      this.drawHorses(appState,palette,timestamp);
      this.flushInstanceBatches();
      this.updateDust(appState,deltaSeconds,palette);
      this.drawDust(palette);
      this.drawRain(appState,timestamp,palette);
      this.drawOverlay(appState);
      this.trackFps(timestamp);
    }

    destroy(){
      this.resizeObserver?.disconnect();

      if(this.canvas){
        this.canvas.removeEventListener("pointerdown",this.boundPointerDown);
        this.canvas.removeEventListener("pointermove",this.boundPointerMove);
        this.canvas.removeEventListener("pointerleave",this.boundPointerLeave);
        this.canvas.removeEventListener("pointerup",this.boundPointerUp);
        this.canvas.removeEventListener("pointercancel",this.boundPointerUp);
        this.canvas.removeEventListener("wheel",this.boundWheel);
        this.canvas.removeEventListener("keydown",this.boundKeyDown);
        this.canvas.removeEventListener("webglcontextlost",this.boundContextLost);
        this.canvas.removeEventListener("webglcontextrestored",this.boundContextRestored);
      }

      this.initialized=false;
    }
  }

  const renderer=new RaceMarketWebGLRenderer();

  global.RaceMarket3D={
    init:options=>renderer.init(options),
    update:(state,timestamp)=>renderer.update(state,timestamp),
    setMode:(mode,options)=>renderer.setMode(mode,options),
    setQuality:(quality,options)=>renderer.setQuality(quality,options),
    getStatus:()=>renderer.getStatus(),
    reset:state=>renderer.resetScene(state),
    destroy:()=>renderer.destroy()
  };
})(window);
