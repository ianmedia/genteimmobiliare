# genteimmobiliare.it

Sito statico di Gente Immobiliare (RE/MAX Abacus Roma).

## Struttura

- `index.html` — home.
- `nfc/index.html` — pagina di redirect deep-link verso il canale YouTube
  `@remaxabacusroma`. Su Android forza l'app YouTube con `intent://` e
  fallback web, su iOS e desktop usa l'universal link. Raggiungibile a `/nfc`
  (pensata per un tag NFC).
- `vercel.json` — `cleanUrls`, così `/nfc` funziona senza slash finale.

## Deploy

Sito statico, nessun build step. Deploy su Vercel come progetto statico.
Puntare il dominio `genteimmobiliare.it` al progetto Vercel.
