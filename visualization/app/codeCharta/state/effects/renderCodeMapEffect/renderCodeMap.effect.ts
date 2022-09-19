import { Inject, Injectable } from "@angular/core"
import { asyncScheduler, combineLatest, filter, tap, throttleTime } from "rxjs"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRendererService"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"
import { ScalingActions } from "../../store/appSettings/scaling/scaling.actions"
import { actionsRequiringRerender } from "./actionsRequiringRerender"

export const maxFPS = 1000 / 60

// don't inject AngularJS services, as AngularJS is not yet bootstrapped when Effects are bootstrapped
@Injectable()
export class RenderCodeMapEffect {
	constructor(
		@Inject(Store) private store: Store,
		@Inject(ActionsToken) private actions$: Actions,
		@Inject(UploadFilesService) private uploadFilesService: UploadFilesService
	) {}

	private actionsRequiringRender$ = this.actions$.pipe(
		filter(action => actionsRequiringRerender.some(actions => isActionOfType(action.type, actions)))
	)

	renderCodeMap$ = createEffect(
		() =>
			combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
				filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
				throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
				tap(([accumulatedData, action]) => {
					CodeMapRenderService.instance.render(accumulatedData.unifiedMapNode)
					ThreeRendererService.instance.render()
					if (isActionOfType(action.type, ScalingActions)) {
						CodeMapRenderService.instance.scaleMap()
					}
				})
			),
		{ dispatch: false }
	)

	removeLoadingIndicatorAfterRender$ = createEffect(
		() =>
			this.renderCodeMap$.pipe(
				filter(() => !this.uploadFilesService.isUploading),
				tap(() => {
					this.store.dispatch(setIsLoadingFile(false))
					this.store.dispatch(setIsLoadingMap(false))
				})
			),
		{ dispatch: false }
	)
}