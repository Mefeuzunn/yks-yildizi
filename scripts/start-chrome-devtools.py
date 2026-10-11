import subprocess, time, json, urllib.request, os, sys

port_file = os.path.expanduser('~/Library/Application Support/Google/Chrome/DevToolsActivePort')

print("Starting Google Chrome with remote debugging on port 9222...")
proc = subprocess.Popen([
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-background-networking'
])

for i in range(10):
    time.sleep(1)
    try:
        with urllib.request.urlopen('http://127.0.0.1:9222/json/version', timeout=2) as response:
            data = json.loads(response.read().decode())
            ws_url = data['webSocketDebuggerUrl']
            path = ws_url.split(':9222')[-1]
            with open(port_file, 'w') as f:
                f.write(f'9222\n{path}\n')
            print(f"DevToolsActivePort successfully active: 9222 {path}")
            break
    except Exception as e:
        print(f"Waiting for Chrome ({i+1}/10)...")

try:
    proc.wait()
except KeyboardInterrupt:
    proc.terminate()
