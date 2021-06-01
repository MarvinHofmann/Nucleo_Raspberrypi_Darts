#include <Arduino.h>
#include <Wire.h>               // Bibliothek für I2C Kommunikation
#include <WirePacker.h>         // Bibliothekt für I2C Kommunikation mit dem ESP32

#define I2C_SLAVE_ADDR 0x04     // I2C Slave an Adresse 0x04

const int dartscheibe[8][8] = {             // Wert des Wurfs: Multipliziert
      {1,   18, 8,  4,  12, 36, 12, 24},    // 0,x
      {50,  25, 26, 13, 39, 27, 9,  18},    // 1,x
      {3,   54, 12, 6,  18, 42, 14, 28},    // 2,x
      {60,  15, 20, 10, 30, 33, 11, 22},    // 3,x
      {20,  5,  30, 15, 45, 24, 8,  16},    // 4,x
      {40,  10, 4,  2,  6,  48, 16, 32},    // 5,x
      {2,   36, 34, 17, 51, 21, 7,  14},    // 6,x
      {0 ,  0,  6,  3,  9,  57, 19, 38}};   // 7,x

const int multi[8][8] = {                   // Single: 1, Double: 2, Tripple: 3
      {1, 1, 2, 1, 3, 3, 1, 2},             // 0,x
      {2, 1, 2, 1, 3, 3, 1, 2},             // 1,x
      {3, 3, 2, 1, 3, 3, 1, 2},             // 2,x
      {3, 3, 2, 1, 3, 3, 1, 2},             // 3,x
      {1, 1, 2, 1, 3, 3, 1, 2},             // 4,x
      {2, 2, 2, 1, 3, 3, 1, 2},             // 5,x
      {2, 2, 2, 1, 3, 3, 1, 2},             // 6,x
      {0 ,0, 2, 1, 3, 3, 1, 2}};            // 7,x

const int feld[8][8] = {                    // Feld 
      {1,   18, 4,  4,  4, 12, 12, 12},     // 0,x
      {25,  25, 13, 13, 13, 9, 9,  9},      // 1,x
      {1,   18, 6, 6,  6, 14, 14, 14},      // 2,x
      {20,  5, 10, 10, 10, 11, 11, 11},     // 3,x
      {20,  5,  15, 15, 15, 8, 8,  8},      // 4,x
      {20,  5, 2,  2,  2,  16, 16, 16},     // 5,x
      {1,   18, 17, 17, 17, 7, 7,  7},      // 6,x
      {0 ,  0,  3,  3,  3,  19, 19, 19}};   // 7,x

      
int matrixInput[] = {13, 12, 11, 10, 9, 8, 7, 6};   // maxtrixInput an Pins: 13,12,11,10,9,8,7,6
int matrixOutput[] = {A1, 4, 3, 2, A5, A4, A3, A2}; // matrixOutput an Pins: A1,4,3,2,A5,A4,A3,A2
String zielFeld;                                    // String mit Format (j,i) 
int wertWurf;                                       // Wert des Wurfs schon multipliziert
int number;                                         // Einfacher Wert des Felds 
int mul;                                            // Multiplikator des Felds
int button = A0;                                    // Button an Pin A0

void setup(){
    Serial.begin(115200);                           // Serial starten für Output
    Wire.begin();                                   // I2C Bus starten
    Serial.println("Start");
    pinMode(button, INPUT);                         // Button ist Input
    for(int i = 0; i < 8; i++){                     // matrixOutput ist Input_Pullup des Nucleo Boards 
        pinMode(matrixOutput[i], INPUT_PULLUP);     
    }
    for(int i = 0; i < 8; i++){                     // matrixInput ist Output des Nucleo Boards und matrixInput HIGH setzen
       pinMode(matrixInput[i], OUTPUT);         
       digitalWrite(matrixInput[i], HIGH);     
    } 
}

void loop(){
    wertWurf = 0;                                         // Alle Variablen auf Standartwert setzen
    mul = 0;
    number = 0;
    zielFeld = "";
                                                          // Sensoren der Dartscheibe auswerten
    for(int i = 0; i < 8; i++){                           // for-Schleife für maxtrixInput
        digitalWrite(matrixInput[i], LOW);                // matrixInput an der jetzigen Stelle LOW setzen
        for(int j = 0; j < 8; j++){                       // for-Schleife für maxtrixOutput
            if(digitalRead(matrixOutput[j]) == LOW){      // Wenn maxtrixOutput an der jetzigen Stelle auch LOW ist besteht ein Kontakt zwischen den beiden Matrixen -> Feld getroffen          
                zielFeld = String(j) + "," + String(i);   // zielFeld String zuweisen zum debuggen
                Serial.println(zielFeld); 
                wertWurf = dartscheibe[j][i];             // wertWurf zuweisen
                number = feld[j][i];                      // number zuweisen
                mul = multi[j][i];                        // mul zuweisen
                Serial.print(wertWurf); 
                Serial.print(" = ");
                Serial.print(mul);
                Serial.print(" * ");
                Serial.println(number);                
                delay(500);                               // Kurze Verzögerung um zu gewährleisten das jeder Treffer nur einmal gewertet wird             
                break;             
            }         
        }         
        digitalWrite(matrixInput[i], HIGH);              // matrixInput an der jetzigen Stelle HIGH setzen   
    } 
    
    if (wertWurf != 0) {                          // wenn wertWurf nicht Null dann wurde ein Feld getroffen und dieses soll übermittelt werden
        Serial.println("Starte I2C");
        WirePacker packer;                        // WirePacker deklarieren             
        packer.write(mul);                        // Format: mul.number in packer schreiben
        packer.write(".");
        packer.write(number);
        packer.end();                             // Nach dem alle Daten hinzugefuegt wurden, packet schließen          

        Wire.beginTransmission(I2C_SLAVE_ADDR);   // Uebertragung starten
        while (packer.available()) {              // schreibe jedes packer byte in Output Buffer           
            Wire.write(packer.read());
        }
        Wire.endTransmission();                   // Uebertragung stoppen           
        delay(500);                               // Kurz Warten
    }

    if(digitalRead(button) == LOW){               // Wenn Button gedrückt, dann übermittle die Zahl 0
        Serial.println("Starte I2C Button");
        WirePacker packer;                        // WirePacker deklarieren           
        packer.write(0);                          // 0 in packer schreiben
        packer.end();                             // Nach dem alle Daten hinzugefuegt wurden, packet schließen          t

        Wire.beginTransmission(I2C_SLAVE_ADDR);   // Uebertragung starten        
        while (packer.available()) {              // schreibe jedes packet byte in Output Buffer            
            Wire.write(packer.read());
        }
        Wire.endTransmission();                   // Uebertragung stoppen          
        delay(500);                               // Kurz Warten, um nicht mehrfach zu senden 
    }
}
