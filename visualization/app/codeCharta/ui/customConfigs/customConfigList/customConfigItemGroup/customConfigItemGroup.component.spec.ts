import { TestBed } from "@angular/core/testing"
import { CustomConfigsModule } from "../../customConfigs.module"
import { MatDialog, MatDialogRef } from "@angular/material/dialog"
import { render, screen } from "@testing-library/angular"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup.component"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../../util/dataMocks"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import userEvent from "@testing-library/user-event"
import { expect } from "@jest/globals"
import { fileMapCheckSumsSelector } from "../fileMapCheckSums.selector"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"

jest.mock("../fileMapCheckSums.selector", () => ({
	fileMapCheckSumsSelector: jest.fn()
}))

const mockedFileMapCheckSumsSelector = fileMapCheckSumsSelector as jest.Mock

describe("customConfigItemGroupComponent", () => {
	let mockedDialog = { open: jest.fn() }
	let mockedDialogReference = { close: jest.fn() }

	beforeEach(() => {
		mockedDialog = { open: jest.fn() }
		mockedDialogReference = { close: jest.fn() }

		TestBed.configureTestingModule({
			imports: [CustomConfigsModule],
			providers: [
				{ provide: MatDialogRef, useValue: mockedDialogReference },
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} }
			]
		})
	})

	it("should apply a custom Config and close custom config dialog", async () => {
		mockedFileMapCheckSumsSelector.mockImplementation(
			() => new Map<CustomConfigMapSelectionMode, string[]>([[CustomConfigMapSelectionMode.MULTIPLE, ["md5_fileB", "md5_fileC"]]])
		)
		CustomConfigHelper.applyCustomConfig = jest.fn()
		const customConfigItemGroups = new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		await userEvent.click(screen.getByText("SampleMap View #1"))

		expect(screen.getAllByTitle("Apply Custom View").length).toBe(2)
		expect(screen.getByText("SampleMap View #1").getAttribute("style")).toBe("color: rgba(0, 0, 0, 0.87);")
		expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(1)
	})

	it("should remove a custom Config and not close custom config dialog", async () => {
		CustomConfigHelper.deleteCustomConfig = jest.fn()
		const customConfigItemGroups = new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		await userEvent.click(screen.getAllByTitle("Remove Custom View")[0])

		expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledTimes(1)
		expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith("File_B_File_C_MULTIPLE_Sample_Map View #1")
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(0)
	})

	it("Should show tooltip with missing maps and correct selection mode if selected custom config is not fully applicable", async () => {
		mockedFileMapCheckSumsSelector.mockImplementation(
			() => new Map<CustomConfigMapSelectionMode, string[]>([[CustomConfigMapSelectionMode.DELTA, ["md5_fileB"]]])
		)
		const customConfigItemGroups = new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		expect(
			screen.getAllByTitle(
				"This view is partially applicable. To complete your view, please switch to the MULTIPLE mode and select the following map(s): fileC."
			).length
		).toBe(2)
		expect(screen.getByText("SampleMap View #1").getAttribute("style")).toBe("color: rgb(204, 204, 204);")
		expect(screen.getByText("SampleMap View #1").closest("button").hasAttribute("disabled")).toBe(false)
	})
})