import "./confirmationDialog.component.scss"
import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
	template: require("./confirmationDialog.component.html")
})
export class ConfirmationDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}