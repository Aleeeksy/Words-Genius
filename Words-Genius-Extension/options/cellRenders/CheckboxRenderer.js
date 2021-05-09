class CheckboxRenderer {
    init(params) {
        this.params = params;

        this.eGui = document.createElement('input');
        this.eGui.type = 'checkbox';
        this.eGui.checked = params.value;

        this.checkedHandler = this.checkedHandler.bind(this);
        this.eGui.addEventListener('click', this.checkedHandler);
    }

    checkedHandler(e) {
        const checked = e.target.checked;
        const colId = this.params.column.colId;
        this.params.node.setDataValue(colId, checked);

        updateSectionVisibility(this.params.data);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('click', this.checkedHandler);
    }
}