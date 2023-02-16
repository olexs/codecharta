import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { EdgeMetricData } from "../../codeCharta.model"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
//import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
// import { Store } from "../../state/store/store"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControls.service"
import { RibbonBarComponent } from "./ribbonBar.component"
import { RibbonBarModule } from "./ribbonBar.module"

jest.mock("../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))
const mockedIsDeltaStateSelector = jest.mocked(isDeltaStateSelector)
jest.mock("../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
	metricDataSelector: jest.fn()
}))
const mockMetricDataSelector = jest.mocked(metricDataSelector)

describe("RibbonBarComponent", () => {
	beforeEach(() => {
		mockedIsDeltaStateSelector.mockImplementation(() => false)
		mockMetricDataSelector.mockImplementation(() => ({ edgeMetricData: [], nodeMetricData: [], nodeEdgeMetricsMap: new Map() }))
		TestBed.configureTestingModule({
			imports: [RibbonBarModule],
			providers: [
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} }
			]
		})
	})

	describe("panel sections", () => {
		it("should toggle panel section", async () => {
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-area-settings-panel").classList).toContain("hidden")

			await userEvent.click(screen.getByText("Area Metric Options"))
			expect(container.querySelector("cc-area-settings-panel").classList).not.toContain("hidden")

			await userEvent.click(screen.getByText("Area Metric Options"))
			expect(container.querySelector("cc-area-settings-panel").classList).toContain("hidden")
		})

		it("should close on outside clicks", async () => {
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })

			await userEvent.click(screen.getByText("Area Metric Options"))
			expect(container.querySelector("cc-area-settings-panel").classList).not.toContain("hidden")

			await userEvent.click(document.body)
			expect(container.querySelector("cc-area-settings-panel").classList).toContain("hidden")
		})

		it("should detect clicks within panel selections and not close itself", async () => {
			const { fixture } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			const mouseEvent = {
				composedPath: () => [{ nodeName: "CC-COLOR-SETTINGS-PANEL" }]
			} as unknown as MouseEvent
			const isClickOutside = fixture.componentInstance["isOutside"](mouseEvent)
			expect(isClickOutside).toBe(false)
		})
	})

	describe("delta state", () => {
		it("should not show cc-color-metric-chooser and cc-link-color-metric-to-height-metric-button when in delta mode", async () => {
			mockedIsDeltaStateSelector.mockImplementation(() => true)
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-color-metric-chooser")).toBe(null)
			expect(container.querySelector("cc-link-color-metric-to-height-metric-button")).toBe(null)
		})

		it("should show cc-color-metric-chooser and cc-link-color-metric-to-height-metric-button when not in delta mode", async () => {
			mockedIsDeltaStateSelector.mockImplementation(() => false)
			const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(container.querySelector("cc-color-metric-chooser")).not.toBe(null)
			expect(container.querySelector("cc-link-color-metric-to-height-metric-button")).not.toBe(null)
		})
	})

	describe("edge metric chooser", () => {
		it("should show edge metrics when there are some available", async () => {
			mockMetricDataSelector.mockImplementation(() => ({
				edgeMetricData: [{} as EdgeMetricData],
				nodeMetricData: [],
				nodeEdgeMetricsMap: new Map()
			}))

			await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(screen.getByText("Edge Metric Options")).toBeTruthy()
		})

		it("should hide edge metrics when there aren't any available", async () => {
			await render(RibbonBarComponent, { excludeComponentDeclaration: true })
			expect(screen.queryByText("Edge Metric Options")).toBe(null)
		})
	})
})
