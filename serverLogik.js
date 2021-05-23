//Init Websocket Server
const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 8080 }); // abgespilteter WS Server auf anderem Port

//Init Express Server
const express = require('express');
const app = express();
//Init Port
const port = 3443;
//Init BodyParser
let bodyParser = require('body-parser');
app.use(bodyParser.json());
//Suche in Ordner Public nach index.html und starte
app.use(express.static('public'));
//Höre auf Port:
app.listen(port, () => {
  console.log(`App listening at http://raspberrypi:${port}`) // Publisher Server auf Port 3443
});

//Globale Variablen
let incomingNumbPL1 = 0;
let mulPL1 = 0;
let ergebnisPL1 = 0;
let stringErgebnisPL1;
//Globale Variablen Player Two
let incomingNumbPL2 = 0;
let mulPL2 = 0;
let ergebnisPL2 = 0;
let stringErgebnisPL2;

/**
 * Exit Post request für verworfenen Dartpfeil
 * wird durch Button druck an Nucleo ausgelöst
 */
app.post('/exit', function (req, res) {
  console.log("Exit Request")
  console.log(req.body.code);
  broadcast(req.body.code,"-");
  res.send("Exit erhalten");
});

/**
 * Behandelt die eingehende Anfrage des ersten Spielers
 * hier wird der Wert errechnet, den der Spieler geworfen hat, sowie das Ergebnis als String.
 * Anschließend werden die daten mittels der broadcast() Funktion an die Clients übergeben
 */
app.post('/player1', function (req, res) {
    incomingNumbPL1 = req.body.numberPL1;
    mulPL1 = req.body.mulPL1;
    ergebnisPL1 = mulPL1 * incomingNumbPL1;
    //Ermittle Double/Tripple/Single
    stringErgebnisPL1 = ermittleFeld(incomingNumbPL1, mulPL1);
    console.log(stringErgebnisPL1);
    //verteile Ergebnis
    broadcast(ergebnisPL1, stringErgebnisPL1, "1");
    //Antwort Server
    res.send("Kam an Ergebnis: " + stringErgebnisPL1);
});

/**
 * Behandelt die eingehende Anfrage des zweiten Spielers
 * hier wird der Wert errechnet, den der Spieler geworfen hat, sowie das Ergebnis als String.
 * Anschließend werden die daten mittels der broadcast() Funktion an die Clients übergeben
 */
app.post('/player2', function (req, res) {
  incomingNumbPL2 = req.body.numberPL2;
  mulPL2 = req.body.mulPL2;
  ergebnisPL2 = mulPL2 * incomingNumbPL2;
  //Ermittle Double/Tripple/Single
  stringErgebnisPL2 = ermittleFeld(incomingNumbPL2, mulPL2);
  console.log(stringErgebnisPL2);
  //verteile Ergebnis
  broadcast(ergebnisPL2, stringErgebnisPL2, "2");
  //Antwort Server
  res.send("Kam an Ergebnis: " + stringErgebnisPL2);
});

//Macht meldung, wenn ein Client connected oder disconnected
wss.on("connection", ws => {
    console.log("Client connected!");
    ws.on("close", data => {
      console.log("Client has disconnceted");
    })
});

/**
 * Sendet die Daten an alle Clients als JSON
 * @param {*} numberErgebnis ist das Ergebnis des Wurfs aus (multiplikator * Feld)
 * @param {*} stringErgebnis ist der Wurd des Spielers mit Multiplikator als String 
 * @param {*} player ist der Spieler, entweder 1 oder 2 
 */
function broadcast(numberErgebnis, stringErgebnis, player) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'numberErgebnis' + player, value: numberErgebnis}));
        client.send(JSON.stringify({ type: 'stringErgebnis' + player, value: stringErgebnis }));
      }
    });
}
/**
 * @param {*} number ist die Geworfene Nummer
 * @param {*} mul ist der Multiplikator (single = 1, double = 2, tripple = 3)
 * @returns Kombinierter String aus Geworfener Nummer und Multiplikator um schöne ausgabe zu erzeugen
 */
function ermittleFeld(number, mul){
    switch(mul){
        case 1: return String('S' + number);
        
        case 2: return String('D' + number);

        case 3: return String('T' + number);
    }
}
