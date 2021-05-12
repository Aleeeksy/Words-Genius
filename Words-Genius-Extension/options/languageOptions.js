const DEFAULT_LANGUAGE_SELECTOR = "#default-language";

const languagesGridColumnDefs = [
    {field: "language", headerName: "Language", width: 200, valueGetter: (args) => args.data.language.name},
    {field: "definitionLanguage", headerName: "Definition Language", width: 200, valueGetter: (args) => args.data.definitionLanguage.name},
    {
        field: "translationLanguage", headerName: "Translation Language", width: 200,
        cellRenderer: (args) => args.data.translationLanguage.name,
        editable: true,
        singleClickEdit : true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: TRANSLATION_LANGUAGES.map(language => language.name),
        },
        onCellValueChanged: (args) => {
            args.data.translationLanguage = TRANSLATION_LANGUAGES.find(language => language.name === args.newValue)

            saveTranslationLanguage(args.data);

            args.api.refreshCells()
        }
    },
];

const languagesGridOptions = (rowData) => ({
    columnDefs: languagesGridColumnDefs,
    rowData: rowData,
    domLayout: 'autoHeight'
});

function populateOptions() {
    populateDefaultLanguageOptions();

    browser.storage.sync.get(USER_OPTIONS)
        .then(result => {
            populateGridOptions(result);
            setSavedDefaultLanguage(result)
        });
}

function populateDefaultLanguageOptions() {
    DEFINITION_LANGUAGES.forEach((key) => $(DEFAULT_LANGUAGE_SELECTOR).append(`<option value="${key.key}">${key.name}</option>`));
}

function populateGridOptions(result) {
    const eGridDiv = document.querySelector('#languages-options-grid');

    if (result?.userOptions?.languages) {
        new agGrid.Grid(eGridDiv, languagesGridOptions(result.userOptions.languages));
    } else {
        new agGrid.Grid(eGridDiv, languagesGridOptions(DEFAULT_LANGUAGES_OPTIONS));
        browser.storage.sync.set({userOptions: {...result.userOptions, languages: DEFAULT_LANGUAGES_OPTIONS}});
    }
}

function setSavedDefaultLanguage(result) {
    if (result?.userOptions?.defaultLanguage) {
        document.querySelector(DEFAULT_LANGUAGE_SELECTOR).value = result.userOptions.defaultLanguage.key;
    } else {
        document.querySelector(DEFAULT_LANGUAGE_SELECTOR).value = DEFAULT_LANGUAGE.key;
        browser.storage.sync.set({userOptions: {...result.userOptions, defaultLanguage: DEFAULT_LANGUAGE}});
    }
}

function saveTranslationLanguage(data) {
    browser.storage.sync.get(USER_OPTIONS)
        .then(result => {
            if (result?.userOptions?.languages) {
                const languages = result.userOptions?.languages.map(language => language.language.key === data.language.key ? data : language);

                browser.storage.sync.set({userOptions: {...result.userOptions, languages}});
            }
        });
}

function saveDefaultLanguage(languageKey) {
    browser.storage.sync.get(USER_OPTIONS)
        .then(result => {
            if (result?.userOptions?.languages) {
                browser.storage.sync.set({
                    userOptions: {
                        ...result.userOptions,
                        defaultLanguage: DEFINITION_LANGUAGES.find(language => language.key === languageKey)
                    }
                });
            }
        });
}

$(DEFAULT_LANGUAGE_SELECTOR).change(function () {
    saveDefaultLanguage($(this).val());
});

populateOptions();