/* La Fringale — affichage du contenu (lit assets/donnees.js, et Google Sheets si branché) */
(function () {
  'use strict';

  var JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function $(sel) { return document.querySelector(sel); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function telHref(tel) { return 'tel:+33' + String(tel).replace(/\D/g, '').replace(/^0/, ''); }
  function prix(p) { return p === '' || p == null ? '' : String(p).replace('.', ',') + ' €'; }
  function sansAccent(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function dateCourte(d) { return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()]; }

  function lireDate(s) {
    s = String(s || '').trim();
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    return null;
  }
  function jourSeul(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  /* ---------- Google Sheets (optionnel) ---------- */
  function parseCSV(txt) {
    var lignes = [], ligne = [], champ = '', guillemets = false;
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (guillemets) {
        if (c === '"' && txt[i + 1] === '"') { champ += '"'; i++; }
        else if (c === '"') guillemets = false;
        else champ += c;
      } else if (c === '"') guillemets = true;
      else if (c === ',') { ligne.push(champ); champ = ''; }
      else if (c === '\n') { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; }
      else if (c !== '\r') champ += c;
    }
    if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
    var entetes = (lignes.shift() || []).map(sansAccent);
    return lignes.filter(function (l) { return l.some(function (x) { return x.trim(); }); }).map(function (l) {
      var o = {};
      entetes.forEach(function (h, i) { o[h] = (l[i] || '').trim(); });
      return o;
    });
  }
  function onglet(id, nom) {
    var url = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(id) + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(nom);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(nom); return r.text(); }).then(parseCSV);
  }
  function chargerSheet(D) {
    var id = D.googleSheetId;
    if (!id) return Promise.resolve(D);
    var nombre = function (v) { return v === '' ? '' : Number(String(v).replace(',', '.').replace(/[^\d.]/g, '')); };
    var oui = function (v) { return /^(oui|x|1|true|vrai)$/i.test(String(v).trim()); };
    return Promise.all([
      onglet(id, 'Carte').catch(function () { return null; }),
      onglet(id, 'Tournée').catch(function () { return null; }),
      onglet(id, 'Congés').catch(function () { return null; }),
      onglet(id, 'Infos').catch(function () { return null; })
    ]).then(function (r) {
      if (r[0] && r[0].length) D.carte = r[0].filter(function (p) { return p.nom; }).map(function (p) {
        return { nom: p.nom, base: /creme/.test(sansAccent(p.base)) ? 'creme' : 'tomate', ingredients: p.ingredients,
          prix26: nombre(p['prix 26']), prix29: nombre(p['prix 29']), accueil: oui(p.accueil), photo: p.photo || '' };
      });
      if (r[1] && r[1].length) D.tournee = r[1].map(function (t) {
        return { jour: JOURS.map(sansAccent).indexOf(sansAccent(t.jour)), ville: t.ville, lieu: t.lieu };
      }).filter(function (t) { return t.jour >= 0 && t.ville; });
      if (r[2]) D.conges = r[2].map(function (c) { return { du: c.du, au: c.au, message: c.message }; });
      if (r[3]) {
        var infos = {};
        r[3].forEach(function (l) { infos[sansAccent(l.cle || l.info || '')] = l.valeur || ''; });
        var map = { 'annonce': 'annonce', 'nom de la chienne': 'nomChienne', 'nom de la mascotte': 'nomMascotte',
          'lien avis google': 'lienAvisGoogle', 'facebook': 'facebook', 'instagram': 'instagram' };
        Object.keys(map).forEach(function (k) { if (k in infos) D[map[k]] = infos[k]; });
        if ('pizza du moment' in infos) {
          D.pizzaDuMoment = { nom: infos['pizza du moment'], ingredients: infos['pizza du moment - ingredients'] || '',
            prix26: nombre(infos['pizza du moment - prix 26'] || ''), prix29: nombre(infos['pizza du moment - prix 29'] || ''),
            photo: infos['pizza du moment - photo'] || '' };
        }
      }
      return D;
    }).catch(function () { return D; });
  }

  /* ---------- Où est le camion ? ---------- */
  function enConges(D, jour) {
    for (var i = 0; i < (D.conges || []).length; i++) {
      var c = D.conges[i], du = lireDate(c.du), au = lireDate(c.au);
      if (du && au && jour >= du && jour <= au) return { fin: au, message: c.message || '' };
    }
    return null;
  }
  function etapeDuJour(D, jour) {
    return (D.tournee || []).filter(function (t) { return t.jour === jour.getDay(); })[0] || null;
  }
  function prochainArret(D, depuis) {
    for (var i = 1; i <= 60; i++) {
      var j = new Date(depuis.getFullYear(), depuis.getMonth(), depuis.getDate() + i);
      if (enConges(D, j)) continue;
      var e = etapeDuJour(D, j);
      if (e) return { etape: e, date: j, dans: i };
    }
    return null;
  }
  function statut(D, maintenant) {
    var jour = jourSeul(maintenant);
    var h = maintenant.getHours() + maintenant.getMinutes() / 60;
    var conge = enConges(D, jour);
    if (conge) return { type: 'conges', conge: conge, prochain: prochainArret(D, conge.fin) };
    var e = etapeDuJour(D, jour);
    if (e && h < D.heureFin) return { type: h >= D.heureDebut ? 'maintenant' : 'cesoir', etape: e };
    return { type: e ? 'termine' : 'repos', prochain: prochainArret(D, jour) };
  }
  function quand(p) {
    if (!p) return '';
    var dans = Math.round((p.date - jourSeul(new Date())) / 86400000);
    if (dans === 1) return 'Demain';
    if (dans < 7) return JOURS[p.date.getDay()];
    return JOURS[p.date.getDay()] + ' ' + dateCourte(p.date);
  }

  function rendreCeSoir(D, s) {
    var el = $('#ce-soir');
    if (!el) return;
    var h = D.heureDebut + 'h → ' + D.heureFin + 'h';
    var html;
    if (s.type === 'cesoir' || s.type === 'maintenant') {
      html = '<p class="ce-soir-etiquette">' + (s.type === 'maintenant' ? 'En ce moment, jusqu’à ' + D.heureFin + 'h · on est à' : 'Ce soir · ' + h + ' · on t’attend à') + '</p>' +
        '<p class="ce-soir-ville">' + esc(s.etape.ville) + '</p><p class="ce-soir-lieu">' + esc(s.etape.lieu) + '</p>';
    } else if (s.type === 'conges') {
      html = '<p class="ce-soir-etiquette">En congés jusqu’au ' + dateCourte(s.conge.fin) + '</p>' +
        (s.prochain ? '<p class="ce-soir-ville">Retour ' + esc(quand(s.prochain).toLowerCase()) + '</p><p class="ce-soir-lieu">' + esc(s.prochain.etape.ville) + ' · ' + esc(s.prochain.etape.lieu) + '</p>' : '') +
        (s.conge.message ? '<p class="ce-soir-message">' + esc(s.conge.message) + '</p>' : '');
    } else {
      var p = s.prochain;
      html = '<p class="ce-soir-etiquette">' + (s.type === 'termine' ? 'C’est fini pour ce soir, merci ! Prochain arrêt :' : 'Ce soir on se repose. Prochain arrêt :') + '</p>' +
        (p ? '<p class="ce-soir-ville">' + esc(quand(p)) + ' · ' + esc(p.etape.ville) + '</p><p class="ce-soir-lieu">' + esc(p.etape.lieu) + ', ' + h + '</p>' : '');
    }
    el.innerHTML = html;
  }

  function rendreTournee(D, s, maintenant) {
    var el = $('#tournee-liste');
    if (!el) return;
    var aujourdhui = maintenant.getDay();
    var enPause = s.type === 'conges';
    var etapes = (D.tournee || []).slice().sort(function (a, b) { return ((a.jour + 6) % 7) - ((b.jour + 6) % 7); });
    el.innerHTML = etapes.map(function (t, i) {
      var actif = !enPause && t.jour === aujourdhui && (s.type === 'cesoir' || s.type === 'maintenant');
      return '<li class="etape' + (actif ? ' aujourdhui' : '') + (enPause ? ' ferme' : '') + '">' +
        '<span class="etape-jour">0' + (i + 1) + ' — ' + JOURS[t.jour] + (actif ? ' · ce soir' : '') + '</span>' +
        '<span class="etape-ville">' + esc(t.ville) + '</span>' +
        '<span>' + esc(t.lieu) + ' · ' + D.heureDebut + 'h → ' + D.heureFin + 'h</span></li>';
    }).join('');
    var jours = etapes.map(function (t) { return t.jour; });
    var repos = [1, 2, 3, 4, 5, 6, 0].filter(function (j) { return jours.indexOf(j) < 0; }).map(function (j) { return JOURS[j].toLowerCase(); });
    var r = $('#jours-repos');
    if (r && repos.length) {
      var txt = repos.length > 1 ? repos.slice(0, -1).join(', ') + ' et ' + repos[repos.length - 1] : repos[0];
      r.textContent = txt.charAt(0).toUpperCase() + txt.slice(1) + ' : repos. Les congés sont affichés ici avant qu’on parte.';
    }
  }

  function rendreBande(D) {
    var el = $('#bande');
    if (!el) return;
    var villes = (D.tournee || []).map(function (t) { return esc(t.ville); });
    var morceau = villes.join(' ✶ ') + ' ✶ ';
    var ligne = '';
    for (var i = 0; i < 4; i++) ligne += morceau;
    el.innerHTML = '<span class="bande-defile">' + ligne + ligne + '</span>';
  }

  function rendreTicket(D) {
    var el = $('#ticket');
    if (!el) return;
    var choix = D.carte.filter(function (p) { return p.accueil; });
    if (!choix.length) choix = D.carte.slice(0, 6);
    var html = '';
    ['tomate', 'creme'].forEach(function (b) {
      var l = choix.filter(function (p) { return p.base === b; });
      if (!l.length) return;
      html += '<div class="ticket-ligne ticket-entete"><span>Base ' + (b === 'creme' ? 'crème' : 'tomate') + '</span><span>26 cm</span><span>29 cm</span></div>';
      html += l.map(function (p) {
        return '<details class="ticket-pizza"><summary class="ticket-ligne"><span><span class="ticket-plus" aria-hidden="true">+</span>' + esc(p.nom) + '</span><span>' + prix(p.prix26) + '</span><span>' + prix(p.prix29) + '</span></summary>' +
          '<p class="ticket-ingredients">' + esc(p.ingredients) + '</p></details>';
      }).join('');
    });
    el.innerHTML = html;
    var n = $('#nb-pizzas');
    if (n) n.textContent = D.carte.length;
  }

  function rendrePolaroids(D) {
    var el = $('#polaroids');
    if (!el) return;
    el.innerHTML = (D.photosAccueil || []).slice(0, 3).map(function (p) {
      return '<figure class="polaroid"><img src="' + esc(p.photo) + '" alt="' + esc(p.legende) + '" loading="lazy" width="600" height="600"><figcaption>' + esc(p.legende) + '</figcaption></figure>';
    }).join('');
  }

  function rendreFamille(D) {
    var nom = $('#nom-chienne');
    if (nom) nom.textContent = D.nomChienne || 'La vraie patronne';
    var num = $('#badge-numero');
    if (num) num.textContent = D.nomChienne ? 'Badge n°001 · La vraie patronne' : 'Badge n°001 · Sécurité cabine';
    var sh = $('#photo-shirley');
    if (sh && D.photoShirley) {
      sh.src = D.photoShirley; sh.hidden = false;
      var ini = $('#initiale-shirley'); if (ini) ini.hidden = true;
    }
    var bulle = $('#bulle');
    if (bulle) bulle.textContent = D.nomMascotte ? 'Salut, moi c’est ' + D.nomMascotte + '. Je goûte tout avant toi.' : 'Salut ! Moi, je goûte tout avant toi.';
    var cam = $('#photo-camion');
    if (cam && D.photoCamion) { cam.src = D.photoCamion; cam.hidden = false; }
  }

  function rendreAvis(D) {
    var el = $('#avis-liste');
    if (el) {
      el.innerHTML = (D.avis || []).map(function (a) {
        var n = Math.max(0, Math.min(5, Number(a.note) || 5));
        return '<figure class="avis-carte"><span class="etoiles" aria-label="' + n + ' sur 5">' + '★★★★★'.slice(0, n) + '</span>' +
          '<blockquote>' + esc(a.texte) + '</blockquote><figcaption>' + esc(a.auteur) + '</figcaption></figure>';
      }).join('');
      el.hidden = !(D.avis || []).length;
    }
    document.querySelectorAll('[data-lien-avis]').forEach(function (a) {
      if (D.lienAvisGoogle) { a.href = D.lienAvisGoogle; a.hidden = false; } else a.hidden = true;
    });
    var bloc = $('#avis-bloc');
    if (bloc) bloc.hidden = !(D.avis || []).length && !D.lienAvisGoogle;
  }

  function rendreCarte(D) {
    var el = $('#carte-complete');
    if (!el) return;
    var filtre = el.getAttribute('data-filtre-actif') || 'toutes';
    function carteHTML(p) {
      return '<article class="pizza">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="Pizza ' + esc(p.nom) + '" loading="lazy" width="800" height="600">' : '') +
        '<div class="pizza-corps"><h3>' + esc(p.nom) + '</h3><p class="pizza-ingredients">' + esc(p.ingredients) + '</p>' +
        '<div class="pizza-prix"><span>26 cm <b>' + prix(p.prix26) + '</b></span><span>29 cm <b>' + prix(p.prix29) + '</b></span></div></div></article>';
    }
    function dessiner() {
      var html = '';
      [['tomate', 'Base tomate'], ['creme', 'Base crème']].forEach(function (g) {
        if (filtre !== 'toutes' && filtre !== g[0]) return;
        var l = D.carte.filter(function (p) { return p.base === g[0]; });
        if (!l.length) return;
        html += '<h2 class="groupe-titre">' + g[1] + ' <small>' + l.length + ' pizzas</small></h2><div class="pizzas">' + l.map(carteHTML).join('') + '</div>';
      });
      el.innerHTML = html;
    }
    if (!el.hasAttribute('data-filtre-actif')) {
      document.querySelectorAll('.filtre').forEach(function (b) {
        b.addEventListener('click', function () {
          el.setAttribute('data-filtre-actif', b.getAttribute('data-filtre'));
          document.querySelectorAll('.filtre').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          rendreCarte(window.FRINGALE);
        });
      });
      el.setAttribute('data-filtre-actif', filtre);
    }
    dessiner();

    var m = $('#pizza-moment'), pm = D.pizzaDuMoment || {};
    if (m && pm.nom) {
      m.innerHTML = (pm.photo ? '<img src="' + esc(pm.photo) + '" alt="Pizza ' + esc(pm.nom) + '">' : '') +
        '<div class="moment-texte"><span class="moment-etiquette">La pizza du moment</span><h2>' + esc(pm.nom) + '</h2>' +
        (pm.ingredients ? '<p>' + esc(pm.ingredients) + '</p>' : '') +
        (pm.prix26 || pm.prix29 ? '<div class="pizza-prix" style="margin-top:10px"><span>26 cm <b>' + prix(pm.prix26) + '</b></span><span>29 cm <b>' + prix(pm.prix29) + '</b></span></div>' : '') + '</div>';
    }
  }

  /* ---------- Fenêtre avec le numéro de téléphone ---------- */
  var popupBranchee = false;
  function brancherPopupTel(D) {
    var dlg = $('#popup-tel');
    if (popupBranchee || !dlg || typeof dlg.showModal !== 'function') return;
    popupBranchee = true;
    document.querySelectorAll('[data-tel]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        dlg.showModal();
      });
    });
    dlg.querySelector('[data-fermer]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    var copier = dlg.querySelector('[data-copier]');
    copier.addEventListener('click', function () {
      var ok = function () { copier.textContent = 'Numéro copié !'; setTimeout(function () { copier.textContent = 'Copier le numéro'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(window.FRINGALE.telephone).then(ok, function () {});
    });
  }

  function rendreCommun(D) {
    var a = $('#annonce');
    if (a) { a.textContent = D.annonce || ''; a.hidden = !D.annonce; }
    document.querySelectorAll('[data-tel], [data-tel-direct]').forEach(function (el) {
      el.href = telHref(D.telephone);
      if (el.hasAttribute('data-tel-texte')) el.textContent = D.telephone;
    });
    var num = document.querySelector('.popup-numero');
    if (num) num.textContent = D.telephone;
    brancherPopupTel(D);
    document.querySelectorAll('[data-reseau]').forEach(function (el) {
      var url = D[el.getAttribute('data-reseau')];
      if (url) { el.href = url; el.hidden = false; } else el.hidden = true;
    });
    var an = $('#annee');
    if (an) an.textContent = new Date().getFullYear();
  }

  function tout(D) {
    var maintenant = new Date();
    var s = statut(D, maintenant);
    rendreCommun(D);
    rendreCeSoir(D, s);
    rendreTournee(D, s, maintenant);
    rendreBande(D);
    rendreTicket(D);
    rendrePolaroids(D);
    rendreFamille(D);
    rendreAvis(D);
    rendreCarte(D);
  }

  var D = window.FRINGALE;
  tout(D);                               // affichage immédiat avec donnees.js
  if (D.googleSheetId) chargerSheet(D).then(tout);  // puis mise à jour depuis Google Sheets
})();
