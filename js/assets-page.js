/* ============================================
   ASSETS PAGE — DOSSIER MODAL SYSTEM
   ============================================ */

(function () {
  'use strict';

  // Character data
  const characters = {
    kratos: {
      unit: 'UNIT 01',
      name: 'Kratos',
      origin: 'God of War — PlayStation',
      platform: 'PlayStation',
      accent: '#cc0000',
      status: 'CONTAINED',
      threat: 'EXTREME',
      acquired: '2025-03-15',
      notes: 'Subject displays extreme aggression. Spartan Rage events documented. Double containment protocols in effect. Chains of Olympus repurposed as restraint system.',
      classification: 'OMEGA'
    },
    spiderman: {
      unit: 'UNIT 02',
      name: 'Spider-Man',
      origin: "Marvel's Spider-Man — PlayStation",
      platform: 'PlayStation',
      accent: '#cc0000',
      status: 'COCOONED',
      threat: 'HIGH',
      acquired: '2025-03-22',
      notes: 'Subject contained in web-neutralization pod. Spider-sense disrupted via electromagnetic field. Subject continues attempts to breach containment via web structures.',
      classification: 'DELTA'
    },
    masterchief: {
      unit: 'UNIT 03',
      name: 'Master Chief',
      origin: 'Halo — Xbox',
      platform: 'Xbox',
      accent: '#d4a017',
      status: 'SEALED',
      threat: 'EXTREME',
      acquired: '2025-04-01',
      notes: 'Mjolnir armour locked at system level. AI companion (Cortana) quarantined separately. Subject compliant but monitoring recommended. Visor displays intermittent activity.',
      classification: 'SIGMA'
    },
    aloy: {
      unit: 'UNIT 04',
      name: 'Aloy',
      origin: 'Horizon Zero Dawn — PlayStation',
      platform: 'PlayStation',
      accent: '#cc4400',
      status: 'MONITORED',
      threat: 'MODERATE',
      acquired: '2025-04-10',
      notes: 'Focus device confiscated and stored in vault annex. Subject demonstrates advanced problem-solving capability. Containment cell reinforced after two escape attempts.',
      classification: 'GAMMA'
    }
  };

  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');

  // Open modal
  function openModal(charId) {
    const char = characters[charId];
    if (!char) return;

    document.getElementById('modal-unit').textContent = char.unit + ' — DOSSIER';
    document.getElementById('modal-name').textContent = char.name;
    document.getElementById('modal-origin').textContent = char.origin;
    document.getElementById('modal-placeholder-text').textContent = char.name.charAt(0);

    // Data rows
    document.getElementById('modal-status').textContent = char.status;
    document.getElementById('modal-threat').textContent = char.threat;
    document.getElementById('modal-acquired').textContent = char.acquired;
    document.getElementById('modal-platform').textContent = char.platform;
    document.getElementById('modal-classification').textContent = char.classification;
    document.getElementById('modal-notes').textContent = char.notes;

    // Set accent color
    document.getElementById('modal-status').style.color = char.accent;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Event listeners for dossier cards
  document.querySelectorAll('.dossier').forEach(card => {
    card.addEventListener('click', () => {
      const charId = card.dataset.character;
      openModal(charId);
    });
  });

  // Close button
  document.getElementById('modal-close').addEventListener('click', closeModal);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();
