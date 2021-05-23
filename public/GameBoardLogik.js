//Eine Verbindung zum Websocket Server Aufbauen
const ws = new WebSocket("ws://192.168.0.46:8080");
//Globale Variablen der Spieler anlegen und initialisieren
let averageZaehler = 0;
let zwischenSumme = 0;
let dartRest = 501;
//Spieler2
let averageZaehlerPL2 = 0;
let zwischenSummePL2 = 0;
let dartRestPL2 = 501;
//globale Variablen die nicht vom Spieler abhängig sind
let zaehler = 0;
let spielVorbei = false;
let zugSpieler1 = true; // Wenn True darf gespielt werden wenn false Spiel vorbei
let zugSpieler2 = false;

//Eine Funktion die in der Konsole des Browserd die Geglückte Verbindung zum Server ausgibt
ws.addEventListener("open", () => {
  console.log("Client connected with server!");
});


/**
 * Die Event listener Funktion erhält alle Nachrichten des Servers. 
 * In ihr wird alles Verarbeitet was der Server schickt
 * die if abfrage zugSpieler1/2 überprüft, ob der Spieler welche die Daten schickt auch an der reihe ist,
 * so dass immer nur ein Spieler freigeschalten ist. Ist das Spiel beednet ist kein Spieler mehr freigeschalten 
 * und keine neuen Werte werden akzeptiert.
 * Die ankommenden JSON werden geparsed und dann ausgewertet, hier wird überprüft ob und welcher Spieler
 * gewonnen hat und was er geworfen hat die Ergebnise auf die GUI zu übertragen wird hier in Auftrag gegeben.
 */
ws.addEventListener("message", function (event) {
  if (zugSpieler1) {
    zugSpieler2 = false;
    const data = JSON.parse(event.data);
    zaehler++;
    if (zaehler === 6) {
      handleZaehlerSechs(data, data.type, 1);
    }
    switch (data.type) {
      case "numberErgebnis1":
        zwischenSumme += data.value;
        break;

      case "stringErgebnis1":
        if (!checkIfWon(data.value,1)) {
          handleStringErgebnise(data.value, "PL1");
        }else{
          spielVorbei = true;
          zugSpieler2 = false;
          MasterHanlder = false;
        }
        break;
    }
  } else if (zugSpieler2) {
    zugSpieler1 = false;
    const data = JSON.parse(event.data);
    zaehler++;
    if (zaehler === 6) {
      handleZaehlerSechs(data, data.type, 2)
    }
    switch (data.type) {
      case "numberErgebnis2":
        zwischenSummePL2 += data.value;
        break;

      case "stringErgebnis2":
        if (!checkIfWon(data.value,2)) {
          handleStringErgebnise(data.value, "PL2");
        }else{
          spielVorbei = true;
          zugSpieler2 = false;
          zugSpieler1 = false;
        }
        break;
    }
  }
});

/**
 * Die Funktion behandelt den Sonderfall des 3. geworfenen Pfeil (zählerstand = 6, da die Funktion die den 
 * Zähler erhöht immer 2 mal pro wurf aufgerufen wird). In diesem besonderen Fall 
 * wechselt der Spieler, der jeweils andere wird gesperrt und der restWert wird berechnet.
 * @param {*} data daten des JSON type
 * @param {*} type JSON type
 * @param {*} player der Spieler (1 oder 2)
 */
function handleZaehlerSechs(data, type, player) {
  if (player === 1) {
    switch (type) {
      case "numberErgebnis1":
        zwischenSumme += data.value;
        break;
      case "stringErgebnis1":
        if (!checkIfWon(data.value,1)) {
          handleStringErgebnise(data.value, "PL1");
        }else{
          spielVorbei = true;
        }
        break;
    }
    dartRest -= zwischenSumme;
    zaehler = 0;
    zwischenSumme = 0;
    averageZaehler++;
    document.getElementById("restWertPL1").innerText = dartRest;
    document.getElementById("averagePL1").innerText = getAverage(averageZaehler);
    if (spielVorbei === false) {
      zugSpieler1 = false;
      zugSpieler2 = true;  
    }
  }else if(player ===2){
    switch (type) {
      case "numberErgebnis2":
        zwischenSummePL2 += data.value;
        break;
      case "stringErgebnis2":
        if (!checkIfWon(data.value,2)) {
          handleStringErgebnise(data.value, "PL2");
        }else{
          spielVorbei = true;
        }
        break;
    }
    dartRestPL2 -= zwischenSummePL2;
    zaehler = 0;
    zwischenSummePL2 = 0;
    averageZaehlerPL2++;
    document.getElementById("restWertPL2").innerText = dartRestPL2;
    document.getElementById("averagePL2").innerText =
    getAveragePL2(averageZaehlerPL2);
    if (spielVorbei === false) {
      zugSpieler1 = true;
      zugSpieler2 = false;  
    }
  }
}


