package common

import (
	"encoding/json"
	"log"
	"net/http"
)

type RequestBodyData struct {
	Query          string `json:"q"`
	SourceLanguage string `json:"source"`
	TargetLanguage string `json:"target"`
	Format         string `json:"format"`
}

type Response struct {
	Data ResponseData `json:"data"`
}

type ResponseData struct {
	Error *ErrorDetails `json:"error,omitempty"`
	Dictionary interface{} `json:"dictionary,omitempty"`
}

type ErrorDetails struct {
	Code    int    `json:"code,omitempty"`
	Title   string `json:"title,omitempty"`
	Message string `json:"message,omitempty"`
}

func RespondWithError(responseWriter http.ResponseWriter, err error, errorDetails ErrorDetails) {
	errorDetails.Code = http.StatusNotFound

	response := Response{ResponseData{Error: &errorDetails}}
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(&response); err != nil {
		log.Printf("Error occured during sending error response")
		panic(err)
	}

	panic(err)
}
