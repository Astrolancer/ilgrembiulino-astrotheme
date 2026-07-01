class PatchPriceCalculator {
  constructor() {
    this.init();
  }

  init() {
    // Esegui il calcolo all'avvio
    this.calculatePatchPrices();
    
    // Osserva le modifiche al DOM per ricalcolare quando il carrello viene aggiornato
    this.setupMutationObserver();
  }

  setupMutationObserver() {
    // Osserva le modifiche al carrello
    const cartContainer = document.querySelector('cart-items');
    if (!cartContainer) return;
    
    const observer = new MutationObserver((mutations) => {
      this.calculatePatchPrices();
    });
    
    observer.observe(cartContainer, { childList: true, subtree: true });
  }

  calculatePatchPrices() {
    // Trova tutti gli elementi del carrello con proprietà patch
    const cartItems = document.querySelectorAll('.cart-item');
    if (!cartItems.length) return;
    
    let totalPatchPrice = 0;
    
    // Calcola il prezzo totale delle patch
    cartItems.forEach(item => {
      // Cerca la proprietà _patch_price
      const patchPriceElements = item.querySelectorAll('.product-option');
      let itemPatchPrice = 0;
      let quantity = 1;
      
      // Trova la quantità dell'articolo
      const quantityInput = item.querySelector('.quantity__input');
      if (quantityInput) {
        quantity = parseInt(quantityInput.value) || 1;
      }
      
      // Cerca il prezzo della patch nelle proprietà
      patchPriceElements.forEach(propElement => {
        const propText = propElement.textContent.trim();
        if (propText.includes('_patch_price')) {
          const priceMatch = propText.match(/\d+/);
          if (priceMatch) {
            itemPatchPrice = parseInt(priceMatch[0]);
            // Moltiplica per la quantità
            totalPatchPrice += itemPatchPrice * quantity;
          }
        }
      });
    });
    
    // Aggiorna il totale visualizzato
    this.updateCartTotal(totalPatchPrice);
  }

  updateCartTotal(patchPrice) {
    if (patchPrice <= 0) return;
    
    // Trova l'elemento del totale del carrello
    const totalElement = document.querySelector('.totals__total-value');
    if (!totalElement) return;
    
    // Ottieni il prezzo originale dal testo dell'elemento
    const originalPriceText = totalElement.textContent.trim();
    const currencySymbol = originalPriceText.match(/[^\d,.\s]/g).join('');
    const originalPrice = parseFloat(originalPriceText.replace(/[^\d,.]/g, '').replace(',', '.'));
    
    // Calcola il nuovo prezzo totale (originale + prezzo patch)
    const patchPriceInCurrency = patchPrice / 100;
    const newTotalPrice = originalPrice + patchPriceInCurrency;
    
    // Formatta il nuovo prezzo totale
    const formattedNewTotal = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(newTotalPrice);
    
    // Aggiorna il testo dell'elemento del totale
    totalElement.textContent = formattedNewTotal;
    
    // Aggiungi una nota sul prezzo della patch
    let patchNoteElement = document.querySelector('.patch-price-note');
    
    if (!patchNoteElement) {
      patchNoteElement = document.createElement('p');
      patchNoteElement.className = 'patch-price-note';
      patchNoteElement.style.fontSize = '0.9em';
      patchNoteElement.style.marginTop = '5px';
      totalElement.parentNode.insertBefore(patchNoteElement, totalElement.nextSibling);
    }
    
    // Formatta il prezzo della patch
    const formattedPatchPrice = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(patchPrice / 100);
    
    patchNoteElement.textContent = `Include ${formattedPatchPrice} per patch personalizzate`;
    
    // Aggiungi un campo nascosto per il checkout
    this.addHiddenPatchPriceField(patchPrice);
  }
  
  addHiddenPatchPriceField(patchPrice) {
    // Trova il form del carrello
    const cartForm = document.querySelector('form[action="/cart"]');
    if (!cartForm) return;
    
    // Rimuovi eventuali campi nascosti precedenti
    const existingField = document.querySelector('input[name="attributes[_patch_total_price]"]');
    if (existingField) {
      existingField.remove();
    }
    
    // Crea un campo nascosto per il prezzo totale delle patch
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'attributes[_patch_total_price]';
    hiddenField.value = patchPrice;
    
    // Aggiungi il campo al form
    cartForm.appendChild(hiddenField);
  }
}

// Inizializza il calcolatore quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  new PatchPriceCalculator();
});