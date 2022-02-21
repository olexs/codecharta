import "./markFolderRow.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../angular-redux/store"
import { markPackages, unmarkPackage } from "../../../store/fileSettings/markedPackages/markedPackages.actions"
import { Observable } from "rxjs"
import { MarkFolderItem, markFolderItemsSelector } from "./selectors/markFolderItems.selector"
import { CodeMapNode } from "../../../../codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"

@Component({
	selector: "cc-mark-folder-row",
	template: require("./markFolderRow.component.html")
})
export class MarkFolderRowComponent {
	markFolderItems$: Observable<MarkFolderItem[]>
	codeMapNode$: Observable<CodeMapNode>

	constructor(@Inject(Store) private store: Store) {
		this.markFolderItems$ = store.select(markFolderItemsSelector)
		this.codeMapNode$ = store.select(rightClickedCodeMapNodeSelector)
	}

	markFolder(path: string, color: string) {
		this.store.dispatch(markPackages([{ path, color }]))
	}

	unmarkFolder(path: string) {
		this.store.dispatch(unmarkPackage({ path }))
	}
}