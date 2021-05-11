class TranslationLanguageDropdownRenderer {
    init(params) {
        this.params = params;

        const selectElement = document.createElement('select');

        TRANSLATION_LANGUAGES
            .filter(language => this.params.node.data.language.key !== language.key)
            .forEach((language) => selectElement.append(`<option value="${language.key}">${language.name}</option>`));

        this.eGui = selectElement
    }

    getGui() {
        return this.eGui;
    }
}
