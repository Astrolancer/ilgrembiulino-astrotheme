class FullscreenMenu extends HTMLElement {
  constructor() {
    super();
    this.menuToggle = this.querySelector('.menu-toggle');
    this.closeButton = this.querySelector('.fullscreen-menu__close');
    this.menu = this.querySelector('#fullscreen-menu');
    this.menuItems = this.querySelectorAll('.fullscreen-menu__item[data-image]');
    this.menuImages = this.querySelectorAll('.fullscreen-menu__image');
    
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', this.openMenu.bind(this));
    }
    
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.closeMenu.bind(this));
    }
    
    // Chiudi il menu quando si preme ESC
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.closeMenu();
    });
    
    // Aggiungi eventi hover alle voci di menu
    this.menuItems.forEach(item => {
      const imageId = item.getAttribute('data-image');
      
      item.addEventListener('mouseenter', () => {
        this.showImage(imageId);
      });
    });
    
    // Mostra la prima immagine all'apertura del menu
    if (this.menuItems.length > 0) {
      const firstItem = this.menuItems[0];
      const firstImageId = firstItem.getAttribute('data-image');
      this.showImage(firstImageId);
    }
  }
  
  openMenu() {
    if (this.menu) {
      this.menu.classList.add('active');
      document.body.classList.add('overflow-hidden');
      trapFocus(this.menu);
      
      // Applica il colore di sfondo dal data-attribute se presente
      const backgroundColor = this.getAttribute('data-background-color');
      if (backgroundColor) {
        this.menu.style.backgroundColor = backgroundColor;
      }
    }
  }
  
  closeMenu() {
    if (this.menu && this.menu.classList.contains('active')) {
      this.menu.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
      removeTrapFocus();
    }
  }
  
  showImage(imageId) {
    this.menuImages.forEach(image => {
      image.classList.remove('active');
    });
    
    const targetImage = this.querySelector(`#menu-image-${imageId}`);
    if (targetImage) {
      targetImage.classList.add('active');
      
      // Applica il colore di sfondo associato all'immagine se presente
      const backgroundColor = targetImage.getAttribute('data-background-color');
      if (backgroundColor && this.menu) {
        this.menu.style.backgroundColor = backgroundColor;
      }
    }
  }
}

customElements.define('fullscreen-menu', FullscreenMenu);