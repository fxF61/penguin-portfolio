---
# SAMPLE CONTENT — placeholder body to exercise the article template.
title: Certified
description: An AD CS box centred on certificate-template misconfiguration and the shadow-credential path it opens.
date: 2025-12-14
os: Windows
difficulty: Medium
tags: [active-directory, adcs, certificates, shadow-credentials]
chain:
  - Foothold from starting credentials
  - Abuse of object permissions
  - Certificate-based authentication
  - Domain escalation
featured: true
---

*Placeholder body — styling only, not a walkthrough.*

## Overview

An assumed-breach box: you start with credentials and climb through Active
Directory Certificate Services. Good material for showing how a longer writeup
paginates — this paragraph exists to give the sticky table of contents more than
one heading to track as you scroll.

```powershell
# tooling reference — output elided in this placeholder
Get-ADObject -Filter * -SearchBase $base
```

## Enumeration

Body copy. The article template keeps animation out of the way here; reading
comes first. Second heading so the table of contents has depth to render.

## Escalation

Closing section. A [sample link](/writeups/) to test inline link colour and the
crimson underline on hover.
