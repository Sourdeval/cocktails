import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    templateUrl: '../dialogs/edit-account.dialog.html',
})
export class EditAccountDialog {
    constructor(
        public dialogRef: MatDialogRef<EditAccountDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

export interface DialogData {
    name: string;
    canExit: boolean;
}
