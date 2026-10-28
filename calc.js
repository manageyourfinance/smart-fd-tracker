(function(){
  var $=function(id){return document.getElementById(id)};
  var amt=$('c-amt'),rate=$('c-rate'),ten=$('c-ten'),tds=$('c-tds');
  if(!amt)return;
  var mode='fd',tfd=$('t-fd'),trd=$('t-rd');
  var inr=new Intl.NumberFormat('en-IN',{maximumFractionDigits:0});
  var shown=0,raf=0;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(n){return '₹'+inr.format(Math.round(n))}
  function tenureText(m){var y=Math.floor(m/12),r=m%12,s=[];if(y)s.push(y+(y===1?' year':' years'));if(r)s.push(r+(r===1?' month':' months'));return s.join(' ')}
  function dateText(m){var d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
  function roll(to){
    cancelAnimationFrame(raf);
    if(reduce){shown=to;$('c-big').textContent=fmt(to);return}
    var from=shown,t0=null,dur=420;
    function step(t){if(t0===null)t0=t;var k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,3);
      shown=from+(to-from)*k;$('c-big').textContent=fmt(shown);if(k<1)raf=requestAnimationFrame(step)}
    raf=requestAnimationFrame(step);
  }
  function calc(){
    var p=Math.max(0,parseFloat(amt.value)||0),r=Math.max(0,parseFloat(rate.value)||0),m=parseInt(ten.value,10);
    var mat,dep;
    if(mode==='rd'){mat=0;for(var k=0;k<m;k++)mat+=p*Math.pow(1+r/400,(m-k)/3);dep=p*m}else{mat=p*Math.pow(1+r/400,4*m/12);dep=p}
    var interest=mat-dep,t=tds.checked?interest*0.10:0,net=mat-t;
    $('c-ten-read').textContent=tenureText(m);
    $('c-date').textContent='on '+dateText(m);
    $('c-p').textContent=fmt(dep);$('c-i').textContent='+ '+fmt(interest);
    $('c-trow').hidden=!tds.checked;$('c-tv').textContent='− '+fmt(t);
    $('c-net').textContent=fmt(net);
    var total=dep+interest||1;
    $('s-p').style.width=(dep/total*100)+'%';$('s-i').style.width=((interest-t)/total*100)+'%';$('s-t').style.width=(t/total*100)+'%';
    roll(net);
  }
  ['input','change'].forEach(function(e){[amt,rate,ten,tds].forEach(function(el){el.addEventListener(e,calc)})});
  function setMode(m){
    mode=m;var rd=m==='rd';
    tfd.setAttribute('aria-selected',rd?'false':'true');trd.setAttribute('aria-selected',rd?'true':'false');
    $('c-amt-l').textContent=rd?'Monthly deposit (₹)':'Amount (₹)';
    $('c-p-l').textContent=rd?'Total deposited':'Amount invested';
    $('c-fine').textContent=rd?'Estimate for a recurring deposit: a deposit every month, each compounded every quarter until maturity. Your bank’s receipt is the final word.':'Estimate for a cumulative FD, interest compounded every quarter. Your bank’s receipt is the final word.';
    amt.step=rd?'500':'1000';amt.value=rd?'10000':'500000';rate.value=rd?'6.80':'7.10';
    calc();
  }
  tfd.addEventListener('click',function(){setMode('fd')});trd.addEventListener('click',function(){setMode('rd')});
  calc();
})();
