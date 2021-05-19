const ws = new WebSocket('ws://192.168.0.46:8080');

let averageZaehler = 0;
let zaehler = 0;
let zwischenSumme = 0;
let dartRest = 501;

let averageZaehlerPL2 = 0;
let zaehlerPL2 = 0;
let zwischenSummePL2 = 0;
let dartRestPL2 = 501;

let MasterHandler = true; // Wenn True darf gespielt werden wenn false Spiel vorbei
let MasterhanlderTwo = false;
ws.addEventListener('open', () => {
    console.log("Client connected with server!")
});

ws.addEventListener('message', function (event){

  if(MasterHandler){
  MasterhanlderTwo = false;
  console.log('Spieler 1 spielt');
  const data = JSON.parse(event.data);
  
    zaehler++;
    
    if(zaehler === 6){
        handleZaehlerSechs(data, data.type);
    }

    switch (data.type) {
      case 'numberErgebnis1':
        zwischenSumme += data.value;
        break;
  
      case 'stringErgebnis1': 
        if(!checkIfWon(data.value)){
          handleStringErgebnise(data.value);
        }
        break;
        

    default:
        // Unknown websocket message type
    }     
  }else if(MasterhanlderTwo){
    Masterhanlder = false;
    console.log('Spieler 2 spielt');
    const data = JSON.parse(event.data);
    
    zaehlerPL2++;
    
    if(zaehlerPL2 === 6){
        handleZaehlerSechsPL2(data, data.type);
    }

    switch (data.type) {
      case 'numberErgebnis2':
        zwischenSummePL2 += data.value;
        break;
  
      case 'stringErgebnis2': 
        if(!checkIfWonPL2(data.value)){
          handleStringErgebnisePL2(data.value);
        }
        break;
        

    default:
        // Unknown websocket message type
    }
  }   
  });

  function handleStringErgebnise(data){
      switch(zaehler){
        case 2: document.getElementById("ergWurf1").innerText = String(data);
                document.getElementById("ergWurf2").innerText = String('/'); //Setzte felder zurück
                document.getElementById("ergWurf3").innerText = String('/');
            break;
        case 4: document.getElementById("ergWurf2").innerText = String(data);
                
            break;
        
        case 6: document.getElementById("ergWurf3").innerText = String(data);
            break;
                     
      } 
  }

  function handleStringErgebnisePL2(data){
    switch(zaehlerPL2){
      case 2: document.getElementById("ergWurf1PL2").innerText = String(data);
              document.getElementById("ergWurf2PL2").innerText = String('/'); //Setzte felder zurück
              document.getElementById("ergWurf3PL2").innerText = String('/');
          break;
      case 4: document.getElementById("ergWurf2PL2").innerText = String(data);
              
          break;
      
      case 6: document.getElementById("ergWurf3PL2").innerText = String(data);
          break;
                   
    } 
}

  function handleZaehlerSechs(data, type){
    console.log("Zaheler = 6 PL1")
      
    switch (type) {
        case 'numberErgebnis1':
          zwischenSumme += data.value;
          break;
    
        case 'stringErgebnis1': 
          if(!checkIfWon(data.value)){
            handleStringErgebnise(data.value);
         }
         break;
    }
    dartRest -= zwischenSumme;
    document.getElementById("restWert").innerText = dartRest;

    zaehler = 0;
       
    zwischenSumme = 0;

    averageZaehler++;

    document.getElementById("average").innerText = getAverage(averageZaehler);

    MasterHandler = false;
    MasterhanlderTwo = true;
  }

  function handleZaehlerSechsPL2(data, type){
    console.log("Zaheler = 6 PL2")
      
    switch (type) {
        case 'numberErgebnis2':
          zwischenSummePL2 += data.value;
          break;
    
        case 'stringErgebnis2': 
          if(!checkIfWonPL2(data.value)){
            handleStringErgebnisePL2(data.value);
         }
         break;
    }
    dartRestPL2 -= zwischenSummePL2;
    document.getElementById("restWertPL2").innerText = dartRestPL2;

    zaehlerPL2 = 0;
    //console.log('Zaehler' + zaehler);
    
    zwischenSummePL2 = 0;
    //console.log('Zwischensumme' + zwischenSumme)

    averageZaehlerPL2++;

    document.getElementById("averagePL2").innerText = getAveragePL2(averageZaehlerPL2);
    MasterHandler = true;
    MasterhanlderTwo = false;
  }

  function getAverage(count){
    return ((501 - dartRest) / count)
  }

  function getAveragePL2(count){
    return ((501 - dartRestPL2) / count)
  }

  function checkIfWon(uebergebenerString){
    split = Array.from(uebergebenerString); //Split von String in Char Array zur Überprüfung auf Double 
    if(split[0] == 'D' && dartRest - zwischenSumme == 0){
      //Wenn Aktueller Ergebnis 0 und der Pfeil in Doppel Feld ist das Spiel beendet
      console.log('Gewonnen');
      zwischenSumme=0;
      averageZaehler++;
      handleStringErgebnise(uebergebenerString);
      document.getElementById("average").innerText = getAverage(averageZaehler);
      dartRest=0;
      document.getElementById("restWert").innerText = dartRest;
      document.getElementById("status").innerHTML = 'Gewonnen';
      MasterHandler = false;
      MasterhanlderTwo = false;
      return true;
    }else if(dartRest - zwischenSumme <=0 || dartRest -zwischenSumme == 1){
      //Wenn das Ergebnis kleiner null oder 1 ist dann ist nicht Gewonnen sondern überworfen
      zwischenSumme = 0;
      document.getElementById("ergWurf1").innerText = String('/');
      document.getElementById("ergWurf2").innerText = String('/'); //Setzte felder zurück
      document.getElementById("ergWurf3").innerText = String('/');
      zaehler=0;
      console.log('nicht gewonnen und Wert kleiner 0');
      document.getElementById("status").innerHTML = 'Überworfen';
      return false;
    }
  }

  function checkIfWonPL2(uebergebenerString){
    split = Array.from(uebergebenerString); //Split von String in Char Array zur Überprüfung auf Double 
    if(split[0] == 'D' && dartRestPL2 - zwischenSummePL2 == 0){
      //Wenn Aktueller Ergebnis 0 und der Pfeil in Doppel Feld ist das Spiel beendet
      console.log('GewonnenPL2');
      zwischenSummePL2=0;
      averageZaehlerPL2++;
      handleStringErgebnisePL2(uebergebenerString);
      document.getElementById("averagePL2").innerText = getAveragePL2(averageZaehlerPL2);
      dartRest=0;
      document.getElementById("restWertPL2").innerText = dartRest;
      document.getElementById("statusPL2").innerHTML = 'Gewonnen';
      MasterHandlerPL2 = false;
      Masterhanlder =false;
      return true;
    }else if(dartRest - zwischenSumme <=0 || dartRest -zwischenSumme == 1){
      //Wenn das Ergebnis kleiner null oder 1 ist dann ist nicht Gewonnen sondern überworfen
      zwischenSumme = 0;
      document.getElementById("ergWurf1PL2").innerText = String('/');
      document.getElementById("ergWurf2PL2").innerText = String('/'); //Setzte felder zurück
      document.getElementById("ergWurf3PL2").innerText = String('/');
      zaehler=0;
      console.log('nicht gewonnen und Wert kleiner 0 PL2');
      document.getElementById("statusPL2").innerHTML = 'Überworfen';
      return false;
    }
  }
  