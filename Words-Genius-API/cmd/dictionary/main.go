package main

import (
	"github.com/Aleeeksy/Words-Genius"
	"log"
	"net/http"
)

func handleRequest() {
	http.HandleFunc("/", dictionary.GetDictionaryData)

	log.Fatal(http.ListenAndServe(":5000", nil))
}

func main() {
	handleRequest()
}
