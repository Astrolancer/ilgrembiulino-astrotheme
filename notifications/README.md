# Notifiche email – Il Grembiulino

I template delle email di notifica **non fanno parte del tema** e non vengono
caricati con `shopify theme push`: vanno incollati a mano nell'admin di Shopify.
Questa cartella serve a tenerli versionati insieme al tema.

## `order-confirmation.liquid` – Conferma ordine

### Cosa risolve

Il template standard di Shopify mostra le proprietà di riga (le opzioni scelte
dal cliente) **solo per i buoni regalo**. Le personalizzazioni aggiunte con
il plugin *Ymq Product Options* (ricamo del nome, patch, nome da ricamare, …)
sono proprietà di riga e quindi non comparivano mai nell'email.

Il nuovo template:

- mostra tutte le proprietà visibili sotto ogni articolo, in un riquadro
  "Personalizzazioni" (sia sulle righe normali sia sulle righe che il plugin
  raggruppa con l'add-on a pagamento, quelle che in admin appaiono come
  "Parte di: …");
- nasconde le proprietà tecniche del plugin che iniziano con `_`
  (`_YmqItemPrice`, `__ymq_option_info`, …) e usa `_YmqItemPrice` solo per
  mostrare il supplemento (es. "Personalizzazioni · +€8,00");
- accorcia le etichette lunghe del plugin ("Scegli dove far ricamare il nome"
  → "Ricamo del nome", "Scegli la patch perfetta…" → "Patch"); le altre
  etichette vengono mostrate così come sono;
- è graficamente allineato al tema: blu `#1F3F92`, rosa `#f51175`, giallo
  `#f6cc38`, font Assistant/Archivo, bottoni a pillola, box assistenza con
  WhatsApp, footer con showroom e social;
- mostra l'IVA come "di cui IVA inclusa" quando i prezzi sono già comprensivi
  di imposte (come nel negozio), invece di una riga "Imposte" separata.

### Come installarlo

1. Admin Shopify → **Impostazioni** → **Notifiche** → **Notifiche cliente**.
2. Apri **Conferma ordine** → **Modifica codice**.
3. Sostituisci tutto il contenuto del **Corpo dell'email (HTML)** con il
   contenuto di `order-confirmation.liquid` e salva.
4. Oggetto consigliato:
   `Ordine {{ name }} confermato – grazie {{ customer.first_name }}!`
5. Sempre in **Notifiche**, con **Personalizza** carica il logo
   (`IL_GREMBIULINO.png`, larghezza 180) e imposta il colore accento
   `#f51175`: il template usa `shop.email_logo_url` se presente, altrimenti
   scrive il nome del negozio.
6. Usa **Invia email di prova** per verificare, oppure apri un ordine con
   personalizzazioni → **Altre azioni** → **Invia di nuovo la conferma**.

### Note

- Il template rende gli articoli con un unico elenco (non separa per metodo
  di consegna in caso di carrello misto spedizione + ritiro). Per questo
  negozio, che usa solo la spedizione, non cambia nulla.
- Se in futuro il plugin cambia il nome delle opzioni, le etichette vengono
  comunque mostrate: la mappatura corta è solo un abbellimento.
