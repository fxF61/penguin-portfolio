---
title: "Escape Two Lab"
description: "Lets start Enumerating the open ports"
date: 2026-02-09
platform: "Hack The Box"
os: "Windows"
difficulty: "Medium"
tags: ["walkthrough", "htb", "kerberoasting", "adcs", "bloodhound", "shadow-credentials", "acl-abuse"]
cover: ../../assets/images/escape2.png
coverAlt: "Escape-Two-Lab HTB"
---

## Enumeration

```bash
sudo nmap -sV -sC 10.129.232.128 -p- -Pn -A -T4
```

Lets start Enumerating the open ports

### SMB

Lets start with authentication using given credentials

```bash
smbmap -R -H 10.129.232.128 -u "rose" -p "KxEPkKe6R8su"
```

using smbmap to with recursive parameter to view all the file , and we found some intersting file in it


![Screenshot](../../assets/images/Pasted-image-20251013140035.png)

we can use smbclient to download the file  and inspect the file


![Screenshot](../../assets/images/Pasted-image-20251013141116.png)
one more Intersting findings while enumerating with **rpcclient** found some users it may help us 


![Screenshot](../../assets/images/Pasted-image-20251013141803.png)

when i was inspecting the given file i found some intersting username and password 


![Screenshot](../../assets/images/Pasted-image-20251013145109.png)

lets make it readable so we can make  a user list



![Screenshot](../../assets/images/Pasted-image-20251013145148.png)
Lets make a userlist from the rpcclient and xml file we found , Lets use kerbrute to enumerate the user


![Screenshot](../../assets/images/Pasted-image-20251013150557.png)

we found 7 vaild  users  and lets use the give user list and password list from the xlm file to further enumerate other protocol

Lets use NetExec for the further  enumeration

**LDAP**
```bash
 nxc ldap sequel.htb -u user.list -p password.list 
```

we found nothing lets enumerate other open ports

**SMB**

We found an user on SMB


![Screenshot](../../assets/images/Pasted-image-20251013152017.png)
**MSSQL**

we found an valid user as expected 


![Screenshot](../../assets/images/Pasted-image-20251013152553.png)

Since we got some valid credential on **SMB** and **MSSQL** services 
```
oscar:86LxLBMgEWaKUnBG
```
```
sa:MSSQLP@ssw0rd!
```
## Foothold

Lets start enumerating with **MSSQL**

we can use tool **impacket**-**mssqlclient** or other tools like **sqsh**

Here i am using  **mssqlclient** let see if have access to xp_cmdshell , 


![Screenshot](../../assets/images/Pasted-image-20251013153654.png)


![Screenshot](../../assets/images/Pasted-image-20251013153719.png)

as we can see from the screenshot we are able to execute the xp_cmdshell by configuring it 

lets start configuring

```sql
# Check if xp_cmdshell is enabled SELECT * FROM sys.configurations WHERE name = 'xp_cmdshell';

# This turns on advanced options and is needed to configure
 xp_cmdshell sp_configure 'show advanced options', '1'
 
# This enables xp_cmdshell sp_configure  
RECONFIGURE 'xp_cmdshell', '1' 
RECONFIGURE

# checking the configurtion works
SQL (sa  dbo@master)> EXEC master..xp_cmdshell 'whoami'
output           
--------------   
sequel\sql_svc   

NULL             


```

We got the shell lets try to create  reverse shell using https://www.revshells.com/ (create reverse shell using PowerShell#3 (Base64)) then execute using
the xp_cmdshell we configured earlier and start net cat listner on our  attack host



![Screenshot](../../assets/images/Pasted-image-20251013155748.png)

netcat Listner


![Screenshot](../../assets/images/Pasted-image-20251013155838.png)

on further enumeration in we did find some intersting file



![Screenshot](../../assets/images/Pasted-image-20251013155943.png)
for futher enumeration on each file we found some credentials from configuration.ini file 

