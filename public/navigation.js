// Native dialogs keep keyboard focus contained and return it to the trigger.
const button=document.querySelector('#glow-settings'),dialog=document.querySelector('#glow-dialog');
button.addEventListener('click',()=>dialog.showModal());
document.querySelector('#glow-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>button.focus());
