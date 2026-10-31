"""Small standard-library CDP client for the repository's installed-Chrome QA."""
import base64,hashlib,json,os,socket,struct,subprocess,tempfile,time,urllib.request
from urllib.parse import urlsplit
class Browser:
 def __init__(self,executable):
  self.profile=tempfile.TemporaryDirectory();self.sequence=0;self.events=[]
  with socket.socket() as s:s.bind(('127.0.0.1',0));self.port=s.getsockname()[1]
  self.process=subprocess.Popen([executable,'--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars','--force-prefers-reduced-motion','--no-first-run','--no-default-browser-check','--user-data-dir='+self.profile.name,'--remote-debugging-port='+str(self.port),'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  for _ in range(150):
   try:
    with urllib.request.urlopen(f'http://127.0.0.1:{self.port}/json/list',timeout=1) as response:targets=json.load(response)
    target=next(t for t in targets if t['type']=='page');break
   except (OSError,ValueError,StopIteration):time.sleep(.1)
  else:self.close();raise RuntimeError('Chrome debugging endpoint did not start')
  u=urlsplit(target['webSocketDebuggerUrl']);self.socket=socket.create_connection((u.hostname,u.port),timeout=40)
  key=base64.b64encode(os.urandom(16)).decode();request=f'GET {u.path} HTTP/1.1\r\nHost: {u.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n';self.socket.sendall(request.encode());header=b''
  while not header.endswith(b'\r\n\r\n'):header+=self.socket.recv(1)
  expected=base64.b64encode(hashlib.sha1((key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode()).digest())
  if b' 101 'not in header or expected.lower()not in header.lower():self.close();raise RuntimeError('Invalid local WebSocket handshake')
  self.command('Page.enable');self.command('Runtime.enable')
 def read(self,n):
  out=b''
  while len(out)<n:
   part=self.socket.recv(n-len(out))
   if not part:raise RuntimeError('Chrome connection closed')
   out+=part
  return out
 def send_frame(self,data,opcode=1):
  mask=os.urandom(4);size=len(data);header=bytes([0x80|opcode])
  header+=bytes([0x80|size])if size<126 else (bytes([0x80|126])+struct.pack('>H',size)if size<65536 else bytes([0x80|127])+struct.pack('>Q',size))
  self.socket.sendall(header+mask+bytes(value^mask[i%4]for i,value in enumerate(data)))
 def receive(self):
  payload=b''
  while True:
   first,second=self.read(2);opcode=first&15;size=second&127
   if size==126:size=struct.unpack('>H',self.read(2))[0]
   elif size==127:size=struct.unpack('>Q',self.read(8))[0]
   mask=self.read(4)if second&128 else None;data=self.read(size)
   if mask:data=bytes(value^mask[i%4]for i,value in enumerate(data))
   if opcode==8:raise RuntimeError('Chrome closed WebSocket')
   if opcode==9:self.send_frame(data,10);continue
   if opcode in (0,1):payload+=data
   if first&128 and opcode in (0,1):return json.loads(payload)
 def command(self,method,params=None):
  self.sequence+=1;request_id=self.sequence;self.send_frame(json.dumps({'id':request_id,'method':method,'params':params or{}}).encode())
  while True:
   response=self.receive()
   if response.get('id')==request_id:
    if 'error'in response:raise RuntimeError(str(response['error']))
    return response.get('result',{})
   if response.get('method')=='Runtime.exceptionThrown':self.events.append(response)
 def evaluate(self,expression):
  result=self.command('Runtime.evaluate',{'expression':expression,'returnByValue':True,'awaitPromise':True})
  if 'exceptionDetails'in result:raise RuntimeError(str(result['exceptionDetails']))
  return result.get('result',{}).get('value')
 def navigate(self,url):
  result=self.command('Page.navigate',{'url':url})
  if result.get('errorText'):raise RuntimeError(result['errorText'])
  # A meta redirect can replace the execution context between readiness reads.
  # Require a stable loaded document, retrying only that transient navigation state.
  stable=0;last_url=None
  for _ in range(150):
   try:
    state=self.evaluate('({ready:document.readyState,url:location.href})')
    if state and state['ready']=='complete' and state['url']==last_url:stable+=1
    else:stable=0
    last_url=state['url'] if state else None
    if stable>=2:break
   except RuntimeError:stable=0
   time.sleep(.12)
  else:raise RuntimeError('Page load timed out: '+url)
 def viewport(self,width):self.command('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':False})
 def screenshot(self,path):
  metrics=self.command('Page.getLayoutMetrics')['cssContentSize'];height=min(30000,max(1000,metrics['height']));width=metrics['width']
  result=self.command('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True,'fromSurface':True,'clip':{'x':0,'y':0,'width':width,'height':height,'scale':1}})
  path.write_bytes(base64.b64decode(result['data']))
 def close(self):
  if hasattr(self,'socket'):self.socket.close()
  if hasattr(self,'process'):
   self.process.terminate()
   try:self.process.wait(timeout=5)
   except subprocess.TimeoutExpired:self.process.kill();self.process.wait()
  if hasattr(self,'profile'):self.profile.cleanup()
