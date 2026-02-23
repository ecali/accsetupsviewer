export const SUPPORTED_LANGS = ["en", "it", "es", "de", "fr"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const LANG_OPTIONS: Record<Lang, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  it: { label: "Italiano", flag: "🇮🇹" },
  es: { label: "Español", flag: "🇪🇸" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  fr: { label: "Français", flag: "🇫🇷" },
};

export type UiText = {
  home: string;
  about: string;
  sourceData: string;
  totalJsonFiles: string;
  filteredResults: string;
  filterCar: string;
  filterTrack: string;
  searchCarPlaceholder: string;
  searchTrackPlaceholder: string;
  resultsCount: string;
  reset: string;
  searchAllSetups: string;
  searchSelectionPrefix: string;
  allSetupsTitle: string;
  clickFileHint: string;
  noResults: string;
  tableCar: string;
  tableTrack: string;
  tableNotes: string;
  setupsWord: string;
  selectedSetupParams: string;
  selectValidFile: string;
  selectFileHint: string;
  carName: string;
  circuit: string;
  tyres: string;
  electronicsAndBrakes: string;
  electronics: string;
  brakes: string;
  mechanicalGrip: string;
  front: string;
  rear: string;
  leftFront: string;
  rightFront: string;
  leftRear: string;
  rightRear: string;
  dampers: string;
  aero: string;
  developedWithBy: string;
  dataLoadErrorPrefix: string;
  valueLoadErrorPrefix: string;
  noValues: string;
};

export const UI_TEXT: Record<Lang, UiText> = {
  en: {
    home: "Home",
    about: "About",
    sourceData: "Data source",
    totalJsonFiles: "Total JSON files",
    filteredResults: "Filtered results",
    filterCar: "Car Filter",
    filterTrack: "Track Filter",
    searchCarPlaceholder: "Search car...",
    searchTrackPlaceholder: "Search track...",
    resultsCount: "Results",
    reset: "RESET",
    searchAllSetups: "Search All Setups",
    searchSelectionPrefix: "Search",
    allSetupsTitle: "All Available Setups With Current Filters",
    clickFileHint: "Click a file to show detailed setup parameters below.",
    noResults: "No setups found for this combination.",
    tableCar: "Car Name",
    tableTrack: "Track",
    tableNotes: "Notes",
    setupsWord: "setups",
    selectedSetupParams: "Selected Setup Parameters",
    selectValidFile: "Select a valid file from the list.",
    selectFileHint: "Select a file from the list",
    carName: "Car Name",
    circuit: "Track",
    tyres: "Tyres",
    electronicsAndBrakes: "Electronics & Brakes",
    electronics: "Electronics",
    brakes: "Brakes",
    mechanicalGrip: "Mechanical Grip",
    front: "Front",
    rear: "Rear",
    leftFront: "Left Front",
    rightFront: "Right Front",
    leftRear: "Left Rear",
    rightRear: "Right Rear",
    dampers: "Dampers",
    aero: "Aero",
    developedWithBy: "Developed with ❤️ and ☕ by",
    dataLoadErrorPrefix: "Unable to read setups from repository",
    valueLoadErrorPrefix: "Unable to fetch converted values from GoSetups",
    noValues: "No values available.",
  },
  it: {
    home: "Home",
    about: "About",
    sourceData: "Sorgente dati",
    totalJsonFiles: "Totale file JSON",
    filteredResults: "Risultati filtrati",
    filterCar: "Filtro Macchina",
    filterTrack: "Filtro Circuito",
    searchCarPlaceholder: "Cerca macchina...",
    searchTrackPlaceholder: "Cerca circuito...",
    resultsCount: "Risultati",
    reset: "RESET",
    searchAllSetups: "Cerca Tutti i Setup",
    searchSelectionPrefix: "Cerca",
    allSetupsTitle: "Tutti i Setup Disponibili con i Filtri Selezionati",
    clickFileHint: "Clicca un file per vedere i parametri dettagliati nel pannello sotto.",
    noResults: "Nessun setup trovato per questa combinazione.",
    tableCar: "Nome Macchina",
    tableTrack: "Circuito",
    tableNotes: "Note",
    setupsWord: "setup",
    selectedSetupParams: "Parametri del Setup Selezionato",
    selectValidFile: "Seleziona un file valido dalla lista.",
    selectFileHint: "Seleziona un file dalla lista",
    carName: "Nome Macchina",
    circuit: "Circuito",
    tyres: "Pneumatici",
    electronicsAndBrakes: "Elettronica e Freni",
    electronics: "Elettronica",
    brakes: "Freni",
    mechanicalGrip: "Grip Meccanico",
    front: "Frontale",
    rear: "Posteriore",
    leftFront: "Anteriore Sinistra",
    rightFront: "Anteriore Destra",
    leftRear: "Posteriore Sinistra",
    rightRear: "Posteriore Destra",
    dampers: "Ammortizzatori",
    aero: "Aerodinamica",
    developedWithBy: "Sviluppato con ❤️ e ☕ da",
    dataLoadErrorPrefix: "Impossibile leggere i setup dalla repository",
    valueLoadErrorPrefix: "Impossibile ottenere i valori convertiti da GoSetups",
    noValues: "Nessun valore disponibile.",
  },
  es: {
    home: "Inicio",
    about: "Acerca de",
    sourceData: "Fuente de datos",
    totalJsonFiles: "Total de archivos JSON",
    filteredResults: "Resultados filtrados",
    filterCar: "Filtro de Coche",
    filterTrack: "Filtro de Circuito",
    searchCarPlaceholder: "Buscar coche...",
    searchTrackPlaceholder: "Buscar circuito...",
    resultsCount: "Resultados",
    reset: "REINICIAR",
    searchAllSetups: "Buscar Todos los Setups",
    searchSelectionPrefix: "Buscar",
    allSetupsTitle: "Todos los Setups Disponibles con los Filtros Actuales",
    clickFileHint: "Haz clic en un archivo para ver los parámetros detallados abajo.",
    noResults: "No se encontraron setups para esta combinación.",
    tableCar: "Coche",
    tableTrack: "Circuito",
    tableNotes: "Notas",
    setupsWord: "setups",
    selectedSetupParams: "Parámetros del Setup Seleccionado",
    selectValidFile: "Selecciona un archivo válido de la lista.",
    selectFileHint: "Selecciona un archivo de la lista",
    carName: "Coche",
    circuit: "Circuito",
    tyres: "Neumáticos",
    electronicsAndBrakes: "Electrónica y Frenos",
    electronics: "Electrónica",
    brakes: "Frenos",
    mechanicalGrip: "Agarre Mecánico",
    front: "Delantero",
    rear: "Trasero",
    leftFront: "Delantero Izquierdo",
    rightFront: "Delantero Derecho",
    leftRear: "Trasero Izquierdo",
    rightRear: "Trasero Derecho",
    dampers: "Amortiguadores",
    aero: "Aerodinámica",
    developedWithBy: "Desarrollado con ❤️ y ☕ por",
    dataLoadErrorPrefix: "No se pudieron leer los setups del repositorio",
    valueLoadErrorPrefix: "No se pudieron obtener los valores convertidos de GoSetups",
    noValues: "No hay valores disponibles.",
  },
  de: {
    home: "Start",
    about: "Über",
    sourceData: "Datenquelle",
    totalJsonFiles: "Gesamtzahl JSON-Dateien",
    filteredResults: "Gefilterte Ergebnisse",
    filterCar: "Fahrzeugfilter",
    filterTrack: "Streckenfilter",
    searchCarPlaceholder: "Fahrzeug suchen...",
    searchTrackPlaceholder: "Strecke suchen...",
    resultsCount: "Ergebnisse",
    reset: "ZURÜCKSETZEN",
    searchAllSetups: "Alle Setups Suchen",
    searchSelectionPrefix: "Suchen",
    allSetupsTitle: "Alle Verfügbaren Setups mit Aktuellen Filtern",
    clickFileHint: "Klicke auf eine Datei, um unten die Details anzuzeigen.",
    noResults: "Keine Setups für diese Kombination gefunden.",
    tableCar: "Fahrzeug",
    tableTrack: "Strecke",
    tableNotes: "Notizen",
    setupsWord: "Setups",
    selectedSetupParams: "Parameter des Ausgewählten Setups",
    selectValidFile: "Wähle eine gültige Datei aus der Liste.",
    selectFileHint: "Datei aus der Liste wählen",
    carName: "Fahrzeug",
    circuit: "Strecke",
    tyres: "Reifen",
    electronicsAndBrakes: "Elektronik und Bremsen",
    electronics: "Elektronik",
    brakes: "Bremsen",
    mechanicalGrip: "Mechanischer Grip",
    front: "Vorne",
    rear: "Hinten",
    leftFront: "Vorne Links",
    rightFront: "Vorne Rechts",
    leftRear: "Hinten Links",
    rightRear: "Hinten Rechts",
    dampers: "Dämpfer",
    aero: "Aerodynamik",
    developedWithBy: "Entwickelt mit ❤️ und ☕ von",
    dataLoadErrorPrefix: "Setups konnten nicht aus dem Repository gelesen werden",
    valueLoadErrorPrefix: "Konvertierte Werte konnten nicht von GoSetups geladen werden",
    noValues: "Keine Werte verfügbar.",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    sourceData: "Source des données",
    totalJsonFiles: "Total des fichiers JSON",
    filteredResults: "Résultats filtrés",
    filterCar: "Filtre Voiture",
    filterTrack: "Filtre Circuit",
    searchCarPlaceholder: "Rechercher une voiture...",
    searchTrackPlaceholder: "Rechercher un circuit...",
    resultsCount: "Résultats",
    reset: "RÉINITIALISER",
    searchAllSetups: "Rechercher Tous les Setups",
    searchSelectionPrefix: "Rechercher",
    allSetupsTitle: "Tous les Setups Disponibles avec les Filtres Actuels",
    clickFileHint: "Cliquez sur un fichier pour afficher les paramètres détaillés ci-dessous.",
    noResults: "Aucun setup trouvé pour cette combinaison.",
    tableCar: "Voiture",
    tableTrack: "Circuit",
    tableNotes: "Notes",
    setupsWord: "setups",
    selectedSetupParams: "Paramètres du Setup Sélectionné",
    selectValidFile: "Sélectionnez un fichier valide dans la liste.",
    selectFileHint: "Sélectionnez un fichier dans la liste",
    carName: "Voiture",
    circuit: "Circuit",
    tyres: "Pneus",
    electronicsAndBrakes: "Électronique et Freins",
    electronics: "Électronique",
    brakes: "Freins",
    mechanicalGrip: "Adhérence Mécanique",
    front: "Avant",
    rear: "Arrière",
    leftFront: "Avant Gauche",
    rightFront: "Avant Droit",
    leftRear: "Arrière Gauche",
    rightRear: "Arrière Droit",
    dampers: "Amortisseurs",
    aero: "Aéro",
    developedWithBy: "Développé avec ❤️ et ☕ par",
    dataLoadErrorPrefix: "Impossible de lire les setups depuis le dépôt",
    valueLoadErrorPrefix: "Impossible de récupérer les valeurs converties depuis GoSetups",
    noValues: "Aucune valeur disponible.",
  },
};

export function normalizeLang(value: string): Lang {
  if (SUPPORTED_LANGS.includes(value as Lang)) {
    return value as Lang;
  }
  return "en";
}

export function getUiText(lang: Lang): UiText {
  return UI_TEXT[lang] ?? UI_TEXT.en;
}
