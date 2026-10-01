---
title: "Enterprise Networking: FCC Multi-Site Network Design"
description: "Design and implementation of a multi-site enterprise network for Fitzwilliam Cybersecurity Consultants using Cisco Packet Tracer."
date: 2026-03-29
platform: "Lab"
os: "Other"
difficulty: "Medium"
tags: ["networking", "lab", "cisco", "eigrp", "vlan"]
---

# Executive Summary

This report presents the design, implementation and verification of an improved network infrastructure for Fitzwilliam Cybersecurity Consultants (FCC), a cybersecurity organisation operating across three sites located in Cambridge, London and Manchester. The existing network infrastructure was identified as inadequate due to critical deficiencies including lack of resilience, scalability, security and dynamic routing capabilities, resulting in frequent network outages that negatively impacted business operations and company reputation.

The proposed solution incorporates Variable Length Subnet Masking (VLSM) for efficient IP address allocation, Virtual Local Area Networks (VLANs) for network segmentation, EtherChannel for increased bandwidth aggregation, Enhanced Interior Gateway Routing Protocol (EIGRP) for dynamic routing, and floating static routes for backup resilience. Additionally, Network Address Translation (NAT/PAT), Access Control Lists (ACLs), Dynamic Host Configuration Protocol (DHCP) and Secure Shell (SSH) have been implemented to meet the security and operational requirements of the organisation.

The redesigned network has been fully implemented and verified using Cisco Packet Tracer, demonstrating successful connectivity across all three sites whilst meeting all specified technical requirements.



# Introduction
Fitzwilliam Cybersecurity Consultants (FCC) is a cybersecurity organisation that has expanded from its original Cambridge headquarters to additional sites in London and Manchester over the past five years. As the organisation has grown, the existing network infrastructure has proven increasingly inadequate, experiencing frequent outages that have negatively impacted profit margins and business reputation.

The Chief Financial Officer (CFO) has allocated a significant budget to address these issues through the complete redesign and implementation of a new network infrastructure. This report details the technical design decisions, implementation process and verification testing undertaken to deliver a robust, scalable and secure network solution that meets the requirements of all three FCC sites.

The new network design utilises Cisco ISR4331 routers and Cisco Catalyst 2960 switches at each site, connected via a full mesh Wide Area Network (WAN) topology. The solution addresses the key requirements of scalability, resilience, security and Internet access control as specified in the project brief.


# Analysis of Current Network Flows

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260321080722.png)
<center><sub>Figure 1: Current FCC Network Topology in Cisco Packet Tracer ( Pre- Redesign)</sub></center>






## Current Network Flaws

The current network topology of Fitzwilliam Cybersecurity Consultants (FCC) presents several critical deficiencies that have resulted in frequent network outages and reduced business productivity. The following issues have been identified:





### Lack of Dynamic Routing Protocol 
The current network solely relies on static routing which requires manual configuration which doesn't adapt or changes to the network changes , The implementation of a dynamic routing protocol such as EIGRP or OSPF would significantly improve network efficiency and resilience (Odom,2020).




### Lack of Network Resilience
The current topology has no redundant links between sites. If a single WAN link fails, the affected site loses all connectivity to the rest of the company network. A full mesh WAN topology with floating static routes would address this issue (Lammle, 2021).




### Lack of VLANs and Inter-VLAN Routing
The current network does not implement VLANs, meaning all devices share the same broadcast domain. This reduces network performance and security. VLANs would segment network traffic and improve both performance and security (Cisco, 2023).




## Lack of EtherChannel
The current network has no link aggregation between switches, limiting bandwidth and providing no redundancy at the switch level. EtherChannel would bundle multiple physical links into one logical link, increasing bandwidth and providing redundancy (Odom, 2020).




### Lack of DHCP
The current network requires manual IP address configuration on all devices, which is inefficient and error prone especially with hundreds of hosts per site. A DHCP server would automate IP address assignment (Lammle, 2021).




### Lack of Security
The current network has no access control lists, no port security and no secure remote access configuration. This leaves the network vulnerable to unauthorised access and potential security breaches (Cisco, 2023).




## Lack of NAT/PAT
The current network has no Network Address Translation configured, meaning internal devices cannot securely access the Internet through a single public IP address.




### Lack of Scalability
The current network only supports a few PCs per site and cannot scale to meet the growing demands of FCC which requires up to 2100 hosts at the Manchester site alone.
## VLSM Addressing Scheme

In order to efficiently allocate IP addresses across the three FCC sites, Variable Length Subnet Masking (VLSM) was employed. VLSM allows different subnet sizes to be allocated based on the number of hosts required, minimising IP address wastage (Odom, 2020). All IP addresses were derived from the initial network address of 192.168.0.0/16, with the exception of the Cambridge to ISP WAN link which was provided as 209.165.200.224/30.

The subnets were calculated in order of largest to smallest host requirement, as per VLSM best practice (Lammle, 2021).





## Subnet Calculation Formula
The formula used to calculate each subnet is **2ⁿ − 2 ≥ hosts required** where **subnet mask = 32-n**


|**Site / Link**|**Hosts Required**|
|---|---|
|**Manchester LAN**|2100|
|**London LAN**|1200|
|**Cambridge LAN**|300|
|**Manchester–London WAN**|2|
|**Manchester–Cambridge WAN**|2|
|**London–Cambridge WAN**|2|







# LAN




## Manchester -  2100 hosts
2¹² = 4096 − 2 = 4094 
**Prefix** = /20 
**Mask** = 255.255.240.0
**Range** = 192.168.0.1 - 192.168.15.254
**Broadcast** = 192.168.15.255





## London - 1200 hosts
2¹¹ = 2048 − 2 = 2046
**Prefix** = /21
**Mask** = 255.255.248.0
**Range** = 192.168.16.1 - 192.168.23.254
BroadCast = 192.168.23.255





## Cambridge - 300 hosts
2⁹ = 512 − 2 = 510
**Prefix** = /23 
**Mask**  =  255.255.254.0
**Range** = 192.168.24.1 - 192.168.25.254
**Broadcast**: 192.168.25.255





# WAN (2 Hosts per region)

2² = 4 − 2 = 2
Prefix = /30 
Mask = 255.255.255.252





