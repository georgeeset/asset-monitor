#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>
#include "deviceLoginData.h"  // contains hidden function for access control


// Define software serial pins for sim800
SoftwareSerial oneSerial(7, 6); //rx, tx

// Data wire is connected to pin10 on the Arduino Nano
const int oneWireBus = 10;

// Setup a oneWire instance to communicate with any OneWire devices

OneWire oneWire(oneWireBus);

// Pass oneWire reference to Dallas Temperature sensor

DallasTemperature tempSensor(&oneWire);

void setup(){
  /**
  * setup - configure hardware and libraries used
  * retun: void
  */

  // Start serial communication for printing results
  oneSerial.begin(9600);
  Serial.begin(9600);

  tempSensor.setPullupPin(10);
  // Start up the library
  tempSensor.begin();
  oneSerial.println("waiting sim ...");
  delay(1000);
}

bool sayHi(){
  /**
  * sayHi: first message sent to gsm module
  * 
  * Eeturn: void
  */

  byte gsmResponseBuffer[16];
  int sizeCount = 0;
  
  byte expected[] = {13,10,79,75,13,10};

  Serial.println("ATE0"); // Disable echo
  Serial.println("AT"); // Say hello
  delay(300);
  sizeCount = Serial.available();
  if (sizeCount){
    Serial.readBytes(gsmResponseBuffer, sizeCount);
    // oneSerial.write(gsmResponseBuffer, sizeCount);
    // return Serial.find(expected);
  }
  // oneSerial.print(memcmp(gsmResponseBuffer, expected, sizeCount - 1));
  // for (int i = 0; i < sizeCount; i++){
  //   oneSerial.print(gsmResponseBuffer[i]);
  //   oneSerial.print(',');
  // }
  // oneSerial.print('\n');

  return (memcmp(gsmResponseBuffer, expected, sizeCount - 1) == 0);
}

void clearBuffer(){
  /**
  * clearBuffer - clears the serial buffer by reading/clocking out data
  * Return: void
  */

  while(Serial.available() > 0) {
    char t = Serial.read();
  }
}

bool waitResponse(byte response[], int maxWaitTime, bool printOutput = false){
  /**
  * waitResponse - waits for a pre-defined byte array for a given period of time 
  * 
  * @response: expected byte array to receive on serial
  * @maxWaitTime: maximum time of expected responsce to arrive in seconds
  * @printOputput: True if you want the actual responce to be printed
  *
  * return: True if all of response is in data received serial data, else false
  */

  byte responseBuffer[64];
  int sizeCount = 0;
  int waitTime = 0;
  int i, j = 0;
  int found = 0;
  // delay(1000);

  for (waitTime = 0; ((waitTime < maxWaitTime) && (sizeCount <= 0)); waitTime ++){
    delay(1000); // delay one second
    sizeCount = Serial.available();
  }
  if (waitTime >= maxWaitTime){
    oneSerial.println("time out occured");
    return false;  // return timeout
  }
  Serial.readBytes(responseBuffer, sizeCount);
  if (printOutput){
    oneSerial.write(responseBuffer, sizeCount);
    // oneSerial.println(sizeCount);
  }
  // oneSerial.println(sizeCount);
  for (i = 0; i < 16; i ++){
    if (responseBuffer[i] == response[found]){
      found ++;
      if (response[found] == '\0')
        return true; // expected response found
    }
    else{
      if (found > 0){
        oneSerial.println("mismatch found");
        return false; //result no match
      }
    }
  }
  return false;
}


bool oneWayMessage(char commandString[], char response[], int maxWaitTime = 3, bool printOutput = false){
  /**
  * sendMessage: executes serial print to gsmModule
  *
  * @commandString: string containing the command
  * @response: string containing the expected response
  * @maxWaitTime: in seconds max wait time for response
  *               form module
  * Return: bool True if message response is same as received data, or false
  */
  clearBuffer();
  Serial.println(commandString);
  return waitResponse(response, maxWaitTime, printOutput);
}



