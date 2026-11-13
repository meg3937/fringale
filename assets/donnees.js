/* =====================================================================
   LA FRINGALE — TOUT LE CONTENU DU SITE EST ICI
   ---------------------------------------------------------------------
   Pour modifier le site, il suffit de changer le texte entre les
   guillemets '...'. Ne pas toucher aux virgules ni aux accolades.

   Astuce : si un Google Sheets est branché (voir "googleSheetId"),
   la carte, la tournée, les congés et les infos viennent de lui,
   et ce fichier sert seulement de secours.
   ===================================================================== */

window.FRINGALE = {

  /* ---------- Infos générales ---------- */
  telephone: '06 09 62 64 93',
  heureDebut: 17,          // ouverture (en heures)
  heureFin: 21,            // fermeture (en heures)

  // Laisser vide '' tant qu'on n'a pas l'info : le site s'adapte.
  nomMascotte: '',         // ex : 'Fringant'
  nomChienne: 'Pops',
  photoShirley: '',        // ex : 'images/shirley.jpg' (la section « Derrière le camion » s'affiche alors)
  roleShirley: '',         // petite phrase sous son nom (sinon « Aux commandes depuis 2005 »)
  roleDavid: '',
  lienAvisGoogle: 'https://g.page/r/CeDiKRJtvVrCEAE/review',     // « laisse ton avis » (lien du QR code)
  lienLireAvis: 'https://maps.google.com/?cid=14004714267415798496', // la fiche Google Maps
  facebook: '',
  instagram: '',
  photoCamion: '',         // ex : 'images/camion.jpg'

  // Message affiché tout en haut du site (laisser vide pour ne rien afficher)
  annonce: '',

  /* ---------- Congés ----------
     Format des dates : 'AAAA-MM-JJ'. Exemple :
     { du: '2026-12-24', au: '2027-01-05', message: 'On recharge les batteries, à l’année prochaine !' },
  */
  conges: [
  ],

  /* ---------- La tournée ----------
     jour : 0 = dimanche, 1 = lundi, 2 = mardi, 3 = mercredi,
            4 = jeudi, 5 = vendredi, 6 = samedi
  */
  tournee: [
    { jour: 2, ville: 'Ruminghem', lieu: 'Place de la mairie' },
    { jour: 3, ville: 'Coquelles', lieu: 'Place de la poste' },
    { jour: 5, ville: 'Ardres',    lieu: 'Place du marché' },
    { jour: 6, ville: 'Marquise',  lieu: 'Place du Franc Marché' }
  ],

  /* ---------- La pizza du moment ----------
     Laisser nom vide '' s'il n'y en a pas en ce moment.
  */
  pizzaDuMoment: { nom: '', ingredients: '', prix26: '', prix29: '', photo: '' },

  /* ---------- La carte ----------
     base    : 'tomate' ou 'creme'
     accueil : true = affichée dans l'extrait de la page d'accueil
     photo   : chemin de la photo, ex 'images/pizzas/reine.jpg' ('' si pas de photo)
  */
  carte: [
    { nom: 'Marguerite',  base: 'tomate', ingredients: 'Fromage à pizza', prix26: 8, prix29: 9, accueil: true, photo: '' },
    { nom: 'Reine',       base: 'tomate', ingredients: 'Fromage à pizza, jambon, champignons', prix26: 9, prix29: 11, accueil: true, photo: '' },
    { nom: 'Orientale',   base: 'tomate', ingredients: 'Fromage à pizza, chorizo, champignons', prix26: 9, prix29: 11, photo: '' },
    { nom: 'Provençale',  base: 'tomate', ingredients: 'Fromage à pizza, oignons, poivrons, tomates, ail, basilic', prix26: 9, prix29: 11, photo: '' },
    { nom: '4 Saisons',   base: 'tomate', ingredients: 'Fromage à pizza, thon, poivrons, oignons', prix26: 10, prix29: 12, accueil: true, photo: '' },
    { nom: 'Croissant',   base: 'tomate', ingredients: 'Calzone : fromage à pizza, jambon, œuf', prix26: 10, prix29: 12, photo: '' },
    { nom: 'Bolognaise',  base: 'tomate', ingredients: 'Fromage à pizza, viande de bœuf hachée, ketchup', prix26: 11, prix29: 13, photo: 'images/pizzas/bolognaise.jpg' },
    { nom: 'Paysanne',    base: 'tomate', ingredients: 'Fromage à pizza, champignons, lardons, poivrons, oignons, chèvre', prix26: 11, prix29: 13, accueil: true, photo: 'images/pizzas/paysanne.jpg' },
    { nom: 'Spéciale',    base: 'tomate', ingredients: 'Fromage à pizza, jambon, chorizo, merguez, champignons', prix26: 11, prix29: 13, photo: 'images/pizzas/speciale.jpg' },
    { nom: 'Campagnole',  base: 'tomate', ingredients: 'Fromage à pizza, jambon, poulet, oignons, beurre persillé', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Raclette',    base: 'tomate', ingredients: 'Fromage à pizza, lardons, oignons, raclette, bacon', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Carnivore',   base: 'tomate', ingredients: 'Fromage à pizza, champignons, jambon, viande hachée, lardons', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Texane',      base: 'tomate', ingredients: 'Champignons, viande hachée, piment, chorizo, poivrons, oignons', prix26: 11, prix29: 13, photo: 'images/pizzas/texane.jpg' },
    { nom: 'Catalane',    base: 'tomate', ingredients: 'Fromage à pizza, chorizo, merguez, poivrons, oignons, ail, basilic', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Miel',        base: 'tomate', ingredients: 'Fromage à pizza, chèvre, oignons, miel', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Exotique',    base: 'tomate', ingredients: 'Fromage à pizza, poulet, chorizo, ananas, oignons', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Burger',      base: 'tomate', ingredients: 'Viande hachée, sauce burger, cheddar, oignons, cornichons, tomates', prix26: 11, prix29: 13, accueil: true, photo: 'images/pizzas/burger.jpg' },

    { nom: '4 Fromages',  base: 'creme', ingredients: 'Mélange mozzarella-emmental, reblochon, chèvre, maroilles', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Curry',       base: 'creme', ingredients: 'Fromage à pizza, curry, chorizo, poulet, oignons, poivrons', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Savoyarde',   base: 'creme', ingredients: 'Fromage à pizza, pommes de terre, lardons, oignons, reblochon', prix26: 11, prix29: 13, accueil: true, photo: 'images/pizzas/savoyarde.jpg' },
    { nom: 'Calanque',    base: 'creme', ingredients: 'Fromage à pizza, jambon, reblochon', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Morteau',     base: 'creme', ingredients: 'Fromage à pizza, saucisse de Morteau, lardons, oignons', prix26: 11, prix29: 13, photo: 'images/pizzas/morteau.jpg' },
    { nom: 'Kebab',       base: 'creme', ingredients: 'Fromage à pizza, kebab, oignons', prix26: 11, prix29: 13, photo: '' },
    { nom: 'Normande',    base: 'creme', ingredients: 'Fromage à pizza, lardons, poulet, oignons, camembert', prix26: 11, prix29: 13, photo: 'images/pizzas/normande.jpg' },
    { nom: 'Nordique',    base: 'creme', ingredients: 'Fromage à pizza, saumon fumé, ail, basilic', prix26: 12, prix29: 14, accueil: true, photo: '' }
  ],

  /* ---------- Photos de la page d'accueil (3 photos) ---------- */
  photosAccueil: [
    { photo: 'images/pizzas/paysanne.jpg', legende: 'La Paysanne' },
    { photo: 'images/pizzas/speciale.jpg', legende: 'La Spéciale' },
    { photo: 'images/pizzas/burger.jpg',   legende: 'La Burger · cheddar, cornichons, tomates' }
  ],

  /* ---------- Avis Google en direct ----------
     Avec une clé Google Maps (restreinte au site) et l'identifiant de la fiche,
     les 5 avis mis en avant par Google et la note s'affichent tout seuls.
     Voir le README, partie « Avis Google ».
  */
  googleMapsCle: '',
  googlePlaceId: '',

  /* ---------- Avis choisis à la main (utilisés si les avis en direct ne sont pas branchés) ----------
     Copier ici de vrais avis de la fiche Google. Exemple :
     { auteur: 'Prénom N.', texte: 'Le texte de l’avis…', note: 5 },
  */
  avis: [
  ],

  /* ---------- Google Sheets (optionnel) ----------
     Mettre ici l'identifiant du Google Sheets (la partie entre /d/ et /edit
     dans son adresse). Le fichier doit être partagé "Tous les utilisateurs
     disposant du lien : lecteur". Voir le README pour les onglets attendus.
  */
  googleSheetId: ''
};
