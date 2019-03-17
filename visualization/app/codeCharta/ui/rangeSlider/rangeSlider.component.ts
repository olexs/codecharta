import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./rangeSlider.component.scss"
import { MapColors } from "../codeMap/rendering/renderSettings"
import $ from "jquery"
import {Settings} from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { MetricService } from "../../state/metric.service";
import {FileStateService} from "../../state/fileState.service";
import {ITimeoutService} from "angular";
import {FileStateHelper} from "../../util/fileStateHelper";

export class RangeSliderController implements SettingsServiceSubscriber {

	private maxMetricValue: number
	private DIGIT_WIDTH: number = 11
	private MIN_DIGITS: number = 4
	private MAX_DIGITS: number = 6
	private FULL_WIDTH_SLIDER: number = 235

	private _viewModel: {
		colorRangeFrom: number,
		colorRangeTo: number,
		sliderOptions: any
	} = {
		colorRangeFrom: null,
		colorRangeTo: null,
		sliderOptions: null
	}

	/* @ngInject */
	constructor(
		private settingsService: SettingsService,
		private fileStateService: FileStateService,
		private codeChartaService: CodeChartaService,
		private metricService: MetricService,
		private $timeout: ITimeoutService,
		private $scope
	) {
		SettingsService.subscribe($scope, this)
		this.initSliderOptions()

		this.$timeout(() => {
			this.$scope.$broadcast("rzSliderForceRender")
		})
	}

	public onSettingsChanged(settings: Settings) {
		// TODO circle ?
		this.initSliderOptions(settings)
		this.updateViewModel(settings)
		this.updateSliderColors()
		this.updateInputFieldWidth()
	}

	private updateViewModel(settings: Settings) {
		if (settings.dynamicSettings.neutralColorRange) {
			this._viewModel.colorRangeFrom = settings.dynamicSettings.neutralColorRange.from
			this._viewModel.colorRangeTo = settings.dynamicSettings.neutralColorRange.to
		}
	}

	public initSliderOptions(settings: Settings = this.settingsService.getSettings()) {
		this.maxMetricValue = this.metricService.getMaxMetricByMetricName(settings.dynamicSettings.colorMetric)

		this._viewModel.sliderOptions = {
			ceil: this.maxMetricValue,
			onChange: this.applySettings.bind(this),
			pushRange: true,
			onToChange: this.onToSliderChange.bind(this),
			onFromChange: this.onFromSliderChange.bind(this),
			disabled: FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
		}
	}

	private onFromSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this.maxMetricValue - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1)
		this.applySettings()
	}

	private onToSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.min(this.maxMetricValue, Math.max(1, this._viewModel.colorRangeTo))
		this.applySettings()
	}

	private applySettings() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				neutralColorRange: {
					to: this._viewModel.colorRangeTo,
					from: this._viewModel.colorRangeFrom
				}
			}
		})
	}

	private updateInputFieldWidth() {
		let fromLength = this.settingsService.getSettings().dynamicSettings.neutralColorRange.from.toFixed().toString().length + 1
		let toLength = this.settingsService.getSettings().dynamicSettings.neutralColorRange.to.toFixed().toString().length + 1
		let fromWidth = Math.min(Math.max(this.MIN_DIGITS, fromLength), this.MAX_DIGITS) * this.DIGIT_WIDTH
		let toWidth = Math.min(Math.max(this.MIN_DIGITS, toLength), this.MAX_DIGITS) * this.DIGIT_WIDTH

		$("range-slider-component #rangeFromInputField").css("width", fromWidth + "px")
		$("range-slider-component #rangeToInputField").css("width", toWidth + "px")
		$("range-slider-component #colorSlider").css("width", this.FULL_WIDTH_SLIDER - fromWidth - toWidth + "px")
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this.maxMetricValue) * this._viewModel.colorRangeFrom
		let rangeColors = this._viewModel.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors() {
		return {
			left: MapColors.lightGrey,
			middle: MapColors.lightGrey,
			right: MapColors.lightGrey
		}
	}

	private getColoredRangeColors() {
		const s = this.settingsService.getSettings()
		let mapColorPositive = s.appSettings.whiteColorBuildings ? MapColors.lightGrey : MapColors.positive

		let rangeColors = {
			left: s.dynamicSettings.neutralColorRange.flipped ? MapColors.negative : mapColorPositive,
			middle: MapColors.neutral,
			right: s.dynamicSettings.neutralColorRange.flipped ? mapColorPositive : MapColors.negative
		}
		return rangeColors
	}

	private applyCssColors(rangeColors, rangeFromPercentage) {
		const slider = $("range-slider-component .rzslider")
		const leftSection = slider.find(".rz-bar-wrapper:nth-child(3) .rz-bar")
		const middleSection = slider.find(".rz-selection")
		const rightSection = slider.find(".rz-right-out-selection .rz-bar")

        leftSection.css("cssText", "background: " + rangeColors.left + " !important; width: " + rangeFromPercentage + "%;")
        middleSection.css("cssText", "background: " + rangeColors.middle + " !important;")
        rightSection.css("cssText", "background: " + rangeColors.right + ";")
    }

}

export const rangeSliderComponent = {
	selector: "rangeSliderComponent",
	template: require("./rangeSlider.component.html"),
	controller: RangeSliderController
}