# VLSM Table
| **Subnet** | **Site/Link**  | **Network Address** | **Prefix** | **Subnet Mask** | **Usable Range**              | **Broadcast**  | **Hosts Supported** |
| ---------- | -------------- | ------------------- | ---------- | --------------- | ----------------------------- | -------------- | ------------------- |
| **1**      | Manchester LAN | 192.168.0.0         | /20        | 255.255.240.0   | 192.168.0.1 – 192.168.15.254  | 192.168.15.255 | 4094                |
| **2**      | London LAN     | 192.168.16.0        | /21        | 255.255.248.0   | 192.168.16.1 – 192.168.23.254 | 192.168.23.255 | 2046                |
| **3**      | Cambridge LAN  | 192.168.24.0        | /23        | 255.255.254.0   | 192.168.24.1 – 192.168.25.254 | 192.168.25.255 | 510                 |
| **4**      | Manc-Lon WAN   | 192.168.26.0        | /30        | 255.255.255.252 | 192.168.26.1 – 192.168.26.2   | 192.168.26.3   | 2                   |
| **5**      | Manc-Cam WAN   | 192.168.26.4        | /30        | 255.255.255.252 | 192.168.26.5 – 192.168.26.6   | 192.168.26.7   | 2                   |
| **6**      | Lon-Cam WAN    | 192.168.26.8        | /30        | 255.255.255.252 | 192.168.26.9 – 192.168.26.10  | 192.168.26.11  | 2                   |

**host address** - 192.168.26.1

	 How to Calculate Subnet Mask, Range and Broadcast 
	  In 192.168.0.0, the **192.168** part is the network address and  
	  **0.0** is the host part. The prefix /20 tells us there are **20
	  ones** (network bits) and **12 zeros** (host bits) in the subnet 
	  mask
	  
	  Calculating the Subnet Mask
	  
	  The 32 bits are split as 20 ones followed by 12 zeros:
	  
			  11111111 . 11111111 . 11110000 . 00000000
                255   .   255   .    ?     .     0
	
	 Subnet Mask = 255.255.240.0
	 
	 Calculating the Broadcast Address
		The 12 host bits are spread across the last 4 bits of octet 3 
		and all 8 bits of octet 4. Set all host bits to 1:
		
				Octet 3 host bits: 1111 = 8+4+2+1 = 15
				Octet 4 host bits: 11111111 = 255
		
	Broadcast = 192.168.15.255
		- **Network address** = all host bits are 0 →
		 192.168.0.0(reserved)
		- **Broadcast address** = all host bits are 1 →192.168.15.255*
		 (reserved)
		- **Usable range** = everything in between → **192.168.0.1 to 
		192.168.15.254**

## Scalability and Resilience

The new network design addresses both scalability and resilience requirements through several key technologies.

Scalability has been achieved through the deployment of Cisco Catalyst 2960 switches at each site, enabling the network to support the required number of hosts. The Manchester site supports up to 4094 hosts within its /20 subnet, significantly exceeding the 2100 host requirement. The London site supports up to 2046 hosts within its /21 subnet, and the Cambridge site supports up to 510 hosts within its /23 subnet.
VLANs further enhance scalability by segmenting network traffic into separate broadcast domains, reducing congestion and improving performance as the organisation grows (Odom, 2020). Three VLANs have been implemented at each site: VLAN 10 (Sales), VLAN 20 (HR) and VLAN 99 (Management).
Network resilience has been addressed through three mechanisms. A full mesh WAN topology has been implemented, creating n(n-1)/2 = 3(3-1)/2 = 3 WAN links between the three sites. This ensures that if any single WAN link fails, traffic is automatically rerouted through an alternative path (Lammle, 2021). EIGRP dynamic routing using the DUAL algorithm maintains feasible successor routes as instant backups. Floating static routes with an administrative distance of 120 provide an additional backup layer in the event of EIGRP failure.
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260321091724.png)
<center><sub></sub></center>

<center><sub>Figure 2: Redesigned FCC Full Mesh WAN Topology with Three Sites</sub></center>


## Basic Configuration

Verificaton




# Cambridge Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327235632.png)
<center><sub>Figure 3: Cambridge Router - Hostname, Password Encryption, Banner and SSH Verification</sub></center>






# HR - Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327235657.png)
<center><sub>Figure 4: HR-Cambridge Switch - Basic Security Configuration and SSH Status</sub></center>







# Sales - Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327235721.png)
<center><sub>Figure 5: Sales-Cambridge Switch - Hostname, Password Encryption and SSH Status</sub></center>




# Manchester




# Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327235857.png)
<center><sub>Figure 6: Manchester Router — Basic Security Configuration and SSH v2 Verification</sub></center>






# Sales-Manchester Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328000054.png)
<center><sub>Figure 7: Sales-Manchester Switch - Hostname and Password Configuration</sub></center>






# HR-Manchester Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328000001.png)
<center><sub>Figure 8: HR-Manchester Switch - Basic Security and SSH Status Verification</sub></center>




# London




# London Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328000237.png)
<center><sub>Figure 9: London Router - Hostname, Password Encryption, Banner and SSH v2 Verification</sub></center>






# Sales - London Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328000325.png)
<center><sub>Figure 10: Sales-London Switch - Basic Security Configuration and SSH Status</sub></center>






# HR - London Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328000454.png)
<center><sub>Figure 11: HR-London Switch - Basic Security Configuration and SSH Status</sub></center>



## EIGRP Dynamic Routing

EIGRP with Autonomous System 500 (AS500) has been configured across all three routers to provide dynamic routing throughout the FCC network. EIGRP was selected over alternative protocols such as RIP and OSPF for several reasons.

Since FCC exclusively utilises Cisco equipment including ISR4331 routers and Catalyst 2960 switches, EIGRP as a Cisco-developed protocol is fully optimised for this environment (Cisco, 2023). EIGRP employs the Diffusing Update Algorithm (DUAL) which provides extremely fast convergence by maintaining a feasible successor route as an instant backup. In contrast, RIP uses the Bellman-Ford algorithm which converges slowly and is limited to a maximum of 15 hops, making it unsuitable for enterprise networks (Odom, 2020). OSPF, whilst an open standard, requires complex area configuration which adds unnecessary administrative overhead for a three-site network of this scale (Lammle, 2021).

EIGRP also consumes less bandwidth than RIP, which sends full routing table updates every 30 seconds regardless of network changes. EIGRP only sends updates when topology changes occur, preserving valuable WAN bandwidth





## Setting up WAN links 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316233554.png)
<center><sub>Figure 12: ISR4331 Router Physical View — NIM-2T Serial Module Installation</sub></center>






## Configuring Serial Interface 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317002309.png)
<center><sub>Figure 13: Full Mesh WAN Topology with Serial Interface Connections Between Sites</sub></center>






## Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316234750.png)
<center><sub>Figure 14: Manchester Router - Serial Interface IP Address Configuration ( Se0/1/0 and Se0/1/1)</sub></center>


