import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton.module"
import { fireEvent, render, screen } from "@testing-library/angular"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import userEvent from "@testing-library/user-event"
import { waitForElementToBeRemoved } from "@testing-library/dom"
import { CustomConfigHelper } from "../../../util/customConfigHelper"

describe("addCustomConfigButtonComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule]
		})
	})

	it("should let a user save a custom config", async () => {
		const addCustomConfigSpy = jest.spyOn(CustomConfigHelper, "addCustomConfig")
		await render(AddCustomConfigButtonComponent, { excludeComponentDeclaration: true })

		const button = screen.getByRole("button")
		fireEvent.click(button)

		await screen.findByText("Add Custom View")

		userEvent.type(screen.getByRole("textbox"), "myCustomConfig")
		fireEvent.click(screen.getByRole("button", { name: "ADD" }))

		await waitForElementToBeRemoved(screen.getByText("Add Custom View"))
		expect(addCustomConfigSpy).toHaveBeenCalledTimes(1)
	})
})