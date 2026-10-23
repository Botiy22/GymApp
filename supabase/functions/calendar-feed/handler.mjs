/* Authenticated, read-only calendar relay. Never stores subscription links or calendar bodies. */
const MAX_BYTES=2*1024*1024;
const STANDARD_HOSTS=['calendar.google.com','outlook.live.com','outlook.office365.com','outlook.office.com','caldav.icloud.com','neptun.bme.hu'];
export function validFeedUrl(value,extraHosts=[]){
  let url;try{url=new URL(String(value).replace(/^webcal:/i,'https:'));}catch(_){return null;}
  const host=url.hostname.toLowerCase();
  if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443'||url.href.length>2048)return null;
  if(!STANDARD_HOSTS.includes(host)&&!/^p\d{1,3}-caldav\.icloud\.com$/.test(host)&&!extraHosts.includes(host))return null;
  return url;
}
export function createHandler({projectUrl,anonKey,origins=[],extraHosts=[],fetcher=fetch,now=Date.now}){
  const attempts=new Map();
  return async request=>{
    const origin=request.headers.get('Origin')||'';
    const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
    if(origin&&origins.includes(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'});
    const reply=(status,code,body={})=>new Response(JSON.stringify(code?{code}:body),{status,headers});
    if(origin&&!origins.includes(origin))return reply(403,'plannerOriginDenied');
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(request.method!=='POST')return reply(405,'method');
    if(!projectUrl||!anonKey)return reply(503,'plannerCalendarSetup');
    const auth=request.headers.get('Authorization');if(!/^Bearer [A-Za-z0-9._-]+$/.test(auth||''))return reply(401,'auth');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{
      const check=await fetcher(projectUrl.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:anonKey,Authorization:auth},signal:controller.signal});
      if(!check.ok)return reply(401,'auth');const user=await check.json();if(!user?.id)return reply(401,'auth');
      const at=now(),bucket=attempts.get(user.id);if(bucket&&at-bucket.at<60000&&bucket.count>=20)return reply(429,'rate');
      if(attempts.size>5000)for(const [id,value]of attempts)if(at-value.at>=60000)attempts.delete(id);
      if(attempts.size>10000)return reply(429,'rate');
      attempts.set(user.id,bucket&&at-bucket.at<60000?{at:bucket.at,count:bucket.count+1}:{at,count:1});
      // Bound the request stream too, instead of trusting a caller-supplied Content-Length.
      const input=request.body?.getReader();let size=0;const parts=[];
      if(input)while(true){const {value,done}=await input.read();if(done)break;size+=value.byteLength;if(size>4096){await input.cancel();return reply(413,'plannerBadUrl');}parts.push(value);}
      const joined=new Uint8Array(size);let offset=0;for(const part of parts){joined.set(part,offset);offset+=part.byteLength;}
      let data;try{data=JSON.parse(new TextDecoder().decode(joined));}catch(_){return reply(400,'plannerBadUrl');}
      let url=validFeedUrl(data.url,extraHosts);if(!url)return reply(400,'plannerBadUrl');
      let response;
      for(let redirects=0;redirects<=3;redirects++){
        response=await fetcher(url.href,{redirect:'manual',headers:{Accept:'text/calendar'},signal:controller.signal});
        if(![301,302,303,307,308].includes(response.status))break;
        const location=response.headers.get('location');await response.body?.cancel();
        url=location?validFeedUrl(new URL(location,url).href,extraHosts):null;
        if(!url||redirects===3)return reply(400,'plannerBadUrl');
      }
      if(!response.ok){await response.body?.cancel();return reply(502,'plannerSyncFailed');}
      if(Number(response.headers.get('content-length'))>MAX_BYTES){await response.body?.cancel();return reply(413,'plannerCalendarLimit');}
      const reader=response.body?.getReader();if(!reader)return reply(422,'plannerInvalidCalendar');
      let bytes=0;const chunks=[];
      while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>MAX_BYTES){await reader.cancel();return reply(413,'plannerCalendarLimit');}chunks.push(value);}
      const buffer=new Uint8Array(bytes);offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}
      const ics=new TextDecoder().decode(buffer);if(!/^\s*BEGIN:VCALENDAR\b/i.test(ics))return reply(422,'plannerInvalidCalendar');
      return reply(200,null,{ics});
    }catch(_){return reply(502,'plannerSyncFailed');}finally{clearTimeout(timer);}
  };
}
