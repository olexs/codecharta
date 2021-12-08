import "./attributeTypeSelector.component.scss"
import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { AttributeTypes, AttributeTypeValue } from "../../../codeCharta.model"
import { updateAttributeType } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { Store } from "../../../state/angular-redux/store"
import {
	GetAttributeTypeOfNodesByMetric,
	getAttributeTypeOfNodesByMetricSelector
} from "../../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Component({
	selector: "cc-attribute-type-selector",
	template: require("./attributeTypeSelector.component.html")
})
export class AttributeTypeSelectorComponent {
	@Input() metricName: string
	@Input() metricType: keyof AttributeTypes

	getAttributeTypeOfNodesByMetric$: Observable<GetAttributeTypeOfNodesByMetric>

	constructor(@Inject(Store) private store: Store) {
		this.getAttributeTypeOfNodesByMetric$ = this.store.select(getAttributeTypeOfNodesByMetricSelector)
	}

	setToAbsolute() {
		this.setAttributeType(AttributeTypeValue.absolute)
	}

	setToRelative() {
		this.setAttributeType(AttributeTypeValue.relative)
	}

	private setAttributeType(attributeTypeValue: AttributeTypeValue) {
		this.store.dispatch(updateAttributeType(this.metricType, this.metricName, attributeTypeValue))
	}
}
