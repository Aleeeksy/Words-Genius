const columnDefs = [
    {field: "order", width: 100, rowDrag: true, valueGetter: (args) => getOrderNumber(args)},
    {field: "section", width: 400},
    {field: "visible", width: 100, cellRenderer: 'checkboxRenderer', cellClass: "grid-cell-centered"},
];

function getOrderNumber(args) {
    return args.node.rowIndex + 1;
}

const gridOptions = (rowData) => ({
    columnDefs: columnDefs,
    rowData: rowData,
    rowDragManaged: true,
    animateRows: true,
    components: {
        checkboxRenderer: CheckboxRenderer
    },
    domLayout: 'autoHeight',
    onRowDragEnd: ({api}) => {
        updateSectionOrder(api.getModel().rowsToDisplay);
        api.refreshCells()
    },
});

function populateOptions() {
    const eGridDiv = document.querySelector('#popover-content-options-grid');

    browser.storage.sync.get(USER_OPTIONS)
        .then(res => {
            if (res?.userOptions?.popoverSections) {
                new agGrid.Grid(eGridDiv, gridOptions(res.userOptions.popoverSections));
            } else {
                new agGrid.Grid(eGridDiv, gridOptions(DEFAULT_POPOVER_SECTIONS));
                browser.storage.sync.set({
                    userOptions: {
                        ...res.userOptions,
                        popoverSections: DEFAULT_POPOVER_SECTIONS
                    }
                });
            }
        });
}

function updateSectionOrder(rows) {
    const popoverSections = rows.map(row => ({...row.data, order: row.rowIndex}));

    browser.storage.sync.get(USER_OPTIONS)
        .then(res => browser.storage.sync.set({userOptions: {...res.userOptions, popoverSections}}));
}

function updateSectionVisibility(data) {
    browser.storage.sync.get(USER_OPTIONS)
        .then(res => {
            if (res?.userOptions?.popoverSections) {
                const popoverSections = res.userOptions?.popoverSections.map(row => row.value === data.value ? data : row);

                browser.storage.sync.set({userOptions: {...res.userOptions, popoverSections}});
            }
        });
}

populateOptions();