```
Manchester#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES NVRAM  up                    up 
GigabitEthernet0/0/0.10192.168.0.1     YES NVRAM  up                    up 
GigabitEthernet0/0/0.20192.168.0.129   YES NVRAM  up                    up 
GigabitEthernet0/0/0.99192.168.1.1     YES NVRAM  up                    up 
GigabitEthernet0/0/1   unassigned      YES NVRAM  administratively down down 
GigabitEthernet0/0/2   unassigned      YES NVRAM  administratively down down 
Serial0/1/0            192.168.26.1    YES manual up                    up 
Serial0/1/1            192.168.26.5    YES manual up                    up 
Vlan1                  unassigned      YES NVRAM  administratively down down
Manchester#
```
<center><sub>Figure 15: Manchester Router - show ip interface brief Verification of Serial and Subinterfaces</sub></center>






## Cambridge 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316235025.png)
<center><sub>Figure 16: Cambridge Router - Serial Interface IP Address Configuration ( Se0/1/0 and Se0/1/1)</sub></center>



```
Cambridge#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES NVRAM  up                    up 
GigabitEthernet0/0/0.10192.168.24.1    YES manual up                    up 
GigabitEthernet0/0/0.20192.168.24.129  YES NVRAM  up                    up 
GigabitEthernet0/0/0.99192.168.25.1    YES NVRAM  up                    up 
GigabitEthernet0/0/1   unassigned      YES NVRAM  administratively down down 
GigabitEthernet0/0/2   unassigned      YES NVRAM  administratively down down 
Serial0/1/0            192.168.26.6    YES manual up                    up 
Serial0/1/1            192.168.26.10   YES manual up                    up 
Vlan1                  unassigned      YES NVRAM  administratively down down
```
<center><sub>Figure 17: Cambridge Router - show ip interface brief Verification</sub></center>





## London
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316235445.png)
<center><sub>Figure 18: London Router - Serial Interface IP Address Configuration ( Se0/1/0 and Se0/1/1)</sub></center>


```
London#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES NVRAM  up                    up 
GigabitEthernet0/0/0.10192.168.16.1    YES NVRAM  up                    up 
GigabitEthernet0/0/0.20192.168.16.129  YES NVRAM  up                    up 
GigabitEthernet0/0/0.99192.168.17.1    YES NVRAM  up                    up 
GigabitEthernet0/0/1   unassigned      YES NVRAM  administratively down down 
GigabitEthernet0/0/2   unassigned      YES NVRAM  administratively down down 
Serial0/1/0            192.168.26.2    YES manual up                    up 
Serial0/1/1            192.168.26.9    YES manual up                    up 
Vlan1                  unassigned      YES NVRAM  administratively down down
London#
```
<center><sub>Figure 19: London Router - show ip interface brief Verification</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317002214.png)
<center><sub>Figure 20: PDU List Window - Successful ICMP Ping Tests Between All Three Routers</sub></center>






## Cambridge Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317020720.png)
<center><sub>Figure 21: Cambridge Router - EIGRP AS500 Network Statements and Configuration</sub></center>


```
Cambridge#show ip eigrp neighbors 
IP-EIGRP neighbors for process 500
H   Address         Interface      Hold Uptime    SRTT   RTO   Q   Seq
                                   (sec)          (ms)        Cnt  Num
0   192.168.26.5    Se0/1/0        11   00:02:23  40     1000  0   15
1   192.168.26.9    Se0/1/1        10   00:01:13  40     1000  0   22
```
<center><sub>Figure 23: Cambridge Router - show ip eigrp neighbors Verification ( Two Neighbours)</sub></center>






## Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317020935.png)
<center><sub>Figure 23: Manchester Router - EIGRP AS500 Configuration with no auto-summary</sub></center>


```
Manchester#show ip eigrp neighbors 
IP-EIGRP neighbors for process 500
H   Address         Interface      Hold Uptime    SRTT   RTO   Q   Seq
                                   (sec)          (ms)        Cnt  Num
0   192.168.26.6    Se0/1/1        13   00:02:04  40     1000  0   19
1   192.168.26.2    Se0/1/0        12   00:00:55  40     1000  0   21

Manchester#
```
<center><sub>Figure 24: Manchester Router - show ip eigrp neighbors Verification ( Two Neighbours)</sub></center>






## London Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317021020.png)
<center><sub>Figure 25: London Router - EIGRP AS500 Configuration with Neighbour Adjacency Messages</sub></center>



```
London#show ip eigrp neighbors 
IP-EIGRP neighbors for process 500
H   Address         Interface      Hold Uptime    SRTT   RTO   Q   Seq
                                   (sec)          (ms)        Cnt  Num
0   192.168.26.1    Se0/1/0        11   00:00:35  40     1000  0   16
1   192.168.26.10   Se0/1/1        14   00:00:35  40     1000  0   20

```
<center><sub>Figure 26: London Router - show ip eigrp neighbors Verification ( Two Neighbours)</sub></center>






# Floating Static Routes
Floating static routes have been configured on all three routers as a backup routing mechanism in the event of EIGRP failure. These routes are assigned an administrative distance of 120, which is higher than EIGRP's default administrative distance of 90. As a result, the floating static routes remain dormant while EIGRP is operational and only activate automatically if EIGRP routes become unavailable (Cisco, 2023).

This implementation ensures that network connectivity is maintained even in the unlikely event that the dynamic routing protocol fails, providing an additional layer of resilience beyond the full mesh WAN topology.




## Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317022046.png)
<center><sub>Figure 27: Manchester Router - Floating Static Route Configuration (AD 120)</sub></center>






## London Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317022137.png)
<center><sub>Figure 28: London Router - Floating Static Route Configuration (AD 120)</sub></center>





## Cambridge Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317022213.png)
<center><sub>Figure 29: Cambridge Router - Floating Static Route Configuration (AD 120)</sub></center>


```
Cambridge#show running-config | section ip route
ip route 192.168.0.0 255.255.255.128 192.168.26.5 120
ip route 192.168.0.128 255.255.255.128 192.168.26.5 120
ip route 192.168.16.0 255.255.255.128 192.168.26.9 120
ip route 192.168.16.128 255.255.255.128 192.168.26.9 120
Cambridge#
```
<center><sub>Figure 30: Cambridge Router - show running-config | section ip route Verification</sub></center>

## Security and Remote Access
Comprehensive security measures have been implemented across all network devices at all three sites. Each router and switch has been configured with encrypted enable secret passwords, console passwords and VTY line passwords using the service password-encryption command. Device banners have been configured to display an authorised access warning to deter unauthorised users (Odom, 2020).

