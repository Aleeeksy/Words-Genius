const ACTIVATION_KEY_SELECTOR = "#activation-key";

const pcKeys = [
    {value: 'alt', text: 'Alt'},
    {value: 'shift', text: 'Shift'},
];

const macKeys = [
    ...pcKeys,
    {value: 'cmd', text: 'Command'},
];

const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') > -1;

function populateOptions() {
    const keys = isMac() ? macKeys : pcKeys;

    keys.forEach((key) => $(ACTIVATION_KEY_SELECTOR).append(`<option value="${key.value}">${key.text}</option>`));

    setSavedActivationKey();
}

function setSavedActivationKey() {
    browser.storage.sync.get(USER_OPTIONS)
        .then(result => {
            if (result?.userOptions?.activationKey) {
                document.querySelector(ACTIVATION_KEY_SELECTOR).value = result.userOptions.activationKey
            }
        });
}


function saveActivationKey(keyValue) {
    browser.storage.sync.get(USER_OPTIONS)
        .then(result => browser.storage.sync.set({userOptions: {...result.userOptions, activationKey: keyValue}}));
}

$(ACTIVATION_KEY_SELECTOR).change(function () {
    saveActivationKey($(this).val());
});

populateOptions();