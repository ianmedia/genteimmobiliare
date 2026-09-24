# genteimmobiliare.it

Sito ufficiale de **La Gente Immobiliare**, la docu-serie di RE/MAX Abacus
prodotta da Quitebold. Landing cinematografica con trailer, cast, rassegna
stampa e rimando al canale YouTube.

## Struttura

- `index.html` — landing cinematografica. Hero con video in loop, trailer
  YouTube (video `LlnWaTOlDv0`) in un player che apre in overlay così le
  visualizzazioni contano su YouTube, sezione serie, host Flaminia Fegarotti,
  feature de Il Messaggero, anteprima al Cinema Eden e call to action verso
  `@remaxabacusroma`. Font Hanken Grotesk, palette del brand kit LGIM.
- `assets/` — logo LGIM, logo RE/MAX Abacus, video di sfondo, poster,
  still ufficiali della serie, ritratto dell'host, immagine Open Graph e
  favicon.
- `nfc/index.html` — pagina di redirect deep-link verso il canale YouTube
  `@remaxabacusroma`. Su Android forza l'app YouTube con `intent://` e
  fallback web, su iOS e desktop usa l'universal link. Raggiungibile a `/nfc`
  (pensata per un tag NFC).
- `vercel.json` — `cleanUrls`, così `/nfc` funziona senza slash finale.

## Deploy

Sito statico, nessun build step. Deploy su Vercel come progetto statico.
Puntare il dominio `genteimmobiliare.it` al progetto Vercel.
