import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '23.3.3:2',
  releaseNotes: {
    en_US:
      'Restores installs and updates on 4 GB machines.\n\nThe minimum-RAM requirement added in the previous release was written as a literal 4 GiB, but StartOS measures the memory the operating system can see, which is always a few hundred MiB below the capacity a machine is sold with. A 4 GB machine therefore failed the minimum and Elements stopped appearing in the marketplace. The requirement now sits between the 2 and 4 GB sizes, so 4 GB machines qualify as intended.\n\nThe Database Cache setting also no longer shows a default that was never applied; leave it blank and Elements uses its own.',
    es_ES:
      'Restaura la instalación y las actualizaciones en máquinas de 4 GB.\n\nEl requisito mínimo de RAM añadido en la versión anterior estaba escrito como 4 GiB exactos, pero StartOS mide la memoria que el sistema operativo puede ver, que siempre queda unos cientos de MiB por debajo de la capacidad con la que se vende una máquina. Así que una máquina de 4 GB no cumplía el mínimo y Elements dejaba de aparecer en el mercado. El requisito se sitúa ahora entre los tamaños de 2 y 4 GB, de modo que las máquinas de 4 GB califican como estaba previsto.\n\nAdemás, el ajuste Caché de base de datos ya no muestra un valor predeterminado que nunca se aplicaba; déjelo en blanco y Elements usará el suyo.',
    de_DE:
      'Stellt Installation und Updates auf 4-GB-Geräten wieder her.\n\nDie in der vorigen Version ergänzte Mindest-RAM-Anforderung war als exakte 4 GiB hinterlegt, doch StartOS misst den Speicher, den das Betriebssystem sehen kann – und der liegt stets einige hundert MiB unter der verkauften Kapazität. Ein 4-GB-Gerät verfehlte damit das Minimum, und Elements erschien nicht mehr im Marktplatz. Die Anforderung liegt jetzt zwischen den Größen 2 und 4 GB, sodass 4-GB-Geräte wie vorgesehen erfüllt sind.\n\nAußerdem zeigt die Einstellung Datenbank-Cache keinen Standardwert mehr an, der nie angewendet wurde; lässt du sie leer, verwendet Elements seinen eigenen.',
    pl_PL:
      'Przywraca instalację i aktualizacje na maszynach z 4 GB.\n\nMinimalne wymaganie RAM dodane w poprzednim wydaniu zapisano jako dokładne 4 GiB, ale StartOS mierzy pamięć widzianą przez system operacyjny, która zawsze jest o kilkaset MiB mniejsza niż pojemność, z jaką sprzedawana jest maszyna. Maszyna z 4 GB nie spełniała więc minimum, a Elements przestawał pojawiać się w sklepie. Wymaganie mieści się teraz między rozmiarami 2 i 4 GB, więc maszyny z 4 GB spełniają je zgodnie z zamysłem.\n\nUstawienie Pamięć podręczna bazy danych nie pokazuje już wartości domyślnej, która nigdy nie była stosowana; pozostaw je puste, a Elements użyje własnej.',
    fr_FR:
      "Rétablit l'installation et les mises à jour sur les machines de 4 Go.\n\nL'exigence de RAM minimale ajoutée dans la version précédente était écrite comme 4 Gio exacts, alors que StartOS mesure la mémoire visible par le système d'exploitation, toujours inférieure de quelques centaines de Mio à la capacité annoncée d'une machine. Une machine de 4 Go échouait donc au minimum et Elements cessait d'apparaître dans la marketplace. L'exigence se situe désormais entre les tailles de 2 et 4 Go : les machines de 4 Go sont éligibles comme prévu.\n\nLe réglage Cache de base de données n'affiche plus une valeur par défaut qui n'était jamais appliquée ; laissez-le vide et Elements utilisera la sienne.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
