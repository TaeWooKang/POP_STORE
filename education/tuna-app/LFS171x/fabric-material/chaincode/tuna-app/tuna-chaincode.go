package main

//bytes, json, formatting, string
//shim, peer

import (
   "fmt"
   "strconv"
   "bytes"
   "encoding/json"
   "github.com/hyperledger/fabric/core/chaincode/shim"
   "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Tuna struct {
   ImageHS string `json:"imagehs"`
   Creater string `json:"creater"`
   PriHolder string `json:"priholder"`
   CrHolder string `json:"crholder"`
   Point string `json:"point"`
   Timestamp string `json:"timestamp"`
   BlockNumber string `json:"blocknumber"`
}
var addTunaCount = 11;
//init
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
   return shim.Success(nil)
}


//invoke
func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
   function, args := stub.GetFunctionAndParameters()
   if function == "queryTuna" {
      return s.queryTuna(stub, args)
   } else if function == "initLedger" {
      return s.initLedger(stub)
   } else if function == "recordTuna" {
      return s.recordTuna(stub, args)
   } else if function == "queryAllTuna" {
      return s.queryAllTuna(stub)
   } else if function == "changeTunaHolder" {
      return s.changeTunaHolder(stub, args)
   } else if function == "deleteTuna" {
      return s.deleteTuna(stub, args)
   }
   return shim.Error("Invalid Smart Contract function name.")
}

// queryTuna

func (s *SmartContract) queryTuna(stub shim.ChaincodeStubInterface, args []string) peer.Response {
   if len(args) != 1 {
      return shim.Error("Incorrect number of arguments. Expecting 1")
   }
   tunaAsBytes,_:=stub.GetState(args[0])
   if tunaAsBytes == nil {
      return shim.Error("Could not locate tuna")
   }
   return shim.Success(tunaAsBytes)
}

// 최초 이미지 등록 수정필요
func (s *SmartContract) recordTuna(stub shim.ChaincodeStubInterface, args []string) peer.Response {
   if len(args) != 3 {//이미지해쉬,크리에이터,타임스탬프
         return shim.Error("Incorrect number of arguments. Expecting 3")
   }
   var tuna = Tuna{ ImageHS: args[0], Creater: args[1], PriHolder: "", CrHolder: args[1], Point: "최초등록", Timestamp: args[2], BlockNumber: strconv.Itoa(addTunaCount)}
   tunaAsBytes,_ := json.Marshal(tuna)
   
   err := stub.PutState(strconv.Itoa(addTunaCount), tunaAsBytes)
   if err != nil {
         return shim.Error(fmt.Sprintf("Failed to record tuna catch: %s", args[0]))
   }
   addTunaCount++;
   return shim.Success(nil)
}


// deleteTuna
func (s *SmartContract) deleteTuna(stub shim.ChaincodeStubInterface, args []string) peer.Response {
   if len(args) != 1 {
      return shim.Error("Incorrect number of arguments. Expecting 1")
   }
   err:=stub.DelState(args[0])
   if err != nil {
      return shim.Error("Could not locate tuna")
   }
   return shim.Success(nil)
}


// // recordTuna 예제 코드
// func (s *SmartContract) recordTuna(stub shim.ChaincodeStubInterface, args []string) peer.Response {
//    if len(args) != 5 {
//          return shim.Error("Incorrect number of arguments. Expecting 5")
//    }
//    var tuna = Tuna{ ImageHS: args[1], Creater: args[2], PriHolder: args[3], CrHolder: args[4], Point: "0", Timestamp: "201812121017", BlockNumber: "BlockNumber"}
//    tunaAsBytes, _ := json.Marshal(tuna)
//    err := stub.PutState(args[0], tunaAsBytes)
//    if err != nil {
//          return shim.Error(fmt.Sprintf("Failed to record tuna catch: %s", args[0]))
//    }
//    return shim.Success(nil)
// }

