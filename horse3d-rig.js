/* =========================================================
   RaceMarket — Horse Model 3.0 Rig
   ---------------------------------------------------------
   Dependency-free procedural skinned thoroughbred and jockey.
   Generates reusable weighted meshes plus a 22-bone horse rig
   and an 11-bone jockey rig. Race state remains authoritative;
   this module only supplies presentation geometry and poses.
========================================================= */

(function installRaceMarketHorseRig(global){
  "use strict";

  const PI=Math.PI;
  const TAU=PI*2;
  const HORSE_BONE_COUNT=22;
  const JOCKEY_BONE_COUNT=11;
  const HORSE_MODEL_HEIGHT=2.12;

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smoothstep=(a,b,v)=>{
    if(a===b){
      return v<a?0:1;
    }
    const t=clamp((v-a)/(b-a),0,1);
    return t*t*(3-2*t);
  };
  const fract=v=>v-Math.floor(v);
  const normalize3=v=>{
    const d=Math.hypot(v[0],v[1],v[2])||1;
    return[v[0]/d,v[1]/d,v[2]/d];
  };
  const cross3=(a,b)=>[
    a[1]*b[2]-a[2]*b[1],
    a[2]*b[0]-a[0]*b[2],
    a[0]*b[1]-a[1]*b[0]
  ];

  function mat4Identity(){
    return new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ]);
  }

  function mat4Multiply(a,b){
    const out=new Float32Array(16);

    for(let c=0;c<4;c++){
      for(let r=0;r<4;r++){
        out[c*4+r]=
          a[r+0]*b[c*4+0]+
          a[r+4]*b[c*4+1]+
          a[r+8]*b[c*4+2]+
          a[r+12]*b[c*4+3];
      }
    }

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

  function mat4Invert(a){
    const out=new Float32Array(16);
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3];
    const a10=a[4],a11=a[5],a12=a[6],a13=a[7];
    const a20=a[8],a21=a[9],a22=a[10],a23=a[11];
    const a30=a[12],a31=a[13],a32=a[14],a33=a[15];

    const b00=a00*a11-a01*a10;
    const b01=a00*a12-a02*a10;
    const b02=a00*a13-a03*a10;
    const b03=a01*a12-a02*a11;
    const b04=a01*a13-a03*a11;
    const b05=a02*a13-a03*a12;
    const b06=a20*a31-a21*a30;
    const b07=a20*a32-a22*a30;
    const b08=a20*a33-a23*a30;
    const b09=a21*a32-a22*a31;
    const b10=a21*a33-a23*a31;
    const b11=a22*a33-a23*a32;

    let determinant=
      b00*b11-b01*b10+b02*b09+
      b03*b08-b04*b07+b05*b06;

    if(Math.abs(determinant)<1e-9){
      return mat4Identity();
    }

    determinant=1/determinant;

    out[0]=(a11*b11-a12*b10+a13*b09)*determinant;
    out[1]=(a02*b10-a01*b11-a03*b09)*determinant;
    out[2]=(a31*b05-a32*b04+a33*b03)*determinant;
    out[3]=(a22*b04-a21*b05-a23*b03)*determinant;
    out[4]=(a12*b08-a10*b11-a13*b07)*determinant;
    out[5]=(a00*b11-a02*b08+a03*b07)*determinant;
    out[6]=(a32*b02-a30*b05-a33*b01)*determinant;
    out[7]=(a20*b05-a22*b02+a23*b01)*determinant;
    out[8]=(a10*b10-a11*b08+a13*b06)*determinant;
    out[9]=(a01*b08-a00*b10-a03*b06)*determinant;
    out[10]=(a30*b04-a31*b02+a33*b00)*determinant;
    out[11]=(a21*b02-a20*b04-a23*b00)*determinant;
    out[12]=(a11*b07-a10*b09-a12*b06)*determinant;
    out[13]=(a00*b09-a01*b07+a02*b06)*determinant;
    out[14]=(a31*b01-a30*b03-a32*b00)*determinant;
    out[15]=(a20*b03-a21*b01+a22*b00)*determinant;

    return out;
  }

  function transformPoint(matrix,point){
    const x=point[0];
    const y=point[1];
    const z=point[2];

    return[
      matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12],
      matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13],
      matrix[2]*x+matrix[6]*y+matrix[10]*z+matrix[14]
    ];
  }

  function transformDirection(matrix,vector){
    const x=vector[0];
    const y=vector[1];
    const z=vector[2];

    return normalize3([
      matrix[0]*x+matrix[4]*y+matrix[8]*z,
      matrix[1]*x+matrix[5]*y+matrix[9]*z,
      matrix[2]*x+matrix[6]*y+matrix[10]*z
    ]);
  }

  function bone(
    name,
    parent,
    translation,
    rotation=[0,0,0]
  ){
    return{
      name,
      parent,
      translation:[...translation],
      rotation:[...rotation]
    };
  }

  const HORSE_DEFS=[
    bone("root",-1,[0,0,0]),
    bone("pelvis",0,[-.78,.08,0]),
    bone("chest",0,[.78,.12,0]),
    bone("neckLower",2,[.58,.25,0],[0,0,-.06]),
    bone("neckUpper",3,[.52,.46,0],[0,0,-.04]),
    bone("head",4,[.46,.39,0],[0,0,-.10]),
    bone("tailBase",1,[-.64,.08,0],[0,0,.18]),
    bone("tailMid",6,[-.56,-.08,0],[0,0,.10]),
    bone("tailTip",7,[-.48,-.16,0],[0,0,.06]),

    bone("leftForeUpper",2,[.40,-.32,.36]),
    bone("leftForeLower",9,[0,-1.05,0]),
    bone("leftForeHoof",10,[0,-1.05,0]),

    bone("rightForeUpper",2,[.40,-.32,-.36]),
    bone("rightForeLower",12,[0,-1.05,0]),
    bone("rightForeHoof",13,[0,-1.05,0]),

    bone("leftHindUpper",1,[-.30,-.30,.36]),
    bone("leftHindLower",15,[0,-1.06,0]),
    bone("leftHindHoof",16,[0,-1.06,0]),

    bone("rightHindUpper",1,[-.30,-.30,-.36]),
    bone("rightHindLower",18,[0,-1.06,0]),
    bone("rightHindHoof",19,[0,-1.06,0]),

    bone("jaw",5,[.42,-.09,0],[0,0,.02])
  ];

  const JOCKEY_DEFS=[
    bone("root",-1,[-.12,1.02,0],[0,0,-.42]),
    bone("spine",0,[0,.36,0],[0,0,-.15]),
    bone("head",1,[.04,.48,0],[0,0,.08]),

    bone("leftUpperArm",1,[.06,.31,.24],[0,0,-1.03]),
    bone("leftForeArm",3,[0,-.58,0],[0,0,.52]),

    bone("rightUpperArm",1,[.06,.31,-.24],[0,0,-1.03]),
    bone("rightForeArm",5,[0,-.58,0],[0,0,.52]),

    bone("leftThigh",0,[-.06,-.04,.27],[0,0,.64]),
    bone("leftShin",7,[0,-.65,0],[0,0,-1.22]),

    bone("rightThigh",0,[-.06,-.04,-.27],[0,0,.64]),
    bone("rightShin",9,[0,-.65,0],[0,0,-1.22])
  ];

  function localsFromDefs(defs){
    return defs.map(def=>
      mat4TRS(
        def.translation[0],
        def.translation[1],
        def.translation[2],
        def.rotation[0],
        def.rotation[1],
        def.rotation[2]
      )
    );
  }

  function globalsFromLocals(defs,locals){
    const globalsOut=new Array(defs.length);

    defs.forEach((def,index)=>{
      globalsOut[index]=def.parent<0
        ?locals[index]
        :mat4Multiply(
            globalsOut[def.parent],
            locals[index]
          );
    });

    return globalsOut;
  }

  function makeBindData(defs){
    const locals=localsFromDefs(defs);
    const globalsOut=globalsFromLocals(defs,locals);
    const inverse=globalsOut.map(mat4Invert);

    return{
      locals,
      globals:globalsOut,
      inverse
    };
  }

  const HORSE_BIND=makeBindData(HORSE_DEFS);
  const JOCKEY_BIND=makeBindData(JOCKEY_DEFS);

  class GeometryBuilder{
    constructor(){
      this.positions=[];
      this.normals=[];
      this.boneIndices=[];
      this.boneWeights=[];
      this.materials=[];
      this.indices=[];
    }

    addVertex(
      position,
      normal,
      influences,
      material=0
    ){
      const normalizedInfluences=
        normalizeInfluences(
          influences
        );

      const index=
        this.positions.length/
        3;

      this.positions.push(
        position[0],
        position[1],
        position[2]
      );

      this.normals.push(
        normal[0],
        normal[1],
        normal[2]
      );

      for(let slot=0;slot<4;slot++){
        const influence=
          normalizedInfluences[
            slot
          ]||
          {
            bone:0,
            weight:0
          };

        this.boneIndices.push(
          influence.bone
        );

        this.boneWeights.push(
          influence.weight
        );
      }

      this.materials.push(
        material
      );

      return index;
    }

    addTriangle(a,b,c){
      this.indices.push(a,b,c);
    }

    finish(){
      return{
        positions:new Float32Array(this.positions),
        normals:new Float32Array(this.normals),
        boneIndices:new Float32Array(this.boneIndices),
        boneWeights:new Float32Array(this.boneWeights),
        materials:new Float32Array(this.materials),
        indices:new Uint16Array(this.indices)
      };
    }
  }

  function normalizeInfluences(influences){
    const entries=[];

    if(Array.isArray(influences)){
      influences.forEach(item=>{
        if(
          item&&
          Number.isFinite(item.bone)&&
          Number.isFinite(item.weight)&&
          item.weight>0
        ){
          entries.push({
            bone:item.bone,
            weight:item.weight
          });
        }
      });
    }else if(
      influences&&
      Number.isFinite(influences.bone)
    ){
      entries.push({
        bone:influences.bone,
        weight:
          Number.isFinite(influences.weight)
            ?influences.weight
            :1
      });
    }

    if(!entries.length){
      entries.push({
        bone:0,
        weight:1
      });
    }

    entries.sort(
      (a,b)=>
        b.weight-
        a.weight
    );

    const selected=
      entries.slice(0,4);

    const total=
      selected.reduce(
        (sum,item)=>
          sum+
          item.weight,
        0
      )||
      1;

    return selected.map(item=>({
      bone:item.bone,
      weight:item.weight/total
    }));
  }

  function singleWeight(boneIndex){
    return[
      {
        bone:boneIndex,
        weight:1
      }
    ];
  }

  function twoWeights(
    a,
    b,
    t
  ){
    const amount=
      clamp(
        t,
        0,
        1
      );

    return[
      {
        bone:a,
        weight:1-amount
      },
      {
        bone:b,
        weight:amount
      }
    ];
  }

  function rotateZPoint(
    point,
    angle
  ){
    const c=Math.cos(angle);
    const s=Math.sin(angle);

    return[
      point[0]*c-point[1]*s,
      point[0]*s+point[1]*c,
      point[2]
    ];
  }

  function addEllipsoid(
    builder,
    {
      center,
      scale,
      rotationZ=0,
      longitude=12,
      latitude=8,
      weights=singleWeight(0),
      weightFunction=null,
      material=0
    }
  ){
    const base=
      builder.positions.length/
      3;

    for(let lat=0;lat<=latitude;lat++){
      const theta=
        lat/
        latitude*
        PI;

      const sinTheta=
        Math.sin(
          theta
        );

      const cosTheta=
        Math.cos(
          theta
        );

      for(let lon=0;lon<=longitude;lon++){
        const phi=
          lon/
          longitude*
          TAU;

        const local=[
          Math.cos(phi)*sinTheta,
          cosTheta,
          Math.sin(phi)*sinTheta
        ];

        const scaled=[
          local[0]*scale[0],
          local[1]*scale[1],
          local[2]*scale[2]
        ];

        const rotated=
          rotateZPoint(
            scaled,
            rotationZ
          );

        const normalLocal=
          normalize3([
            local[0]/Math.max(.001,scale[0]),
            local[1]/Math.max(.001,scale[1]),
            local[2]/Math.max(.001,scale[2])
          ]);

        const normal=
          rotateZPoint(
            normalLocal,
            rotationZ
          );

        const position=[
          center[0]+rotated[0],
          center[1]+rotated[1],
          center[2]+rotated[2]
        ];

        builder.addVertex(
          position,
          normalize3(normal),
          weightFunction
            ?weightFunction(
                position,
                local
              )
            :weights,
          material
        );
      }
    }

    const stride=
      longitude+
      1;

    for(let lat=0;lat<latitude;lat++){
      for(let lon=0;lon<longitude;lon++){
        const first=
          base+
          lat*
          stride+
          lon;

        const second=
          first+
          stride;

        builder.addTriangle(
          first,
          second,
          first+1
        );

        builder.addTriangle(
          second,
          second+1,
          first+1
        );
      }
    }
  }

  function addTube(
    builder,
    {
      points,
      radii,
      radial=8,
      influences,
      material=0,
      closeStart=true,
      closeEnd=true
    }
  ){
    if(
      !points||
      points.length<2
    ){
      return;
    }

    const base=
      builder.positions.length/
      3;

    points.forEach(
      (
        point,
        index
      )=>{
        const previous=
          points[
            Math.max(
              0,
              index-1
            )
          ];

        const next=
          points[
            Math.min(
              points.length-1,
              index+1
            )
          ];

        const tangent=
          normalize3([
            next[0]-previous[0],
            next[1]-previous[1],
            next[2]-previous[2]
          ]);

        let side=[
          0,
          0,
          1
        ];

        if(
          Math.abs(
            tangent[2]
          )>
          .92
        ){
          side=[
            1,
            0,
            0
          ];
        }

        const perpendicular=
          normalize3(
            cross3(
              tangent,
              side
            )
          );

        const secondAxis=
          normalize3(
            cross3(
              tangent,
              perpendicular
            )
          );

        const radius=
          Array.isArray(
            radii
          )
            ?radii[
                Math.min(
                  radii.length-1,
                  index
                )
              ]
            :radii;

        for(let slice=0;slice<=radial;slice++){
          const angle=
            slice/
            radial*
            TAU;

          const cos=
            Math.cos(
              angle
            );

          const sin=
            Math.sin(
              angle
            );

          const normal=
            normalize3([
              perpendicular[0]*cos+
                secondAxis[0]*sin,
              perpendicular[1]*cos+
                secondAxis[1]*sin,
              perpendicular[2]*cos+
                secondAxis[2]*sin
            ]);

          const vertex=[
            point[0]+normal[0]*radius,
            point[1]+normal[1]*radius,
            point[2]+normal[2]*radius
          ];

          const ringInfluence=
            typeof influences==="function"
              ?influences(
                  index/
                  Math.max(
                    1,
                    points.length-1
                  ),
                  index
                )
              :influences;

          builder.addVertex(
            vertex,
            normal,
            ringInfluence,
            material
          );
        }
      }
    );

    const ringStride=
      radial+
      1;

    for(let ring=0;ring<points.length-1;ring++){
      for(let slice=0;slice<radial;slice++){
        const a=
          base+
          ring*
          ringStride+
          slice;

        const b=
          a+
          ringStride;

        builder.addTriangle(
          a,
          b,
          a+1
        );

        builder.addTriangle(
          b,
          b+1,
          a+1
        );
      }
    }

    if(closeStart){
      const center=
        builder.addVertex(
          points[0],
          normalize3([
            points[0][0]-points[1][0],
            points[0][1]-points[1][1],
            points[0][2]-points[1][2]
          ]),
          typeof influences==="function"
            ?influences(0,0)
            :influences,
          material
        );

      for(let slice=0;slice<radial;slice++){
        builder.addTriangle(
          center,
          base+slice+1,
          base+slice
        );
      }
    }

    if(closeEnd){
      const lastIndex=
        points.length-
        1;

      const ringBase=
        base+
        lastIndex*
        ringStride;

      const center=
        builder.addVertex(
          points[lastIndex],
          normalize3([
            points[lastIndex][0]-
              points[lastIndex-1][0],
            points[lastIndex][1]-
              points[lastIndex-1][1],
            points[lastIndex][2]-
              points[lastIndex-1][2]
          ]),
          typeof influences==="function"
            ?influences(1,lastIndex)
            :influences,
          material
        );

      for(let slice=0;slice<radial;slice++){
        builder.addTriangle(
          center,
          ringBase+slice,
          ringBase+slice+1
        );
      }
    }
  }

  function addBox(
    builder,
    {
      center,
      scale,
      rotationZ=0,
      weights=singleWeight(0),
      material=0
    }
  ){
    const faces=[
      {
        normal:[1,0,0],
        corners:[
          [.5,-.5,-.5],
          [.5,-.5,.5],
          [.5,.5,.5],
          [.5,.5,-.5]
        ]
      },
      {
        normal:[-1,0,0],
        corners:[
          [-.5,-.5,.5],
          [-.5,-.5,-.5],
          [-.5,.5,-.5],
          [-.5,.5,.5]
        ]
      },
      {
        normal:[0,1,0],
        corners:[
          [-.5,.5,-.5],
          [.5,.5,-.5],
          [.5,.5,.5],
          [-.5,.5,.5]
        ]
      },
      {
        normal:[0,-1,0],
        corners:[
          [-.5,-.5,.5],
          [.5,-.5,.5],
          [.5,-.5,-.5],
          [-.5,-.5,-.5]
        ]
      },
      {
        normal:[0,0,1],
        corners:[
          [.5,-.5,.5],
          [-.5,-.5,.5],
          [-.5,.5,.5],
          [.5,.5,.5]
        ]
      },
      {
        normal:[0,0,-1],
        corners:[
          [-.5,-.5,-.5],
          [.5,-.5,-.5],
          [.5,.5,-.5],
          [-.5,.5,-.5]
        ]
      }
    ];

    faces.forEach(face=>{
      const start=
        builder.positions.length/
        3;

      face.corners.forEach(corner=>{
        const scaled=[
          corner[0]*scale[0],
          corner[1]*scale[1],
          corner[2]*scale[2]
        ];

        const rotated=
          rotateZPoint(
            scaled,
            rotationZ
          );

        builder.addVertex(
          [
            center[0]+rotated[0],
            center[1]+rotated[1],
            center[2]+rotated[2]
          ],
          normalize3(
            rotateZPoint(
              face.normal,
              rotationZ
            )
          ),
          weights,
          material
        );
      });

      builder.addTriangle(
        start,
        start+1,
        start+2
      );

      builder.addTriangle(
        start,
        start+2,
        start+3
      );
    });
  }

  function addCone(
    builder,
    {
      base,
      tip,
      radius=.2,
      radial=7,
      weights=singleWeight(0),
      material=0
    }
  ){
    const tangent=
      normalize3([
        tip[0]-base[0],
        tip[1]-base[1],
        tip[2]-base[2]
      ]);

    let side=[
      0,
      0,
      1
    ];

    if(
      Math.abs(
        tangent[2]
      )>
      .92
    ){
      side=[
        1,
        0,
        0
      ];
    }

    const axisA=
      normalize3(
        cross3(
          tangent,
          side
        )
      );

    const axisB=
      normalize3(
        cross3(
          tangent,
          axisA
        )
      );

    const ring=[];

    for(let index=0;index<radial;index++){
      const angle=
        index/
        radial*
        TAU;

      const normal=
        normalize3([
          axisA[0]*Math.cos(angle)+
            axisB[0]*Math.sin(angle)+
            tangent[0]*.18,
          axisA[1]*Math.cos(angle)+
            axisB[1]*Math.sin(angle)+
            tangent[1]*.18,
          axisA[2]*Math.cos(angle)+
            axisB[2]*Math.sin(angle)+
            tangent[2]*.18
        ]);

      ring.push(
        builder.addVertex(
          [
            base[0]+
              (
                axisA[0]*Math.cos(angle)+
                axisB[0]*Math.sin(angle)
              )*
              radius,
            base[1]+
              (
                axisA[1]*Math.cos(angle)+
                axisB[1]*Math.sin(angle)
              )*
              radius,
            base[2]+
              (
                axisA[2]*Math.cos(angle)+
                axisB[2]*Math.sin(angle)
              )*
              radius
          ],
          normal,
          weights,
          material
        )
      );
    }

    const tipIndex=
      builder.addVertex(
        tip,
        tangent,
        weights,
        material
      );

    const center=
      builder.addVertex(
        base,
        [
          -tangent[0],
          -tangent[1],
          -tangent[2]
        ],
        weights,
        material
      );

    for(let index=0;index<radial;index++){
      const next=
        (
          index+
          1
        )%
        radial;

      builder.addTriangle(
        ring[index],
        ring[next],
        tipIndex
      );

      builder.addTriangle(
        center,
        ring[next],
        ring[index]
      );
    }
  }

  function bindPosition(
    bind,
    boneIndex
  ){
    const matrix=
      bind.globals[
        boneIndex
      ];

    return[
      matrix[12],
      matrix[13],
      matrix[14]
    ];
  }

  function bodyWeightsForPosition(
    position
  ){
    const x=
      position[0];

    if(x<-.34){
      const pelvis=
        smoothstep(
          -.20,
          -1.25,
          x
        );

      return[
        {
          bone:1,
          weight:
            .44+
            pelvis*
            .48
        },
        {
          bone:0,
          weight:
            .56-
            pelvis*
            .38
        },
        {
          bone:2,
          weight:
            .10*
            (
              1-
              pelvis
            )
        }
      ];
    }

    if(x>.32){
      const chest=
        smoothstep(
          .18,
          1.35,
          x
        );

      return[
        {
          bone:2,
          weight:
            .42+
            chest*
            .52
        },
        {
          bone:0,
          weight:
            .58-
            chest*
            .43
        },
        {
          bone:1,
          weight:
            .07*
            (
              1-
              chest
            )
        }
      ];
    }

    return[
      {
        bone:0,
        weight:.70
      },
      {
        bone:1,
        weight:
          clamp(
            .17-
            x*.10,
            .08,
            .25
          )
      },
      {
        bone:2,
        weight:
          clamp(
            .17+
            x*.10,
            .08,
            .25
          )
      }
    ];
  }

  function addHorseLegGeometry(
    builder,
    upperBone,
    lowerBone,
    hoofBone,
    radial,
    hind=false
  ){
    const hip=
      bindPosition(
        HORSE_BIND,
        upperBone
      );

    const knee=
      bindPosition(
        HORSE_BIND,
        lowerBone
      );

    const hoofJoint=
      bindPosition(
        HORSE_BIND,
        hoofBone
      );

    const toe=[
      hoofJoint[0]+
        (
          hind
            ?.18
            :.22
        ),
      hoofJoint[1]-.02,
      hoofJoint[2]
    ];

    addTube(
      builder,
      {
        points:[
          hip,
          [
            lerp(
              hip[0],
              knee[0],
              .52
            ),
            lerp(
              hip[1],
              knee[1],
              .52
            ),
            lerp(
              hip[2],
              knee[2],
              .52
            )
          ],
          knee
        ],
        radii:
          hind
            ?[
                .19,
                .145,
                .115
              ]
            :[
                .175,
                .128,
                .10
              ],
        radial,
        influences:t=>
          twoWeights(
            upperBone,
            lowerBone,
            smoothstep(
              .62,
              1,
              t
            )
          ),
        material:0
      }
    );

    addTube(
      builder,
      {
        points:[
          knee,
          [
            lerp(
              knee[0],
              hoofJoint[0],
              .55
            ),
            lerp(
              knee[1],
              hoofJoint[1],
              .55
            ),
            lerp(
              knee[2],
              hoofJoint[2],
              .55
            )
          ],
          hoofJoint
        ],
        radii:[
          .105,
          .073,
          .058
        ],
        radial,
        influences:t=>
          twoWeights(
            lowerBone,
            hoofBone,
            smoothstep(
              .64,
              1,
              t
            )
          ),
        material:2
      }
    );

    addBox(
      builder,
      {
        center:[
          toe[0],
          toe[1],
          toe[2]
        ],
        scale:[
          .42,
          .16,
          .30
        ],
        rotationZ:
          hind
            ?.035
            :-.055,
        weights:
          singleWeight(
            hoofBone
          ),
        material:4
      }
    );
  }

  function createHorseGeometry(
    quality="high"
  ){
    const high=
      quality==="high";

    const longitude=
      high
        ?16
        :10;

    const latitude=
      high
        ?10
        :7;

    const radial=
      high
        ?9
        :6;

    const builder=
      new GeometryBuilder();

    /* Barrel / rib cage */
    addEllipsoid(
      builder,
      {
        center:[-.10,.02,0],
        scale:[1.78,.64,.58],
        rotationZ:.012,
        longitude,
        latitude,
        weightFunction:
          bodyWeightsForPosition,
        material:0
      }
    );

    /* Hindquarter mass */
    addEllipsoid(
      builder,
      {
        center:[-1.12,.12,0],
        scale:[.88,.75,.67],
        rotationZ:.05,
        longitude:
          Math.max(
            8,
            longitude-2
          ),
        latitude,
        weights:[
          {
            bone:1,
            weight:.84
          },
          {
            bone:0,
            weight:.16
          }
        ],
        material:1
      }
    );

    /* Shoulder */
    addEllipsoid(
      builder,
      {
        center:[.93,.15,0],
        scale:[.82,.77,.64],
        rotationZ:-.055,
        longitude:
          Math.max(
            8,
            longitude-2
          ),
        latitude,
        weights:[
          {
            bone:2,
            weight:.86
          },
          {
            bone:0,
            weight:.14
          }
        ],
        material:1
      }
    );

    /* Chest */
    addEllipsoid(
      builder,
      {
        center:[1.39,.00,0],
        scale:[.46,.57,.57],
        rotationZ:-.10,
        longitude:
          Math.max(
            8,
            longitude-4
          ),
        latitude:
          Math.max(
            6,
            latitude-2
          ),
        weights:
          singleWeight(
            2
          ),
        material:0
      }
    );

    /* Belly shadow volume */
    addEllipsoid(
      builder,
      {
        center:[-.12,-.30,0],
        scale:[1.28,.31,.50],
        longitude:
          Math.max(
            8,
            longitude-4
          ),
        latitude:
          Math.max(
            5,
            latitude-3
          ),
        weightFunction:
          bodyWeightsForPosition,
        material:2
      }
    );

    const chestPoint=
      bindPosition(
        HORSE_BIND,
        2
      );

    const neck1=
      bindPosition(
        HORSE_BIND,
        3
      );

    const neck2=
      bindPosition(
        HORSE_BIND,
        4
      );

    const headPoint=
      bindPosition(
        HORSE_BIND,
        5
      );

    addTube(
      builder,
      {
        points:[
          [
            chestPoint[0]+.22,
            chestPoint[1]+.18,
            chestPoint[2]
          ],
          neck1,
          neck2,
          headPoint
        ],
        radii:[
          .46,
          .40,
          .31,
          .25
        ],
        radial,
        influences:t=>{
          if(t<.34){
            return twoWeights(
              2,
              3,
              t/.34
            );
          }

          if(t<.68){
            return twoWeights(
              3,
              4,
              (
                t-.34
              )/
              .34
            );
          }

          return twoWeights(
            4,
            5,
            (
              t-.68
            )/
            .32
          );
        },
        material:0
      }
    );

    /* Head */
    addEllipsoid(
      builder,
      {
        center:[
          headPoint[0]+.28,
          headPoint[1]+.04,
          0
        ],
        scale:[.72,.38,.35],
        rotationZ:-.10,
        longitude:
          Math.max(
            10,
            longitude-2
          ),
        latitude:
          Math.max(
            7,
            latitude-2
          ),
        weights:
          singleWeight(
            5
          ),
        material:0
      }
    );

    /* Muzzle */
    addEllipsoid(
      builder,
      {
        center:[
          headPoint[0]+.78,
          headPoint[1]-.10,
          0
        ],
        scale:[.48,.25,.28],
        rotationZ:-.06,
        longitude:
          Math.max(
            8,
            longitude-4
          ),
        latitude:
          Math.max(
            6,
            latitude-3
          ),
        weights:[
          {
            bone:5,
            weight:.72
          },
          {
            bone:21,
            weight:.28
          }
        ],
        material:3
      }
    );

    /* Lower jaw */
    addEllipsoid(
      builder,
      {
        center:[
          headPoint[0]+.50,
          headPoint[1]-.25,
          0
        ],
        scale:[.42,.18,.29],
        rotationZ:-.04,
        longitude:
          Math.max(
            8,
            longitude-5
          ),
        latitude:
          Math.max(
            5,
            latitude-4
          ),
        weights:[
          {
            bone:21,
            weight:.82
          },
          {
            bone:5,
            weight:.18
          }
        ],
        material:2
      }
    );

    /* Ears */
    [
      -.17,
      .17
    ].forEach(
      (
        z,
        index
      )=>{
        addCone(
          builder,
          {
            base:[
              headPoint[0]-.05+
                index*.12,
              headPoint[1]+.31,
              z
            ],
            tip:[
              headPoint[0]-.09+
                index*.15,
              headPoint[1]+.84,
              z+
                (
                  index===0
                    ?-.025
                    :.025
                )
            ],
            radius:.14,
            radial:
              high
                ?7
                :5,
            weights:
              singleWeight(
                5
              ),
            material:2
          }
        );
      }
    );

    /* Mane: overlapping tapered wedges anchored along neck */
    const manePoints=[
      {
        p:[
          chestPoint[0]+.25,
          chestPoint[1]+.50,
          -.28
        ],
        bone:2
      },
      {
        p:[
          neck1[0],
          neck1[1]+.30,
          -.28
        ],
        bone:3
      },
      {
        p:[
          neck2[0],
          neck2[1]+.24,
          -.25
        ],
        bone:4
      },
      {
        p:[
          headPoint[0]-.06,
          headPoint[1]+.20,
          -.20
        ],
        bone:5
      }
    ];

    for(let index=0;index<manePoints.length-1;index++){
      const start=
        manePoints[index];

      const end=
        manePoints[index+1];

      const steps=
        high
          ?3
          :2;

      for(let step=0;step<steps;step++){
        const t=
          (
            step+
            .35
          )/
          steps;

        const x=
          lerp(
            start.p[0],
            end.p[0],
            t
          );

        const y=
          lerp(
            start.p[1],
            end.p[1],
            t
          );

        const z=
          lerp(
            start.p[2],
            end.p[2],
            t
          );

        addCone(
          builder,
          {
            base:[
              x,
              y,
              z
            ],
            tip:[
              x-.25,
              y-.18,
              z-.16
            ],
            radius:.10,
            radial:
              high
                ?6
                :4,
            weights:
              twoWeights(
                start.bone,
                end.bone,
                t
              ),
            material:2
          }
        );
      }
    }

    /* Tail */
    const tail0=
      bindPosition(
        HORSE_BIND,
        6
      );

    const tail1=
      bindPosition(
        HORSE_BIND,
        7
      );

    const tail2=
      bindPosition(
        HORSE_BIND,
        8
      );

    addTube(
      builder,
      {
        points:[
          [
            tail0[0]+.08,
            tail0[1]+.05,
            0
          ],
          tail0,
          tail1,
          tail2,
          [
            tail2[0]-.42,
            tail2[1]-.30,
            0
          ]
        ],
        radii:[
          .20,
          .19,
          .15,
          .10,
          .035
        ],
        radial,
        influences:t=>{
          if(t<.30){
            return twoWeights(
              1,
              6,
              t/.30
            );
          }

          if(t<.62){
            return twoWeights(
              6,
              7,
              (
                t-.30
              )/
              .32
            );
          }

          return twoWeights(
            7,
            8,
            (
              t-.62
            )/
              .38
          );
        },
        material:2
      }
    );

    /* Legs */
    addHorseLegGeometry(
      builder,
      9,
      10,
      11,
      radial,
      false
    );

    addHorseLegGeometry(
      builder,
      12,
      13,
      14,
      radial,
      false
    );

    addHorseLegGeometry(
      builder,
      15,
      16,
      17,
      radial,
      true
    );

    addHorseLegGeometry(
      builder,
      18,
      19,
      20,
      radial,
      true
    );

    /* Saddle cloth */
    addBox(
      builder,
      {
        center:[
          -.05,
          .50,
          0
        ],
        scale:[
          1.55,
          .42,
          1.20
        ],
        rotationZ:-.02,
        weights:[
          {
            bone:0,
            weight:.56
          },
          {
            bone:1,
            weight:.20
          },
          {
            bone:2,
            weight:.24
          }
        ],
        material:6
      }
    );

    /* Saddle */
    addBox(
      builder,
      {
        center:[
          -.10,
          .73,
          0
        ],
        scale:[
          1.12,
          .16,
          1.01
        ],
        rotationZ:-.02,
        weights:[
          {
            bone:0,
            weight:.65
          },
          {
            bone:1,
            weight:.16
          },
          {
            bone:2,
            weight:.19
          }
        ],
        material:7
      }
    );

    /* Face blaze */
    addBox(
      builder,
      {
        center:[
          headPoint[0]+.50,
          headPoint[1]+.13,
          .337
        ],
        scale:[
          .45,
          .055,
          .018
        ],
        rotationZ:-.28,
        weights:
          singleWeight(
            5
          ),
        material:5
      }
    );

    return builder.finish();
  }

  function createJockeyGeometry(
    quality="high"
  ){
    const high=
      quality==="high";

    const radial=
      high
        ?8
        :5;

    const longitude=
      high
        ?11
        :8;

    const latitude=
      high
        ?8
        :6;

    const builder=
      new GeometryBuilder();

    const root=
      bindPosition(
        JOCKEY_BIND,
        0
      );

    const spine=
      bindPosition(
        JOCKEY_BIND,
        1
      );

    const head=
      bindPosition(
        JOCKEY_BIND,
        2
      );

    /* Torso / silks */
    addEllipsoid(
      builder,
      {
        center:[
          spine[0],
          spine[1]+.04,
          spine[2]
        ],
        scale:[
          .40,
          .55,
          .34
        ],
        rotationZ:-.18,
        longitude,
        latitude,
        weights:[
          {
            bone:1,
            weight:.78
          },
          {
            bone:0,
            weight:.22
          }
        ],
        material:6
      }
    );

    /* Head */
    addEllipsoid(
      builder,
      {
        center:[
          head[0],
          head[1]+.05,
          head[2]
        ],
        scale:[
          .27,
          .30,
          .25
        ],
        longitude,
        latitude,
        weights:
          singleWeight(
            2
          ),
        material:8
      }
    );

    /* Helmet */
    addEllipsoid(
      builder,
      {
        center:[
          head[0]-.02,
          head[1]+.25,
          head[2]
        ],
        scale:[
          .31,
          .17,
          .30
        ],
        longitude,
        latitude:
          Math.max(
            4,
            latitude-2
          ),
        weights:
          singleWeight(
            2
          ),
        material:9
      }
    );

    const armData=[
      [3,4],
      [5,6]
    ];

    armData.forEach(
      (
        pair,
        sideIndex
      )=>{
        const upper=
          bindPosition(
            JOCKEY_BIND,
            pair[0]
          );

        const fore=
          bindPosition(
            JOCKEY_BIND,
            pair[1]
          );

        const hand=[
          fore[0]+.43,
          fore[1]-.32,
          fore[2]
        ];

        addTube(
          builder,
          {
            points:[
              upper,
              fore
            ],
            radii:[
              .11,
              .09
            ],
            radial,
            influences:t=>
              twoWeights(
                pair[0],
                pair[1],
                smoothstep(
                  .65,
                  1,
                  t
                )
              ),
            material:6
          }
        );

        addTube(
          builder,
          {
            points:[
              fore,
              hand
            ],
            radii:[
              .085,
              .055
            ],
            radial,
            influences:
              singleWeight(
                pair[1]
              ),
            material:8
          }
        );

        addEllipsoid(
          builder,
          {
            center:hand,
            scale:[
              .10,
              .09,
              .08
            ],
            longitude:
              high
                ?8
                :6,
            latitude:
              high
                ?6
                :4,
            weights:
              singleWeight(
                pair[1]
              ),
            material:8
          }
        );
      }
    );

    const legData=[
      [7,8],
      [9,10]
    ];

    legData.forEach(pair=>{
      const thigh=
        bindPosition(
          JOCKEY_BIND,
          pair[0]
        );

      const shin=
        bindPosition(
          JOCKEY_BIND,
          pair[1]
        );

      const foot=[
        shin[0]+.34,
        shin[1]-.44,
        shin[2]
      ];

      addTube(
        builder,
        {
          points:[
            thigh,
            shin
          ],
          radii:[
            .15,
            .11
          ],
          radial,
          influences:t=>
            twoWeights(
              pair[0],
              pair[1],
              smoothstep(
                .66,
                1,
                t
              )
            ),
          material:10
        }
      );

      addTube(
        builder,
        {
          points:[
            shin,
            foot
          ],
          radii:[
            .095,
            .065
          ],
          radial,
          influences:
            singleWeight(
              pair[1]
            ),
          material:4
        }
      );

      addBox(
        builder,
        {
          center:[
            foot[0]+.10,
            foot[1],
            foot[2]
          ],
          scale:[
            .32,
            .11,
            .16
          ],
          rotationZ:-.08,
          weights:
            singleWeight(
              pair[1]
            ),
          material:4
        }
      );
    });

    return builder.finish();
  }

  function makePoseLocals(
    defs
  ){
    return defs.map(def=>
      mat4TRS(
        def.translation[0],
        def.translation[1],
        def.translation[2],
        def.rotation[0],
        def.rotation[1],
        def.rotation[2]
      )
    );
  }

  function setLocal(
    locals,
    defs,
    index,
    {
      translation=null,
      rotation=null,
      scale=null
    }={}
  ){
    const def=
      defs[index];

    const t=
      translation||
      def.translation;

    const r=
      rotation||
      def.rotation;

    const s=
      scale||
      [
        1,
        1,
        1
      ];

    locals[index]=
      mat4TRS(
        t[0],
        t[1],
        t[2],
        r[0],
        r[1],
        r[2],
        s[0],
        s[1],
        s[2]
      );
  }

  function createSkinMatrices(
    defs,
    bind,
    locals
  ){
    const globalsOut=
      globalsFromLocals(
        defs,
        locals
      );

    const flattened=
      new Float32Array(
        defs.length*
        16
      );

    const matrices=
      new Array(
        defs.length
      );

    for(let index=0;index<defs.length;index++){
      const skin=
        mat4Multiply(
          globalsOut[index],
          bind.inverse[index]
        );

      matrices[index]=skin;

      flattened.set(
        skin,
        index*
        16
      );
    }

    return{
      flattened,
      globals:globalsOut,
      matrices
    };
  }

  function sampleGaitLeg(
    phase,
    speedFactor,
    legIndex,
    strideBias=1,
    energy=1,
    running=true
  ){
    const sprint=
      smoothstep(
        .68,
        1,
        speedFactor
      );

    const canter=
      1-
      smoothstep(
        .30,
        .72,
        speedFactor
      );

    const stance=
      lerp(
        .46,
        .30,
        sprint
      )+
      canter*
      .025;

    const phaseOffsets=[
      0,
      .13,
      .50,
      .64
    ];

    const cycle=
      fract(
        phase/
        TAU+
        phaseOffsets[
          legIndex
        ]
      );

    const isFore=
      legIndex>=2;

    const reach=
      (
        isFore
          ?lerp(
              .52,
              .88,
              speedFactor
            )
          :lerp(
              .45,
              .78,
              speedFactor
            )
      )*
      strideBias*
      lerp(
        .88,
        1,
        energy
      );

    const push=
      (
        isFore
          ?lerp(
              .43,
              .72,
              speedFactor
            )
          :lerp(
              .48,
              .82,
              speedFactor
            )
      )*
      strideBias;

    const liftHeight=
      (
        isFore
          ?lerp(
              .27,
              .62,
              speedFactor
            )
          :lerp(
              .24,
              .54,
              speedFactor
            )
      )*
      lerp(
        .86,
        1,
        energy
      );

    if(!running){
      const neutral=[
        -.04,
        .08,
        .12,
        -.08
      ][
        legIndex
      ];

      return{
        x:neutral,
        lift:0,
        contact:true,
        phase:cycle,
        stance
      };
    }

    if(cycle<stance){
      const t=
        cycle/
        stance;

      return{
        x:
          lerp(
            reach,
            -push,
            smoothstep(
              0,
              1,
              t
            )
          ),
        lift:0,
        contact:true,
        phase:cycle,
        stance
      };
    }

    const flight=
      (
        cycle-
        stance
      )/
      (
        1-
        stance
      );

    const arc=
      Math.pow(
        Math.max(
          0,
          Math.sin(
            PI*
            flight
          )
        ),
        .78
      );

    return{
      x:
        lerp(
          -push,
          reach,
          smoothstep(
            0,
            1,
            flight
          )
        ),
      lift:
        arc*
        liftHeight,
      contact:false,
      phase:cycle,
      stance
    };
  }

  function solveLegIK(
    locals,
    defs,
    globalsBefore,
    {
      parent,
      upper,
      lower,
      hoof,
      target,
      upperLength,
      lowerLength,
      bendSign,
      hoofPitch=0
    }
  ){
    const parentGlobal=
      globalsBefore[
        parent
      ];

    const inverseParent=
      mat4Invert(
        parentGlobal
      );

    const targetInParent=
      transformPoint(
        inverseParent,
        target
      );

    const joint=
      defs[
        upper
      ].translation;

    const dx=
      targetInParent[0]-
      joint[0];

    const dy=
      targetInParent[1]-
      joint[1];

    const distance=
      clamp(
        Math.hypot(
          dx,
          dy
        ),
        Math.abs(
          upperLength-
          lowerLength
        )+
        .02,
        upperLength+
        lowerLength-
        .025
      );

    const direction=
      Math.atan2(
        dx,
        -dy
      );

    const shoulderAlpha=
      Math.acos(
        clamp(
          (
            upperLength*
              upperLength+
            distance*
              distance-
            lowerLength*
              lowerLength
          )/
          (
            2*
            upperLength*
            distance
          ),
          -1,
          1
        )
      );

    const kneeInner=
      Math.acos(
        clamp(
          (
            upperLength*
              upperLength+
            lowerLength*
              lowerLength-
            distance*
              distance
          )/
          (
            2*
            upperLength*
            lowerLength
          ),
          -1,
          1
        )
      );

    const upperAngle=
      direction-
      bendSign*
      shoulderAlpha;

    const lowerAngle=
      bendSign*
      (
        PI-
        kneeInner
      );

    const hoofAngle=
      -(
        upperAngle+
        lowerAngle
      )+
      hoofPitch;

    setLocal(
      locals,
      defs,
      upper,
      {
        rotation:[
          0,
          0,
          upperAngle
        ]
      }
    );

    setLocal(
      locals,
      defs,
      lower,
      {
        rotation:[
          0,
          0,
          lowerAngle
        ]
      }
    );

    setLocal(
      locals,
      defs,
      hoof,
      {
        rotation:[
          0,
          0,
          hoofAngle
        ]
      }
    );
  }

  function createHorsePose(
    parameters={}
  ){
    const speed=
      clamp(
        Number(
          parameters.speed
        )||
        0,
        0,
        1.6
      );

    const speedFactor=
      clamp(
        speed/
        1.35,
        0,
        1
      );

    const running=
      Boolean(
        parameters.running
      );

    const phase=
      Number(
        parameters.phase
      )||
      0;

    const energy=
      clamp(
        (
          Number(
            parameters.energy
          )||
          100
        )/
        100,
        .12,
        1
      );

    const strideBias=
      clamp(
        Number(
          parameters.strideBias
        )||
        1,
        .82,
        1.20
      );

    const bounceBias=
      clamp(
        Number(
          parameters.bounceBias
        )||
        1,
        .75,
        1.28
      );

    const neckBias=
      clamp(
        Number(
          parameters.neckBias
        )||
        1,
        .72,
        1.30
      );

    const tailBias=
      clamp(
        Number(
          parameters.tailBias
        )||
        1,
        .70,
        1.34
      );

    const style=
      String(
        parameters.runningStyle||
        ""
      );

    const locals=
      makePoseLocals(
        HORSE_DEFS
      );

    const sprint=
      smoothstep(
        .62,
        1,
        speedFactor
      );

    const suspension=
      running
        ?Math.pow(
            Math.max(
              0,
              Math.sin(
                phase+
                PI*.36
              )
            ),
            2.15
          )*
          (
            .035+
            .090*
            speedFactor
          )*
          bounceBias
        :0;

    const compression=
      running
        ?Math.pow(
            Math.max(
              0,
              Math.sin(
                phase+
                PI*1.28
              )
            ),
            3.0
          )*
          (
            .018+
            .040*
            speedFactor
          )
        :0;

    const breathing=
      running
        ?0
        :Math.sin(
            (
              Number(
                parameters.time
              )||
              0
            )*
            .0012+
            (
              Number(
                parameters.seed
              )||
              0
            )
          )*
          .010;

    const rootY=
      suspension-
      compression+
      breathing;

    const extension=
      running
        ?Math.sin(
            phase+
            PI*.08
          )*
          (
            .015+
            .040*
            speedFactor
          )*
          strideBias
        :0;

    const rootPitch=
      running
        ?Math.sin(
            phase*
            2+
            .18
          )*
          (
            .015+
            .032*
            speedFactor
          )
        :0;

    const rootRoll=
      running
        ?Math.sin(
            phase+
            PI*.55
          )*
          (
            .006+
            .013*
            speedFactor
          )
        :0;

    setLocal(
      locals,
      HORSE_DEFS,
      0,
      {
        translation:[
          0,
          rootY,
          0
        ],
        rotation:[
          rootRoll,
          0,
          rootPitch
        ],
        scale:[
          1+
            extension*
            .12,
          1-
            compression*
            .08,
          1
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      1,
      {
        translation:[
          HORSE_DEFS[1].translation[0]-
            extension*
            .52,
          HORSE_DEFS[1].translation[1],
          0
        ],
        rotation:[
          0,
          0,
          running
            ?Math.sin(
                phase+
                PI*.18
              )*
              (
                .020+
                .045*
                speedFactor
              )
            :0
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      2,
      {
        translation:[
          HORSE_DEFS[2].translation[0]+
            extension*
            .52,
          HORSE_DEFS[2].translation[1],
          0
        ],
        rotation:[
          0,
          0,
          running
            ?-Math.sin(
                phase+
                PI*.18
              )*
              (
                .018+
                .038*
                speedFactor
              )
            :0
        ]
      }
    );

    const frontRunnerPosture=
      style==="Front Runner"
        ?.035
        :style==="Pace Presser"
          ?.018
          :style==="Deep Closer"&&
            speedFactor>.75
            ?.028
            :0;

    const neckWave=
      running
        ?Math.sin(
            phase+
            PI*.68
          )*
          (
            .035+
            .070*
            speedFactor
          )*
          neckBias
        :0;

    const headWave=
      running
        ?Math.sin(
            phase+
            PI*.92
          )*
          (
            .025+
            .050*
            speedFactor
          )*
          neckBias
        :0;

    setLocal(
      locals,
      HORSE_DEFS,
      3,
      {
        rotation:[
          0,
          0,
          HORSE_DEFS[3].rotation[2]+
            neckWave*
            .58-
            frontRunnerPosture
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      4,
      {
        rotation:[
          0,
          0,
          HORSE_DEFS[4].rotation[2]+
            neckWave*
            .72-
            frontRunnerPosture*
            .72
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      5,
      {
        rotation:[
          0,
          0,
          HORSE_DEFS[5].rotation[2]+
            headWave-
            neckWave*
            .22
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      21,
      {
        rotation:[
          0,
          0,
          HORSE_DEFS[21].rotation[2]+
            (
              running
                ?Math.max(
                    0,
                    Math.sin(
                      phase+
                      .7
                    )
                  )*
                  .035
                :0
            )
        ]
      }
    );

    const tailWave=
      running
        ?Math.sin(
            phase*
            .82+
            PI*.30
          )*
          (
            .15+
            .18*
            speedFactor
          )*
          tailBias
        :Math.sin(
            (
              Number(
                parameters.time
              )||
              0
            )*
            .001+
            (
              Number(
                parameters.seed
              )||
              0
            )
          )*
          .035;

    setLocal(
      locals,
      HORSE_DEFS,
      6,
      {
        rotation:[
          .04*
            Math.sin(
              phase*.71
            ),
          0,
          HORSE_DEFS[6].rotation[2]+
            tailWave*
            .34
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      7,
      {
        rotation:[
          .10*
            Math.sin(
              phase*.71+
              .6
            ),
          0,
          HORSE_DEFS[7].rotation[2]+
            tailWave*
            .70
        ]
      }
    );

    setLocal(
      locals,
      HORSE_DEFS,
      8,
      {
        rotation:[
          .16*
            Math.sin(
              phase*.71+
              1.1
            ),
          0,
          HORSE_DEFS[8].rotation[2]+
            tailWave
        ]
      }
    );

    /*
      Build torso globals before solving the four limb chains.
      Hoof targets remain fixed against the ground while the body
      compresses and extends over them.
    */
    let globalsBefore=
      globalsFromLocals(
        HORSE_DEFS,
        locals
      );

    const legDefinitions=[
      {
        parent:2,
        upper:9,
        lower:10,
        hoof:11,
        side:.36,
        fore:true,
        index:2
      },
      {
        parent:2,
        upper:12,
        lower:13,
        hoof:14,
        side:-.36,
        fore:true,
        index:3
      },
      {
        parent:1,
        upper:15,
        lower:16,
        hoof:17,
        side:.36,
        fore:false,
        index:0
      },
      {
        parent:1,
        upper:18,
        lower:19,
        hoof:20,
        side:-.36,
        fore:false,
        index:1
      }
    ];

    const hoofSamples=[];
    const hoofAnchors=[];

    legDefinitions.forEach(definition=>{
      const sample=
        sampleGaitLeg(
          phase,
          speedFactor,
          definition.index,
          strideBias,
          energy,
          running
        );

      const parentGlobal=
        globalsBefore[
          definition.parent
        ];

      const hip=
        transformPoint(
          parentGlobal,
          HORSE_DEFS[
            definition.upper
          ].translation
        );

      const target=[
        hip[0]+
          sample.x,
        -HORSE_MODEL_HEIGHT+
          sample.lift,
        hip[2]+
          (
            definition.side>
            0
              ?.018
              :-.018
          )
      ];

      solveLegIK(
        locals,
        HORSE_DEFS,
        globalsBefore,
        {
          parent:
            definition.parent,
          upper:
            definition.upper,
          lower:
            definition.lower,
          hoof:
            definition.hoof,
          target,
          upperLength:
            definition.fore
              ?1.05
              :1.06,
          lowerLength:
            definition.fore
              ?1.05
              :1.06,
          bendSign:
            definition.fore
              ?1
              :-1,
          hoofPitch:
            definition.fore
              ?-.045+
                sprint*
                -.025
              :.035
        }
      );

      globalsBefore=
        globalsFromLocals(
          HORSE_DEFS,
          locals
        );

      const hoofGlobal=
        globalsBefore[
          definition.hoof
        ];

      hoofSamples.push(
        sample
      );

      hoofAnchors.push([
        hoofGlobal[12],
        hoofGlobal[13]-
          .05,
        hoofGlobal[14]
      ]);
    });

    const skin=
      createSkinMatrices(
        HORSE_DEFS,
        HORSE_BIND,
        locals
      );

    const headGlobal=
      skin.globals[5];

    const jawGlobal=
      skin.globals[21];

    return{
      bones:
        skin.flattened,
      globals:
        skin.globals,
      speedFactor,
      sprint,
      rootY,
      rootPitch,
      rootRoll,
      suspension,
      compression,
      hoofSamples,
      hoofAnchors,
      anchors:{
        label:
          transformPoint(
            headGlobal,
            [
              .38,
              .56,
              0
            ]
          ),
        bridleLeft:
          transformPoint(
            headGlobal,
            [
              .64,
              -.02,
              .23
            ]
          ),
        bridleRight:
          transformPoint(
            headGlobal,
            [
              .64,
              -.02,
              -.23
            ]
          ),
        muzzle:
          transformPoint(
            jawGlobal,
            [
              .42,
              0,
              0
            ]
          )
      }
    };
  }

  function createJockeyPose(
    parameters={}
  ){
    const speedFactor=
      clamp(
        Number(
          parameters.speedFactor
        )||
        0,
        0,
        1
      );

    const running=
      Boolean(
        parameters.running
      );

    const phase=
      Number(
        parameters.phase
      )||
      0;

    const motionBias=
      clamp(
        Number(
          parameters.motionBias
        )||
        1,
        .75,
        1.30
      );

    const locals=
      makePoseLocals(
        JOCKEY_DEFS
      );

    const suspension=
      Number(
        parameters.suspension
      )||
      0;

    const crouch=
      lerp(
        .46,
        .73,
        speedFactor
      );

    const rise=
      running
        ?Math.sin(
            phase+
            PI*.38
          )*
          (
            .018+
            .040*
            speedFactor
          )*
          motionBias
        :0;

    setLocal(
      locals,
      JOCKEY_DEFS,
      0,
      {
        translation:[
          JOCKEY_DEFS[0].translation[0],
          JOCKEY_DEFS[0].translation[1]+
            suspension*
            .65+
            rise,
          0
        ],
        rotation:[
          0,
          0,
          -crouch
        ]
      }
    );

    setLocal(
      locals,
      JOCKEY_DEFS,
      1,
      {
        rotation:[
          0,
          0,
          -.10-
            speedFactor*
            .16-
            rise*
            .35
        ]
      }
    );

    setLocal(
      locals,
      JOCKEY_DEFS,
      2,
      {
        rotation:[
          0,
          0,
          .16+
            speedFactor*
            .10
        ]
      }
    );

    const armReach=
      .94+
      speedFactor*
      .14;

    [
      3,
      5
    ].forEach(
      (
        upper,
        index
      )=>{
        setLocal(
          locals,
          JOCKEY_DEFS,
          upper,
          {
            rotation:[
              0,
              0,
              -1.00-
                speedFactor*
                .10+
                (
                  index===0
                    ?.012
                    :-.012
                )
            ]
          }
        );
      }
    );

    [
      4,
      6
    ].forEach(lower=>{
      setLocal(
        locals,
        JOCKEY_DEFS,
        lower,
        {
          rotation:[
            0,
            0,
            .48+
              armReach*
              .10
          ]
        }
      );
    });

    [
      7,
      9
    ].forEach(
      (
        thigh,
        index
      )=>{
        setLocal(
          locals,
          JOCKEY_DEFS,
          thigh,
          {
            rotation:[
              0,
              0,
              .62+
                speedFactor*
                .08+
                (
                  index===0
                    ?.015
                    :-.015
                )
            ]
          }
        );
      }
    );

    [
      8,
      10
    ].forEach(shin=>{
      setLocal(
        locals,
        JOCKEY_DEFS,
        shin,
        {
          rotation:[
            0,
            0,
            -1.18-
              speedFactor*
              .08
          ]
        }
      );
    });

    const skin=
      createSkinMatrices(
        JOCKEY_DEFS,
        JOCKEY_BIND,
        locals
      );

    const leftFore=
      skin.globals[4];

    const rightFore=
      skin.globals[6];

    return{
      bones:
        skin.flattened,
      globals:
        skin.globals,
      anchors:{
        leftHand:
          transformPoint(
            leftFore,
            [
              0,
              -.54,
              0
            ]
          ),
        rightHand:
          transformPoint(
            rightFore,
            [
              0,
              -.54,
              0
            ]
          ),
        head:
          transformPoint(
            skin.globals[2],
            [
              0,
              .32,
              0
            ]
          )
      }
    };
  }

  global.RaceMarketHorseRig={
    version:"3.0.0",
    HORSE_BONE_COUNT,
    JOCKEY_BONE_COUNT,
    HORSE_MODEL_HEIGHT,
    horseDefinitions:
      HORSE_DEFS.map(def=>({
        ...def,
        translation:[
          ...def.translation
        ],
        rotation:[
          ...def.rotation
        ]
      })),
    jockeyDefinitions:
      JOCKEY_DEFS.map(def=>({
        ...def,
        translation:[
          ...def.translation
        ],
        rotation:[
          ...def.rotation
        ]
      })),
    createHorseGeometry,
    createJockeyGeometry,
    createHorsePose,
    createJockeyPose,
    sampleGaitLeg,
    transformPoint,
    mat4TRS,
    mat4Multiply,
    clamp,
    smoothstep
  };
})(window);
