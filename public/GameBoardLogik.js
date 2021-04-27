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

    if(zaehler == 3){
        document.getElementById("restWert").innerText = dartRest - zwischenSumme ;
        zaehler = 0;
        zwischenSumme = 0;
    }
    
  });

  function handleStringErgebnise(data){
      switch(zaehler){
        case 1: document.getElementById("ergWurf1").innerText = String(data);
                document.getElementById("ergWurf2").innerText = String('/');
                document.getElementById("ergWurf3").innerText = String('/');
            break;
        case 2: document.getElementById("ergWurf2").innerText = String(data);
                document.getElementById("ergWurf3").innerText = String('/');
            break;
        
        case 3: document.getElementById("ergWurf3").innerText = String(data);
            break;
                     
      } 
  }