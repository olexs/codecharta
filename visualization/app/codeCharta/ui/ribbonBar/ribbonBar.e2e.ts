import { CC_URL, delay, puppeteer } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SettingsPanelPageObject } from "../settingsPanel/settingsPanel.po"

jest.setTimeout(10000)

describe("RibbonBar", () => {
	let browser, page

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser.close()
	})

	it("should toggle ribbonBar onClick toggle button", async () => {
		await page.goto(CC_URL)
		await delay(500)

		const ribbonBar = new RibbonBarPageObject(page)
		console.log("before: ", Object.values(await ribbonBar.getRibbonBarClassList()))
		expect(Object.values(await ribbonBar.getRibbonBarClassList())).not.toContain("expanded")

		await ribbonBar.toggle()
		console.log("middle: ", Object.values(await ribbonBar.getRibbonBarClassList()))

		expect(Object.values(await ribbonBar.getRibbonBarClassList())).toContain("expanded")

		await ribbonBar.toggle()
		console.log("after: ", Object.values(await ribbonBar.getRibbonBarClassList()))

		expect(Object.values(await ribbonBar.getRibbonBarClassList())).not.toContain("expanded")
	})

	it("hovering over a folder should display the sum of metric of all children", async () => {
		await page.goto(CC_URL)
		await page.evaluate(() => {
			const loadingIndicator = document.querySelector("#loading-gif-file")
			loadingIndicator.parentNode.removeChild(loadingIndicator)
		})
		await delay(500)
		const settingsPanel = new SettingsPanelPageObject(page)
		await settingsPanel.open()
		await settingsPanel.toggleTreeViewSearchPanel()
		await settingsPanel.rightClickRootNodeInTreeViewSearchPanel()
		const ribbonBar = new RibbonBarPageObject(page)

		const actual = await ribbonBar.getAreaMetricValue()
		expect(actual).toBe("600")
	})
})
