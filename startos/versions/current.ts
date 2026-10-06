import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '23.3.3:2',
  releaseNotes: {
    en_US:
      'Initial release of Elements (Liquid) for StartOS.\n\n- Runs a Liquid mainnet full node. Peg-in validation is off, so it does not need a Bitcoin node beside it.\n- Offers a JSON-RPC interface for other StartOS services, such as PeerSwap, and creates a wallet named peerswap on first run.\n- The initial sync downloads the whole Liquid sidechain, well over 80 GB. Before it fills your disk, open the Configuration action and decide on Pruning, which defaults to a pruned target on small disks.\n- The Disk Space health check notifies you when space runs low, and fails before the node runs the disk out.',
    es_ES:
      'Primera versión de Elements (Liquid) para StartOS.\n\n- Ejecuta un nodo completo de Liquid mainnet. La validación de peg-ins está desactivada, así que no necesita un nodo Bitcoin a su lado.\n- Ofrece una interfaz JSON-RPC para otros servicios de StartOS, como PeerSwap, y crea un monedero llamado peerswap en el primer arranque.\n- La sincronización inicial descarga toda la sidechain de Liquid, muy por encima de 80 GB. Antes de que llene tu disco, abre la acción Configuración y decide sobre la Poda, que en discos pequeños usa por defecto un objetivo podado.\n- La comprobación de salud Espacio en disco te avisa cuando queda poco espacio y falla antes de que el nodo agote el disco.',
    de_DE:
      'Erstveröffentlichung von Elements (Liquid) für StartOS.\n\n- Betreibt einen Liquid-Mainnet-Full-Node. Die Peg-in-Validierung ist aus, daher braucht er keinen Bitcoin-Knoten daneben.\n- Bietet anderen StartOS-Diensten wie PeerSwap eine JSON-RPC-Schnittstelle und legt beim ersten Start ein Wallet namens peerswap an.\n- Die erste Synchronisierung lädt die gesamte Liquid-Sidechain herunter, deutlich über 80 GB. Bevor sie deine Festplatte füllt, öffne die Aktion Konfiguration und entscheide dich beim Pruning, das auf kleinen Festplatten standardmäßig ein gekürztes Ziel verwendet.\n- Die Zustandsprüfung Speicherplatz benachrichtigt dich, wenn der Platz knapp wird, und schlägt fehl, bevor der Knoten die Festplatte volllaufen lässt.',
    pl_PL:
      'Pierwsze wydanie Elements (Liquid) dla StartOS.\n\n- Uruchamia pełny węzeł Liquid mainnet. Walidacja peg-in jest wyłączona, więc nie potrzebuje obok węzła Bitcoin.\n- Udostępnia interfejs JSON-RPC innym usługom StartOS, takim jak PeerSwap, i przy pierwszym uruchomieniu tworzy portfel o nazwie peerswap.\n- Pierwsza synchronizacja pobiera cały sidechain Liquid, znacznie ponad 80 GB. Zanim zapełni dysk, otwórz akcję Konfiguracja i zdecyduj o Przycinaniu, które na małych dyskach domyślnie ma ustawiony cel przycinania.\n- Kontrola stanu Miejsce na dysku powiadamia, gdy zaczyna brakować miejsca, i zgłasza błąd, zanim węzeł zapełni dysk.',
    fr_FR:
      "Première version d'Elements (Liquid) pour StartOS.\n\n- Fait tourner un nœud complet Liquid mainnet. La validation des peg-ins est désactivée, il n'a donc pas besoin d'un nœud Bitcoin à côté.\n- Offre une interface JSON-RPC aux autres services StartOS, comme PeerSwap, et crée un portefeuille nommé peerswap au premier démarrage.\n- La synchronisation initiale télécharge toute la sidechain Liquid, bien au-delà de 80 Go. Avant qu'elle ne remplisse votre disque, ouvrez l'action Configuration et choisissez l'Élagage, qui utilise par défaut une cible élaguée sur les petits disques.\n- Le contrôle de santé Espace disque vous prévient quand l'espace devient faible, et échoue avant que le nœud ne sature le disque.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