Remote access has been secured by enabling SSH version 2 on all devices and explicitly disabling Telnet on VTY lines using the transport input ssh command. SSH provides encrypted communication between the administrator and network devices, whereas Telnet transmits data in plaintext making it vulnerable to interception (Lammle, 2021).

Port security has been implemented on all access ports across all six switches. Each port is configured to allow a maximum of one MAC address using the sticky learning method, which automatically records the MAC address of the connected device. The violation mode is set to restrict, which drops unauthorised traffic and logs a security violation without disabling the port.





### Sales-Cambridge Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317031944.png)
<center><sub>Figure 31: Sales-London Switch - Port Security Configuration on Fast Ethernet 0/1</sub></center>





### HR-Cambridge Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032059.png)
<center><sub>Figure 32: HR-London Switch - Port Security Configuration (Sticky MAC, Violation Restrict)</sub></center>



Similiary on other switches as well
Verification on Swtich




### Sales-Manchester Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032622.png)
<center><sub>Figure 33: Sales-Manchester Switch - show port-security interface fa0/1 ( Secure- Up)</sub></center>





### HR-Manchester Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032701.png)
<center><sub>Figure 34: HR-Manchester Switch - show port-security interface fa0/1 ( Secure- Down)</sub></center>





### Sales-London Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032807.png)
<center><sub>Figure 35: Sales-London Switch - show port-security interface fa0/1 Verification</sub></center>





### HR-London Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032824.png)
<center><sub>Figure 36: HR-London Switch - show port-security interface fa0/1 Verification</sub></center>





### Sales-Cambridge Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032858.png)
<center><sub>Figure 37: Sales-Cambridge Switch - show port-security interface fa0/1 Verification</sub></center>





### HR-Cambridge Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317032926.png)
<center><sub>Figure 38: HR-Cambridge Switch - show port-security interface fa0/1 Verification</sub></center>





### Testing SSH and telenet




### London PC --> Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317034423.png)
<center><sub>Figure 39: London PC2 - SSH Access to Cambridge Router Successful, Telnet Connection Refused</sub></center>

## EtherChannel
EtherChannel has been implemented at each site using the Link Aggregation Control Protocol (LACP) to bundle four FastEthernet links between the Sales and HR switches into a single logical 400Mbps link. This configuration was achieved using channel-group 1 mode active on ports FastEthernet0/3 through FastEthernet0/6 on both switches at each site.

EtherChannel provides two key benefits. Firstly, it increases available bandwidth between the Sales and HR VLANs from 100Mbps to 400Mbps. Secondly, it provides link redundancy at the switch level - if one physical link fails, traffic continues to flow across the remaining links without interruption (Cisco, 2023).




### Sales-Cambridge Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316224959.png)
<center><sub>Figure 40: Sales-Cambridge Switch - EtherChannel LACP Configuration on Fa0/3- Fa0/6</sub></center>


```
Sales-Cambridge#show etherchannel summary 
Flags:  D - down        P - in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------------------

1      Po1(SU)           LACP   Fa0/3(P) Fa0/4(P) Fa0/5(P) Fa0/6(P) 
Sales-Cambridge#
```
<center><sub>Figure 41: Sales-Cambridge Switch - show etherchannel summary (Po1 SU, All Ports P)</sub></center>





### HR-Cambridge Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316225430.png)
<center><sub>Figure 42: HR-Cambridge Switch - EtherChannel LACP Configuration on Fa0/3- Fa0/6</sub></center>



```
HR-Cambridge#show etherchannel summary 
Flags:  D - down        P - in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------------------

1      Po1(SU)           LACP   Fa0/6(P) Fa0/3(P) Fa0/4(P) Fa0/5(P) 
```
<center><sub>Figure 43: HR-Cambridge Switch - show etherchannel summary Verification</sub></center>







### Sales-London Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316230136.png)
<center><sub>Figure 44: Sales-London Switch - Ether Channel LACP Configuration with interface range</sub></center>



```
Sales-London#show etherchannel summary 
Flags:  D - down        P - in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------------------

1      Po1(SU)           LACP   Fa0/3(P) Fa0/4(P) Fa0/5(P) Fa0/6(P) 
```
<center><sub>Figure 45: Sales-London Switch - show etherchannel summary (Po1 SU, All Ports P)</sub></center>






### HR-London Switch
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316230310.png)
<center><sub>Figure 46: HR-London Switch - EtherChannel LACP Configuration on Fa0/3- Fa0/6</sub></center>


```
HR-London#show etherchannel summary 
Flags:  D - down        P - in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------------------

1      Po1(SU)           LACP   Fa0/3(P) Fa0/4(P) Fa0/5(P) Fa0/6(P) 

```
<center><sub>Figure 47: HR-London Switch - show etherchannel summary Verification</sub></center>






## Sales-Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316230655.png)
<center><sub>Figure 48: Sales-Manchester Switch - Ether Channel LACP Configuration</sub></center>




```
Sales-Manchester#show etherchannel sum
Sales-Manchester#show etherchannel summary 
Flags:  D - down        P - in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------------------

1      Po1(SU)           LACP   Fa0/3(P) Fa0/4(P) Fa0/5(P) Fa0/6(P) 
Sales-Manchester#
```
<center><sub>Figure 49: Sales-Manchester Switch - show etherchannel summary (Po1 SU, All Ports P)</sub></center>






## HR-Manchester
```
HR-Cambridge#show etherchannel summary 
Flags:  D - down        P - in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------------------

1      Po1(SU)           LACP   Fa0/6(P) Fa0/3(P) Fa0/4(P) Fa0/5(P) 
```
<center><sub>Figure 50: HR-Manchester Switch - show etherchannel summary Verification</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316230808.png)
<center><sub>Figure 51: HR-Cambridge Switch - EtherChannel Reconfiguration with Duplex Compatibility Resolution</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316230843.png)
<center><sub>Figure 52: Final Network Topology - All Three Sites with EtherChannel Links Visible</sub></center>






# WAN Bandwidth Verification




## London serial 0/1/0
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001326.png)
<center><sub>Figure 53: London Serial 0/1/0 - show interfaces Verification (BW 4000 Kbit, IP 192.168.26.2)</sub></center>





## London serial 0/1/1
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001408.png)
<center><sub>Figure 54: London Serial 0/1/1 - show interfaces Verification (BW 4000 Kbit, IP 192.168.26.9)</sub></center>





## Cambridge serial 0/1/0
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001736.png)
<center><sub>Figure 55: Cambridge Serial 0/1/0 - show interfaces Verification (BW 4000 Kbit, IP 192.168.26.6)</sub></center>






