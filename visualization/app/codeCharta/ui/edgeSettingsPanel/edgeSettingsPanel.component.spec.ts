import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { DEFAULT_STATE } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { EdgeMetricService } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { AmountOfEdgePreviewsService } from "../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { EdgeHeightService } from "../../state/store/appSettings/edgeHeight/edgeHeight.service"
import { ShowOnlyBuildingsWithEdgesService } from "../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let edgeMetricDataService: EdgeMetricDataService
	let codeMapActionsService: CodeMapActionsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
		withMockedEdgeMetricDataService()
		withMockedCodeMapActionsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController(
			$rootScope,
			settingsService,
			storeService,
			edgeMetricDataService,
			codeMapActionsService
		)
	}

	function withMockedSettingsService() {
		settingsService = edgeSettingsPanelController["settingsService"] = jest.fn<SettingsService>(() => {
			return {
				updateSettings: jest.fn()
			}
		})()
	}

	function withMockedEdgeMetricDataService(amountOfAffectedBuildings: number = 0) {
		edgeMetricDataService = edgeSettingsPanelController["edgeMetricDataService"] = jest.fn<EdgeMetricDataService>(() => {
			return {
				getAmountOfAffectedBuildings: jest.fn().mockReturnValue(amountOfAffectedBuildings)
			}
		})()
	}

	function withMockedCodeMapActionsService() {
		codeMapActionsService = edgeSettingsPanelController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(() => {
			return {
				updateEdgePreviews: jest.fn()
			}
		})()
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
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})
	})

	describe("onEdgeHeightChanged", () => {
		it("should update viewModel edgeHeight and call codeMapActionService", () => {
			edgeSettingsPanelController.onEdgeHeightChanged(7)

			expect(edgeSettingsPanelController["_viewModel"].edgeHeight).toBe(7)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})
	})

	describe("onShowOnlyBuildingsWithEdgesChanged", () => {
		it("should update viewModel showOnlyBuildingsWithEdges and call codeMapActionService", () => {
			edgeSettingsPanelController.onShowOnlyBuildingsWithEdgesChanged(true)

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(true)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
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

		it("should get 0 amountOfEdgePreviews and call applySettingsAmountOfEdgePreviews for metricName None", () => {
			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews = jest.fn()

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(0)
			expect(edgeSettingsPanelController.applySettingsAmountOfEdgePreviews).toHaveBeenCalled()
		})

		it("should get 0 amountOfEdgePreviews and call applyShowOnlyBuildingsWithEdges for metricName None", () => {
			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges = jest.fn()

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(false)
			expect(edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges).toHaveBeenCalled()
		})
	})

	describe("applySettingsAmountOfEdgePreviews", () => {
		it("should call updateSettings", () => {
			edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews = 42

			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { amountOfEdgePreviews: 42 } })
			expect(storeService.getState().appSettings.amountOfEdgePreviews).toBe(42)
		})
	})

	describe("applySettingsEdgeHeight", () => {
		it("should call updateSettings", () => {
			edgeSettingsPanelController["_viewModel"].edgeHeight = 21

			edgeSettingsPanelController.applySettingsEdgeHeight()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { edgeHeight: 21 } })
			expect(storeService.getState().appSettings.edgeHeight).toBe(21)
		})
	})

	describe("applyShowOnlyBuildingsWithEdges", () => {
		it("should call updateSettings", () => {
			edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges = false

			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { showOnlyBuildingsWithEdges: false } })
			expect(storeService.getState().appSettings.showOnlyBuildingsWithEdges).toBeFalsy()
		})
	})
})
