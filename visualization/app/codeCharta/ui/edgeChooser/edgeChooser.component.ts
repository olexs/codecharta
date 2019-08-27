import "./edgeChooser.component.scss"
import { MetricData, EdgeMetricCount } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService, EdgeMetricServiceSubscriber } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"

export class EdgeChooserController implements EdgeMetricServiceSubscriber {
	private originalEdgeMetricData: MetricData[]

	private _viewModel: {
		edgeMetricData: MetricData[]
		edgeMetric: string
		hoveredEdgeValue: EdgeMetricCount
		searchTerm: string
	} = {
		edgeMetricData: [],
		edgeMetric: "None",
		hoveredEdgeValue: null,
		searchTerm: ""
	}

	constructor(
		private $rootScope: IRootScopeService,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService
	) {
		EdgeMetricService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
	}

	public onEdgeMetricDataUpdated(edgeMetrics: MetricData[]) {
		this._viewModel.edgeMetricData = edgeMetrics
		this.originalEdgeMetricData = edgeMetrics

		let edgeMetricNames = edgeMetrics.map(x => x.name)

		if (!edgeMetricNames.includes(this._viewModel.edgeMetric)) {
			this._viewModel.edgeMetric = edgeMetricNames[0]
		}
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data && data.to && data.to.node && data.to.node.edgeAttributes) {
			this._viewModel.hoveredEdgeValue = data.to.node.edgeAttributes[this._viewModel.edgeMetric]
		} else {
			this._viewModel.hoveredEdgeValue = null
		}
	}

	public onEdgeMetricSelected() {
		this.settingsService.updateSettings({ dynamicSettings: { edgeMetric: this._viewModel.edgeMetric } })
		this.codeMapActionsService.updateEdgePreviews()
	}

	public noEdgesAvailable() {
		return this._viewModel.edgeMetricData.length <= 1
	}

	public filterMetricData() {
		this._viewModel.edgeMetricData = this.originalEdgeMetricData.filter(metric =>
			metric.name.toLowerCase().includes(this._viewModel.searchTerm.toLowerCase())
		)
	}

	public clearSearchTerm() {
		this._viewModel.searchTerm = ""
		this._viewModel.edgeMetricData = this.originalEdgeMetricData
	}
}

export const edgeChooserComponent = {
	selector: "edgeChooserComponent",
	template: require("./edgeChooser.component.html"),
	controller: EdgeChooserController
}
