import "./sortingButton.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import {
	SortingOrderAscendingService,
	SortingOrderAscendingSubscriber
} from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"

export class SortingButtonController implements SortingOrderAscendingSubscriber {
	private _viewModel: {
		orderAscending: boolean
	} = {
		orderAscending: true
	}
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		SortingOrderAscendingService.subscribe(this.$rootScope, this)
	}

	onSortingOrderAscendingChanged(sortingOrderAscending: boolean) {
		this._viewModel.orderAscending = sortingOrderAscending
	}

	onButtonClick() {
		this.storeService.dispatch(setSortingOrderAscending(!this._viewModel.orderAscending))
	}
}

export const sortingButtonComponent = {
	selector: "sortingButtonComponent",
	template: require("./sortingButton.component.html"),
	controller: SortingButtonController
}
