(function(){"use strict";function r(f){return(f*1e3/sampleRate).toFixed(1)}function i(f){return Math.round(f*sampleRate/1e3)}class u extends AudioWorkletProcessor{constructor(){super(),console.log("Moshi processor lives",currentFrame,sampleRate),console.log(currentTime);let l=i(80);this.initialBufferSamples=1*l,this.partialBufferSamples=i(10),this.maxBufferSamples=i(10),this.partialBufferIncrement=i(5),this.maxPartialWithIncrements=i(80),this.maxBufferSamplesIncrement=i(5),this.maxMaxBufferWithIncrements=i(80),this.initState(),this.port.onmessage=a=>{if(a.data.type=="reset"){console.log("Reset audio processor state."),this.initState();return}let m=a.data.frame;if(this.frames.push(m),this.currentSamples()>=this.initialBufferSamples&&!this.started&&this.start(),this.pidx<20&&console.log(this.timestamp(),"Got packet",this.pidx++,r(this.currentSamples()),r(m.length)),this.currentSamples()>=this.totalMaxBufferSamples()){console.log(this.timestamp(),"Dropping packets",r(this.currentSamples()),r(this.totalMaxBufferSamples()));let h=this.initialBufferSamples+this.partialBufferSamples;for(;this.currentSamples()>this.initialBufferSamples+this.partialBufferSamples;){let e=this.frames[0],t=this.currentSamples()-h;t=Math.min(e.length-this.offsetInFirstBuffer,t),this.offsetInFirstBuffer+=t,this.timeInStream+=t/sampleRate,this.offsetInFirstBuffer==e.length&&(this.frames.shift(),this.offsetInFirstBuffer=0)}console.log(this.timestamp(),"Packet dropped",r(this.currentSamples())),this.maxBufferSamples+=this.maxBufferSamplesIncrement,this.maxBufferSamples=Math.min(this.maxMaxBufferWithIncrements,this.maxBufferSamples),console.log("Increased maxBuffer to",r(this.maxBufferSamples))}this.currentSamples()/sampleRate,this.port.postMessage({totalAudioPlayed:this.totalAudioPlayed,actualAudioPlayed:this.actualAudioPlayed,delay:a.data.micDuration-this.timeInStream,minDelay:this.minDelay,maxDelay:this.maxDelay})}}initState(){this.frames=new Array,this.offsetInFirstBuffer=0,this.firstOut=!1,this.remainingPartialBufferSamples=0,this.timeInStream=0,this.resetStart(),this.totalAudioPlayed=0,this.actualAudioPlayed=0,this.maxDelay=0,this.minDelay=2e3,this.pidx=0,this.partialBufferSamples=i(10),this.maxBufferSamples=i(10)}totalMaxBufferSamples(){return this.maxBufferSamples+this.partialBufferSamples+this.initialBufferSamples}timestamp(){return Date.now()%1e3}currentSamples(){let l=0;for(let a=0;a<this.frames.length;a++)l+=this.frames[a].length;return l-=this.offsetInFirstBuffer,l}resetStart(){this.started=!1}start(){this.started=!0,this.remainingPartialBufferSamples=this.partialBufferSamples,this.firstOut=!0}canPlay(){return this.started&&this.frames.length>0&&this.remainingPartialBufferSamples<=0}process(l,a,m){let h=this.currentSamples()/sampleRate;this.canPlay()&&(this.maxDelay=Math.max(this.maxDelay,h),this.minDelay=Math.min(this.minDelay,h));const e=a[0][0];if(!this.canPlay())return this.actualAudioPlayed>0&&(this.totalAudioPlayed+=e.length/sampleRate),this.remainingPartialBufferSamples-=e.length,!0;this.firstOut&&console.log(this.timestamp(),"Audio resumed",r(this.currentSamples()),this.remainingPartialBufferSamples),this.frames[0];let t=0;for(;t<e.length&&this.frames.length;){let s=this.frames[0],n=Math.min(s.length-this.offsetInFirstBuffer,e.length-t);e.set(s.subarray(this.offsetInFirstBuffer,this.offsetInFirstBuffer+n),t),this.offsetInFirstBuffer+=n,t+=n,this.offsetInFirstBuffer==s.length&&(this.offsetInFirstBuffer=0,this.frames.shift())}if(this.firstOut){this.firstOut=!1;for(let s=0;s<t;s++)e[s]*=s/t}if(t<e.length){console.log(this.timestamp(),"Missed some audio",e.length-t),this.partialBufferSamples+=this.partialBufferIncrement,this.partialBufferSamples=Math.min(this.partialBufferSamples,this.maxPartialWithIncrements),console.log("Increased partial buffer to",r(this.partialBufferSamples)),this.resetStart();for(let s=0;s<t;s++)e[s]*=(t-s)/t}return this.totalAudioPlayed+=e.length/sampleRate,this.actualAudioPlayed+=t/sampleRate,this.timeInStream+=t/sampleRate,!0}}registerProcessor("moshi-processor",u)})();
