const DEFAULT_ACTIVATION_KEY = 'alt';

const USER_OPTIONS = 'userOptions';

const TRANSLATION = 'translation';
const DEFINITION = 'definition';
const PART_OF_SPEECH = 'partOfSpeech';
const SYNONYMS = 'synonyms';

const DEFAULT_POPOVER_SECTIONS = [
    {section: "Translation", value: TRANSLATION, visible: true, order: 0},
    {section: "Part of speech", value: PART_OF_SPEECH, visible: true, order: 1},
    {section: "Definition", value: DEFINITION, visible: true, order: 2},
    {section: "Synonyms", value: SYNONYMS, visible: true, order: 3}
];

const DEFINITION_LANGUAGES = [
    {key: 'en', name: 'English'},
    {key: 'de', name: 'German'},
    {key: 'es', name: 'Spanish'},
    {key: 'fr', name: 'French'}
]

const TRANSLATION_LANGUAGES = [
    ...DEFINITION_LANGUAGES,
    {key: 'pl', name: 'Polish'}
]

const DEFAULT_LANGUAGES_OPTIONS = [
    {
        language: {key: 'en', name: 'English'},
        definitionLanguage: {key: 'en', name: 'English'},
        translationLanguage: {key: 'pl', name: 'Polish'}
    }, {
        language: {key: 'de', name: 'German'},
        definitionLanguage: {key: 'de', name: 'German'},
        translationLanguage: {key: 'pl', name: 'Polish'}
    }, {
        language: {key: 'es', name: 'Spanish'},
        definitionLanguage: {key: 'es', name: 'Spanish'},
        translationLanguage: {key: 'pl', name: 'Polish'}
    }, {
        language: {key: 'fr', name: 'French'},
        definitionLanguage: {key: 'fr', name: 'French'},
        translationLanguage: {key: 'pl', name: 'Polish'}
    }
]