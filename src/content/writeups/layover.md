---
title: "Layover"
description: "A Linux box chaining wireless credential sniffing, a Craft CMS RCE, security-key abuse, and a CUPS local privilege escalation to root."
date: 2026-10-01
platform: "Hack The Box"
os: "Linux"
difficulty: "Medium"
target: "10.129.76.116"
domain: "international.htb"
executiveSummary: "This report documents the full compromise of the Layover Linux host. Using provided RDP credentials, wireless traffic captured in monitor mode on the workstation exposed cleartext credentials for the Craft CMS employee portal. An authenticated Craft CMS remote code execution vulnerability (CVE-2026-31857) established a foothold as www-data, and the application’s hardcoded security key was abused to decrypt a stored mail-relay password, granting access as the user aporter. Privilege escalation to root was achieved by exploiting a vulnerable local CUPS service (CVE-2026-34990)."
techniques: ["RDP access", "Wi-Fi credential sniffing", "Craft CMS RCE (CVE-2026-31857)", "Security-key abuse", "CUPS LPE (CVE-2026-34990)", "Ligolo-ng pivot"]
tags: ["linux", "craft-cms", "cups", "wifi"]
cover: ../../assets/images/layover.png
coverAlt: "Layover HTB"
locked: true
---

<!-- ACTIVE BOX: full walkthrough intentionally withheld from this public repo
     until Layover retires. The public page shows only the executive summary
     above. To publish on retirement: paste the ported walkthrough body here
     (source in ~/Desktop/CAPE), copy its screenshots into src/assets/images,
     and set locked: false. -->
