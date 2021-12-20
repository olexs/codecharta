import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../../state/angular-redux/store"
import { Node } from "../../../../codeCharta.model"
import { fileCountDescriptionSelector } from "./fileCountDescription.selector"

@Component({
	selector: "cc-node-path",
	template: require("./nodePath.component.html")
})
export class NodePathComponent {
	@Input() node?: Pick<Node, "path" | "isLeaf">
	fileCountDescription$: Observable<string | undefined>

	constructor(@Inject(Store) store: Store) {
		this.fileCountDescription$ = store.select(fileCountDescriptionSelector)
	}
}