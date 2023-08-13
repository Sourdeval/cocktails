import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    templateUrl: '../dialogs/fields.dialog.html',
})
export class FieldsDialog {
    fieldsName: string[] = [];

    constructor(
        public dialogRef: MatDialogRef<FieldsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {
        for (let fieldName in data.fields){
            this.fieldsName.push(fieldName);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

export interface DialogData {
    title: string,
    fields: { [id: string] : string; },
    canExit: boolean;
}
