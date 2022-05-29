import { Component, Inject } from "@angular/core"
import { MatSlideToggleChange } from "@angular/material/slide-toggle"
import { Store } from "../../../../state/angular-redux/store"
import { setScreenshotToClipboardEnabled } from "../../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { screenshotToClipboardEnabledSelector } from "../../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { setExperimentalFeaturesEnabled } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { experimentalFeaturesEnabledSelector } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"
import { setHideFlatBuildings } from "../../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { hideFlatBuildingsSelector } from "../../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.selector"
import { setIsWhiteBackground } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { isWhiteBackgroundSelector } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.selector"
import { setResetCameraIfNewFileIsLoaded } from "../../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { resetCameraIfNewFileIsLoadedSelector } from "../../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"

@Component({
	template: require("./globalConfigurationDialog.component.html")
})
export class GlobalConfigurationDialogComponent {
	screenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)
	experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)
	isWhiteBackground$ = this.store.select(isWhiteBackgroundSelector)
	hideFlatBuildings$ = this.store.select(hideFlatBuildingsSelector)
	resetCameraIfNewFileIsLoaded$ = this.store.select(resetCameraIfNewFileIsLoadedSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleResetCameraIfNewFileIsLoadedChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setResetCameraIfNewFileIsLoaded(event.checked))
	}

	handleHideFlatBuildingsChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setHideFlatBuildings(event.checked))
	}

	handleIsWhiteBackgroundChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setIsWhiteBackground(event.checked))
	}

	handleExperimentalFeaturesEnabledChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setExperimentalFeaturesEnabled(event.checked))
	}

	handleScreenshotToClipboardEnabledChanged(event: MatSlideToggleChange) {
		this.store.dispatch(setScreenshotToClipboardEnabled(event.checked))
	}
}