import {findProduct,plans} from './catalog.js';
export const bagKey='gummy-glow-bag-v1';
export const quantity=value=>Math.min(99,Math.max(1,Math.floor(Number(value)||1)));
export function normalizeBag(input){
 if(!Array.isArray(input))return [];
 const result=[];
 for(const line of input.slice(0,50)){
  if(!line||!findProduct(line.id)||!Object.hasOwn(plans,line.plan)||!Number.isFinite(Number(line.quantity))||Number(line.quantity)<1)continue;
  const previous=result.find(x=>x.id===line.id&&x.plan===line.plan);
  if(previous)previous.quantity=quantity(previous.quantity+Number(line.quantity));else result.push({id:line.id,plan:line.plan,quantity:quantity(line.quantity)});
 }
 return result;
}
export function readBag(storage){try{return normalizeBag(JSON.parse(storage.getItem(bagKey)||'[]'));}catch{return [];}}
export function saveBag(storage,bag){try{storage.setItem(bagKey,JSON.stringify(normalizeBag(bag)));return true;}catch{return false;}}
export function addToBag(bag,id,plan,count){return normalizeBag([...bag,{id,plan,quantity:quantity(count)}]);}
export function updateBag(bag,index,count){return normalizeBag(bag.map((line,i)=>i===index?{...line,quantity:quantity(count)}:line));}
export const bagCount=bag=>bag.reduce((sum,line)=>sum+line.quantity,0);
