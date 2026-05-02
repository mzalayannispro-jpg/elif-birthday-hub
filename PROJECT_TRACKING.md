# 🌙 Elif Birthday Hub - Development & Project Tracking

Bienvenue dans le document de suivi ultra-détaillé du projet **Elif Birthday Hub**. Ce fichier retrace l'historique exhaustif des décisions architecturales, des implémentations techniques, des bugs corrigés, et des tâches accomplies depuis le tout début du projet, ainsi que les tâches futures. Ce document est le point central de référence pour l'évolution du code.

---

## 📋 TASK LIST : Historique Complet

### Phase 1 : Fondation & Esthétique 🎨
- `[x]` **Thème Kitsch Turc 70s :** Création du design system dans `style.css` (Tapis persans, Couleurs Or, Rouge Sang, Teal Turc).
- `[x]` **Structure Core :** Mise en place de `index.html` et `app.js` pour gérer le rendu dynamique.
- `[x]` **Asset Manager :** Implémentation d'un script Node.js récursif pour scanner les dossiers d'images et générer `assets_list.js`, permettant aux jeux de charger dynamiquement les stickers personnels au lieu d'images génériques.
- `[x]` **Internationalisation (i18n) :** Mise en place d'un système de langues dynamique (Anglais 🇬🇧 / Turc 🇹🇷) pour toute l'interface.

### Phase 2 : Layer 1 - Les Jeux Classiques 🕹️
- `[x]` **Space Invaders :** Adaptation du classique où les ennemis sont remplacés par des images du dossier `space-invaders`.
- `[x]` **Mahjong Solitaire :** Implémentation du système d'association de tuiles utilisant les images du dossier `mahjong`.
- `[x]` **Sudoku (Punchlines) :** Modification du Sudoku classique pour remplacer les numéros par des clins d'œil et des punchlines personnelles ("inside jokes") afin d'éliminer le texte par défaut (français).
- `[x]` **Tetris :** Empilement de tuiles personnalisées avec logique de destruction de lignes.
- `[x]` **Uzinagaz (Lancer de hache) :** Jeu de timing basé sur le lancer d'objets pour atteindre des cibles mouvantes.

### Phase 3 : Système de Progression & Sauvegarde 💾
- `[x]` **Score Global (`localStorage`) :** Chaque victoire dans un jeu du Layer 1 ajoute 100 points au score global persistant.
- `[x]` **Sauvegarde Multi-Supports (Tablette) :** Création d'un algorithme de chiffrement simple (`ELIF-{score * 7}-XYZ`) permettant de générer un code sur PC et de le rentrer sur tablette via un bouton "Load" pour récupérer la progression.
- `[x]` **La Porte Magique (The Magic Door) :** Bouton conditionnel qui apparaît à 3000 points et devient cliquable à 6000 points.

### Phase 4 : Layer 2 - Jeux 2D Avancés & Cadeaux 🎁
- `[x]` **Super Elif (Platformer) :** Clone de Mario intégrant des "Baklavas" comme power-ups, et changeant dynamiquement le sprite du joueur selon son état (petit, grand, invincible).
- `[x]` **Angry Stickers :** Mécanique de lance-pierre à l'aide de la souris.
- `[x]` **Tower Defense :** Protection de base avec placement d'unités.
- `[x]` **Cadeau 1 (Easter Egg) :** Page vidéo surprise `cnab-surprise.html` débloquée après l'ouverture de la porte à 6000 points.

### Phase 5 : Layer 3 - Expériences 3D 🧊 (En cours)
- `[x]` **Structure d'Unlock :** Porte magique de niveau 3 cliquable à 12000 points.
- `[/]` **Counter Stickers :** Base du moteur 3D web préparée. *(En construction)*
- `[/]` **Cadeau 2 :** Bouton préparé dans l'UI pour la récompense finale des 12000 points.

---

## 🛠️ WALKTHROUGH TECHNIQUE : Problèmes, Correctifs et Décisions

### 1. Problème de Navigation & Coupure de Musique (02/05/2026)
* **Contexte :** Le Hub intègre une playlist Spotify persistante en arrière-plan. Lorsque le joueur cliquait sur "Cadeau 1" (la vidéo surprise), la navigation s'effectuait dans le même onglet.
* **Problème :** Cela rechargeait la page et **coupait la musique Spotify**. De plus, revenir en arrière avec le navigateur réinitialisait visuellement l'état du Hub.
* **Correctif :** 
  - Dans `app.js`, le bouton cadeau utilise désormais `window.open(..., "_blank")` pour ouvrir la surprise dans un nouvel onglet, préservant ainsi l'onglet principal et l'audio.
  - Dans `cnab-surprise.html`, le bouton de retour appelle `window.close()` pour refermer proprement l'onglet surprise et replacer directement l'utilisateur sur le Hub en pleine action.

### 2. Spam des Modales d'Accueil & Bouton "Message" (02/05/2026)
* **Contexte :** À l'ouverture du Hub, un "overlay Kitsch" clignotant s'affiche, suivi d'une modale contenant un long message d'anniversaire personnel.
* **Problème :** Lors des rechargements de page, ces modales s'ouvraient en boucle, ruinant l'expérience.
* **Correctif :**
  - Ajout du `sessionStorage.getItem('visited')`. Si la session est déjà ouverte, l'overlay et la modale reçoivent un `display: none` d'office. L'utilisateur arrive directement sur le dashboard.
  - **Effet Secondaire corrigé :** Comme la modale ne s'ouvrait plus, il était impossible de relire le mot d'amour. Une fonction globale `window.reopenPersonalModal()` a été ajoutée et liée à un nouveau bouton **"💌 Message"** situé dans le header du dashboard, permettant de ré-invoquer la modale à volonté sans recharger.

### 3. Le "Bug du Layer 3" - Apparition fantôme (02/05/2026)
* **Contexte :** Si un joueur entrait un code de 12000 points (`ELIF-84000-XYZ`), il débloquait le Layer 3, et l'information `layer3Unlocked = 'true'` était stockée en local. S'il entrait ensuite un code pour redescendre à 6000 points (`ELIF-42000-XYZ`) pour tester le Layer 2, il voyait **toujours** le Layer 3 affiché.
* **Problème :** La fonction `updateScoreUI()` se chargeait uniquement d'**enlever** la classe `.hidden` lorsque le score montait, mais elle ne ré-appliquait jamais `.hidden` si le score redescendait (ou au rechargement initial avant les calculs). Cela créait des états UI incohérents.
* **Correctif (Comment & Pourquoi) :**
  - Modification de `updateScoreUI()` dans `app.js` pour qu'elle soit *idempotente*.
  - Au tout début de la fonction, les éléments `layer-2-container`, `layer-3-container`, `gifts-container` et `magic-door-container` reçoivent **obligatoirement** la classe `.hidden`.
  - Ensuite, le code évalue le score actuel et ne révèle (`classList.remove('hidden')`) que les sections légitimes. Ainsi, à 6000 points stricts, le Layer 3 reste fermement caché.