for futher information  please refer 
```https://learn.microsoft.com/en-us/sql/database-engine/install-windows/install-sql-server-using-a-configuration-file?view=sql-server-ver17```

the credentials we found from the file


![Screenshot](../../assets/images/Pasted-image-20251013161303.png)

Lets use this password to enumerate the open ports which and see which all users can be pawned!

we got lucky with smb ,winrm , ldap


![Screenshot](../../assets/images/Pasted-image-20251013162008.png)


![Screenshot](../../assets/images/Pasted-image-20251013162047.png)


![Screenshot](../../assets/images/Pasted-image-20251013162124.png)

Lets use evil-winrm to access the user see if can capture the flag


![Screenshot](../../assets/images/Pasted-image-20251013162308.png)

Here we got the access powerhsell lets enumerate 



![Screenshot](../../assets/images/Pasted-image-20251013162555.png)

First ! user flag Bingo 

The next phase involves utilizing the data collected by the `bloodhound-python` utility to conduct a thorough domain enumeration and develop an optimized path for privilege escalation and attack planning.



![Screenshot](../../assets/images/Pasted-image-20251013163317.png)

Lets run the bloodhound GUI from the attacker system



![Screenshot](../../assets/images/Pasted-image-20251013164611.png)


![Screenshot](../../assets/images/Pasted-image-20251013164628.png)

With Bloodhound we found ryan as the writeOwner access ca_svc account


![Screenshot](../../assets/images/Pasted-image-20251013165349.png)
lets start abusing this privilege

Lets start with  Targeted Kerberoast we can use the tool called [targetedKerberoast.py](https://github.com/ShutdownRepo/targetedKerberoast). which will give us the hash for the user **ca_svc**



![Screenshot](../../assets/images/Pasted-image-20251013170705.png)



![Screenshot](../../assets/images/Pasted-image-20251013170718.png)

Lets try to crack the hash with hashcat



![Screenshot](../../assets/images/Pasted-image-20251013170955.png)No luck in breaking the hash lets try Shadow credential method using pywhisker.py



![Screenshot](../../assets/images/Pasted-image-20251013172036.png)

Before executing pywhisker we need ti change the ownership of ca_svc account 


![Screenshot](../../assets/images/Pasted-image-20251013173608.png)
change the permission as well


![Screenshot](../../assets/images/Pasted-image-20251013173631.png)

Lets run pywhisker again 


![Screenshot](../../assets/images/Pasted-image-20251013173652.png)
Yes we created the certificate ! we need to obtain the tgt hash lets start digging 
we need to download this tool to obtain TGT ticket
https://github.com/dirkjanm/PKINITtools



![Screenshot](../../assets/images/Pasted-image-20251013174131.png)
lets export the certificate
```bash
python3 gettgtpkinit.py -cert-pem ../M4LlAABk_cert.pem -key-pem ../M4LlAABk_priv.pem sequel.htb/ca_svc ca_svc.ccache

```

the tgt would be saved to file which we can use to get NTLM hash 


![Screenshot](../../assets/images/Pasted-image-20251013175422.png)

Next we can use certipy to perform authenticated enumeration it uses unprivileged domain credential to print out vulnerable templated and and CA's


![Screenshot](../../assets/images/Pasted-image-20251014102219.png)


Lets inspect the text file


![Screenshot](../../assets/images/Pasted-image-20251014102346.png)
upon inpection of text file we can see its list ESC4 vulnerablity , A template is vulnerable when the user have write permission on it , this gives the right to modify the template configuration allowing an attacker to make it vulnerable to ECS1 



![Screenshot](../../assets/images/Pasted-image-20251014123831.png)
Now we can start exploiting the template    with req command 


![Screenshot](../../assets/images/Pasted-image-20251014130125.png)
Here we got administrator pfx with which should be able authenticate as an administrator


![Screenshot](../../assets/images/Pasted-image-20251014130156.png)

we got the NTLM hash for the adimistrator

Login as  Admin using impacket-psexec then find the root.txt


![Screenshot](../../assets/images/Pasted-image-20251014130601.png)

