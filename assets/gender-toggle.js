// Semplice toggle genere che funziona con i filtri Shopify
function initGenderToggle() {
  const femaleLabel = document.querySelector('.gender-toggle__label--female');
  const maleLabel = document.querySelector('.gender-toggle__label--male');
  const toggleIcon = document.querySelector('.gender-toggle__icon');
  const genderToggle = document.querySelector('.gender-toggle');
  
  if (!femaleLabel || !maleLabel || !genderToggle) return;
  
  // Funzione per ottenere il genere attuale dall'URL
  function getCurrentGender() {
    const urlParams = new URLSearchParams(window.location.search);
    const genderParam = urlParams.get('filter.p.m.custom.gender');
    
    if (genderParam === 'bambino') return 'male';
    if (genderParam === 'bambina') return 'female';
    return 'none';
  }
  
  // Funzione per aggiornare l'aspetto del toggle
  function updateToggleUI() {
    const currentGender = getCurrentGender();
    
    // Reset classi
    genderToggle.classList.remove('male', 'female');
    femaleLabel.classList.remove('active');
    maleLabel.classList.remove('active');
    
    // Applica stato attuale
    if (currentGender === 'male') {
      genderToggle.classList.add('male');
      maleLabel.classList.add('active');
      if (toggleIcon) toggleIcon.textContent = '♂';
    } else if (currentGender === 'female') {
      genderToggle.classList.add('female');
      femaleLabel.classList.add('active');
      if (toggleIcon) toggleIcon.textContent = '♀';
    } else {
      if (toggleIcon) toggleIcon.textContent = '○';
    }
  }
  
  // Funzione per navigare a un nuovo URL con filtro
  function navigateWithGenderFilter(gender) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Rimuovi filtro genere esistente
    urlParams.delete('filter.p.m.custom.gender');
    
    // Aggiungi nuovo filtro se necessario
    if (gender === 'male') {
      urlParams.set('filter.p.m.custom.gender', 'bambino');
    } else if (gender === 'female') {
      urlParams.set('filter.p.m.custom.gender', 'bambina');
    }
    
    // Naviga al nuovo URL
    const newUrl = window.location.pathname + '?' + urlParams.toString();
    window.location.href = newUrl;
  }
  
  // Inizializza l'aspetto
  updateToggleUI();
  
  // Event listener per BAMBINA
  femaleLabel.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const currentGender = getCurrentGender();
    
    if (currentGender === 'female') {
      // Se già attivo, disattiva
      navigateWithGenderFilter('none');
    } else {
      // Attiva filtro bambina
      navigateWithGenderFilter('female');
    }
  });
  
  // Event listener per BAMBINO
  maleLabel.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const currentGender = getCurrentGender();
    
    if (currentGender === 'male') {
      // Se già attivo, disattiva
      navigateWithGenderFilter('none');
    } else {
      // Attiva filtro bambino
      navigateWithGenderFilter('male');
    }
  });
  
  // Event listener per l'icona centrale (opzionale)
  if (toggleIcon) {
    toggleIcon.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const currentGender = getCurrentGender();
      
      if (currentGender === 'none') {
        navigateWithGenderFilter('female');
      } else if (currentGender === 'female') {
        navigateWithGenderFilter('male');
      } else {
        navigateWithGenderFilter('none');
      }
    });
  }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGenderToggle);
} else {
  initGenderToggle();
}