## Cambridge serial 0/1/1
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001757.png)
<center><sub>Figure 56: Cambridge Serial 0/1/1 - show interfaces Verification (BW 4000 Kbit, IP 192.168.26.10)</sub></center>






## Cambridge serial 0/2/0
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001856.png)
<center><sub>Figure 57: Cambridge Serial 0/2/0 - show interfaces (ISP Link, IP 209.165.200.225)</sub></center>






## Manchester serial 0/1/0
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001626.png)
<center><sub>Figure 58: Manchester Serial 0/1/0 - show interfaces Verification (BW 4000 Kbit)</sub></center>





## Manchester serial 0/1/1
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001644.png)
<center><sub>Figure 59: Manchester Serial 0/1/1 - show interfaces Verification (BW 4000 Kbit)</sub></center>

## Inter-VLAN Routing
Inter-VLAN routing has been implemented using the Router on a Stick methodology, whereby subinterfaces are configured on the GigabitEthernet0/0/0 interface of each router to handle traffic for each VLAN. Each subinterface is configured with the encapsulation dot1Q command to tag traffic with the appropriate VLAN ID (Odom, 2020).

_The following subinterfaces were configured on each router:_
- Gig0/0/0.10 — handles VLAN 10 (Sales) traffic
- Gig0/0/0.20 — handles VLAN 20 (HR) traffic
- Gig0/0/0.99 — handles VLAN 99 (Management) traffic, configured as the native VLAN
The trunk port on each Sales switch (FastEthernet0/24) carries all VLAN traffic to the router, enabling communication between VLANs through the router's subinterfaces.

1. Creating an VLAN on each switch
```
Sales-London#enable
Sales-London#configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Sales-London(config)#vlan 10
Sales-London(config-vlan)#name Sales
Sales-London(config-vlan)#exit
Sales-London(config)#vlan 20
Sales-London(config-vlan)#name HR
Sales-London(config-vlan)#exit
Sales-London(config)#vlan 99
Sales-London(config-vlan)#name Management
Sales-London(config-vlan)#exit
```


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316195732.png)


```
Sales-London(config)#int
Sales-London(config)#interface fas
Sales-London(config)#interface fastEthernet 0/1
Sales-London(config-if)#swi
Sales-London(config-if)#switchport mode ac
Sales-London(config-if)#switchport mode access 
Sales-London(config-if)#sw
Sales-London(config-if)#switchport ac
Sales-London(config-if)#switchport access vla
Sales-London(config-if)#switchport access vlan 10
Sales-London(config-if)#sw
Sales-London(config-if)#switchport non
Sales-London(config-if)#switchport nonegotiate 
Sales-London(config-if)#spa
Sales-London(config-if)#spanning-tree p
Sales-London(config-if)#spanning-tree portfast 
Sales-London(config-if)#spanning-tree portfast 

Sales-London(config-if)#exit
Sales-London(config)#inte
Sales-London(config)#interface vla
Sales-London(config)#interface vlan 99
Sales-London(config-if)#
%LINK-5-CHANGED: Interface Vlan99, changed state to up

Sales-London(config-if)#ip ad
Sales-London(config-if)#ip address 192.168.24.2 255.255.254.0
Sales-London(config-if)#no shut
Sales-London(config-if)#no shutdown 
Sales-London(config-if)#exit
Sales-London(config)#ip de
Sales-London(config)#ip default-gateway 192.168.24.1
Sales-London(config)#wr
Sales-London(config)#exit
Sales-London#
%SYS-5-CONFIG_I: Configured from console by console

Sales-London#wri
Sales-London#write mem
Sales-London#write memory 
Building configuration...
[OK]
Sales-London#
```
<center><sub>Figure 60: Sales-London Switch - VLAN 10, 20, 99 Creation and Access Port Assignment</sub></center>


Setting up trunk port 
```
Sales-Cambridge(config)#interface fastEthernet 0/24
Sales-Cambridge(config-if)#swit
Sales-Cambridge(config-if)#switchport mod
Sales-Cambridge(config-if)#switchport mode tru
Sales-Cambridge(config-if)#switchport mode trunk 
Sales-Cambridge(config-if)#swt
Sales-Cambridge(config-if)#swit
Sales-Cambridge(config-if)#switchport trun
Sales-Cambridge(config-if)#switchport trunk nat
Sales-Cambridge(config-if)#switchport trunk native vlan
Sales-Cambridge(config-if)#switchport trunk native vlan 99
Sales-Cambridge(config-if)#exit
Sales-Cambridge(config)#exit
Sales-Cambridge#
%SYS-5-CONFIG_I: Configured from console by console

Sales-Cambridge#wri
Sales-Cambridge#write mem
Sales-Cambridge#write memory 
Building configuration...
[OK]
Sales-Cambridge#

```
<center><sub>Figure 61: Sales-Cambridge Switch - Trunk Port Configuration on Fa0/24 with Native VLAN 99</sub></center>






## Inter-Vlan Routing
This is configured on the **routers** using **subinterfaces**. This allows VLAN 10 (Sales) and VLAN 20 (HR) to communicate with each other.

we would be using Router on a Stick where a router creates sub interfaces on the router for each VLAN this is called **Router on Stick**





## Cambridge Router 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316231846.png)
<center><sub>Figure 62: Cambridge Router - Subinterface Configuration ( Gig0/0/0.10, .20, .99 with dot1Q Encapsulation)</sub></center>


```
Cambridge#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES unset  up                    up 
GigabitEthernet0/0/0.10192.168.24.1    YES manual up                    up 
GigabitEthernet0/0/0.20192.168.24.129  YES manual up                    up 
GigabitEthernet0/0/0.99192.168.25.1    YES manual up                    up 
GigabitEthernet0/0/1   unassigned      YES unset  administratively down down 
GigabitEthernet0/0/2   unassigned      YES unset  administratively down down 
Vlan1                  unassigned      YES unset  administratively down down
Cambridge#
```
<center><sub>Figure 63: Cambridge Router - show ip interface brief After Subinterface Configuration</sub></center>






## London-Router 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316232241.png)
<center><sub>Figure 64: London Router - Subinterface Configuration ( Gig0/0/0.10, .20, .99)</sub></center>



```
London#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES NVRAM  up                    up 
GigabitEthernet0/0/0.10192.168.16.1    YES manual up                    up 
GigabitEthernet0/0/0.20192.168.16.129  YES manual up                    up 
GigabitEthernet0/0/0.99192.168.17.1    YES manual up                    up 
GigabitEthernet0/0/1   unassigned      YES NVRAM  administratively down down 
GigabitEthernet0/0/2   unassigned      YES NVRAM  administratively down down 
Vlan1                  unassigned      YES NVRAM  administratively down down
London#
```
<center><sub>Figure 65: London Router - show ip interface brief After Subinterface Configuration</sub></center>






## Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316232634.png)
<center><sub>Figure 66: Manchester Router - Subinterface Configuration ( Gig0/0/0.10, .20, .99)</sub></center>


```
Manchester#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES NVRAM  up                    up 
GigabitEthernet0/0/0.10192.168.0.1     YES manual up                    up 
GigabitEthernet0/0/0.20192.168.0.129   YES manual up                    up 
GigabitEthernet0/0/0.99192.168.1.1     YES manual up                    up 
GigabitEthernet0/0/1   unassigned      YES NVRAM  administratively down down 
GigabitEthernet0/0/2   unassigned      YES NVRAM  administratively down down 
Vlan1                  unassigned      YES NVRAM  administratively down down
```
<center><sub>Figure 67: Manchester Router - show ip interface brief After Subinterface Configuration</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260316233223.png)
<center><sub>Figure 68: Complete Network Topology Before DHCP Configuration</sub></center>




# DHCP
Dynamic Host Configuration Protocol (DHCP) has been configured on each router to automatically assign IP addresses to end devices across all three sites, eliminating the need for manual IP address configuration. Each router acts as a DHCP server for its local site, with separate DHCP pools configured for each VLAN (Lammle, 2021).

Excluded address ranges have been configured to reserve the first ten IP addresses in each subnet for network infrastructure devices such as routers and switches, ensuring these addresses are not dynamically assigned to end user devices.





# DHCP configuration





## Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317022716.png)
<center><sub>Figure 69: Manchester Router - DHCP Pool Configuration (Sales, HR, Management) with Excluded Addresses</sub></center>



# London Router

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317022817.png)
<center><sub>Figure 70: London Router - DHCP Pool Configuration with Excluded Addresses</sub></center>



# Cambridge Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317022858.png)
<center><sub>Figure 71: Cambridge Router - DHCP Pool Configuration with Excluded Addresses</sub></center>


 What are Excluded Addresses?
These are IPs reserved for **network devices** like routers and switches so DHCP doesn't accidentally assign them to PCs

Successfully  we got an IP from the server
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317023057.png)
<center><sub>Figure 72: London PC - DHCP Request Successful (IP 192.168.16.11, Gateway 192.168.16.1)</sub></center>


Similiarly we can request IP from DHCP for each pc ping each other 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317023740.png)
<center><sub>Figure 74: PDU List Window - Successful Ping Tests Between All PCs Across All Three Sites</sub></center>




# NAT/PAT
Network Address Translation with Port Address Translation overload (NAT/PAT) has been configured on the Cambridge router to enable all three sites to access the Internet through the single public IP address 209.165.200.225. PAT allows multiple internal devices to share a single public IP address by differentiating sessions using unique port numbers (Cisco, 2023).

The Cambridge router's GigabitEthernet and serial LAN interfaces have been designated as NAT inside interfaces, whilst the Serial0/2/0 interface connecting to the ISP has been designated as the NAT outside interface. Access list 1 permits all traffic from the 192.168.0.0/16 address space to be translated.

A default route (0.0.0.0/0) pointing to the ISP has been configured on the Cambridge router and redistributed via EIGRP to all sites, enabling Internet access from London and Cambridge whilst the Manchester site remains blocked by the ACL.





### Configure Cambridge Se0/2/0
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317025050.png)
<center><sub>Figure 74: Cambridge Router - Se0/2/0 ISP Interface Configuration (IP 209.165.200.225)</sub></center>






# Configure ISP Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317025151.png)
<center><sub>Figure 75: ISP Router - Serial Interface Configuration (IP 209.165.200.226)</sub></center>


Verification

```
Cambridge#show ip interface brief 
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0/0   unassigned      YES NVRAM  up                    up 
GigabitEthernet0/0/0.10192.168.24.1    YES NVRAM  up                    up 
GigabitEthernet0/0/0.20192.168.24.129  YES NVRAM  up                    up 
GigabitEthernet0/0/0.99192.168.25.1    YES NVRAM  up                    up 
GigabitEthernet0/0/1   unassigned      YES NVRAM  administratively down down 
GigabitEthernet0/0/2   unassigned      YES NVRAM  administratively down down 
Serial0/1/0            192.168.26.6    YES NVRAM  up                    up 
Serial0/1/1            192.168.26.10   YES NVRAM  up                    up 
Serial0/2/0            209.165.200.225 YES manual up                    up 
Serial0/2/1            unassigned      YES unset  down                  down 
Vlan1                  unassigned      YES NVRAM  administratively down down
Cambridge#ping 209.165.200.226

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 209.165.200.226, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 7/13/18 ms
```
<center><sub>Figure 76: Cambridge Router - show ip interface brief with ISP Link and Successful Ping to ISP</sub></center>

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317025523.png)
<center><sub>Figure 77: Cambridge Router - NAT Inside/Outside Interface Designation, ACL 1 and PAT Overload Configuration</sub></center>


Testing ping from an Cambridge PC - ISP
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317025703.png)
<center><sub>Figure 78: Cambridge PC - Successful Ping to ISP (209.165.200.226) Through NAT</sub></center>


checking NAT table again on Cambridge:
```
Cambridge#show ip nat translations 
Pro  Inside global     Inside local       Outside local      Outside global
icmp 209.165.200.225:5 192.168.24.11:5    209.165.200.226:5  209.165.200.226:5
icmp 209.165.200.225:6 192.168.24.11:6    209.165.200.226:6  209.165.200.226:6
icmp 209.165.200.225:7 192.168.24.11:7    209.165.200.226:7  209.165.200.226:7
icmp 209.165.200.225:8 192.168.24.11:8    209.165.200.226:8  209.165.200.226:8
icmp 209.165.200.225:9 192.168.24.11:9    209.165.200.226:9  209.165.200.226:9

Cambridge#
```
<center><sub>Figure 79: Cambridge Router - show ip nat translations ( Internal IP Translated to 209.165.200.225)</sub></center>

Testing London PC- ISP
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317025931.png)
<center><sub>Figure 80: London PC1 - Successful Ping to ISP Through NAT (TTL=253, Two Hops)</sub></center>


From Manchester PC ping ISP
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317030015.png)
<center><sub>Figure 81: Manchester PC2 - Successful Ping to ISP Before ACL Applied</sub></center>

From **ISP router**
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001013.png)
<center><sub>Figure 82: ISP Router - Ping to Internal Network (192.168.24.11) Fails (NAT Blocks Inbound)</sub></center>



