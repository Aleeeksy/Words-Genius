const WORDS_GENIUS_POPOVER_CLASSNAME = "words-genius-popover";
const WORDS_GENIUS_POPOVER_CLASS_SELECTOR = "." + WORDS_GENIUS_POPOVER_CLASSNAME;
const SELECTED_WORD_WRAPPER_CLASSNAME = "selected-word-wrapper";
const SELECTED_WORD_WRAPPER_CLASS_SELECTOR = "." + SELECTED_WORD_WRAPPER_CLASSNAME;

function showPopover(event) {
    if (isEventOutsideOfPopover(event)) {
        hidePopover(event);

        const selectedWord = getSelectedWord();

        if (selectedWord.toString().length > 1) {
            wrapSelectedWord(selectedWord);
            getWordInformation()
            showPopoverAndAddCustomCssClass()
        }
    }
}

function getSelectedWord() {
    return window.getSelection().getRangeAt(0);
}

function wrapSelectedWord(selectedWord) {
    selectedWord.surroundContents(createWrapper());
}

function createWrapper() {
    const wrapper = document.createElement("span");
    wrapper.setAttribute("class", SELECTED_WORD_WRAPPER_CLASSNAME);
    wrapper.setAttribute("data-toggle", "popover");
    wrapper.setAttribute("data-placement", "bottom");
    wrapper.setAttribute("title", "Loading data");
    wrapper.setAttribute("data-content", "Please Wait...");
    return wrapper;
}

function getWordInformation(selectedWord) {
    return browser.runtime.sendMessage({word: selectedWord});
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

document.addEventListener("dblclick", e => showPopover(e));

document.addEventListener("click", e => hidePopover(e));
