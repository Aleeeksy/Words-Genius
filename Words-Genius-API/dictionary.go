package dictionary

import (
	"github.com/Aleeeksy/Words-Genius/common"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/%s/%s"

func GetDictionaryData(responseWriter http.ResponseWriter, incomingRequest *http.Request) {
	body, err := ioutil.ReadAll(incomingRequest.Body)
	if err != nil {
		log.Printf("Error occured when reading request body")
		respondWithDictionaryError(responseWriter, nil)
	}
	if body == nil {
		log.Printf("Empty body")
		respondWithDictionaryError(responseWriter, nil)
	}

	var incomingRequestBodyData common.RequestBodyData
	if err := json.Unmarshal(body, &incomingRequestBodyData); err != nil {
		log.Printf("Error occured when reading request body")
		respondWithDictionaryError(responseWriter, nil)
	}

	dictionaryResponse, dictionaryResponseError := http.Get(prepareUrl(incomingRequestBodyData))
	if dictionaryResponseError != nil {
		log.Printf("Error occured during getting information from dictionary")
		respondWithDictionaryError(responseWriter, err)
	}

	dictionaryResponseBody, err := ioutil.ReadAll(dictionaryResponse.Body)
	if err != nil {
		log.Printf("Error occured when reading translation response body")
		respondWithDictionaryError(responseWriter, err)
	}
	if dictionaryResponseBody == nil {
		log.Printf("Empty body. No information found")
		respondWithDictionaryError(responseWriter, nil)
	}

	var dictionaryData []interface{}
	if err := json.Unmarshal(dictionaryResponseBody, &dictionaryData); err != nil {
		log.Printf("Error occured when reading dictionary response body")
		respondWithDictionaryError(responseWriter, nil)
	}

	response := common.Response{Data: common.ResponseData{Dictionary: dictionaryData[0]}}
	if err := json.NewEncoder(responseWriter).Encode(&response); err != nil {
		log.Printf("Error occured during sending response with dictionary data")
		respondWithDictionaryError(responseWriter, err)
	}
}

func prepareUrl(requestData common.RequestBodyData) string {
	return fmt.Sprintf(
		DICTIONARY_URL,
		requestData.SourceLanguage,
		requestData.Query,
	)
}

func respondWithDictionaryError(responseWriter http.ResponseWriter, err error) {
	errorDetails := common.ErrorDetails{Title: "No Definition Found", Message: "Sorry, we couldn't find definition for the word you were looking for."}

	common.RespondWithError(responseWriter, err, errorDetails)
}
