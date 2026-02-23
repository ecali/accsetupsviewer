import { getUiText, normalizeLang, type Lang } from "@/lib/i18n";

const ABOUT_TEXT: Record<Lang, {
  title: string;
  intro: string;
  dataOrigin: string;
  dataOriginBody: string;
  processing: string;
  processingBody: string;
  notes: string;
  notesItems: string[];
  support: string;
  supportBody: string;
  projectRepo: string;
  openIssue: string;
}> = {
  en: {
    title: "About CaliACCSetupsViewer",
    intro:
      "This application lets you browse, filter and visualize Assetto Corsa Competizione setup JSON files in a practical way for tuning and testing.",
    dataOrigin: "Data Origin",
    dataOriginBody: "Setup files are loaded from the public repository:",
    processing: "How Data Is Processed",
    processingBody:
      "To show final values comparable to community tools, the app uses the selected JSON file and extracts converted values from the GoSetups viewer/comparator.",
    notes: "Important Notes",
    notesItems: [
      "Setups remain property of their original authors in the source repository.",
      "Data availability depends on external services (GitHub and GoSetups).",
      "Displayed values reflect the selected source file.",
    ],
    support: "Support And Feedback",
    supportBody:
      "For bug reports, suggestions, feature requests, or any other communication, please open an issue on the project repository.",
    projectRepo: "Project repository",
    openIssue: "Open an issue on GitHub",
  },
  it: {
    title: "About CaliACCSetupsViewer",
    intro:
      "Questa applicazione permette di esplorare, filtrare e visualizzare i file JSON dei setup di Assetto Corsa Competizione in modo pratico per test e tuning.",
    dataOrigin: "Origine Dati",
    dataOriginBody: "I file setup vengono caricati dalla repository pubblica:",
    processing: "Elaborazione Dati",
    processingBody:
      "Per mostrare valori finali comparabili con gli strumenti della community, l'app usa il JSON selezionato e ricava i valori convertiti dal viewer/comparator di GoSetups.",
    notes: "Note Importanti",
    notesItems: [
      "I setup restano di proprietà dei rispettivi autori nella repository di origine.",
      "La disponibilità dei dati dipende da servizi esterni (GitHub e GoSetups).",
      "I valori mostrati riflettono il file sorgente selezionato.",
    ],
    support: "Supporto e Segnalazioni",
    supportBody:
      "Per bug, suggerimenti, richieste funzionalità o qualsiasi altra comunicazione, apri una issue nella repository del progetto.",
    projectRepo: "Repository progetto",
    openIssue: "Apri una issue su GitHub",
  },
  es: {
    title: "Acerca de CaliACCSetupsViewer",
    intro:
      "Esta aplicación permite explorar, filtrar y visualizar archivos JSON de setup de Assetto Corsa Competizione de forma práctica para pruebas y ajustes.",
    dataOrigin: "Origen de Datos",
    dataOriginBody: "Los archivos de setup se cargan desde el repositorio público:",
    processing: "Cómo se Procesan los Datos",
    processingBody:
      "Para mostrar valores finales comparables con herramientas de la comunidad, la app usa el JSON seleccionado y obtiene valores convertidos del visor/comparador de GoSetups.",
    notes: "Notas Importantes",
    notesItems: [
      "Los setups siguen siendo propiedad de sus autores originales en el repositorio fuente.",
      "La disponibilidad depende de servicios externos (GitHub y GoSetups).",
      "Los valores mostrados reflejan el archivo fuente seleccionado.",
    ],
    support: "Soporte y Comentarios",
    supportBody:
      "Para errores, sugerencias, nuevas funciones o cualquier otra comunicación, abre una issue en el repositorio del proyecto.",
    projectRepo: "Repositorio del proyecto",
    openIssue: "Abrir una issue en GitHub",
  },
  de: {
    title: "Über CaliACCSetupsViewer",
    intro:
      "Diese Anwendung ermöglicht das Durchsuchen, Filtern und Visualisieren von Assetto Corsa Competizione Setup-JSON-Dateien für praxisnahes Tuning und Testen.",
    dataOrigin: "Datenquelle",
    dataOriginBody: "Setup-Dateien werden aus dem öffentlichen Repository geladen:",
    processing: "Datenverarbeitung",
    processingBody:
      "Um Endwerte vergleichbar mit Community-Tools darzustellen, verwendet die App die ausgewählte JSON-Datei und liest konvertierte Werte aus dem GoSetups Viewer/Comparator.",
    notes: "Wichtige Hinweise",
    notesItems: [
      "Setups bleiben Eigentum ihrer ursprünglichen Autoren im Quell-Repository.",
      "Die Datenverfügbarkeit hängt von externen Diensten ab (GitHub und GoSetups).",
      "Die angezeigten Werte entsprechen der ausgewählten Quelldatei.",
    ],
    support: "Support und Feedback",
    supportBody:
      "Für Bugs, Vorschläge, Feature-Wünsche oder sonstige Anliegen bitte ein Issue im Projekt-Repository erstellen.",
    projectRepo: "Projekt-Repository",
    openIssue: "Issue auf GitHub öffnen",
  },
  fr: {
    title: "À propos de CaliACCSetupsViewer",
    intro:
      "Cette application permet d'explorer, filtrer et visualiser les fichiers JSON de setup Assetto Corsa Competizione de manière pratique pour les tests et réglages.",
    dataOrigin: "Origine des Données",
    dataOriginBody: "Les fichiers setup sont chargés depuis le dépôt public :",
    processing: "Traitement des Données",
    processingBody:
      "Pour afficher des valeurs finales comparables aux outils de la communauté, l'application utilise le JSON sélectionné et récupère les valeurs converties depuis le viewer/comparator GoSetups.",
    notes: "Notes Importantes",
    notesItems: [
      "Les setups restent la propriété de leurs auteurs dans le dépôt source.",
      "La disponibilité dépend de services externes (GitHub et GoSetups).",
      "Les valeurs affichées reflètent le fichier source sélectionné.",
    ],
    support: "Support et Retours",
    supportBody:
      "Pour les bugs, suggestions, demandes de fonctionnalités ou tout autre besoin, ouvrez une issue dans le dépôt du projet.",
    projectRepo: "Dépôt du projet",
    openIssue: "Ouvrir une issue sur GitHub",
  },
};

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang = normalizeLang(typeof params.lang === "string" ? params.lang : "en");
  const copy = ABOUT_TEXT[lang];
  const t = getUiText(lang);

  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-900">
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-950">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{copy.title}</h1>
          <p className="mt-3 text-zinc-700 dark:text-zinc-300">{copy.intro}</p>

          <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{copy.dataOrigin}</h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">{copy.dataOriginBody}</p>
          <p className="mt-1">
            <a href="https://github.com/Lon3035/ACC_Setups" target="_blank" rel="noreferrer" className="font-semibold text-[#23a936] underline">
              github.com/Lon3035/ACC_Setups
            </a>
          </p>

          <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{copy.processing}</h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">{copy.processingBody}</p>
          <p className="mt-1">
            <a href="https://gosetups.gg/acc-setup-viewer-comparator/" target="_blank" rel="noreferrer" className="font-semibold text-[#23a936] underline">
              gosetups.gg/acc-setup-viewer-comparator
            </a>
          </p>

          <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{copy.notes}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
            {copy.notesItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{copy.support}</h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">{copy.supportBody}</p>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">
            {copy.projectRepo}: {" "}
            <a href="https://github.com/ecali/accsetupsviewer" target="_blank" rel="noreferrer" className="font-semibold text-[#23a936] underline">
              github.com/ecali/accsetupsviewer
            </a>
          </p>
          <p className="mt-2">
            <a href="https://github.com/ecali/accsetupsviewer/issues/new/choose" target="_blank" rel="noreferrer" className="font-semibold text-[#23a936] underline">
              {copy.openIssue}
            </a>
          </p>

          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
            {t.developedWithBy} <a href="https://github.com/ecali" target="_blank" rel="noreferrer" className="font-semibold text-[#23a936] underline">Cali</a>
          </p>
        </section>
      </main>
    </div>
  );
}
