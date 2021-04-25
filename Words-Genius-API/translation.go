package dictionary

import (
	"bytes"
	"github.com/Aleeeksy/Words-Genius/common"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

const TRANSLATION_URL = "https://translation.googleapis.com/language/translate/v2"

func Translate(responseWriter http.ResponseWriter, incomingRequest *http.Request) {
	path := incomingRequest.URL.Path

	body, err := ioutil.ReadAll(incomingRequest.Body)
	if err != nil {
		log.Printf("Error occured when reading request body")
		respondWithTranslationError(responseWriter, nil)
	}
	if body == nil {
		log.Printf("Empty body")
		respondWithTranslationError(responseWriter, nil)
	}

	translationRequest, translationRequestError := http.NewRequest("POST", TRANSLATION_URL+path, bytes.NewBuffer(body))
	if translationRequestError != nil {
		log.Printf("Error occured during creating translation request")
		respondWithTranslationError(responseWriter, translationRequestError)
	}

	translationResponse, err := prepareAndSendTransactionRequest(translationRequest)
	if err != nil {
		log.Printf("Error occured during translation")
		respondWithTranslationError(responseWriter, err)
	}

	translationResponseBody, err := ioutil.ReadAll(translationResponse.Body)
	if err != nil {
		log.Printf("Error occured when reading translation response body")
		respondWithTranslationError(responseWriter, err)
	}

	if _, err := responseWriter.Write(translationResponseBody); err != nil {
		log.Printf("Error occured during sending response with translation data")
		respondWithTranslationError(responseWriter, err)
	}
}

func respondWithTranslationError(responseWriter http.ResponseWriter, err error) {
	errorDetails := common.ErrorDetails{Title: "No Translation Found", Message: "Sorry, we couldn't find translation for the word you were looking for."}

	common.RespondWithError(responseWriter, err, errorDetails)
}

func prepareAndSendTransactionRequest(translationRequest *http.Request) (*http.Response, error) {
	translationRequest.Header.Set("Content-Type", "application/json")
	queryValues := translationRequest.URL.Query()
	queryValues.Add("key", getApiKey())
	translationRequest.URL.RawQuery = queryValues.Encode()

	client := &http.Client{}

	return client.Do(translationRequest)
}

func getApiKey() string {
	log.Printf(os.Getenv("TRANSLATION_API_KEY"))
	return os.Getenv("TRANSLATION_API_KEY")
}