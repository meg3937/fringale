/* La Fringale — affichage du contenu.
   Le contenu vient du dossier contenu/ (fichiers modifiés depuis l'espace d'édition),
   les réglages techniques de assets/donnees.js. */
(function () {
  'use strict';

  var JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function $(sel) { return document.querySelector(sel); }
  var animOK = !!(window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window);
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

  /* ---------- Chargement du contenu (dossier contenu/) ---------- */
  var FICHIERS = ['infos', 'conges', 'tournee', 'carte', 'galerie', 'avis', 'legal'];
  function lireJSON(nom) {
    return fetch('contenu/' + nom + '.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }
  function nombre(v) {
    if (v === '' || v == null) return '';
    var n = Number(String(v).replace(',', '.'));
    return isNaN(n) ? '' : n;
  }
  function chemin(p) { return String(p || '').replace(/^\/+/, ''); } // les images sont relatives au site
  function chargerContenu(D) {
    if (!window.fetch) return Promise.resolve(D);
    return Promise.all(FICHIERS.map(lireJSON)).then(function (r) {
      var infos = r[0] || {};
      Object.keys(infos).forEach(function (k) { if (infos[k] != null) D[k] = infos[k]; });
      D.heureDebut = Number(D.heureDebut) || 17;
      D.heureFin = Number(D.heureFin) || 21;
      ['photoShirley', 'photoCamion'].forEach(function (k) { D[k] = chemin(D[k]); });
      if (D.pizzaDuMoment) D.pizzaDuMoment.photo = chemin(D.pizzaDuMoment.photo);
      D.photosAccueil = (D.photosAccueil || []).filter(function (p) { return p && p.photo; }).map(function (p) { return { photo: chemin(p.photo), legende: p.legende || '' }; });
      if (r[1].conges) D.conges = r[1].conges.filter(function (c) { return c && c.du && c.au; });
      if (r[2].tournee) D.tournee = r[2].tournee.map(function (t) {
        var j = typeof t.jour === 'number' ? t.jour : JOURS.map(sansAccent).indexOf(sansAccent(t.jour || ''));
        return { jour: j, ville: t.ville || '', lieu: t.lieu || '' };
      }).filter(function (t) { return t.jour >= 0 && t.ville; });
      if (r[3].pizzas) D.carte = r[3].pizzas.filter(function (p) { return p && p.nom; }).map(function (p) {
        return { nom: p.nom, base: /creme/.test(sansAccent(p.base || '')) ? 'creme' : 'tomate', ingredients: p.ingredients || '',
          prix26: nombre(p.prix26), prix29: nombre(p.prix29), accueil: !!p.accueil, photo: chemin(p.photo) };
      });
      if (r[4].photos) D.galerie = r[4].photos.filter(function (p) { return p && p.photo; }).map(function (p) { return { photo: chemin(p.photo), legende: p.legende || '' }; });
      if (r[5].avis) D.avis = r[5].avis.filter(function (a) { return a && a.texte; });
      D.legal = r[6] || {};
      return D;
    });
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
    D.carte = D.carte || [];
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
    var sh = $('#photo-shirley'), eq = $('#equipe');
    if (sh && eq && D.photoShirley) { sh.src = D.photoShirley; eq.hidden = false; }
    if (D.roleShirley && $('#role-shirley')) $('#role-shirley').textContent = D.roleShirley;
    if (D.roleDavid && $('#role-david')) $('#role-david').textContent = D.roleDavid;
    var bulle = $('#bulle');
    if (bulle) bulle.textContent = D.nomMascotte ? 'Salut, moi c’est ' + D.nomMascotte + '. Je goûte tout avant toi.' : 'Salut ! Moi, je goûte tout avant toi.';
    var cam = $('#photo-camion');
    if (cam && D.photoCamion) { cam.src = D.photoCamion; cam.hidden = false; }
  }

  function etoiles(n) {
    n = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    return '<span class="etoiles" aria-label="' + n + ' sur 5">' + '★★★★★'.slice(0, n) + '<span class="etoiles-vides">' + '★★★★★'.slice(n) + '</span></span>';
  }
  function prenomInitiale(nom) {
    var mots = String(nom || '').trim().split(/\s+/).filter(Boolean);
    if (mots.length < 2) return mots[0] || '';
    return mots[0] + ' ' + mots[mots.length - 1].charAt(0).toUpperCase() + '.';
  }
  function carteAvis(a) {
    var auteur = a.lien ? '<a href="' + esc(a.lien) + '" target="_blank" rel="noopener">' + esc(a.auteur) + '</a>' : esc(a.auteur);
    return '<figure class="avis-carte">' + etoiles(a.note) +
      '<blockquote>' + esc(a.texte) + '</blockquote>' +
      '<figcaption>' + (a.photo ? '<img src="' + esc(a.photo) + '" alt="" width="32" height="32" loading="lazy" referrerpolicy="no-referrer">' : '') +
      '<span>' + auteur + (a.quand ? '<small>' + esc(a.quand) + '</small>' : '') + '</span></figcaption></figure>';
  }
  function afficherAvis(D, liste, resume) {
    var el = $('#avis-liste');
    if (el) {
      var cartes = liste.map(carteAvis).join('');
      // Défilement continu : la liste est doublée pour boucler sans à-coup (le double est masqué aux lecteurs d'écran)
      var defile = liste.length >= 3 && animOK;
      el.classList.toggle('avis-defile', defile);
      el.innerHTML = defile
        ? '<div class="avis-piste" style="--duree:' + (liste.length * 9) + 's">' + cartes + '<div class="avis-double" aria-hidden="true">' + cartes + '</div></div>'
        : cartes;
      el.hidden = !liste.length;
    }
    var r = $('#avis-resume');
    if (r) {
      if (resume && resume.note) {
        r.innerHTML = '<strong>' + String(resume.note.toFixed(1)).replace('.', ',') + '</strong>' + etoiles(resume.note) +
          '<span>' + (resume.nombre ? resume.nombre + ' avis sur Google' : 'sur Google') + '</span>';
        r.hidden = false;
      } else r.hidden = true;
    }
    var src = $('#avis-source'); if (src) src.hidden = !resume;
    var bloc = $('#avis-bloc');
    if (bloc) bloc.hidden = !liste.length && !D.lienAvisGoogle && !D.lienLireAvis;
    animer();
  }

  function rendreAvis(D) {
    document.querySelectorAll('[data-lien-avis]').forEach(function (a) {
      if (D.lienAvisGoogle) { a.href = D.lienAvisGoogle; a.hidden = false; } else a.hidden = true;
    });
    document.querySelectorAll('[data-lien-lire]').forEach(function (a) {
      if (D.lienLireAvis) { a.href = D.lienLireAvis; a.hidden = false; } else a.hidden = true;
    });
    afficherAvis(D, (D.avis || []).map(function (a) { return { auteur: prenomInitiale(a.auteur), texte: a.texte, note: a.note || 5 }; }), null);
  }

  /* ---------- Avis Google en direct (note, nombre d'avis et avis si Google les fournit) ---------- */
  var avisGoogleCharges = false;
  function chargerAvisGoogle(D) {
    if (avisGoogleCharges || !D.googleMapsCle || !D.googlePlaceId || !$('#avis-bloc') || !window.fetch) return;
    avisGoogleCharges = true;
    fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(D.googlePlaceId) + '?languageCode=fr', {
      headers: { 'X-Goog-Api-Key': D.googleMapsCle, 'X-Goog-FieldMask': D.googleAvisTextes ? 'rating,userRatingCount,reviews' : 'rating,userRatingCount' }
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (p) {
      var google = (p.reviews || []).filter(function (r) { return r.text && r.text.text; }).map(function (r) {
        var aut = r.authorAttribution || {};
        return { auteur: aut.displayName || 'Client Google', lien: aut.uri, photo: aut.photoUri, note: r.rating, texte: r.text.text, quand: r.relativePublishTimeDescription };
      });
      var manuels = (D.avis || []).map(function (a) { return { auteur: prenomInitiale(a.auteur), texte: a.texte, note: a.note || 5 }; });
      afficherAvis(D, google.length ? google : manuels, p.rating ? { note: p.rating, nombre: p.userRatingCount } : null);
    }).catch(function () { /* en cas d'échec, on garde les avis de donnees.js */ });
  }

  function rendreCarte(D) {
    var el = $('#carte-complete');
    if (!el) return;
    var filtre = el.getAttribute('data-filtre-actif') || 'toutes';
    function carteHTML(p) {
      return '<article class="pizza">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="Pizza ' + esc(p.nom) + '" loading="lazy" width="800" height="600">'
        : '<div class="pizza-tuile pizza-tuile-' + (p.base === 'creme' ? 'creme' : 'tomate') + '" aria-hidden="true"><span style="--n:' + Math.max(5, String(p.nom).length) + '">' + esc(p.nom) + '</span></div>') +
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
          animer();
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

  /* ---------- Galerie + visionneuse ---------- */
  function rendreGalerie(D) {
    var el = $('#galerie');
    if (!el) return;
    var photos = D.galerie || [];
    el.innerHTML = photos.map(function (p, i) {
      return '<figure class="galerie-item"><button type="button" class="galerie-bouton" data-index="' + i + '" aria-label="Agrandir' + (p.legende ? ' : ' + esc(p.legende) : ' la photo') + '">' +
        '<img src="' + esc(p.photo) + '" alt="' + esc(p.legende) + '" loading="lazy"></button>' +
        (p.legende ? '<figcaption>' + esc(p.legende) + '</figcaption>' : '') + '</figure>';
    }).join('');
    var dlg = $('#visionneuse');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    var img = dlg.querySelector('img'), leg = dlg.querySelector('figcaption'), courant = 0;
    function montrer(i) {
      courant = (i + photos.length) % photos.length;
      img.src = photos[courant].photo; img.alt = photos[courant].legende || '';
      leg.textContent = photos[courant].legende || ''; leg.hidden = !photos[courant].legende;
    }
    el.querySelectorAll('.galerie-bouton').forEach(function (b) {
      b.addEventListener('click', function () { montrer(+b.getAttribute('data-index')); dlg.showModal(); });
    });
    if (dlg.hasAttribute('data-branchee')) return;
    dlg.setAttribute('data-branchee', '');
    dlg.querySelector('[data-precedente]').addEventListener('click', function () { montrer(courant - 1); });
    dlg.querySelector('[data-suivante]').addEventListener('click', function () { montrer(courant + 1); });
    dlg.querySelector('[data-fermer]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') montrer(courant - 1);
      if (e.key === 'ArrowRight') montrer(courant + 1);
    });
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) montrer(courant + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Actus : publications de la page Facebook (chargées seulement après un clic) ---------- */
  function memoire(cle, val) {
    try { if (val === undefined) return localStorage.getItem(cle); localStorage.setItem(cle, val); } catch (e) { return null; }
  }
  function rendreActus(D) {
    var sec = $('#actus');
    if (!sec) return;
    sec.hidden = !D.facebook;
    if (!D.facebook) return;
    sec.querySelectorAll('[data-lien-facebook]').forEach(function (a) { a.href = D.facebook; });
    var zone = $('#actus-fil');
    function charger() {
      var largeur = Math.min(500, zone.clientWidth || 500);
      zone.innerHTML = '<iframe title="Publications Facebook de La Fringale" src="https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(D.facebook) +
        '&tabs=timeline&width=' + largeur + '&height=640&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&locale=fr_FR"' +
        ' width="' + largeur + '" height="640" style="border:0;overflow:hidden;max-width:100%" scrolling="no" allowfullscreen loading="lazy"' +
        ' allow="clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>';
    }
    if (memoire('fringale-facebook') === 'oui') { charger(); return; }
    var b = $('#actus-charger');
    if (b && !b.hasAttribute('data-branche')) {
      b.setAttribute('data-branche', '');
      b.addEventListener('click', function () {
        if ($('#actus-memoriser') && $('#actus-memoriser').checked) memoire('fringale-facebook', 'oui');
        charger();
      });
    }
  }

  /* ---------- Mentions légales ---------- */
  function rendreLegal(D) {
    var L = D.legal || {};
    document.querySelectorAll('[data-legal]').forEach(function (el) {
      var v = L[el.getAttribute('data-legal')];
      el.textContent = v ? v : 'à compléter';
      el.classList.toggle('a-completer', !v);
    });
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

  /* ---------- Effets : apparitions au scroll et profondeur ---------- */
  if (animOK) document.documentElement.classList.add('anim-on');
  var observateur = animOK ? new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); observateur.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  var EFFETS = [
    ['monte', '.titre-section, .chapo, .astuce, .galerie-item, .actus-boite, .etape, .ticket, .famille-texte p, .fiche, .badge, .fidelite, .groupe-titre, .moment, .filtres, .pizza, .info'],
    ['colle', '.polaroid, .patronne .sticker, .mascotte-fidelite']
  ];
  function animer() {
    if (!animOK) return;
    EFFETS.forEach(function (e) {
      document.querySelectorAll(e[1]).forEach(function (el) {
        if (el.hasAttribute('data-anim')) return;
        el.setAttribute('data-anim', e[0]);
        var freres = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.matches(e[1]); });
        el.style.setProperty('--i', Math.max(0, freres.indexOf(el)) % 6);
        observateur.observe(el);
      });
    });
  }

  var PROFONDEUR = [['.heros .mascotte', 0.12], ['.tampon', 0.22], ['.patronne .sticker', 0.1], ['.mascotte-fidelite', 0.16]];
  var elementsProfonds = [];
  function brancherProfondeur() {
    if (!animOK || elementsProfonds.length) return;
    PROFONDEUR.forEach(function (p) {
      document.querySelectorAll(p[0]).forEach(function (el) { el.setAttribute('data-profondeur', ''); elementsProfonds.push({ el: el, f: p[1], base: 0 }); });
    });
    if (!elementsProfonds.length) return;
    function mesurer() {
      elementsProfonds.forEach(function (o) {
        o.el.style.translate = '0 0';
        var r = o.el.getBoundingClientRect();
        o.base = r.top + window.scrollY + r.height / 2;
      });
      maj();
    }
    var enAttente = false;
    function maj() {
      enAttente = false;
      var milieu = window.scrollY + window.innerHeight / 2;
      elementsProfonds.forEach(function (o) {
        var d = Math.max(-70, Math.min(70, (o.base - milieu) * o.f));
        o.el.style.translate = '0 ' + d.toFixed(1) + 'px';
      });
    }
    window.addEventListener('scroll', function () { if (!enAttente) { enAttente = true; requestAnimationFrame(maj); } }, { passive: true });
    window.addEventListener('resize', mesurer);
    window.addEventListener('load', mesurer);
    mesurer();
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
    chargerAvisGoogle(D);
    rendreCarte(D);
    rendreGalerie(D);
    rendreActus(D);
    rendreLegal(D);
    animer();
    brancherProfondeur();
  }

  var D = window.FRINGALE;
  chargerContenu(D).then(tout, function () { tout(D); });
})();
