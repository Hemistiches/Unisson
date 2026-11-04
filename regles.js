/* Unisson, par Hémistiches : tarifs, questionnaire et règles d'orientation, communs aux pages française et anglaise.
   Source unique : toute modification de prix, de question ou de règle se fait ici, et nulle part ailleurs.
   Les textes affichés restent dans chaque page ; ce fichier ne contient que des clés, des nombres et des règles. */
(function (g) {
  "use strict";

  /* ============================================================
     1. Tarifs (HT), arrêtés le 30 octobre 2026 (repère : environ 170 € de l'heure sur le temps moyen estimé).
     ============================================================ */
  var TARIFS = {
    version: "2026-11-04",
    consultation: { prix: 350, minutes: 45, deductionJours: 30 },
    collaboration: 500,        // un intervenant, une mission, une convention
    operation: 1000,           // plusieurs intervenants ou une organisation (comité, congrès, partenariat)
    diagnostic: 1500,
    structuration: { essentielle: 3000, complete: 4800 },   // prix globaux, diagnostic compris
    briques: {
      cadeaux: 600,            // politique cadeaux et invitations, tous interlocuteurs
      intermediaires: 1000,    // procédure d'évaluation et clauses types, hors vérifications sur chaque tiers
      conflits: 750,           // conflits d'intérêts liés aux relations avec les acteurs de santé
      alerte: 1200,            // mise en place du dispositif d'alerte, hors exploitation et enquêtes
      controle: 950,           // contrôle sur un échantillon de dix dossiers
      /* Modules ajoutés le 4 novembre 2026 */
      formation: 1000,         // demi-journée sur cas concrets, une douzaine de participants au plus
      subventions: 1000,       // dons, subventions et bourses éducatives, circuit CVS compris
      patients: 800,           // collaborations avec les patients et leurs associations
      ddp2026: 900,            // mise à jour des modèles et de la procédure aux DDP applicables en 2026
      groupe: 1200,            // procédures de groupe confrontées au droit français, additif France
      transparence: 800        // procédure de déclaration Transparence Santé et contrôle des déclarations
    },
    dossierEvenement: 350,     // par événement, en complément d'une opération : dossier Codeem ou CVS
    suivi: [
      { cle: "limite",   prix: 490,  heures: 3,  aPartirDe: false },
      { cle: "regulier", prix: 990,  heures: 6,  aPartirDe: false },
      { cle: "renforce", prix: 1490, heures: 10, aPartirDe: true }
    ],
    tauxDepassement: 180,
    preavisMois: 1           // sans durée minimale ; report sur le mois suivant : moitié du volume, trois heures au plus (règle commune du 3 novembre 2026)
  };

  function palier(cle) { for (var i = 0; i < TARIFS.suivi.length; i++) if (TARIFS.suivi[i].cle === cle) return TARIFS.suivi[i]; return null; }
  /* Structuration après un diagnostic déjà réglé : seul le complément du prix global est facturé. */
  function complement(niveau) { return TARIFS.structuration[niveau] - TARIFS.diagnostic; }

  /* ============================================================
     2. Questionnaire. Chaque option porte une clé et des drapeaux ; aucune pondération chiffrée.
        Les drapeaux « nsp » marquent une inconnue à clarifier, jamais un manquement.
     ============================================================ */
  function O(k, flags) { return { k: k, flags: flags || [] }; }

  var Q = {
    /* Secteur (4 novembre 2026). La filiale est repérée par l'option « code de notre groupe » de la question suivante, à choix multiple. */
    profil: { opts: [
      O("labo", []), O("dm", ["dm"]), O("deux", ["dm", "deux"]), O("autre", [])
    ]},
    /* Conditionnelle : sauf « autre ». Options filtrées selon le secteur (voir options()). */
    code: { multi: true, exclusive: ["aucun", "nsp"], opts: [
      O("ddp", ["ddp"]), O("medtech", ["medtech"]),
      O("groupe", ["filiale"]), O("aucun", []), O("nsp", ["nsp_mineur", "code_nsp"])
    ]},
    acteurs: { multi: true, exclusive: "aucun", opts: [
      O("ps", ["collab"]), O("experts", ["collab", "experts"]), O("etab", ["collab", "etab"]),
      O("societes", ["collab"]), O("patients", ["collab", "patients"]), O("patients_ind", ["collab", "patients", "patients_ind"]), O("intermediaires", ["collab", "intermediaires"]),
      O("aucun", ["sans_collab"])
    ]},
    /* Branche « aucune collaboration » : un projet est-il en préparation ? */
    projet: { opts: [ O("non", ["pas_projet"]), O("bientot", ["projet", "bientot"]), O("plus_tard", ["projet"]) ]},
    operations: { multi: true, opts: [
      O("expertise", []), O("board", ["op_collective"]), O("congres", ["op_collective", "congres"]), O("congres_tiers", ["op_collective", "congres", "congres_tiers"]),
      O("dons", ["op_collective", "dons"]), O("recherche", ["recherche"]), O("formation", []), O("formation_produit", [])
    ]},
    /* Conditionnelle : Code MedTech appliqué et soutien à des congrès organisés par des tiers.
       Réunit le soutien direct et l'avis du Conference Vetting System. */
    soutien_direct: { opts: [
      O("cvs", []), O("sans_cvs", ["faible", "eval_cvs"]),
      O("direct", ["faible", "faible", "soutien_direct"]),   /* compte double : interdit du Code MedTech, pas une simple faiblesse */
      O("nsp", ["nsp"])
    ]},
    /* Conditionnelle : DDP appliquées et des événements organisés ou soutenus (plateforme du Codeem). */
    evaluation: { opts: [ O("systematique", []), O("parfois", ["faible", "eval_partielle"]), O("non", ["faible", "eval_absente"]), O("nsp", ["nsp"]) ]},
    frequence: { opts: [ O("rare", []), O("reguliere", ["recurrent"]), O("frequente", ["recurrent", "intense"]), O("nsp", ["nsp"]) ]},
    regles: { opts: [
      O("methode", []), O("cas_doc", []), O("cas_oral", ["faible", "qualif_orale"]), O("aucune", ["faible", "qualif_absente"]), O("nsp", ["nsp", "qualif_nsp"])
    ]},
    conventions: { opts: [
      O("modeles_revus", []), O("modeles_anciens", ["faible", "modeles_anciens"]), O("partenaire_relus", []),
      O("partenaire_etat", ["faible", "partenaire_etat"]), O("sans_ecrit", ["faible", "sans_ecrit"])
    ]},
    justification: { opts: [ O("criteres", []), O("cas", []), O("informel", ["faible", "justif_informelle"]), O("nsp", ["nsp", "justif_nsp"]) ]},
    formalites: { opts: [ O("circuit", []), O("connu", []), O("variable", ["faible", "formalites_variables"]), O("nsp", ["nsp", "formalites_nsp"]) ]},
    reconstitution: { opts: [ O("oui", []), O("partiel", ["recon_partielle"]), O("non", ["faible", "recon_impossible"]), O("nsp", ["nsp", "recon_nsp"]) ]},
    /* Conditionnelle : seulement si des intermédiaires sont déclarés. */
    intermediaires: { opts: [ O("evalues", []), O("contrat_seul", ["brique_intermediaires"]), O("informel", ["brique_intermediaires", "inter_informel"]), O("nsp", ["nsp", "brique_intermediaires"]) ]},
    /* Conditionnelle : seulement si des établissements ou des dons sont déclarés. */
    autres: { opts: [ O("regles", []), O("sans_regle", ["brique_cadeaux"]), O("non", []), O("nsp", ["nsp_mineur"]) ]},
    /* Conditionnelle : seulement si des prestations d'expertise ou des comités sont déclarés. */
    liens: { opts: [ O("geres", []), O("non_geres", ["brique_conflits"]), O("non", []), O("nsp", ["nsp_mineur"]) ]},
    /* Formation des personnes qui organisent les opérations. */
    formation: { opts: [ O("recente", []), O("ancienne", ["formation_manque"]), O("non", ["formation_manque", "formation_absente"]), O("nsp", ["nsp_mineur", "formation_manque"]) ]},
    /* Vérification des dossiers : ouvre sur le contrôle sur échantillon. */
    verification: { opts: [ O("oui", []), O("non", ["jamais_verifie"]), O("nsp", ["nsp_mineur", "jamais_verifie"]) ]},
    alerte: { opts: [ O("oui", []), O("non_petit", []), O("non", ["brique_alerte"]), O("nsp", ["nsp_mineur", "alerte_nsp"]) ]},
    /* Sujets voisins, hors formules décrites : orientent vers un devis. Posée à tous. */
    voisins: { multi: true, exclusive: "aucun", opts: [
      O("corruption", ["devis_corruption"]), O("controle", ["devis_controle", "urgent"]), O("signalement", ["devis_signalement"]),
      O("pays", ["devis_pays"]), O("regularisation", ["devis_regularisation"]), O("aucun", [])
    ]},
    besoin: { opts: [
      O("etat", ["b_etat"]), O("outils", ["b_outils"]), O("operation", ["b_operation"]), O("appui", ["b_appui"]), O("question", ["b_question"])
    ]},
    /* Conditionnelle : seulement si une opération prochaine est à sécuriser. */
    echeance: { opts: [ O("mois", ["urgent"]), O("trimestre", []), O("plus_tard", []) ]}
  };
  Object.keys(Q).forEach(function (id) { Q[id].id = id; });

  /* Options proposées selon les réponses déjà données (seule la question « code » est filtrée). */
  function options(id, a) {
    var os = Q[id].opts; if (id !== "code") return os;
    var p = a.profil;
    return os.filter(function (o) {
      if (o.k === "ddp") return p === "labo" || p === "deux";
      if (o.k === "medtech") return p === "dm" || p === "deux";
      return true;
    });
  }
  function opt(id, k) { var os = Q[id].opts; for (var i = 0; i < os.length; i++) if (os[i].k === k) return os[i]; return null; }
  function choisies(id, a) {
    var v = a[id]; if (v === undefined || v === null) return [];
    if (Q[id].multi) { var ok = options(id, a); return (v || []).map(function (k) { return opt(id, k); }).filter(function (o) { return o && ok.indexOf(o) > -1; }); }
    var o = opt(id, v); if (o && options(id, a).indexOf(o) < 0) return []; return o ? [o] : [];
  }
  function a_(a, id, k) { var v = a[id]; return Q[id].multi ? (v || []).indexOf(k) > -1 : v === k; }

  /* Liste des questions posées, recalculée à chaque réponse : une réponse modifiée en revenant en arrière
     retire les questions qui ne s'appliquent plus, et leurs réponses ne sont plus prises en compte. */
  function parcours(a) {
    var L = ["profil"];
    if (a.profil && a.profil !== "autre") L.push("code");
    L.push("acteurs");
    if (a_(a, "acteurs", "aucun")) {
      L.push("projet");
      if (a.projet === "bientot" || a.projet === "plus_tard") L.push("operations");
      L.push("voisins", "besoin");
      if (a.besoin === "operation") L.push("echeance");
      return L;
    }
    L.push("operations");
    var c = choisies("code", a).reduce(function (m, o) { o.flags.forEach(function (x) { m[x] = true; }); return m; }, {});
    if (c.medtech && a_(a, "operations", "congres_tiers")) L.push("soutien_direct");
    if (c.ddp && (a_(a, "operations", "congres") || a_(a, "operations", "congres_tiers") || a_(a, "operations", "formation") || a_(a, "operations", "formation_produit"))) L.push("evaluation");
    L.push("frequence", "regles", "conventions", "justification", "formalites", "reconstitution");
    if (a_(a, "acteurs", "intermediaires")) L.push("intermediaires");
    /* Compléments du socle : cadeaux aux autres interlocuteurs (établissements ou dons), liens d'intérêts (expertise ou comités) ;
       formation, vérification et alerte : posées à toute entreprise qui collabore. */
    if (a_(a, "acteurs", "etab") || a_(a, "operations", "dons")) L.push("autres");
    if (a_(a, "operations", "expertise") || a_(a, "operations", "board")) L.push("liens");
    L.push("formation", "verification", "alerte", "voisins", "besoin");
    if (a.besoin === "operation") L.push("echeance");
    return L;
  }

  function drapeaux(a) {
    var ids = parcours(a), f = { faibles: 0, inconnues: 0, nActeurs: 0 };
    ids.forEach(function (id) { choisies(id, a).forEach(function (o) { o.flags.forEach(function (x) {
      if (x === "faible") f.faibles++; else if (x === "nsp") f.inconnues++; else f[x] = true;
    }); }); });
    f.nActeurs = (a.acteurs || []).filter(function (k) { return k !== "aucun" && k !== "intermediaires"; }).length;
    return f;
  }

  /* ============================================================
     3. Orientation : règles explicites, sans note ni total de points.
        a) état des pratiques : à clarifier (au moins deux inconnues), à consolider (au moins deux faiblesses),
           établi (sinon) ; une inconnue isolée devient un point à vérifier, pas un manquement ;
        b) opération prochaine, indépendante de l'état ;
        c) suivi, selon la fréquence et le besoin ;
        d) briques, pour les manques précis, même si le reste est rassurant ;
        e) consultation, si rien d'autre ne s'impose ou pour une question précise.
     ============================================================ */
  function orienter(a) {
    var f = drapeaux(a);
    var r = { devis: [], profil: null, etat: null, operation: null, structuration: null, diagnostic: false, suivi: null, briques: [], consultation: "option", urgent: !!f.urgent, sansCollab: !!f.sans_collab };

    ["corruption", "controle", "signalement", "pays", "regularisation"].forEach(function (d) { if (f["devis_" + d]) r.devis.push(d); });
    if (f.sans_collab) {
      r.etat = f.projet ? "projet" : "aucun";
      if (f.projet && (a.besoin === "operation" || a.besoin === "outils")) r.operation = (a.operations || []).some(function (k) { return opt("operations", k).flags.indexOf("op_collective") > -1; }) ? "operation" : "collaboration";
      if (f.projet && a.besoin === "outils") r.structuration = "essentielle";
      if (f.projet && a.besoin === "etat") r.consultation = "principale";
      if (!r.operation && !r.structuration && !r.devis.length) r.consultation = "principale";
      r.profil = f.devis_controle ? "situation" : (f.projet ? "projet" : "aucun");
      return r;
    }

    r.etat = f.inconnues >= 2 ? "a_clarifier" : (f.faibles >= 2 ? "a_consolider" : "etabli");
    var large = f.recurrent || f.nActeurs >= 3 || f.intermediaires;

    if (r.etat === "a_clarifier") r.diagnostic = true;
    if (r.etat === "a_consolider") r.structuration = large ? "complete" : "essentielle";
    if (r.etat === "etabli" && a.besoin === "outils") r.structuration = large ? "complete" : "essentielle";
    if (r.etat === "etabli" && (a.besoin === "etat" || f.jamais_verifie)) r.briques.push("controle");   // une organisation établie se vérifie sur pièces, sans diagnostic

    if (a.besoin === "operation") r.operation = (a.operations || []).some(function (k) { return opt("operations", k).flags.indexOf("op_collective") > -1; }) ? "operation" : "collaboration";

    if (a.besoin === "appui" || (r.etat === "etabli" && f.recurrent && a.besoin !== "question" && a.besoin !== "operation")) {
      r.suivi = { palier: f.intense ? "renforce" : (f.recurrent ? "regulier" : "limite"), apres: r.etat !== "etabli" };
    }

    ["intermediaires", "cadeaux", "conflits", "alerte"].forEach(function (b) { if (f["brique_" + b]) r.briques.push(b); });

    /* Modules du 4 novembre 2026 : chacun répond à un manque ou à une situation précise, même si le reste est établi. */
    if (f.formation_manque && r.structuration !== "complete") r.briques.push("formation");   // la formation n'est comprise que dans le socle approfondi
    if (f.soutien_direct || f.eval_cvs || ((f.dons || f.congres_tiers) && r.etat !== "etabli")) r.briques.push("subventions");
    if (f.ddp && !r.structuration && !r.diagnostic) r.briques.push("ddp2026");                // couvre aussi les patients au sens des DDP
    if (f.patients && r.briques.indexOf("ddp2026") < 0 && (r.etat !== "etabli" || f.patients_ind)) r.briques.push("patients");
    if (f.filiale) r.briques.push("groupe");
    if (f.formalites_variables || f.formalites_nsp) r.briques.push("transparence");
    var evts = ["congres", "congres_tiers", "formation", "formation_produit"].some(function (k) { return a_(a, "operations", k); });
    /* Dossier d'évaluation : plateforme du Codeem pour tout événement (DDP) ; CVS pour les seuls congrès de tiers (Code MedTech). */
    r.dossier = !!(r.operation && ((f.ddp && evts) || (f.medtech && a_(a, "operations", "congres_tiers"))));

    var rien = !r.diagnostic && !r.structuration && !r.operation && !r.suivi && !r.briques.length && !r.devis.length;
    if (a.besoin === "question" || rien) r.consultation = "principale";

    r.profil = r.operation && r.etat === "etabli" ? "operation"
      : (r.etat === "a_clarifier" ? "clarifier" : (r.etat === "a_consolider" ? "consolider" : (r.suivi && (a.besoin === "appui" || !r.structuration) ? "appui" : (r.operation ? "operation" : "etabli"))));
    if (f.devis_controle) r.profil = "situation";
    return r;
  }


  /* Indicateurs de situation (30 octobre 2026) : trois niveaux qualitatifs, jamais une note.
     Fragilité des pratiques : faiblesses déclarées (×2) et inconnues ; exposition : ce qui se verrait le jour où il faut justifier ;
     intensité des relations : rythme et diversité des collaborations, qui commandent l'effort d'encadrement. */
  function indicateurs(a) {
    var f = drapeaux(a);
    if (f.sans_collab) return null;
    var frag = f.faibles * 2 + f.inconnues;
    var expo = (f.urgent ? 3 : 0) + (f.soutien_direct ? 3 : 0) + (f.eval_cvs ? 1 : 0) + (f.eval_absente ? 1 : 0) + (f.sans_ecrit ? 2 : 0) + (f.partenaire_etat ? 1 : 0) + (f.justif_informelle ? 2 : 0) + (f.recon_impossible ? 2 : 0)
      + (f.inter_informel ? 1 : 0) + (f.brique_alerte ? 2 : 0) + (f.brique_conflits ? 1 : 0) + (f.qualif_absente ? 1 : 0);
    var intens = ({ rare: 1, reguliere: 2, frequente: 3, nsp: 1 })[a.frequence] || 1;
    intens += f.nActeurs >= 3 ? 2 : (f.nActeurs >= 2 ? 1 : 0);
    if ((a.operations || []).some(function (k) { return opt("operations", k).flags.indexOf("op_collective") > -1; })) intens += 1;
    if (f.intermediaires) intens += 1;
    function niv(v, m, e) { return v >= e ? "eleve" : (v >= m ? "modere" : "limite"); }
    return { frag: niv(frag, 2, 4), expo: niv(expo, 2, 5), intens: niv(intens, 3, 5) };
  }

  /* Points à vérifier, dans l'ordre d'affichage. */
  function points(a) {
    var f = drapeaux(a), k = [];
    if (f.sans_collab) { if (f.devis_controle) k.push("controle"); else if (f.urgent) k.push("urgent"); k.push(f.projet ? "projet" : "aucun"); k.push("reserve"); return k; }
    if (f.devis_controle) k.push("controle"); else if (f.urgent) k.push("urgent");
    ["soutien_direct", "eval_cvs", "eval_absente", "eval_partielle", "sans_ecrit", "partenaire_etat", "qualif_absente", "qualif_orale", "justif_informelle", "formalites_variables", "recon_impossible", "modeles_anciens"].forEach(function (x) { if (f[x]) k.push(x); });
    if (f.inconnues) k.push("inconnues");
    if (f.inter_informel) k.push("intermediaires");
    if (f.ddp && f.patients_ind) k.push("ddp_patients");
    if (f.medtech && f.intermediaires) k.push("medtech_intermediaires");
    if (f.code_nsp) k.push("code_nsp");
    if (f.brique_alerte) k.push("alerte"); else if (f.alerte_nsp) k.push("alerte_nsp");
    if (f.formation_absente) k.push("formation"); else if (f.formation_manque) k.push("formation_ancienne");
    if (f.jamais_verifie && !f.sans_collab) k.push("verification");
    if (f.filiale) k.push("filiale");
    if (f.dm) k.push("dm");
    if (f.experts) k.push("experts");
    if (f.recherche) k.push("recherche");
    var info = ["inconnues", "alerte_nsp", "formation_ancienne", "verification", "filiale", "dm", "experts", "recherche", "ddp_patients", "medtech_intermediaires", "code_nsp"];
    if (!k.some(function (x) { return info.indexOf(x) < 0; }) && !f.inconnues) k.unshift("etabli");
    k.push("reserve");
    return k;
  }

  /* Clés transmises si le visiteur demande à être recontacté (champ offres_suggerees), sans aucune réponse détaillée. */
  function cles(r) {
    var k = ["etat:" + r.etat];
    if (r.diagnostic) k.push("diagnostic");
    if (r.structuration) k.push("structuration:" + r.structuration);
    if (r.operation) k.push(r.operation);
    if (r.dossier) k.push("dossier_evenement");
    if (r.suivi) k.push("suivi:" + r.suivi.palier);
    r.briques.forEach(function (b) { k.push("brique:" + b); });
    k.push("consultation:" + r.consultation);
    r.devis.forEach(function (d) { k.push("devis:" + d); });
    if (r.urgent) k.push("urgent");
    return k;
  }

  g.UNISSON = { TARIFS: TARIFS, Q: Q, options: options, palier: palier, complement: complement, parcours: parcours, drapeaux: drapeaux, orienter: orienter, indicateurs: indicateurs, points: points, cles: cles };
})(typeof window !== "undefined" ? window : globalThis);
