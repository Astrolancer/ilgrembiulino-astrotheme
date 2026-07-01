if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
        
        // Inizializza i selettori delle patch se presenti
        this.patchSelectors = this.querySelectorAll('input[name="patch_selection"]');
        if (this.patchSelectors.length > 0) {
          this.patchSelectors.forEach(selector => {
            selector.addEventListener('change', this.updatePatchSelection.bind(this));
          });
          this.patchPriceDisplay = this.querySelector('.patch-price-display');
          this.updatePatchSelection();
        }
      }

      // Nuovo metodo per gestire la selezione delle patch
      updatePatchSelection() {
        const selectedPatch = this.querySelector('input[name="patch_selection"]:checked');
        
        if (selectedPatch) {
          const patchPrice = selectedPatch.dataset.price || '0';
          const patchName = selectedPatch.dataset.name || '';
          
          // Rimuovi eventuali input nascosti precedenti per evitare duplicati
          const existingPatchInput = this.querySelector('input[name="properties[Patch]"]');
          const existingPriceInput = this.querySelector('input[name="properties[_patch_price]"]');
          
          if (existingPatchInput) existingPatchInput.remove();
          if (existingPriceInput) existingPriceInput.remove();
          
          // Aggiungi solo se è stata selezionata una patch (non "Nessuna patch")
          if (patchName && patchPrice > 0) {
            // Crea input nascosti per le proprietà
            const patchInput = document.createElement('input');
            patchInput.type = 'hidden';
            patchInput.name = 'properties[Patch]';
            patchInput.value = patchName;
            this.form.appendChild(patchInput);
            
            const priceInput = document.createElement('input');
            priceInput.type = 'hidden';
            priceInput.name = 'properties[_patch_price]';
            priceInput.value = patchPrice;
            this.form.appendChild(priceInput);
            
            // Aggiorna il display del prezzo
            if (this.patchPriceDisplay) {
              const formattedPrice = new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR'
              }).format(patchPrice / 100);
              this.patchPriceDisplay.textContent = `+${formattedPrice}`;
              this.patchPriceDisplay.classList.remove('hidden');
            }
          } else {
            // Nascondi il display del prezzo se non c'è patch selezionata
            if (this.patchPriceDisplay) {
              this.patchPriceDisplay.classList.add('hidden');
            }
          }
        }
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        
        // Assicurati che la selezione della patch sia aggiornata prima dell'invio
        if (this.patchSelectors.length > 0) {
          this.updatePatchSelection();
        }
        
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}