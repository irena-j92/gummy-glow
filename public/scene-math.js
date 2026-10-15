/* Grip measurements: claw1024×1536 seal contact1400, tips1436.
   Original pouch498×803: seal center247,2; artwork center247,401.
   Restore its original artwork at 75% of the aperture height. */
(() => {
 const timing=Object.freeze({descent:1.8,lift:1.7,release:.18,exit:1.35,drop:.8,recoil:.42});
 function heroGeometry(width,height){
  const responsiveScale=Math.min(1,width*.76/(680*488/798),height*.75/680);
  const clawWidth=1100*responsiveScale,clawHeight=clawWidth*1536/1024,scale=clawWidth/1024;
  const packScale=680/798*responsiveScale,packWidth=498*packScale,packHeight=803*packScale;
  const centerY=height/2-401*packScale,pickupY=1400*scale-2*packScale;
  return {clawWidth,clawHeight,clawX:width/2-510*scale,packWidth,packHeight,packX:width/2-247*packScale,centerY,pickupY,clawReleaseY:centerY-pickupY,offscreenY:-clawHeight-30,scale,packScale};
 }
 // Centers measured within the reference's x97..766 / y110..660 aperture.
 const popLayout=Object.freeze([
  [.058,.085,.15,4],[.943,.056,.14,4],[.326,.258,.065,0],[.767,.32,.075,1],
  [.102,.662,.05,0],[.320,.86,.07,0],[.052,.955,.12,2],[.943,.927,.14,3]
 ]);
 function heroPopGeometry(width,height){return popLayout.map(([x,y,w,blur])=>{const size=width*w,h=size*632/640;return {left:width*x-size/2,width:size,height:h,apex:height*y-h/2,bottom:height+h+20,blur};});}
 function headingFontSize(width,advance,letters){return width*.985/(advance-(letters-1)*.035);}
 window.GummyScene=Object.freeze({heroGeometry,heroPopGeometry,headingFontSize,popLayout,timing});
})();
