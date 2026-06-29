(function () {
  'use strict';

  Models.initDefaults();

  const tabs = document.querySelectorAll('.app-tab');
  const views = document.querySelectorAll('.app-view');

  function switchTab(tabId) {
    tabs.forEach((t) => t.classList.toggle('app-tab--active', t.dataset.tab === tabId));
    views.forEach((v) => v.classList.toggle('app-view--active', v.id === tabId + '-view'));
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  Dashboard.init();
  Registro.init();
  Analisis.init();

  switchTab('dashboard');
})();