# Access Control Lists

An extended Access Control List (ACL 100) has been configured and applied on the Manchester router to prevent all Manchester site devices from accessing the Internet, as required by the assignment specification. The ACL denies traffic from all three Manchester subnets (Sales, HR and Management VLANs) destined for any external address, whilst permitting all other traffic (Odom, 2020).

The ACL has been applied inbound on all three Manchester router subinterfaces (Gig0/0/0.10, Gig0/0/0.20 and Gig0/0/0.99) to intercept traffic as it enters the router from the local network, preventing it from being forwarded towards the Internet.




## Manchester Router




## Configure ACL on Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327222231.png)
<center><sub>Figure 83: Manchester Router - Extended ACL 100 Configuration (Deny Manchester Subnets to ISP)</sub></center>






## Apply ACL to Manchester on LAN interfaces
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317031325.png)
<center><sub>Figure 84: Manchester Router - ACL 100 Removed from Serial, Applied to LAN Subinterfaces</sub></center>






## Apply ACL on All Subinterfaces
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317031536.png)
<center><sub>Figure 85: Manchester Router - ACL 100 Applied Inbound on All Three Subinterfaces</sub></center>






## Verifying the ACL from Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317030630.png)
<center><sub>Figure 86: Manchester PC2 - First Ping Succeeds ( Before ACL), Second Ping Blocked (Destination Unreachable)</sub></center>





## PC1 
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260317031616.png)
<center><sub>Figure 87: Manchester PC1 - Internet Access Blocked After ACL Applied ( Destination Unreachable)</sub></center>


Access list on Cambridge-Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260328001109.png)
<center><sub>Figure 88: Cambridge Router - show access-lists ( Standard ACL 1 with 22 Matches for NAT)</sub></center>




# Test Plan





# Cross-VLAN ping test





### Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327215503.png)
<center><sub>Figure 89: Cambridge PC1 and PC2 - Successful Cross-VLAN Ping (VLAN 10 to VLAN 20)</sub></center>





## Manchester

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327222421.png)
<center><sub>Figure 90: Manchester PC1 and PC2 - Successful Cross-VLAN Ping Between Sales and HR</sub></center>






## London
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327215904.png)
<center><sub>Figure 91: London PC1 and PC2 - Successful Cross-VLAN Ping Between Sales and HR</sub></center>






# DHCP Binding Verification
The following verification confirms that IP addresses have been successfully leased to end devices across all three sites. The show ip dhcp binding command was executed on each router to confirm active DHCP leases across all VLANs.




## Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329172814.png)
<center><sub>Figure 92: Cambridge Router - show ip dhcp binding (192.168.24.11 and 192.168.24.140)</sub></center>





## Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329172900.png)
<center><sub>Figure 93: Manchester Router - show ip dhcp binding (192.168.0.11 and 192.168.0.140)</sub></center>





## London
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329172933.png)
<center><sub>Figure 94: London Router - show ip dhcp binding (192.168.16.11 and 192.168.16.140)</sub></center>



The output confirms that IP addresses have been successfully assigned to devices on the sites Sales (VLAN 10), HR (VLAN 20) and Management (VLAN 99) VLANs from the configured DHCP pools.




# DHCP verfication





## Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327222802.png)
<center><sub>Figure 95: Cambridge P Cs - ipconfig /release and /renew Verification</sub></center>





## Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327222953.png)
<center><sub>Figure 96: Manchester P Cs - ipconfig /release and /renew Verification</sub></center>






## London
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327223142.png)
<center><sub>Figure 97: London P Cs - ipconfig /release and /renew Verification</sub></center>



# EIGRP verification 




## London router:
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327223428.png)
<center><sub>Figure 98: London Router - show ip route (EIGRP Routes and D*EX Default Route)</sub></center>






## Manchester Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327223528.png)
<center><sub>Figure 99: Manchester Router - show ip route (EIGRP Learned Routes and D*EX Default Route)</sub></center>





## Cambridge Router
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327223755.png)
<center><sub>Figure 100: Cambridge Router - show ip route (Full Routing Table with Static Default Route)</sub></center>



## floating static route fail-over test




## Manchester
Shutting down the **Manchester --> London**  lInk
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327224632.png)
<center><sub>Figure 101: Manchester Router - Shutting Down Serial 0/1/0 (Manchester- London Link)</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327224943.png)
<center><sub>Figure 102: Manchester Router - show ip route After Link Failure (EIGRP Reroutes via Cambridge)</sub></center>


EIGRP (AD 90) took over via Cambridge using its **Feasible Successor** the floating static route (AD 120) never activated because EIGRP found an alternative path first.
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327225122.png)
<center><sub>Figure 103: Manchester Router - no router eigrp 500 (EIGRP Completely Disabled)</sub></center>


turning off the EIGRP completley
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327225224.png)
<center><sub>Figure 104: Manchester Router - show ip route (Floating Static Routes S [120/0] Now Active)</sub></center>
Restored Manchester:

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327225450.png)
<center><sub>Figure 105: Manchester Router - show ip route After EIGRP Restored (D Routes Return)</sub></center>





## London
Turning off the EIGRP completley
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327225838.png)
<center><sub>Figure 106: London Router - no router eigrp 500 (EIGRP Disabled for Testing)</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327225902.png)
<center><sub>Figure 107: London Router - show ip route (Floating Static Routes Active Without EIGRP)</sub></center>


Restoring
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327225951.png)
<center><sub>Figure 108: London Router - show ip route After EIGRP Restored (D Routes Return)</sub></center>





## Cambridge
turning off the EIGRP completley
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327230229.png)
<center><sub>Figure 109: Cambridge Router - no router eigrp 500 (EIGRP Disabled)</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327230254.png)
<center><sub>Figure 110: Cambridge Router - show ip route (Floating Static Routes Active)</sub></center>


Restoring EIGRP
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327230348.png)

<center><sub>Figure 111: Cambridge Router - show ip route After EIGRP Restored (Full Route Table)</sub></center>



# Sites reach internet after ACL applied





## Cambridge
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327231042.png)
<center><sub>Figure 112: Cambridge PC1 - Successful Ping to ISP After ACL Applied</sub></center>






## Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327231112.png)
<center><sub>Figure 113: Manchester PC1 - Internet Access Blocked (Destination Unreachable After ACL)</sub></center>





## London
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260327231204.png)
<center><sub>Figure 114: London PC1 - Internet Access Verified After DHCP Renew</sub></center>




# Management VLAN Verification





# Cambridge





