/* Coordinates measured from the supplied PNGs, including transparent padding.
   Claw: 1024×1536, grip center x=510, seal contact y=1400, tips y=1436.
   Pouch visible bounds: x=3..491, y=2..800 within 498×803. */
(() => {
 const timing = Object.freeze({descent:1.8,lift:1.7,release:.18,exit:1.35,drop:.8,recoil:.42});
 function heroGeometry(width,height) {
  // Desktop targets: 770px claw canvas, approximately 360×560px pouch.
  // Preserve the pouch aspect ratio: its visible artwork is about 340×557px.
  const responsiveScale=Math.min(1,width*.82/360,height*.72/560);
  const clawWidth=770*responsiveScale,clawHeight=clawWidth*1536/1024;
  const scale=clawWidth/1024;
  const packHeight=560*responsiveScale,packWidth=packHeight*498/803,packScale=packHeight/803;
  const centerY=height/2-401*packScale;
  const pickupY=1400*scale-2*packScale;
  return {clawWidth,clawHeight,clawX:width/2-510*scale,packWidth,packHeight,packX:width/2-247*packScale,centerY,pickupY,clawReleaseY:centerY-pickupY,offscreenY:-clawHeight-30,scale};
 }
 window.GummyScene=Object.freeze({heroGeometry,timing});
})();
