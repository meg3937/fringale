# La Fringale — site web

Site du camion à pizzas de Shirley et David (depuis 2005).
Site statique : du HTML, du CSS et un peu de JavaScript, sans outil de construction.
Il suffit de l'héberger tel quel (GitHub Pages, Netlify, Cloudflare Pages…).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil : où est le camion ce soir, tournée, extrait de la carte, histoire, avis |
| `carte.html` | La carte complète, avec filtres base tomate / base crème |
| `assets/donnees.js` | **Tout le contenu modifiable** : carte, prix, tournée, congés, annonce, avis… |
| `assets/app.js` | Affichage du contenu (pas besoin d'y toucher) |
| `assets/style.css` | Le style |
| `images/` | Mascotte, chienne, photos de pizzas (`images/pizzas/`) |

## Modifier le contenu

Tout se passe dans `assets/donnees.js`, qui est commenté en français :

- **Congés** : ajouter une ligne dans `conges`, par exemple
  `{ du: '2026-12-24', au: '2027-01-05', message: 'On recharge les batteries !' },`
  Le site affiche alors « En congés jusqu'au 5 janvier » et la date de retour.
- **Annonce** en haut du site : remplir `annonce: '…'` (laisser `''` pour l'enlever).
- **Pizza du moment** : remplir `pizzaDuMoment`.
- **Prix ou nouvelle pizza** : modifier la liste `carte`.
- **Photo d'une pizza** : déposer la photo dans `images/pizzas/` (par exemple `reine.jpg`)
  et indiquer `photo: 'images/pizzas/reine.jpg'` sur la bonne ligne.
- **Avis Google** : copier de vrais avis dans `avis`, et le lien de la fiche dans `lienAvisGoogle`.

Le bloc « Ce soir, on t'attend à… » se calcule tout seul selon le jour, l'heure et les congés.

## Option : modifier depuis un Google Sheets

Pour que Shirley et David puissent tout modifier depuis leur téléphone sans toucher au code :

1. Créer un Google Sheets avec ces onglets (la 1re ligne contient les titres des colonnes) :
   - **Carte** : `Nom` · `Base` (tomate / crème) · `Ingrédients` · `Prix 26` · `Prix 29` · `Accueil` (oui / vide) · `Photo`
   - **Tournée** : `Jour` (mardi…) · `Ville` · `Lieu`
   - **Congés** : `Du` · `Au` (format 24/12/2026) · `Message`
   - **Infos** : `Clé` · `Valeur`. Clés reconnues : `Annonce`, `Pizza du moment`,
     `Pizza du moment - Ingrédients`, `Pizza du moment - Prix 26`, `Pizza du moment - Prix 29`,
     `Nom de la chienne`, `Nom de la mascotte`, `Lien avis Google`, `Facebook`, `Instagram`
2. Partager le fichier : « Tous les utilisateurs disposant du lien » → **Lecteur**.
3. Copier l'identifiant du fichier (la partie entre `/d/` et `/edit` dans l'adresse)
   dans `googleSheetId` de `assets/donnees.js`.

Le site affiche d'abord le contenu de `donnees.js`, puis le remplace par celui du Google Sheets.
Si un onglet manque, c'est `donnees.js` qui reste utilisé.

## Avis Google

Les liens « Lire tous les avis » (fiche Google Maps) et « Laisse ton avis » (lien du QR code)
sont déjà branchés dans `assets/donnees.js`.

Pour afficher **les avis et la note en direct** sur le site :

1. Sur https://console.cloud.google.com, créer un projet « La Fringale » et y associer un compte
   de facturation (Google offre un quota gratuit chaque mois ; voir l'étape 5 pour ne jamais payer).
2. Menu **API et services → Bibliothèque** : activer **Maps JavaScript API** et **Places API (New)**.
3. **API et services → Identifiants → Créer des identifiants → Clé API**.
4. Restreindre la clé :
   - *Restrictions relatives aux applications* : **Sites Web**, ajouter `https://meg3937.github.io/*`
     (et le futur nom de domaine).
   - *Restrictions relatives aux API* : cocher seulement les deux API ci-dessus.
5. **API et services → Places API (New) → Quotas** : plafonner les requêtes par jour
   (par exemple 100) pour rester dans le gratuit.
6. Trouver l'identifiant de la fiche (« Place ID ») avec l'outil
   https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
   en cherchant « La Fringale ».
7. Renseigner `googleMapsCle` et `googlePlaceId` dans `assets/donnees.js`.

La clé sera visible dans le code du site : c'est normal pour ce type de clé, la restriction
de l'étape 4 empêche qu'elle serve ailleurs. Google renvoie au maximum 5 avis (ceux qu'il juge
les plus pertinents). Si le chargement échoue, le site affiche les avis copiés à la main dans `avis`.

## Voir le site en local

```sh
python3 -m http.server 8080
```
puis ouvrir http://localhost:8080
