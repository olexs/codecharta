import { Component } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { readFiles } from "../../../util/uploadFiles/readFiles"

@Component({
	selector: "cc-upload-custom-config-button",
	template: require("./uploadCustomConfigButton.component.html")
})
export class UploadCustomConfigButtonComponent {
	upload() {
		const fileInput = createCCFileInput()
		fileInput.addEventListener("change", async () => {
			const customConfigsContent = await Promise.all(readFiles(fileInput.files))
			for (const customConfigContent of customConfigsContent) {
				try {
					CustomConfigHelper.importCustomConfigs(customConfigContent)
				} catch {
					// Explicitly ignored
				}
			}
		})
		fileInput.click()
	}
}