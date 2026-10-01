---
# SAMPLE CONTENT — placeholder body to exercise the article template.
# Real writeups replace this at Hugo-port time.
title: Forest
description: A quiet Active Directory box — enumeration, a roastable service account, and a group-nesting path to Domain Admin.
date: 2025-11-02
os: Windows
difficulty: Easy
tags: [active-directory, kerberos, bloodhound, dcsync]
chain:
  - Enumeration → user list
  - Roast a service account
  - Nested group privileges
  - Domain escalation
featured: true
---

*Placeholder body. This text exists only to style the reading template — measure,
rhythm, code blocks, tables and callouts. It is not a walkthrough.*

## Recon

The box presents a familiar domain-controller surface and little else, which
makes it a clean exercise in reading Active Directory from the outside in. A
first scan establishes the lay of the land.

```bash
nmap -p- --min-rate 5000 -sC -sV -oA scans/forest 10.10.10.161
```

The interesting services and what each told us:

| Port | Service  | Note                    |
| ---- | -------- | ----------------------- |
| 88   | Kerberos | domain realm identified |
| 389  | LDAP     | directory reachable     |
| 445  | SMB      | share listing available |
| 5985 | WinRM    | remote shell if we get creds |

> [!note]
> Callout styling lives in the article template. Variants planned: **note**,
> **warning**, and **loot** (for recovered credentials / flags), each with its
> own left-rule colour drawn from the palette.

## Foothold

Prose paragraph to test the reading measure at `--step-0`. A run of body copy
sitting on the `--measure` width, long enough to show the line length, the
`--leading-body` rhythm, and how an inline `command` reads against the bone
background. The `<em>` treatment pulls *toward crimson* on emphasis.

## Escalation

A short ordered list to check list rhythm:

1. Map the group nesting.
2. Follow the path the graph exposes.
3. Reach the objective.

That closes the box.
