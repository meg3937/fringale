# La Fringale — site web

Site du camion à pizzas de Shirley et David (depuis 2005).
Site statique : du HTML, du CSS et un peu de JavaScript, sans outil de construction.
Publié avec GitHub Pages : https://meg3937.github.io/fringale/

## Les fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : où est le camion ce soir, tournée, extrait de la carte, famille, actus Facebook, avis |
| `carte.html` | La carte complète, avec filtres base tomate / base crème |
| `galerie.html` | Galerie photo avec visionneuse |
| `mentions-legales.html` | Mentions légales (remplies depuis `contenu/legal.json`) |
| `admin.html` | Page d'accès à l'espace d'édition pour Shirley et David (non référencée) |
| `contenu/*.json` | **Tout le contenu modifiable** : carte, tournée, congés, infos, galerie, avis, mentions légales |
| `.pages.yml` | Configuration de l'espace d'édition (Pages CMS) |
| `assets/donnees.js` | Réglages techniques : liens et clé Google, valeurs de secours |
| `assets/app.js` | Affichage du contenu (pas besoin d'y toucher) |
| `assets/style.css` | Le style |
| `assets/polices/` | Polices hébergées sur le site (Anton, Archivo, Space Mono, licence OFL) |
| `images/` | Mascotte, Pops, photos de pizzas (`images/pizzas/`) et de la galerie (`images/galerie/`) |

## Modifier le contenu : l'espace d'édition

Shirley et David modifient le site depuis **Pages CMS** (https://app.pagescms.org), un outil
gratuit qui affiche des formulaires à la place du code. Le lien est sur la page `admin.html`
(« Espace d'édition » en bas de chaque page).

Menus disponibles : **Infos et annonce** (annonce, pizza du moment, téléphone, horaires, photos
de l'accueil, photo de Shirley, Facebook…), **Congés**, **La tournée**, **La carte**, **Galerie**,
**Avis clients**, **Mentions légales**. Chaque enregistrement crée un commit sur GitHub, et le
site se met à jour tout seul en une à deux minutes.

### Mise en place (une seule fois)

1. Aller sur https://app.pagescms.org et se connecter avec le compte GitHub propriétaire du dépôt.
2. Installer l'application Pages CMS sur le dépôt `fringale` quand elle le demande.
3. Ouvrir le projet `fringale` : les menus de `.pages.yml` apparaissent. Si le site est publié
   depuis une autre branche que `main`, choisir cette branche dans Pages CMS.
4. Donner l'accès à Shirley et David : depuis Pages CMS (paramètres du projet → collaborateurs,
   invitation par e-mail) ou en les ajoutant comme collaborateurs du dépôt sur GitHub.

### À la main

On peut aussi modifier directement les fichiers `contenu/*.json`. Les dates sont au format
`AAAA-MM-JJ`, les jours de la tournée en toutes lettres (`Mardi`), la base `tomate` ou `creme`.

Le bloc « Ce soir, on t'attend à… » se calcule tout seul selon le jour, l'heure et les congés.

## Actus Facebook

Dès que l'adresse de la page Facebook est renseignée (menu **Infos et annonce**), la partie
« Les actus du camion » apparaît sur l'accueil. Les publications ne sont chargées qu'après un clic
du visiteur (Facebook dépose des cookies : on ne les charge pas sans son accord).

## Avis Google

- « Lire tous les avis » (fiche Google Maps) et « Laisse ton avis » (lien du QR code) sont branchés
  dans `assets/donnees.js`.
- La note et le nombre d'avis s'affichent en direct grâce à Places API (New), avec une clé
  restreinte au site (`googleMapsCle`) et l'identifiant de la fiche (`googlePlaceId`).
- Google ne fournit pas le texte des avis de cette fiche : les avis affichés sont ceux saisis dans
  le menu **Avis clients**.
- Le projet Google Cloud est en essai gratuit. À la fin de l'essai, la note disparaît simplement du
  site si le compte n'est pas passé en compte complet (les liens restent).

## Voir le site en local

```sh
python3 -m http.server 8080
```
puis ouvrir http://localhost:8080 (le contenu est chargé depuis `contenu/`, il faut donc passer
par un petit serveur et non ouvrir le fichier directement).
