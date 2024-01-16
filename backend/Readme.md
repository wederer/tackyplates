# Tackyplates Backend




## Too Long, Didn't Read
- Admin erreichbar via <backend-ip>:8000/admin
- Update via `git pull`
- Restart durch `./restart.sh`
- Ob backend läuft kann getestet werden via <backend-ip>:8000/api/heartbeat




## Lokales Entwickeln
Um lokal zu entwickeln muss poetry, sowie python>3.9 vorhanden sein. Mittels `poetry install` werden alle
Abhängigkeiten installiert. Anschließend kann via `make migrate` die Datenbank angelegt werden. Danach kann der Server
mit `make runserver-mocked` ausgeführt werden. Bevor die Anwendung dann wirklich funktioniert muss noch etwas in die
Settings Tabelle geschrieben werden. Das kann entweder mit `./seed.sh` oder via dem Admin Panel <backend_ip>:8000/admin
erledigt werden. Außerdem sollte der Ordner `export` angelegt werden und mittels `chmod 777` allen Usern freigegeben
werden. Dieser wird benutzt um Excel Dateien zu exportieren (funktioniert im lokalen Setup nicht, nur auf dem RPI).

## Dependency Management
Auf dem RPI werden andere Abhängigkeiten (z.B. RPI-GPIO, gpiozero etc.) benötigt als beim lokalen development.
Eigentlich sollte das mit Poetry klappen, aber komischerweise gab es auf dem RPI immer Probleme beim Installieren von
Paketen via Poetry.

Somit werden jetzt alle Abhängigkeiten zum Development mit Poetry gemanaged und für die Installation auf dem RPI mit
requirements.txt.

Falls sich die Pakete geändert haben einfach via:
```bash
poetry export --without-hashes --format=requirements.txt > requirements.txt
```
eine neue requirements.txt schreiben.

Diese dann auf dem RPI installieren und die requirements-rpi.txt updaten.
```bash
source /venv/bin/activate
pip install -r requirements.txt
pip freeze > requirements-rpi.txt
```

Somit sind alle Abhängigkeiten für das Development in der pyproject.toml sowie requirements.txt und die Abhängigkeiten
für den RPI in requirements-rpi.txt.

## Setup auf rpi für labor netzwerk:
Folgendes zu /etc/rc.local hinzufügen, damit wlan im labor funktioniert:
```
#config für Labornetz

#setze Mac-Adresse um
ifconfig wlan0 down
ifconfig wlan0 hw ether 2c:91:ab:6b:4a:d1
ifconfig wlan0 up
ifconfig wlan0 up
```

