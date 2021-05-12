const TRANSLATION_URL = "https://europe-west3-words-genius.cloudfunctions.net/translation"
const DICTIONARY_URL = "https://europe-west3-words-genius.cloudfunctions.net/dictionary"
const TRANSLATION_ERROR_TITLE = "Translation Error";
const TRANSLATION_ERROR_MSG = "Error occurred when we try to find a word translation for You.";
const NO_TRANSLATION_TITLE = "No Translation Found";
const NO_TRANSLATION_MSG = "Sorry, we couldn't find translation for this word";
const DEFINITION_ERROR_TITLE = "Definition Error";
const DEFINITION_ERROR_MSG = "Error occurred when we try to find a word definition for You.";
const NO_DEFINITION_TITLE = "No Definition Found";
const NO_DEFINITION_MSG = "Sorry, we couldn't find definition for this word";

browser.runtime.onMessage
    .addListener((request, sender, sendResponse) => getWordInformation(request, sendResponse))

function getWordInformation(request, sendResponse) {
    getLanguages().then(({language, translationLanguage}) => {
        const wordDictionary = fetch(DICTIONARY_URL, {
            method: 'POST',
            credentials: 'omit',
            headers: prepareHeaders(),
            body: JSON.stringify(prepareDictionaryRequestBody(request.word, language.key))
        }).then(response => handleDictionaryResponse(response));

        const wordTranslation = fetch(TRANSLATION_URL, {
            method: 'POST',
            credentials: 'omit',
            headers: prepareHeaders(),
            body: JSON.stringify(prepareTranslationRequestBody(request.word, language.key, translationLanguage.key))
        }).then(response => handleTranslationResponse(response));

        Promise.all([wordDictionary, wordTranslation])
            .then(results => ({...results[0], ...results[1]}))
            .then(data => sendResponse({data}));
    })

    return true;
}

async function getLanguages() {
    const result = await browser.storage.sync.get(USER_OPTIONS);

    const languagesOptions = result?.userOptions?.languages ? result.userOptions.languages : DEFAULT_LANGUAGES_OPTIONS;
    const defaultLanguage = result?.userOptions?.defaultLanguage ? result.userOptions.defaultLanguage : DEFAULT_LANGUAGE;

    const languageOptions = languagesOptions.find(option => option.language.key === defaultLanguage.key);

    return {language: languageOptions.language, translationLanguage: languageOptions.translationLanguage};
}

prepareHeaders = () => {
    return {
        "Content-type": "application/json;charset=UTF-8"
    }
}

prepareDictionaryRequestBody = (word, sourceLanguage) => {
    return {"q": word, "source": sourceLanguage}
}

prepareTranslationRequestBody = (word, sourceLanguage, targetLanguage) => {
    return {"q": word, "source": sourceLanguage, "target": targetLanguage, "format": "text"}
}

function handleDictionaryResponse(response) {
    if (response.ok) {
        return response.json().then(responseBody => {
            if (responseBody?.data?.error) {
                return handleDictionaryError(data.data.error.code);
            }

            return Promise.resolve({
                word: responseBody.data.dictionary?.word,
                phonetic: {
                    text: responseBody.data.dictionary?.phonetics[0]?.text,
                    audio: responseBody.data.dictionary?.phonetics[0]?.audio,
                },
                partOfSpeech: responseBody.data.dictionary?.meanings[0]?.partOfSpeech,
                definition: responseBody.data.dictionary?.meanings[0]?.definitions[0]?.definition,
                synonyms: responseBody.data.dictionary?.meanings[0]?.definitions[0]?.synonyms
            })
        });
    }
    return preparePromiseWithTranslationError(DEFINITION_ERROR_TITLE, DEFINITION_ERROR_MSG);
}

function handleDictionaryError(errorCode) {
    if (errorCode === 400) {
        return preparePromiseWithTranslationError(DEFINITION_ERROR_TITLE, DEFINITION_ERROR_MSG);
    }
    return preparePromiseWithTranslationError(NO_DEFINITION_TITLE, NO_DEFINITION_MSG);
}

preparePromiseWithDictionaryError = (title, message) => {
    return Promise.resolve({
        dictionaryError: {title, message}
    });
}

function handleTranslationResponse(response) {
    if (response.ok) {
        return response.json().then(responseBody => {
            if (responseBody?.data?.error) {
                return handleTranslationError(responseBody.data.error.code);
            }

            return Promise.resolve({
                wordTranslations: responseBody.data.translations?.map(translation => translation.translatedText)
            })
        });
    }
    return preparePromiseWithTranslationError(TRANSLATION_ERROR_TITLE, TRANSLATION_ERROR_MSG);
}

function handleTranslationError(errorCode) {
    if (errorCode === 400) {
        return preparePromiseWithTranslationError(TRANSLATION_ERROR_TITLE, TRANSLATION_ERROR_MSG);
    }
    return preparePromiseWithTranslationError(NO_TRANSLATION_TITLE, NO_TRANSLATION_MSG);
}

preparePromiseWithTranslationError = (title, message) => {
    return Promise.resolve({
        translationError: {title, message}
    });
}