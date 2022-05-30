import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { DEFAULT_STATE } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { EdgeMetricService } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { AmountOfEdgePreviewsService } from "../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { EdgeHeightService } from "../../state/store/appSettings/edgeHeight/edgeHeight.service"
import { ShowOnlyBuildingsWithEdgesService } from "../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let edgeMetricDataService: EdgeMetricDataService

	beforeEach(() => {
		restartSystem()
		withMockedEdgeMetricDataService()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController($rootScope, storeService, edgeMetricDataService)
	}

	function withMockedEdgeMetricDataService(amountOfAffectedBuildings = 0) {
		edgeMetricDataService.getAmountOfAffectedBuildings = jest.fn().mockReturnValue(amountOfAffectedBuildings)
	}

	describe("constructor", () => {
		it("should subscribe to AmountOfEdgePreviewsService", () => {
			AmountOfEdgePreviewsService.subscribe = jest.fn()

			rebuildController()

			expect(AmountOfEdgePreviewsService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to EdgeHeightService", () => {
			EdgeHeightService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeHeightService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to ShowOnlyBuildingsWithEdgesService", () => {
			ShowOnlyBuildingsWithEdgesService.subscribe = jest.fn()

			rebuildController()

			expect(ShowOnlyBuildingsWithEdgesService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to EdgeMetricService", () => {
			EdgeMetricService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})
	})

	describe("onAmountOfEdgePreviewsChanged", () => {
		it("should update viewModel amountOfEdgePreviews and call codeMapActionService", () => {
			edgeSettingsPanelController.onAmountOfEdgePreviewsChanged(42)

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(42)
		})
	})

	describe("onEdgeHeightChanged", () => {
		it("should update viewModel edgeHeight and call codeMapActionService", () => {
			edgeSettingsPanelController.onEdgeHeightChanged(7)

			expect(edgeSettingsPanelController["_viewModel"].edgeHeight).toBe(7)
		})
	})

	describe("onShowOnlyBuildingsWithEdgesChanged", () => {
		it("should update viewModel showOnlyBuildingsWithEdges and call codeMapActionService", () => {
			edgeSettingsPanelController.onShowOnlyBuildingsWithEdgesChanged(true)

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(true)
		})
	})

	describe("onEdgeMetricChanged", () => {
		it("should get 0 totalAffectedBuildings", () => {
			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(0)
		})

		it("should get 42 totalAffectedBuildings", () => {
			withMockedEdgeMetricDataService(42)

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(42)
		})

		it("should get amountOfEdgePreviews from settings", () => {
			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(DEFAULT_STATE.appSettings.amountOfEdgePreviews)
		})
	})

	describe("applySettingsAmountOfEdgePreviews", () => {
		it("should update amountOfEdgePreviews in store", () => {
			edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews = 42

			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews()

			expect(storeService.getState().appSettings.amountOfEdgePreviews).toBe(42)
		})
	})

	describe("applySettingsEdgeHeight", () => {
		it("should update edgeHeight in store", () => {
			edgeSettingsPanelController["_viewModel"].edgeHeight = 21

			edgeSettingsPanelController.applySettingsEdgeHeight()

			expect(storeService.getState().appSettings.edgeHeight).toBe(21)
		})
	})

	describe("applyShowOnlyBuildingsWithEdges", () => {
		it("should update showOnlyBuildingsWithEdges in store", () => {
			edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges = false

			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges()

			expect(storeService.getState().appSettings.showOnlyBuildingsWithEdges).toBeFalsy()
		})
	})
})
