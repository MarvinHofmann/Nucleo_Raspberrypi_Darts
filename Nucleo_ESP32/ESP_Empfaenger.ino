#include <WiFi.h>                   // Bibliothek für Wifi Verbindungen
#include <HTTPClient.h>             // Bibliothek dass der ESP32 ein HTTPClient sein kann
#include <Arduino.h>                  
#include <Wire.h>                   // Bibliothek für I2C Kommunikation
#include <WireSlave.h>              // Bibliothekt für I2C Kommunikation mit dem ESP32

const char* ssid = "xxxx";                       // SSID des lokalen Wlans
const char* password = "xxxx";  // Passwort des lokalen Wlans
const char* host = "http://192.168.0.46:3443/";   // Host ID von Raspberry Pi
String url = "player1";                           // String url deklarieren
String urlExit = "exit";
int number = 0;                                   // Variable number deklarieren und mit 0 initialisieren 
int mul = 0;                                      // Variable mul deklarieren und mit 0 initialisieren 
int button = 1;                                   // buttonValue ist 1: Nicht gedrückt 0: gedrückt


#define SDA_PIN 21                                // Default Pin SDA beim ESP32
#define SCL_PIN 22                                // Default Pin SCL beim ESP32
#define I2C_SLAVE_ADDR 0x04                       // I2C Slave an Adresse 0x04

void receiveEvent(int howMany);                   // Prototyp der Funktion reciveEvent(): welche automatisch aufgerufen wird wenn es neue Daten auf der I2C Schnittstelle gibt

void setup(){ 
  Serial.begin(115200);                           // Serial starten für Output
  
  delay(10);                                      
  Serial.println(); 
  Serial.println(); 
  Serial.print("Connecting to "); 
  Serial.println(ssid); 
  
  WiFi.mode(WIFI_STA);                            // Wlan Mode auf WIFI_STA setzen
  WiFi.begin(ssid, password);                     // Mit Wlan verbinden starten 
  while (WiFi.status() != WL_CONNECTED){          // Solange noch nicht verbunden .... 
    delay(500); 
    Serial.print("."); 
  } 
  Serial.println(""); 
  Serial.println("WiFi connected"); 
  Serial.println("IP address: "); 
  Serial.println(WiFi.localIP()); 

  bool success = WireSlave.begin(SDA_PIN, SCL_PIN, I2C_SLAVE_ADDR);     // I2C Schnittstelle oeffnen
    if (!success) {                                                     // Falls Fehler auftritt diesen ausgeben
        Serial.println("I2C slave init failed");
        while(1) delay(100);
    }

    WireSlave.onReceive(receiveEvent);                                  // Anweisung das die receiveEvent Methode automatisch aufgerufen wird wenn neue Daten ankommen
 } 

void loop(){ 
  if(number != 0 && button == 1){                                                                   // Wenn number nicht 0 ist gibt es neue Daten welche an den Server übertragen werden müssen und Button nicht gedrueckt
    Serial.println("-----------------------");
    Serial.print("connecting to ");   
    Serial.println(host);               
    WiFiClient client;                                                                              // Wificlient erzeugen                                                                       
    const int httpPort = 3443;                                                                      // httpPort ist 3443
  
    Serial.print("Requesting URL: "); 
    Serial.println(url);  
    Serial.println(number);
    Serial.println(mul);
    
    String postData = " { \"numberPL1\": " + String(number) + ", \"mulPL1\": " + String(mul) + "}"; // JSON erstellen
    String address = host + url;
    
    HTTPClient http; 
    http.begin(address); 
    http.addHeader("Content-Type", "application/json");                                             // Daten posten 
    auto httpCode = http.POST(postData);                                                             
    Serial.println(httpCode);  
                                                                          
    String payload = http.getString();                                                               // HTTP return code, auf Antwort warten
    Serial.println(payload); 
    http.end();                                                                                      // HTTP Verbindung trennen 
    Serial.println("closing connection"); 
    Serial.println("-----------------------");
    
    number = 0;                                                                                      // number und mul mit Standardwerte belegen
    mul = 0;
  }
  if(button == 0){                                              // Wenn Button gedrueckt wurde, übermittle dies an Website                                          
    Serial.println("Sende Button");
  
    String postData = " { \"code\": " +String(0) + "}";
    String address = host + urlExit ;
   
    HTTPClient http;                                            // Wificlient erzeugen
    http.begin(address);                                        // httpPort ist 3443
    http.addHeader("Content-Type", "application/json"); 
    auto httpCode = http.POST(postData);                        // Daten posten 

    Serial.println(httpCode); 
    String payload = http.getString();                          // HTTP return code, auf Antwort warten
    Serial.println(payload); 
    http.end();                                                 // // HTTP Verbindung trennen 
    Serial.println("closing connection"); 
    Serial.println("-----------------------");
 
    button = 1;                                                 // Button wieder 1 (nicht gedrückt) setzen
  }
  
  WireSlave.update();                                           // Suchen ob es neue Daten im Input Buffer gibt wenn ja receiveEvent aufrufen
} 

void receiveEvent(int howMany){     // Methode um Daten die per I2C ankommen aus dem Input Buffer zu lesen
    Serial.println("I2C");
    mul = WireSlave.read();         // Erstes ankommendes Byte auslesen und in mul schreiben
    if(mul != 0){                   // Ist dieses ungleich Null wurden ein Dartwurf übermittelt
      WireSlave.read(); 
      number = WireSlave.read();
      Serial.print(mul);
      Serial.print(" ");
      Serial.println(number);
    }
    else{                           // Ist das erste Byte gleich null wurde ein aktiver Buttondruck übermittelt
      button = 0;                   // Button 0 setzen, er ist gedrückt
      Serial.println("Button = 0");
    }                               // Übertragung zuende
}
