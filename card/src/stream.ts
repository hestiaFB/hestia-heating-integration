// One subscription to Hestia Chauffage per connection, shared by every Chauffage card of the page (the same as Hestia
// Énergie's, audit of 9 Nov. 2026): the integration sends the cards' view once, then only its parts that changed.

export type Connection={subscribeMessage:<T>(callback:(m:T)=>void,msg:Record<string,unknown>)=>Promise<()=>Promise<void>>};
type Message={version:number;view?:Record<string,unknown>;changes?:Record<string,unknown>;removed?:string[];reload?:true};
export type StreamError={code?:string;message?:string};
type Listener={view:(v:Record<string,unknown>)=>void;error:(e:StreamError)=>void;reload:()=>void};
type Stream={listeners:Set<Listener>;last?:Record<string,unknown>;stop?:Promise<()=>Promise<void>>;closing?:ReturnType<typeof setTimeout>};

/** How long a stream without cards stays open: a dashboard redrawing its cards keeps it. */
export const GRACE_MS=5_000;
const streams=new WeakMap<Connection,Stream>();

function close(connection:Connection,stream:Stream){
 if(streams.get(connection)===stream)streams.delete(connection);
 clearTimeout(stream.closing);
 void stream.stop?.then(stop=>stop()).catch(()=>{/* already closed */});
}

/** Follows the cards' view. Returns what stops following. */
export function follow(connection:Connection,view:Listener['view'],error:Listener['error'],reload:Listener['reload']):()=>void{
 let stream=streams.get(connection);
 const listener:Listener={view,error,reload};
 if(!stream){
  const created:Stream={listeners:new Set()};
  stream=created;streams.set(connection,created);
  created.stop=connection.subscribeMessage<Message>(m=>{
   if(m.reload){
    // The brick was reloaded: each card follows the new one a moment later.
    close(connection,created);
    for(const l of [...created.listeners])l.reload();
    return;
   }
   let next:Record<string,unknown>;
   if(m.changes){
    if(!created.last)return;
    next={...created.last,...m.changes};
    for(const k of m.removed??[])delete next[k];
   }else if(m.view)next=m.view;
   else return;
   created.last=next;
   for(const l of [...created.listeners])l.view(next);
  },{type:'hestia_heating/subscribe'});
  created.stop.catch((e:StreamError)=>{
   if(streams.get(connection)===created)streams.delete(connection);
   for(const l of [...created.listeners])l.error(e);
  });
 }else{
  clearTimeout(stream.closing);stream.closing=undefined;
  const last=stream.last;
  if(last)queueMicrotask(()=>{if(stream!.listeners.has(listener))view(last);});
 }
 const joined=stream;
 joined.listeners.add(listener);
 return ()=>{
  if(!joined.listeners.delete(listener)||joined.listeners.size)return;
  clearTimeout(joined.closing);
  joined.closing=setTimeout(()=>{if(!joined.listeners.size)close(connection,joined);},GRACE_MS);
 };
}
