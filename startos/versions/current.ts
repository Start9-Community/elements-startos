import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '23.3.3:1',
  releaseNotes: {
    en_US:
      'Adds pruning and a transaction-index toggle so the Liquid chain can be capped, plus a disk-space health check and a minimum-RAM requirement. The transaction index is now off by default, matching upstream. Adds a peer interface for inbound Liquid connections. Rebuilt on start-sdk 2.0.',
    es_ES:
      'Añade poda y un interruptor de índice de transacciones para limitar la cadena de Liquid, además de una comprobación de espacio en disco y un requisito mínimo de RAM. El índice de transacciones ahora está desactivado por defecto, igual que en el proyecto original. Añade una interfaz de pares para conexiones entrantes de Liquid. Reconstruido sobre start-sdk 2.0.',
    de_DE:
      'Fügt Pruning und einen Schalter für den Transaktionsindex hinzu, um die Liquid-Chain zu begrenzen, dazu eine Speicherplatz-Prüfung und eine Mindest-RAM-Anforderung. Der Transaktionsindex ist jetzt standardmäßig aus, wie im Upstream-Projekt. Fügt eine Peer-Schnittstelle für eingehende Liquid-Verbindungen hinzu. Neu gebaut auf start-sdk 2.0.',
    pl_PL:
      'Dodaje przycinanie i przełącznik indeksu transakcji, aby ograniczyć rozmiar łańcucha Liquid, a także kontrolę miejsca na dysku i minimalne wymagania RAM. Indeks transakcji jest teraz domyślnie wyłączony, zgodnie z projektem źródłowym. Dodaje interfejs węzłów dla przychodzących połączeń Liquid. Przebudowane na start-sdk 2.0.',
    fr_FR:
      "Ajoute l'élagage et un interrupteur d'index des transactions pour limiter la chaîne Liquid, ainsi qu'un contrôle d'espace disque et une exigence de RAM minimale. L'index des transactions est désormais désactivé par défaut, comme en amont. Ajoute une interface pair pour les connexions Liquid entrantes. Reconstruit sur start-sdk 2.0.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
