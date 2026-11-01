#!/bin/sh
# Kør i repoets rodmappe før/efter en opdatering: bekræfter at lykkehjulet, sponsorbjælken og AI-widget er forbundet.
f=0
[ -f lykkehjul.html ] || { echo "FEJL: lykkehjul.html mangler!"; f=1; }
grep -q "lykkehjul.html" index.html || { echo "FEJL: index.html åbner ikke længere lykkehjul.html!"; f=1; }
grep -q 'LYKKEHJUL_CONFIG' lykkehjul.html 2>/dev/null || { echo "FEJL: lykkehjul.html ser ikke korrekt ud"; f=1; }
[ -f sponsor-strip.js ] && grep -q 'sponsor-strip.js' index.html || { echo "FEJL: sponsorbjælken (sponsor-strip.js) er ikke forbundet"; f=1; }
[ -f golfstart-widget.js ] && grep -q 'golfstart-widget.js' index.html || { echo "FEJL: GolfStart AI-widget er ikke forbundet"; f=1; }
[ $f = 0 ] && echo "OK: lykkehjul, sponsorbjælke og GolfStart AI er forbundet."; exit $f
