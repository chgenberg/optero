# Mendio Domain Setup Guide
## Koppla din domän från One.com till Railway

### Steg 1: Lägg till domän i Railway

1. Gå till Railway dashboard: https://railway.app
2. Välj ditt projekt: **optero**
3. Klicka på **Settings** → **Domains**
4. Klicka på **+ Custom Domain**
5. Skriv in din domän: **mendio.io** (eller vilken domän du vill använda)
6. Railway visar nu DNS-inställningar du behöver

---

### Steg 2: DNS-inställningar i One.com

#### A) För huvuddomän (mendio.io):

Logga in på One.com → DNS-inställningar → Lägg till följande:

**CNAME Record:**
```
Type: CNAME
Name: @ (eller tomt)
Value: [Railway ger dig detta, typ: optero-production.up.railway.app]
TTL: 3600
```

**ELLER A Record (om CNAME inte fungerar för root):**
```
Type: A
Name: @ (eller tomt)  
Value: [Railway ger dig IP-adress]
TTL: 3600
```

#### B) För www-subdomän (www.mendio.io):

```
Type: CNAME
Name: www
Value: optero-production.up.railway.app
TTL: 3600
```

---

### Steg 3: SSL/HTTPS (Automatiskt)

Railway hanterar SSL-certifikat automatiskt via Let's Encrypt:
- ✅ Inget du behöver göra
- ✅ Certifikat förnyas automatiskt
- ✅ Klart inom 5-10 minuter efter DNS-propagering

---

### Steg 4: Språk-subdomäner (optional)

Om du vill ha separata domäner per språk:

**sv.mendio.io (Svenska):**
```
Type: CNAME
Name: sv
Value: optero-production.up.railway.app
TTL: 3600
```

**de.mendio.io (Tyska):**
```
Type: CNAME
Name: de
Value: optero-production.up.railway.app
TTL: 3600
```

Osv för es, fr...

---

### Steg 5: Verifiera DNS-propagering

Vänta 5-30 minuter (kan ta upp till 48h i vissa fall), sedan testa:

```bash
# Kolla DNS
nslookup mendio.io

# Kolla CNAME
dig mendio.io

# Testa i browser
https://mendio.io
```

---

### Steg 6: Uppdatera miljövariabler i Railway

I Railway → Settings → Environment Variables:

```
NEXT_PUBLIC_BASE_URL=https://mendio.io
```

Redeploya efter ändring.

---

### Steg 7: Uppdatera sitemap och robots.txt

Dessa filer behöver uppdateras med din nya domän:
- `/public/sitemap.xml`
- `/public/robots.txt`

(Jag kan hjälpa dig med detta!)

---

## Troubleshooting

### Problem: "DNS_PROBE_FINISHED_NXDOMAIN"
**Lösning:** DNS har inte propagerat än. Vänta 30 min - 2h.

### Problem: "Certificate error"
**Lösning:** Railway genererar SSL-cert. Vänta 5-10 min.

### Problem: "Site not loading"
**Lösning:** 
1. Kolla att CNAME pekar rätt
2. Verifiera i Railway att domänen är "Verified"
3. Kolla Railway logs för fel

### Problem: "www fungerar men inte root"
**Lösning:** Lägg till både CNAME för www OCH A-record för root

---

## Rekommenderad DNS-konfiguration

```
# Root domain
mendio.io          A      [Railway IP]
mendio.io          AAAA   [Railway IPv6]

# WWW redirect
www.mendio.io      CNAME  optero-production.up.railway.app

# Language subdomains (optional)
sv.mendio.io       CNAME  optero-production.up.railway.app
de.mendio.io       CNAME  optero-production.up.railway.app
es.mendio.io       CNAME  optero-production.up.railway.app
fr.mendio.io       CNAME  optero-production.up.railway.app

# Email (om du vill ha email@mendio.io)
mendio.io          MX     10 mail.one.com
```

---

## Checklista

- [ ] Lägg till domän i Railway
- [ ] Kopiera CNAME/A-record värden från Railway
- [ ] Logga in på One.com
- [ ] Lägg till DNS-records
- [ ] Vänta på DNS-propagering (5-30 min)
- [ ] Verifiera att domänen fungerar
- [ ] Uppdatera NEXT_PUBLIC_BASE_URL i Railway
- [ ] Uppdatera sitemap.xml och robots.txt
- [ ] Testa alla språk-routes (/sv, /es, etc)
- [ ] Verifiera SSL-certifikat

---

## Tidsplan

**0-5 min:** Lägg till domän i Railway och DNS i One.com
**5-30 min:** DNS propagerar
**30-60 min:** SSL-certifikat genereras
**60 min:** Allt fungerar! ✅

---

## Behöver du hjälp?

Jag kan hjälpa dig med:
1. Uppdatera sitemap.xml och robots.txt med ny domän
2. Konfigurera redirects (www → root, gamla länkar, etc)
3. Sätta upp email-forwarding
4. Konfigurera analytics med ny domän

Säg bara till! 🚀