## SALES
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329171613.png)
<center><sub>Figure 115: Sales-Cambridge - show interfaces vlan 99 and show vlan brief ( Management VLAN Active)</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174030.png)
<center><sub>Figure 116: Sales- Cambridge - show crypto key mypubkey rsa (RSA Keys for SSH)</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174206.png)
<center><sub>Figure 117: HR- Cambridge - show interfaces vlan 99 and show vlan brief</sub></center>






## HR
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329171656.png)
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174309.png)
<center><sub>Figure 117: HR- Cambridge - show interfaces vlan 99 and show vlan brief</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174401.png)
<center><sub>Figure 118: HR- Cambridge - show crypto key mypubkey rsa</sub></center>





# Manchester




## SALES
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174505.png)
<center><sub>Figure 119: Sales- Manchester - show interfaces vlan 99 and show vlan brief</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174600.png)
<center><sub>Figure 120: Sales- Manchester - show crypto key mypubkey rsa</sub></center>





## HR
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174655.png)
<center><sub>Figure 121: HR- Manchester - show interfaces vlan 99 and show vlan brief</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329174824.png)
<center><sub>Figure 122: HR- Manchester — show crypto key mypubkey rsa</sub></center>





# London





## SALES
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329175241.png)
<center><sub>Figure 123: Sales- London - show interfaces vlan 99 and show vlan brief</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329175821.png)
<center><sub>Figure 124: Sales- London - show crypto key mypubkey rsa</sub></center>






## HR

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329175701.png)
<center><sub>Figure 125: HR- London - show interfaces vlan 99 and show vlan brief</sub></center>


![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329175547.png)
<center><sub>Figure 126: HR- London - show crypto key mypubkey rsa</sub></center>



# SSH into each switch from a PC 





# Sales-Cambridge

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329181450.png)
<center><sub>Figure 127: Cambridge PC1 - SSH into Sales-Cambridge Switch via Management VLAN (192.168.25.2)</sub></center>





# HR-Cambrige
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329181917.png)
<center><sub>Figure 128: Cambridge PC2 - SSH into HR- Cambridge Switch (192.168.25.3)</sub></center>





# Sales-London

![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329182258.png)
<center><sub>Figure 129: London PC1 - SSH into Sales- London Switch (192.168.17.2)</sub></center>





# HR-London
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329182629.png)
<center><sub>Figure 130: London PC2 - SSH into HR- London Switch (192.168.17.3)</sub></center>






# Sales-Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329182834.png)
<center><sub>Figure 131: Manchester PC2 - SSH into Sales- Manchester Switch (192.168.1.2)</sub></center>





# HR-Manchester
![Image](https://fxf61.github.io/Pentesting-AD-machine/images/Pasted-image-20260329183013.png)
<center><sub>Figure 132: Manchester PC1 - SSH into HR- Manchester Switch (192.168.1.3)</sub></center>



| **Test No** | **Test**                         | **Expected Result**                  | **Actual Result**        | **Status** |
| ----------- | -------------------------------- | ------------------------------------ | ------------------------ | ---------- |
| **1**       | EtherChannel all 6 switches      | Po1(SU) all ports (P)                | Po1(SU) all ports (P)    | **Pass**   |
| **2**       | EIGRP neighbours all 3 routers   | 2 neighbours per router              | 2 neighbours confirmed   | **Pass**   |
| **3**       | Inter-VLAN Cambridge             | Ping successful (VLAN 10/20)         | Ping successful          | **Pass**   |
| **4**       | Inter-VLAN London                | Ping successful (VLAN 10/20)         | Ping successful          | **Pass**   |
| **5**       | Inter-VLAN Manchester            | Ping successful (VLAN 10/20)         | Ping successful          | **Pass**   |
| **6**       | DHCP all 3 sites                 | IP assigned from correct pool        | IP assigned successfully | **Pass**   |
| **7**       | Default route propagation        | D*EX 0.0.0.0/0 on LDN/MAN            | Confirmed on all routers | **Pass**   |
| **8**       | Floating static route failover   | S routes (AD 120) when EIGRP down    | AD 120 routes confirmed  | **Pass**   |
| **9**       | SSH working / Telnet disabled    | SSH connects, Telnet refused         | Confirmed                | **Pass**   |
| **10**      | NAT/PAT Cambridge & London       | Internet access, NAT table populated | Confirmed                | **Pass**   |
| **11**      | Manchester blocked from Internet | Ping to ISP fails                    | Destination unreachable  | **Pass**   |
| **12**      | Cambridge Internet Access (ACL)  | Ping to ISP succeeds                 | Confirmed                | **Pass**   |
| **13**      | London Internet Access (ACL)     | Ping to ISP succeeds                 | Confirmed                | **Pass**   |



# **Conclusion**

This report has presented the complete redesign, implementation and verification of the network infrastructure for Fitzwilliam Cybersecurity Consultants across its three sites in Cambridge, London and Manchester. The redesigned network successfully addresses all critical deficiencies identified in the existing infrastructure.

The implementation of VLSM has enabled efficient IP address allocation across all three sites, with each site receiving appropriately sized subnets to accommodate current and future host requirements. The Manchester site supports up to 4094 hosts, London up to 2046 hosts and Cambridge up to 510 hosts, significantly exceeding the specified requirements.

Network resilience has been achieved through three complementary mechanisms. The full mesh WAN topology ensures that no single link failure can isolate any site. EIGRP with AS500 provides dynamic routing with fast convergence through the DUAL algorithm, automatically rerouting traffic via alternative paths when a link fails. Floating static routes with an administrative distance of 120 provide a final backup layer, activating automatically in the event of EIGRP failure, as demonstrated during testing.

Security has been comprehensively addressed through the implementation of encrypted passwords, SSH version 2 for remote access with Telnet explicitly disabled, port security with sticky MAC address learning on all six switches, and Access Control Lists restricting Manchester site devices from accessing the Internet whilst permitting all internal communication.

VLANs and inter-VLAN routing have been successfully implemented at all three sites, segmenting network traffic into separate broadcast domains for Sales, HR and Management, improving both network performance and security. EtherChannel using LACP has aggregated four FastEthernet links between the Sales and HR switches at each site, providing 400Mbps bandwidth and switch level redundancy.

DHCP has been configured on each router to automate IP address assignment across all VLANs at all three sites, eliminating manual configuration and reducing the risk of addressing errors. NAT/PAT has been configured on the Cambridge router, enabling all internal devices to access the Internet through a single public IP address.

All implemented features have been fully verified through comprehensive testing as documented in the test plan, demonstrating that the redesigned network meets all specified technical requirements and provides a robust, scalable and secure infrastructure suitable for the continued growth of Fitzwilliam Cybersecurity Consultants.