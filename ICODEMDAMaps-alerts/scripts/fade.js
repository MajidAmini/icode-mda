var TimeToFade = 1000.0;

function animateFade(lastTick, eid)
{  
  var curTick = new Date().getTime();
  var elapsedTicks = curTick - lastTick;
  
  var element = document.getElementById(eid);

  if (element == null)
  {
     return;
  }
 
  if(element.FadeTimeLeft <= elapsedTicks)
  {
    element.style.opacity = element.FadeState == 1 ? '1' : '0';
    element.style.filter = 'alpha(opacity = ' + (element.FadeState == 1 ? '100' : '0') + ')';
    element.FadeState = element.FadeState == 1 ? 2 : -2;
    return;
  }
 
  element.FadeTimeLeft -= elapsedTicks;
  var newOpVal = element.FadeTimeLeft/TimeToFade;
  if(element.FadeState == 1)
    newOpVal = 1 - newOpVal;

  element.style.opacity = newOpVal;
  element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';
  
    setTimeout(function(){animateFade(curTick,eid)}, 33);
}


function fadeToggle(eid)
{
  var element = document.getElementById(eid);
  
   
  if(element.FadeState == null)
  {
    if(element.style.opacity == null || element.style.opacity == '' 
       || element.style.opacity == '1')
      element.FadeState = 2;
    else
      element.FadeState = -2;
  }
    
  if(element.FadeState == 1 || element.FadeState == -1)
  {
    element.FadeState = element.FadeState == 1 ? -1 : 1;
    element.FadeTimeLeft = TimeToFade - element.FadeTimeLeft;
  }
  else
  {
    element.FadeState = element.FadeState == 2 ? -1 : 1;
    element.FadeTimeLeft = TimeToFade;
    setTimeout(function(){animateFade(new Date().getTime(),eid)}, 33);
  }  
}


$(document).ready(function(){
   if ($('#status-msg')) {    //check if status-msg div exists
      setTimeout(function(){
         fadeToggle('status-msg');
         //Remove the div entirely from the page
         /*
         setTimeout(function(){
            var div = document.getElementById('status-msg');
            div.parentNode.removeChild(div);   
         }, TimeToFade);
         */
      }, 3000);
   }
   else {
      //Do nothing, status-msg div not found
   }
});