/**
 * Darstellen der Würfe auf der GUI 
 * @param {*} ergWurf ist der Wurf (z.B D11 oder T14) als String welcher in die GUI übertragen wird
 * @param {*} spieler ist der Spieler als String ("PL2") oder ("PL1") um das richtige 
 * html Element anzusprechen
 */
function handleStringErgebnise(ergWurf, spieler) {
  switch (zaehler) {
    case 2:
      document.getElementById("ergWurf1" + spieler).innerText = String(ergWurf);
      document.getElementById("ergWurf2" + spieler).innerText = String("/");
      document.getElementById("ergWurf3" + spieler).innerText = String("/");
      break;
    case 4:
      document.getElementById("ergWurf2" + spieler).innerText = String(ergWurf);
      break;
    case 6:
      document.getElementById("ergWurf3" + spieler).innerText = String(ergWurf);
      break;
  }
}

/**
 * @param  count ist die Anzahl der vollständigen Spielzüge (3 Würfe, falls verworfen 
 * zählt das als null wurf) 
 * @returns durchschnitt der 3 Pfeile eines Spielers auf das ganze Spiel gerechnet
 */
function getAverage(count) {
  return (501 - dartRest) / count;
}

function getAveragePL2(count) {
  return (501 - dartRestPL2) / count;
}

/**
 * Ermittelt ob der Spieler mit Double aus gemacht hat und das Spiel gewonnen oder ob er
 * überworfen hat. Falls keins von beidem -> Spiel geht normal weiter
 * Wenn gewonnen werden die Spieler gesperrt keine Weiteren werte werden gewertet.
 * Wenn überworfen wird der Spielzug beendet und der andere Spieler ist an der reihe.
 * @param {*} ergString Ist das String Ergebnis eines Wurfs (Bsp. D11 oder T12)
 * @param {*} player ist der Spieler für den überprüft wird (1 oder 2)
 * @returns boolean true falls der Spieler gewonnen hat, false falls nicht gewonnen
 */
function checkIfWon(ergString, player) {
  split = Array.from(ergString);
  if (player === 1) {
    if (split[0] == "D" && dartRest - zwischenSumme == 0) { //Gewonnen
      zwischenSumme = 0;
      averageZaehler++;
      dartRest = 0;
      handleStringErgebnise(ergString, "PL1");
      guiWon("PL1", 1);
      zugSpieler2 = false;
      zugSpieler1 = false;
      return true;
    } else if (dartRest - zwischenSumme < 1) { //Überworfen
      zwischenSumme = 0;
      zaehler = 0;
      clearWuerfe("PL");
      return false;
    }
  } else if (player === 2){
    if (split[0] == "D" && dartRestPL2 - zwischenSummePL2 == 0) { //Gewonnen
      zwischenSummePL2 = 0;
      averageZaehlerPL2++;
      dartRestPL2 = 0;
      handleStringErgebnise(ergString, "PL2");
      guiWon("PL2", 2);
      zugSpieler2 = false;
      zugSpieler1 = false;
      return true;
    } else if (dartRestPL2 - zwischenSummePL2 < 1) { //Überworfen
      zwischenSumme = 0;
      zaehler = 0;
      clearWuerfe("PL");
      return false;
    }
  }
  return false;
}

/**
 * Gibt auf der GUI gewonnen aus und setzt die letzten Werte des jeweiligen Spielers
 * @param {*} stringSp der String name des Spielers ("SP1") oder ("SP2) als zugriff auf das passende 
 * html Element
 * @param {*} player der Spieler als nummer 1 oder 2 
 */
function guiWon(stringSp, player) {
  if (player === 1) {
    document.getElementById("average" + stringSp).innerText =
      getAverage(averageZaehlerPL2);
    document.getElementById("restWert" + stringSp).innerText = dartRest;
    document.getElementById("status" + stringSp).innerText = "Gewonnen";
  } else if (player === 2) {
    document.getElementById("average" + stringSp).innerText =
      getAveragePL2(averageZaehlerPL2);
    document.getElementById("restWert" + stringSp).innerText = dartRestPL2;
    document.getElementById("status" + stringSp).innerText = "Gewonnen";
  }
}

/**
 * Setzt die einzelnen Würfe des Spielers zurück zu default /
 * @param {*} player der Spieler als String um auf das richtige html Element 
 * zugreigen zu können
 */
function clearWuerfe(player) {
  document.getElementById("ergWurf1" + player).innerText = String("/");
  document.getElementById("ergWurf2" + player).innerText = String("/");
  document.getElementById("ergWurf3" + player).innerText = String("/");
}
