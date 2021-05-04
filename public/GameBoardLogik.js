const ws = new WebSocket('ws://192.268.0.46:8080');

let averageZaehler = 0;
let zaehler = 0;
let zwischenSumme = 0;
let dartRest = 501;

let MasterHandler = true; // Wenn True darf gespielt werden wenn false Spiel vorbei

ws.addEventListener('open', () => {
    console.log("Client connected with server!")
});

ws.addEventListener('message', function (event){

  if(MasterHandler){
  const data = JSON.parse(event.data);
    
    zaehler++;
    
    if(zaehler === 6){
        handleZaehlerSechs(data, data.type);
    }

    switch (data.type) {
      case 'numberErgebnis':
        zwischenSumme += data.value;
        break;
  
      case 'stringErgebnis': 
        if(!checkIfWon(data.value)){
          handleStringErgebnise(data.value);
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

  function handleZaehlerSechs(data, type){
    //console.log("Zaheler = 6")
      
    switch (type) {
        case 'numberErgebnis':
          zwischenSumme += data.value;
          break;
    
        case 'stringErgebnis': 
          if(!checkIfWon(data.value)){
            handleStringErgebnise(data.value);
         }
         break;
    }
    dartRest -= zwischenSumme;
    document.getElementById("restWert").innerText = dartRest;

    zaehler = 0;
    //console.log('Zaehler' + zaehler);
    
    zwischenSumme = 0;
    //console.log('Zwischensumme' + zwischenSumme)

    averageZaehler++;

    document.getElementById("average").innerText = getAverage(averageZaehler);
  }

  function getAverage(count){
    return ((501 - dartRest) / count)
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