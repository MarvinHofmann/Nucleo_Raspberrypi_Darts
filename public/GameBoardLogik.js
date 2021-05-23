//Eine Verbindung zum Websocket Server Aufbauen
const ws = new WebSocket("ws://192.168.0.46:8080");

//Globale Variablen der Spiler anlegen und initialisieren

let averageZaehler = 0;

let zwischenSumme = 0;
let dartRest = 501;

let averageZaehlerPL2 = 0;
let zwischenSummePL2 = 0;
let dartRestPL2 = 501;


let zaehler = 0;
let spielVorbei = false;
let MasterHandler = true; // Wenn True darf gespielt werden wenn false Spiel vorbei
let MasterhanlderTwo = false;
//Eine Funktion die in der Konsole des Browserd die Geglückte Verbindung zum Server ausgibt
ws.addEventListener("open", () => {
  console.log("Client connected with server!");
});

//Die Event listener Funktion erhält alle Nachrichten des Servers. In ihr wird alles Verarbeitet was der Server schickt
ws.addEventListener("message", function (event) {
  if (MasterHandler) {
    MasterhanlderTwo = false;
    console.log("Spieler 1 spielt");
    const data = JSON.parse(event.data);
    console.log(data);
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
          MasterHandlerPL2 = false;
          Masterhanlder = false;
        }
        break;
    }
  } else if (MasterhanlderTwo) {
    Masterhanlder = false;
    console.log("Spieler 2 spielt");
    const data = JSON.parse(event.data);
    console.log(data);
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
          MasterHandlerPL2 = false;
          Masterhanlder = false;
        }
        break;
    }
  }
});

function handleZaehlerSechs(data, type, player) {
  if (player === 1) {
    console.log("Zaheler = 6 PL1");
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
      MasterHandler = false;
      MasterhanlderTwo = true;  
    }
  }else {
    console.log("Zaheler = 6 PL2");
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
      MasterHandler = true;
      MasterhanlderTwo = false;  
    }
  }
}

//Hier werden die String ergebnisse (z.B D11, T20 oder S15) auf den jeweiligen Platz der Webseite geschrieben
//Die entscheidung läuft nach globalem Zählerstand, sodass für den 3. Wurf(zähler = 6) das Ergebnis im 3. Kasten dargestellt wird
function handleStringErgebnise(data, spieler) {
  switch (zaehler) {
    case 2:
      document.getElementById("ergWurf1" + spieler).innerText = String(data);
      document.getElementById("ergWurf2" + spieler).innerText = String("/");
      document.getElementById("ergWurf3" + spieler).innerText = String("/");
      break;
    case 4:
      document.getElementById("ergWurf2" + spieler).innerText = String(data);

      break;

    case 6:
      document.getElementById("ergWurf3" + spieler).innerText = String(data);
      break;
  }
}


function getAverage(count) {
  return (501 - dartRest) / count;
}

function getAveragePL2(count) {
  return (501 - dartRestPL2) / count;
}

function checkIfWon(ergString, player) {
  split = Array.from(ergString);
  if (player === 1) {
    if (split[0] == "D" && dartRest - zwischenSumme == 0) {
      console.log("GewonnenPL1");
      zwischenSumme = 0;
      averageZaehler++;
      dartRest = 0;
      handleStringErgebnise(ergString, "PL1");
      guiWon("PL1", 1);
      MasterHandlerPL2 = false;
      Masterhanlder = false;
      return true;
    } else if (dartRest - zwischenSumme < 1) {
      zwischenSumme = 0;
      zaehler = 0;
      clearWuerfe("PL");
      return false;
    }
  } else {
    if (split[0] == "D" && dartRestPL2 - zwischenSummePL2 == 0) {
      console.log("GewonnenPL2");
      zwischenSummePL2 = 0;
      averageZaehlerPL2++;
      dartRestPL2 = 0;
      handleStringErgebnise(ergString, "PL2");
      guiWon("PL2", 2);
      MasterHandlerPL2 = false;
      Masterhanlder = false;
      return true;
    } else if (dartRestPL2 - zwischenSummePL2 < 1) {
      zwischenSumme = 0;
      zaehler = 0;
      clearWuerfe("PL");
      return false;
    }
  }
  return false;
}

function guiWon(stringSp, player) {
  if (player === 1) {
    document.getElementById("average" + stringSp).innerText =
      getAverage(averageZaehlerPL2);
    document.getElementById("restWert" + stringSp).innerText = dartRest;
    document.getElementById("status" + stringSp).innerText = "Gewonnen";
  } else {
    document.getElementById("average" + stringSp).innerText =
      getAveragePL2(averageZaehlerPL2);
    document.getElementById("restWert" + stringSp).innerText = dartRestPL2;
    document.getElementById("status" + stringSp).innerText = "Gewonnen";
  }
}

function clearWuerfe(player) {
  document.getElementById("ergWurf1" + player).innerText = String("/");
  document.getElementById("ergWurf2" + player).innerText = String("/");
  document.getElementById("ergWurf3" + player).innerText = String("/");
}
