import { Inject, Injectable } from "@angular/core"
import { combineLatest, filter, map } from "rxjs"
import { isActionOfType } from "../../../../util/reduxHelper"
import { createEffect } from "../../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../../angular-redux/effects/effects.module"
import { Store } from "../../../angular-redux/store"
import {
	MetricMinMax,
	selectedColorMetricDataSelector
} from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { FilesSelectionActions } from "../../files/files.actions"
import { ColorMetricActions } from "../colorMetric/colorMetric.actions"
import { setColorRange } from "./colorRange.actions"

@Injectable()
export class ResetColorRangeEffect {
	private selectedColorMetricData$ = this.store.select(selectedColorMetricDataSelector)
	private resetActions$ = this.actions$.pipe(
		filter(action => isActionOfType(action.type, FilesSelectionActions) || isActionOfType(action.type, ColorMetricActions))
	)

	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(Store) private store: Store) {}

	resetColorRange$ = createEffect(() =>
		combineLatest([this.resetActions$, this.selectedColorMetricData$]).pipe(
			map(([, selectedColorMetricData]) => setColorRange(_metricMinMaxToInitialColorRange(selectedColorMetricData)))
		)
	)
}

export const _metricMinMaxToInitialColorRange = (metricMinMax: MetricMinMax) => {
	const totalRange = metricMinMax.maxValue - metricMinMax.minValue
	const aThird = Math.round(totalRange / 3)
	const firstThird = aThird + metricMinMax.minValue
	const secondThird = aThird * 2 + metricMinMax.minValue
	return { from: firstThird, to: secondThird }
}