void publishMsg(float data){
  /**
  * publishMsg - implement mqtt data format for sending
  *              data to mqtt channel
  * @data: float data expected to be sent in publish payload
  * Return: void
  */

  char result[10];
  dtostrf(data, 5, 2, result);

  //index 4 start of channel name end in index 0x31
  byte publishPacket[62] = {0x30, 66, 0, 49, 'E', 's', 'e', 't',
  'A', 'u', 't', 'o', 'm', 'a', 't', 'i', 'o', 'n', '/', 'L', 'a', 'g',
  'o', 's', '/', 'U', 't', 'i', 'l', 'i', 't', 'y', '/', 'A', 'H', 'U',
  '/', 'v', 'i', 'b', 'r', 'a', 't', 'i', 'o', 'n', '/', '4', '3', '3',
  '2', 'w', 'z', '{', 0x22, 'v', 'a', 'l', 'u', 'e', 0x22, ':'}; //60 + 2

  Serial.write(publishPacket, 62);  // 62

  Serial.write(result, 5);  // 5

  Serial.write('}'); // 1
  Serial.write(0x1A); //end
  // Serial.write('\n');
}


void loop(){
  /**
  * loop -  forever loop
  */
  bool response = false;

  // Call requestTemperatures() to issue a global temperature request
  tempSensor.requestTemperatures();

  byte okResponse[] = "OK\0"; //OK
  char atMessage[] = "AT";
  byte pushConfig[] = "AT+CIICR";
  byte getIP[] = "AT+CIFSR";
  byte connectOk[] = "CONNECT OK\0";
  char ipResponse[] = ".\0";
  char sendRdy[] = ">\0";
  byte sendCip[] = "AT+CIPSEND";
  byte sendOk[] = "SEND OK";

  // Get the temperature in Celsius from the first sensor on the wire
  float temperatureC = tempSensor.getTempCByIndex(0);

  // Print the temperature to serial monitor
  // oneSerial.print("Temperature: ");
  // oneSerial.println(temperatureC);

  while(1){// while(!sayHi());

  do {
    Serial.println("ATE0"); // Disable echo
    oneSerial.print("retry");
  } while(!oneWayMessage(atMessage, okResponse, 3, true));
  oneSerial.println("Hi message pass");

  // oneSerial.println("setting gprs");
  if (oneWayMessage(apnMessage, okResponse) == 1){
    oneSerial.println("gprs set");
  }

  bool vie = oneWayMessage(pushConfig, okResponse, 6);
  if (vie == 1){
    oneSerial.println("config pushed");
  }
  else{
    oneSerial.println("confg push fail");
  }

  vie = oneWayMessage(getIP, ipResponse, 3, true);
  if (vie){
    oneSerial.println("Ip was given");
  }
  else{
    oneSerial.println(vie);
  }

  delay(500);
  vie = oneWayMessage(connectAddress, okResponse, 30, true);
  if (vie){
    oneSerial.println("connection established");
  }
  else{
    oneSerial.println("connection failed");
  }

  vie = waitResponse(okResponse, 3, true );
  if (vie){
    oneSerial.println("connect OK received");
  }

  delay(500);
  vie = oneWayMessage(sendCip, sendRdy, 10, true);
  if (vie){
    oneSerial.println("ready to collect data");
    delay(400);
  }
  else{
    oneSerial.println("not ready to accept data");
    delay(400);
    while(!oneWayMessage("AT+CIPSHUT", "SHUT OK", 5, true));
    continue;
  }

  connectMQTT();
  publishMsg(temperatureC);
  // sendTestMsg();


  vie = waitResponse(sendOk, 60, true);
  if (vie){
    oneSerial.print("message Sent");
  }
  else{
    oneSerial.println("send ok not received");
    while(!oneWayMessage("AT+CIPSHUT", "SHUT OK", 5, true));
    continue;
  }
  for (int i = 0; i < 20; i++){
    delay(1000); //few seconds delay before sending next data

    vie = oneWayMessage(sendCip, sendRdy, 10, true);
    if (vie){
      oneSerial.println("ready to collect data");
    }
    else{
      oneSerial.println("not ready for data");
      delay(400);
      while(!oneWayMessage("AT+CIPSHUT", "SHUT OK", 10, true));
      break;
    }

    tempSensor.requestTemperatures();
    temperatureC = tempSensor.getTempCByIndex(0);

    publishMsg(temperatureC);

    vie = waitResponse(sendOk, 60, true);
    if (vie){
      oneSerial.print("message Sent");
    }
    else{
      oneSerial.print("sendOk not received");
      break;
    }
  }

  delay(5000);

  // disconnect current network activity
  while (!oneWayMessage("AT+CIPSHUT", "SHUT OK", 5, true));

  // while(1);
  }

}
