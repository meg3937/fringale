/* =====================================================================
   LA FRINGALE — RÉGLAGES TECHNIQUES
   ---------------------------------------------------------------------
   Le contenu du site (carte, prix, tournée, congés, annonce, galerie, avis…)
   se trouve dans le dossier contenu/ et se modifie depuis l'espace d'édition
   (voir la page admin.html et le README).

   Ce fichier ne contient que des réglages techniques et des valeurs de secours.
   ===================================================================== */

window.FRINGALE = {
  /* Valeurs de secours si le contenu ne se charge pas */
  telephone: '06 09 62 64 93',
  heureDebut: 17,
  heureFin: 21,
  carte: [],
  tournee: [],
  conges: [],
  galerie: [],
  avis: [],

  /* Liens Google (fiche La Fringale, Ardres) */
  lienAvisGoogle: 'https://g.page/r/CeDiKRJtvVrCEAE/review',          // « laisse ton avis » (lien du QR code)
  lienLireAvis: 'https://maps.google.com/?cid=14004714267415798496',   // la fiche Google Maps

  /* Note Google en direct : clé restreinte au site + identifiant de la fiche */
  googleMapsCle: 'AIzaSyCWF0kDC17I59opaHeMh78tTzpLjpzsiY8',
  googlePlaceId: 'ChIJJc9wwvxF3EcR4OIpEm29WsI'
};
