import { Component, Inject } from "@angular/core"
import { CopyToClipboardService } from "./copyToClipboard.service"

@Component({
	template: require("./copyToClipboardButton.component.html")
})
export class CopyToClipboardButtonComponent {
	constructor(@Inject(CopyToClipboardService) private service: CopyToClipboardService) {}

	async copyNamesToClipBoard() {
		await navigator.clipboard.writeText(this.service.getClipboardText())
	}
}