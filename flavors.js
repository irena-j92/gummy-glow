export const flavors=Object.freeze({
 watermelon:{title:'WATERMELON TRANCE',profile:'FRUITY / FRESH / PLAYFUL',notes:'Bright, fruity, and a little bit dreamy. A little summer, every day.',gummy:'pink-gummy-new',color:'#fc8cf6'},
 elderflower:{title:'ELDERFLOWER LULLABY',profile:'FLORAL / DELICATE / DREAMY',notes:'Soft floral notes with a fresh little twist. Flower power for your routine.',gummy:'teal-gummy',color:'#94edcf'},
 pumpkin:{title:'PUMPKIN ENERGY',profile:'MELLOW / WARM / SUNNY',notes:'Warm, mellow, and full of sunny personality. Your pocketful of sunshine.',gummy:'orange-gummy-glow',color:'#ffa851'},
 blueberry:{title:'BLUEBERRY BOMB',profile:'BERRY / BOLD / BRIGHT',notes:'Bold berry flavor with a playful little punch. Delightfully blue.',gummy:'star-gummy',color:'#80c9ff'}
});
export function restorePick(value){return Object.hasOwn(flavors,value)?value:null;}
export function tourProgress(scroll,height,viewport){return Math.min(1,Math.max(0,scroll/Math.max(1,height-viewport)));}
