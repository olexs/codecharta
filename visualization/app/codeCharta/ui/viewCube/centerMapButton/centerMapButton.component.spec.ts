import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { CenterMapButtonComponent } from "./centerMapButton.component"

describe("CenterMapButtonComponent", () => {
	const threeOrbitControlsService = { autoFitTo: jest.fn() }

	beforeEach(() => {
		threeOrbitControlsService.autoFitTo = jest.fn()
		TestBed.configureTestingModule({
			providers: [{ provide: ThreeOrbitControlsServiceToken, useValue: threeOrbitControlsService }]
		})
	})

	it("should call autoFitTo of threeOrbitControlsService on click", async () => {
		await render(CenterMapButtonComponent)

		userEvent.click(screen.getByTitle("Center map"))

		expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
	})
})