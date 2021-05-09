const PLAY_AUDIO_BUTTON_ID = "play-audio-button";
const PLAY_AUDIO_BUTTON_SELECTOR = "#" + PLAY_AUDIO_BUTTON_ID;
const WORDS_GENIUS_POPOVER_CLASSNAME = "words-genius-popover";
const WORDS_GENIUS_POPOVER_CLASS_SELECTOR = "." + WORDS_GENIUS_POPOVER_CLASSNAME;
const SELECTED_WORD_WRAPPER_CLASSNAME = "selected-word-wrapper";
const SELECTED_WORD_WRAPPER_CLASS_SELECTOR = "." + SELECTED_WORD_WRAPPER_CLASSNAME;

function getDataAndShowPopover(event) {
    if (isEventOutsideOfPopover(event)) {
        hidePopover(event);

        const selectedWordRange = getSelectedWordRange();

        if (selectedWordRange.toString().length > 1) {
            wrapSelectedWord(selectedWordRange);
            updatePopoverContent(selectedWordRange.toString());
            showPopoverAndAddCustomCssClass()
        }
    }
}

function getSelectedWordRange() {
    return window.getSelection().getRangeAt(0);
}

function wrapSelectedWord(selectedWordRange) {
    selectedWordRange.surroundContents(createWrapper());
}

function createWrapper() {
    const wrapper = document.createElement("span");
    wrapper.setAttribute("class", SELECTED_WORD_WRAPPER_CLASSNAME);
    wrapper.setAttribute("data-toggle", "popover");
    wrapper.setAttribute("data-html", "true");
    wrapper.setAttribute("data-placement", "bottom");
    wrapper.setAttribute("data-container", "body");
    wrapper.setAttribute("data-content", "Please Wait...");
    wrapper.setAttribute("data-original-title", "Loading data");
    return wrapper;
}

async function updatePopoverContent(selectedWord) {
    const response = await getWordInformation(selectedWord)
    const {title, content} = await preparePopoverTitleAndContent(response);

    $(SELECTED_WORD_WRAPPER_CLASS_SELECTOR).attr("data-original-title", title);
    $(SELECTED_WORD_WRAPPER_CLASS_SELECTOR).attr("data-content", content);

    reloadPopoverContent();
}

function getWordInformation(selectedWord) {
    return browser.runtime.sendMessage({word: selectedWord, time: Date.now()});
}

async function preparePopoverTitleAndContent(response) {
    if (!response.data || Object.keys(response.data).length === 0) {
        return {
            title: "Not found",
            content: "Sorry, we couldn't find translation and definition for this word",
        }
    }
    if (response.data.translationError && response.data.dictionaryError) {
        return {
            title: "Error",
            content: "Sorry, error occurred when we try to retrieved word translation and definition",
        }
    }

    const audioElement = document.createElement("audio")
    audioElement.id = "word-pronunciation";
    audioElement.src = response.data.phonetic.audio;
    audioElement.type = "audio/mpeg";
    document.body.appendChild(audioElement);

    return {
        title: `${response.data.phonetic.text} <a id="${PLAY_AUDIO_BUTTON_ID}"> <span class="volume-up-icon"/></a>`,
        content: await preparePopoverContent(response.data),
    }
}

async function preparePopoverContent(data) {
    const result = await browser.storage.sync.get(USER_OPTIONS);
    const sections = result?.userOptions?.popoverSections ? result.userOptions.popoverSections : DEFAULT_POPOVER_SECTIONS;

    const popoverSections = preparePopoverSections(sections, data);

    return preparePopoverContentHtmlElements(popoverSections);
}

function preparePopoverSections(sections, data) {
    return sections.map(section => {
        if (section.value === TRANSLATION) {
            return {...section, term: 'Translation', details: data.wordTranslations}
        }
        if (section.value === PART_OF_SPEECH) {
            return {...section, term: 'Part of speech', details: data.partOfSpeech}
        }
        if (section.value === DEFINITION) {
            return {...section, term: 'Definition', details: data.definition}
        }
        if (section.value === SYNONYMS) {
            return {...section, term: 'Synonyms', details: data.synonyms?.join(', ')}
        }
    });
}

function preparePopoverContentHtmlElements(popoverSections) {
    const descriptions = document.createElement('div');

    popoverSections.filter(e => e.details)
        .filter(e => e.visible)
        .sort((e1, e2) => e1.order - e2.order)
        .forEach((item) => {
            const descriptionTerm = document.createElement('div');
            const descriptionDetails = document.createElement('div');
            descriptions.appendChild(descriptionTerm);
            descriptions.appendChild(descriptionDetails);

            descriptionTerm.innerHTML = item.term;
            descriptionTerm.setAttribute("class", "definition-term");

            descriptionDetails.innerHTML = item.details;
            descriptionDetails.setAttribute("class", "definition-details");
        });

    return descriptions.outerHTML;
}


function playAudio() {
    const audioElement = document.getElementById("word-pronunciation");
    audioElement.play();
}

function reloadPopoverContent() {
    $(SELECTED_WORD_WRAPPER_CLASS_SELECTOR).popover("hide");
    $(SELECTED_WORD_WRAPPER_CLASS_SELECTOR).popover("show");
}

function showPopoverAndAddCustomCssClass() {
    $(
        $(SELECTED_WORD_WRAPPER_CLASS_SELECTOR)
            .popover("show")
            .data("bs.popover")
            .tip
    ).addClass(WORDS_GENIUS_POPOVER_CLASSNAME);
}

function hidePopover(event) {
    if (isEventOutsideOfPopover(event)) {
        $(SELECTED_WORD_WRAPPER_CLASS_SELECTOR).popover("hide");

        document.querySelectorAll("#word-pronunciation")
            .forEach(node => {
                node.remove();
            })

        document.querySelectorAll(SELECTED_WORD_WRAPPER_CLASS_SELECTOR)
            .forEach(node => {
                unwrapWord(node);
                node.remove();
            })
    }
}

function isEventOutsideOfPopover(event) {
    return !event.target.closest(WORDS_GENIUS_POPOVER_CLASS_SELECTOR);
}

function unwrapWord(node) {
    const parentNode = node.parentNode;
    while (node.firstChild) {
        parentNode.insertBefore(node.firstChild, node);
    }
}

document.addEventListener("dblclick", e => {
    browser.storage.sync.get(USER_OPTIONS).then((result) => {
        const activationKey = result?.userOptions?.activationKey ? result.userOptions.activationKey : DEFAULT_ACTIVATION_KEY;
        if(e[`${activationKey}Key`]) {
            return getDataAndShowPopover(e);
        }
    });
});

document.addEventListener("click", e => hidePopover(e));

$('body').on('click', PLAY_AUDIO_BUTTON_SELECTOR, () => playAudio());