//queryAllTuna
func (s *SmartContract) queryAllTuna(stub shim.ChaincodeStubInterface) peer.Response {
   startKey := "0"
   endKey := strconv.Itoa(addTunaCount)
   resultsIterator, err := stub.GetStateByRange(startKey, endKey)
   if err != nil {
         return shim.Error(err.Error())
   }
   defer resultsIterator.Close()
   // buffer is a JSON array containing QueryResults
   var buffer bytes.Buffer
   buffer.WriteString("[")
   bArrayMemberAlreadyWritten := false
   for resultsIterator.HasNext() {
      queryResponse, err := resultsIterator.Next()
      if err != nil {
      return shim.Error(err.Error())
      }
      // Add a comma before array members, suppress it for the first array member
      if bArrayMemberAlreadyWritten == true {
         buffer.WriteString(",")
      }
      buffer.WriteString("{\"Key\":")
      buffer.WriteString("\"")
      buffer.WriteString(queryResponse.Key)
      buffer.WriteString("\"")
      buffer.WriteString(", \"Record\":")
      // Record is a JSON object, so we write as-is
      buffer.WriteString(string(queryResponse.Value))
      buffer.WriteString("}")
      bArrayMemberAlreadyWritten = true
   }
   buffer.WriteString("]")
   fmt.Printf("- queryAllTuna:\n%s\n", buffer.String())
   return shim.Success(buffer.Bytes())
}

// changeTunaHolder
func (s *SmartContract) changeTunaHolder(stub shim.ChaincodeStubInterface, args []string) peer.Response {
   if len(args) != 3 {
         return shim.Error("Incorrect number of arguments. Expecting 3")
   }
   tunaAsBytes, _ := stub.GetState(args[0])
   if tunaAsBytes == nil {
         return shim.Error("Could not locate tuna")
   }
   temptuna := Tuna{}
   json.Unmarshal(tunaAsBytes, &temptuna)
   // Normally check that the specified argument is a valid holder of tuna but here we are skipping this check for this example.
   temptuna.PriHolder = temptuna.CrHolder
   temptuna.CrHolder = args[1]
   temptuna.Point = args[2]
   tunaAsBytes, _ = json.Marshal(temptuna)
   err := stub.PutState(args[0], tunaAsBytes)
   if err != nil {
         return shim.Error(fmt.Sprintf("Failed to change tuna holder: %s", args[0]))
   }
   return shim.Success(nil)
}

func (s *SmartContract) initLedger(stub shim.ChaincodeStubInterface) peer.Response {
   tuna := []Tuna{
      Tuna{ImageHS: "ABCDE1234", Creater: "Hong", PriHolder: "Hong", CrHolder: "Hong", Point: "최초등록", Timestamp: "201812121017", BlockNumber: "1"},
      Tuna{ImageHS: "ABCDE2234", Creater: "Kong", PriHolder: "Kong", CrHolder: "Kong", Point: "최초등록", Timestamp: "201812121018", BlockNumber: "2"},
      Tuna{ImageHS: "ABCDE3234", Creater: "Pong", PriHolder: "Pong", CrHolder: "Pong", Point: "최초등록", Timestamp: "201812121019", BlockNumber: "3"},
      Tuna{ImageHS: "ABCDE4234", Creater: "Yong", PriHolder: "Yong", CrHolder: "Yong", Point: "최초등록", Timestamp: "201812121020", BlockNumber: "4"},
      Tuna{ImageHS: "ABCDE5234", Creater: "Qong", PriHolder: "Qong", CrHolder: "Qong", Point: "최초등록", Timestamp: "201812121021", BlockNumber: "5"},
      Tuna{ImageHS: "ABCDE6234", Creater: "Wong", PriHolder: "Wong", CrHolder: "Wong", Point: "최초등록", Timestamp: "201812121022", BlockNumber: "6"},
      Tuna{ImageHS: "ABCDE7234", Creater: "Eong", PriHolder: "Eong", CrHolder: "Eong", Point: "최초등록", Timestamp: "201812121023", BlockNumber: "7"},
      Tuna{ImageHS: "ABCDE8234", Creater: "Dong", PriHolder: "Dong", CrHolder: "Dong", Point: "최초등록", Timestamp: "201812121024", BlockNumber: "8"},
      Tuna{ImageHS: "ABCDE9234", Creater: "Song", PriHolder: "Song", CrHolder: "Song", Point: "최초등록", Timestamp: "201812121025", BlockNumber: "9"},
      Tuna{ImageHS: "ABCDE1034", Creater: "Bong", PriHolder: "Bong", CrHolder: "Bong", Point: "최초등록", Timestamp: "201812121026", BlockNumber: "10"},
   }

   i := 0 
   for i < len(tuna) {
      fmt.Println("i is ", i)
      tunaAsBytes, _ := json.Marshal(tuna[i]) // converted object, error
      stub.PutState(strconv.Itoa(i+1), tunaAsBytes) // key, value
      fmt.Println("Added", tuna[i])
      i = i + 1
   }

   return shim.Success(nil)
}


func main() {
   err := shim.Start(new(SmartContract))
   if err != nil {
      fmt.Printf("Error creating new Smart contract: %s", err)
   }
}
