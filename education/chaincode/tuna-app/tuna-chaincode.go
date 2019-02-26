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
   Creater string `json:"creater"`
   PriHolder string `json:"priholder"`
   CrHolder string `json:"crholder"`
   Point string `json:"point"`
   Timestamp string `json:"timestamp"`
   Tx_id string `json:"tx_id"`
}

//get
func getHistory(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	type AuditHistory struct {
		TxId    string   `json:"txId"`
		Value   Marble   `json:"value"`
	}
	var history []AuditHistory;
	var marble Marble

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	marbleId := args[0]
	fmt.Printf("- start getHistoryForMarble: %s\n", marbleId)

	// Get History
	resultsIterator, err := stub.GetHistoryForKey(marbleId)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId                     //copy transaction id over
		json.Unmarshal(historyData.Value, &marble)     //un stringify it aka JSON.parse()
		if historyData.Value == nil {                  //marble has been deleted
			var emptyMarble Marble
			tx.Value = emptyMarble                 //copy nil marble
		} else {
			json.Unmarshal(historyData.Value, &marble) //un stringify it aka JSON.parse()
			tx.Value = marble                      //copy marble over
		}
		history = append(history, tx)              //add this tx to the list
	}
	fmt.Printf("- getHistoryForMarble returning:\n%s", history)

	//change to array of bytes
	historyAsBytes, _ := json.Marshal(history)     //convert to array of bytes
	return shim.Success(historyAsBytes)
}


//init
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
   return shim.Success(nil)
}


//invoke
func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
   function, args := stub.GetFunctionAndParameters()
   if function == "queryTuna" {
      return s.queryTuna(stub, args)
   // } else if function == "initLedger" {
   //    return s.initLedger(stub)
   } else if function == "recordTuna" {
      return s.recordTuna(stub, args)
   } else if function == "queryAllTuna" {
      return s.queryAllTuna(stub)
   } else if function == "changeTunaHolder" {
      return s.changeTunaHolder(stub, args)
   } else if function == "deleteTuna" {
      return s.deleteTuna(stub, args)
   } else if function == "gethistory" {
      return s.gethistory(stub, args)
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
   if len(args) != 4 {//이미지해쉬,크리에이터,타임스탬프, tx_id
         return shim.Error("Incorrect number of arguments. Expecting 4")
   }
   key = args[0]
   printf(key)
   printf(type(key))
   
   var tuna = Tuna{Creater: args[1], PriHolder: "", CrHolder: args[1], Point: "최초등록", Timestamp: args[2], Tx_id: args[3]}
   tunaAsBytes,_ := json.Marshal(tuna)
   
   err := stub.PutState(key, tunaAsBytes)
   if err != nil {
         return shim.Error(fmt.Sprintf("Failed to record tuna catch: %s", args[0]))
   }
   return shim.Success(nil)
}

// 이미지 거래 함수
func (s *SmartContract) tradeTuna(stub shim.ChaincodeStubInterface, args []string) peer.Response {
   if len(args) != 7 {//이미지해쉬,크리에이터,이전 소유자,현재 소유자,포인트,타임스탬프
         return shim.Error("Incorrect number of arguments. Expecting 7")
   }
   var tuna = Tuna{Creater: args[1], PriHolder: args[2], CrHolder: args[3], Point: args[4], Timestamp: args[5], Tx_id: args[6]}
   tunaAsBytes,_ := json.Marshal(tuna)
   
   err := stub.PutState(args[0], tunaAsBytes)
   if err != nil {
         return shim.Error(fmt.Sprintf("Failed to record tuna catch: %s", args[0]))
   }
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
//    var tuna = Tuna{ ImageHS: args[1], Creater: args[2], PriHolder: args[3], CrHolder: args[4], Point: "0", Timestamp: "201812121017", Tx_id: "BlockNumber"}
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
   endKey := "999"
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

// func (s *SmartContract) initLedger(stub shim.ChaincodeStubInterface) peer.Response {
//    tuna := []Tuna{
//       Tuna{Creater: "Hong", PriHolder: "Hong", CrHolder: "Hong", Point: "최초등록", Timestamp: "201812121017", Tx_id: "1"},
//       Tuna{Creater: "Kong", PriHolder: "Kong", CrHolder: "Kong", Point: "최초등록", Timestamp: "201812121018", Tx_id: "2"},
//       Tuna{Creater: "Pong", PriHolder: "Pong", CrHolder: "Pong", Point: "최초등록", Timestamp: "201812121019", Tx_id: "3"},
//       Tuna{ImageHS: "ABCDE4234", Creater: "Yong", PriHolder: "Yong", CrHolder: "Yong", Point: "최초등록", Timestamp: "201812121020", Tx_id: "4"},
//       Tuna{ImageHS: "ABCDE5234", Creater: "Qong", PriHolder: "Qong", CrHolder: "Qong", Point: "최초등록", Timestamp: "201812121021", Tx_id: "5"},
//       Tuna{ImageHS: "ABCDE6234", Creater: "Wong", PriHolder: "Wong", CrHolder: "Wong", Point: "최초등록", Timestamp: "201812121022", Tx_id: "6"},
//       Tuna{ImageHS: "ABCDE7234", Creater: "Eong", PriHolder: "Eong", CrHolder: "Eong", Point: "최초등록", Timestamp: "201812121023", Tx_id: "7"},
//       Tuna{ImageHS: "ABCDE8234", Creater: "Dong", PriHolder: "Dong", CrHolder: "Dong", Point: "최초등록", Timestamp: "201812121024", Tx_id: "8"},
//       Tuna{ImageHS: "ABCDE9234", Creater: "Song", PriHolder: "Song", CrHolder: "Song", Point: "최초등록", Timestamp: "201812121025", Tx_id: "9"},
//       Tuna{ImageHS: "ABCDE1034", Creater: "Bong", PriHolder: "Bong", CrHolder: "Bong", Point: "최초등록", Timestamp: "201812121026", Tx_id: "10"},
//    }

//    i := 0 
//    for i < len(tuna) {
//       fmt.Println("i is ", i)
//       tunaAsBytes, _ := json.Marshal(tuna[i]) // converted object, error
//       stub.PutState(strconv.Itoa(i+1), tunaAsBytes) // key, value
//       fmt.Println("Added", tuna[i])
//       i = i + 1
//    }

//    return shim.Success(nil)
// }


func main() {
   err := shim.Start(new(SmartContract))
   if err != nil {
      fmt.Printf("Error creating new Smart contract: %s", err)
   }
}
