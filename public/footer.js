export function bindNewsletter(form,{fetcher=globalThis.fetch}={}){
 const input=form.querySelector('[name="email"]'),button=form.querySelector('[type="submit"]'),status=form.querySelector('[role="status"]');
 let pending=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(pending||!form.reportValidity())return;
  pending=true;button.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Saving your sign-up…';
  try{
   const response=await fetcher(form.action,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:input.value,consent:true,website:form.querySelector('[name="website"]').value})});
   const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||'We couldn’t save your sign-up. Please try again.');
   status.textContent='You’re on the list! Thanks for adding a little glow to your inbox.';form.reset();
  }catch(error){status.textContent=error.message==='Failed to fetch'?'We couldn’t connect. Please try again.':error.message||'Please try again shortly.';}
  finally{pending=false;button.disabled=false;form.removeAttribute('aria-busy');}
 });
}
const panels={
 faq:['A little glow knowledge','<p>Explore all four pouch flavors and three daily sticks in <a href="/collection/">the collection</a>.</p><p>This is a private shopping preview. The bag saves your selection on this device; payments and orders are not available.</p><p>Prefer a quieter factory? Open the profile icon in the navigation to choose less motion.</p>'],
 social:['More glow is coming','<p>Gummy Glow’s social accounts haven’t been connected to this private preview yet. Explore the factory or join the newsletter for updates.</p>'],
 credit:['Made with a little glow','<p>Brand artwork and product references supplied by Gummy Glow. Factory motion uses GSAP and Three.js, with locally hosted Anton and Outfit typefaces.</p>'],
 privacy:['Privacy Policy','<p>This private preview stores your bag on this device. If you subscribe, your email address, sign-up time and consent version are saved in the website’s database.</p><p>The sign-up form does not send an email or place an order. No payment information is collected. Social links are not connected to third-party accounts.</p>'],
 terms:['Terms of Service','<p>Gummy Glow is a private brand and shopping preview. Product information and discount messaging are illustrative; checkout, orders and discount redemption are not available.</p><p>Newsletter sign-up records your interest. It does not create a paid subscription or guarantee a discount.</p>']
};
if(typeof document!=='undefined'){
 const form=document.querySelector('#footer-signup');if(form)bindNewsletter(form);
 const dialog=document.querySelector('#footer-dialog');let opener;
 for(const button of document.querySelectorAll('[data-footer-panel]'))button.addEventListener('click',()=>{
  const panel=panels[button.dataset.footerPanel];if(!panel||!dialog)return;
  opener=button;dialog.querySelector('#footer-dialog-title').textContent=panel[0];dialog.querySelector('#footer-dialog-copy').innerHTML=panel[1];dialog.showModal();
 });
 document.querySelector('#footer-dialog-close')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('close',()=>opener?.focus());
}
