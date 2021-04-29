const ws = new WebSocket('ws://192.168.0.46:8080');

let zaehler = 0;
let zwischenSumme = 0;
let dartRest = 501;

ws.addEventListener('open', () => {
    console.log("Client connected with server!")
});

ws.addEventListener('message', function (event){
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
        handleStringErgebnise(data.value);
        break;

    default:
        // Unknown websocket message type
    }   
  });

  function handleStringErgebnise(data){
      switch(zaehler){
        case 2: document.getElementById("ergWurf1").innerText = String(data);
                //document.getElementById("ergWurf2").innerText = String('/');
                //document.getElementById("ergWurf3").innerText = String('/');
            break;
        case 4: document.getElementById("ergWurf2").innerText = String(data);
                
            break;
        
        case 6: document.getElementById("ergWurf3").innerText = String(data);
            break;
                     
      } 
  }

  function handleZaehlerSechs(data, type){
    console.log("Zaheler = 6")
    
    
    switch (type) {
        case 'numberErgebnis':
          zwischenSumme += data.value;
          break;
    
        case 'stringErgebnis': 
          handleStringErgebnise(data.value);
          break;
    }
    dartRest -= zwischenSumme;
    document.getElementById("restWert").innerText = dartRest;

    zaehler = 0;
    console.log('Zaehler' + zaehler);
    
    zwischenSumme = 0;
    console.log('Zwischensumme' + zwischenSumme)
  }