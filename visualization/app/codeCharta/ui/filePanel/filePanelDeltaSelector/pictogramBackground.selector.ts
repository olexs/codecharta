import { MapColors } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"

export const _mapColors2pictogramColors = (mapColors: Pick<MapColors, "positiveDelta" | "negativeDelta">) =>
	`linear-gradient(${mapColors.positiveDelta} 50%, ${mapColors.negativeDelta} 50%)`

export const pictogramBackgroundSelector = createSelector([mapColorsSelector], _mapColors2pictogramColors)