import "./colorSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setInvertDeltaColors } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.actions"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import {
	InvertDeltaColorsService,
	InvertDeltaColorsSubscriber
} from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import {
	InvertColorRangeService,
	InvertColorRangeSubscriber
} from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { ColorRange } from "../../codeCharta.model"

export class ColorSettingsPanelController
	implements FilesSelectionSubscriber, InvertDeltaColorsSubscriber, InvertColorRangeSubscriber, ColorRangeSubscriber
{
	private _viewModel: {
		invertColorRange: boolean
		invertDeltaColors: boolean
		isDeltaState: boolean
		colorRange: { from: number; to: number }
		colorLabels: { positive: boolean; negative: boolean; neutral: boolean }
	} = {
		invertColorRange: null,
		invertDeltaColors: null,
		isDeltaState: null,
		colorRange: { from: null, to: null },
		colorLabels: { positive: false, negative: false, neutral: false }
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		InvertDeltaColorsService.subscribe(this.$rootScope, this)
		InvertColorRangeService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this._viewModel.colorRange = colorRange
	}

	onInvertColorRangeChanged(invertColorRange: boolean) {
		this._viewModel.invertColorRange = invertColorRange
	}

	onInvertDeltaColorsChanged(invertDeltaColors: boolean) {
		this._viewModel.invertDeltaColors = invertDeltaColors
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
	}

	swapColorLabelsPositive() {
		const colorLabels = this.storeService.getState().appSettings.colorLabels
		colorLabels.positive = !colorLabels.positive
		this.storeService.dispatch(setColorLabels(colorLabels))
	}

	swapColorLabelsNegative() {
		const colorLabels = this.storeService.getState().appSettings.colorLabels
		colorLabels.negative = !colorLabels.negative
		this.storeService.dispatch(setColorLabels(colorLabels))
	}

	swapColorLabelsNeutral() {
		const colorLabels = this.storeService.getState().appSettings.colorLabels
		colorLabels.neutral = !colorLabels.neutral
		this.storeService.dispatch(setColorLabels(colorLabels))
	}

	invertColorRange() {
		const mapColors = this.storeService.getState().appSettings.mapColors
		this.storeService.dispatch(
			setMapColors({
				...mapColors,
				positive: mapColors.negative,
				negative: mapColors.positive
			})
		)
	}

	invertDeltaColors() {
		const { positiveDelta, negativeDelta } = this.storeService.getState().appSettings.mapColors

		this.storeService.dispatch(setInvertDeltaColors(this._viewModel.invertDeltaColors))
		this.storeService.dispatch(
			setMapColors({
				...this.storeService.getState().appSettings.mapColors,
				negativeDelta: positiveDelta,
				positiveDelta: negativeDelta
			})
		)
	}
}

export const colorSettingsPanelComponent = {
	selector: "colorSettingsPanelComponent",
	template: require("./colorSettingsPanel.component.html"),
	controller: ColorSettingsPanelController
}
