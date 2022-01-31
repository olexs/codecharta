import angular from "angular"
import { ColorModeService } from "./store/dynamicSettings/colorMode/colorMode.service"
import { RecentFilesService } from "./store/dynamicSettings/recentFiles/recentFiles.service"
import { ColorLabelsService } from "./store/appSettings/colorLabels/colorLabels.service"
import { LabelShowMetricValueService } from "./store/appSettings/showMetricLabelNodeName/labelShowMetricValueService"
import { LabelShowNodeNameService } from "./store/appSettings/showMetricLabelNameValue/labelShowNodeNameService"
import { PanelSelectionService } from "./store/appSettings/panelSelection/panelSelection.service"
import { NodeMetricDataService } from "./store/metricData/nodeMetricData/nodeMetricData.service"
import { CameraTargetService } from "./store/appSettings/cameraTarget/cameraTarget.service"
import { IdToNodeService } from "./store/lookUp/idToNode/idToNode.service"
import { IdToBuildingService } from "./store/lookUp/idToBuilding/idToBuilding.service"
import { IsAttributeSideBarVisibleService } from "./store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { SearchPanelModeService } from "./store/appSettings/searchPanelMode/searchPanelMode.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { IsLoadingMapService } from "./store/appSettings/isLoadingMap/isLoadingMap.service"
import { FilesService } from "./store/files/files.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { MapColorsService } from "./store/appSettings/mapColors/mapColors.service"
import { ResetCameraIfNewFileIsLoadedService } from "./store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.service"
import { ShowOnlyBuildingsWithEdgesService } from "./store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { IsWhiteBackgroundService } from "./store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { DynamicMarginService } from "./store/appSettings/dynamicMargin/dynamicMargin.service"
import { InvertHeightService } from "./store/appSettings/invertHeight/invertHeight.service"
import { HideFlatBuildingsService } from "./store/appSettings/hideFlatBuildings/hideFlatBuildings.service"
import { CameraService } from "./store/appSettings/camera/camera.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { EdgeHeightService } from "./store/appSettings/edgeHeight/edgeHeight.service"
import { AmountOfEdgePreviewsService } from "./store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { AmountOfTopLabelsService } from "./store/appSettings/amountOfTopLabels/amountOfTopLabels.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { AttributeTypesService } from "./store/fileSettings/attributeTypes/attributeTypes.service"
import { EdgeMetricService } from "./store/dynamicSettings/edgeMetric/edgeMetric.service"
import { ColorRangeService } from "./store/dynamicSettings/colorRange/colorRange.service"
import { MarginService } from "./store/dynamicSettings/margin/margin.service"
import { SearchPatternService } from "./store/dynamicSettings/searchPattern/searchPattern.service"
import { FocusedNodePathService } from "./store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { HeightMetricService } from "./store/dynamicSettings/heightMetric/heightMetric.service"
import { DistributionMetricService } from "./store/dynamicSettings/distributionMetric/distributionMetric.service"
import { ColorMetricService } from "./store/dynamicSettings/colorMetric/colorMetric.service"
import { AreaMetricService } from "./store/dynamicSettings/areaMetric/areaMetric.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { InjectorService } from "./injector.service"
import { StoreService } from "./store.service"
import "../codeCharta.module"
import camelCase from "lodash.camelcase"
import { IsPresentationModeService } from "./store/appSettings/isPresentationMode/isPresentationMode.service"
import { EdgeMetricDataService } from "./store/metricData/edgeMetricData/edgeMetricData.service"
import { MetricDataService } from "./store/metricData/metricData.service"
import { ExperimentalFeaturesEnabledService } from "./store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { LayoutAlgorithmService } from "./store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { MaxTreeMapFilesService } from "./store/appSettings/maxTreeMapFiles/maxTreeMapFiles.service"
import { SharpnessModeService } from "./store/appSettings/sharpnessMode/sharpnessMode.service"
import { ScreenshotToClipboardEnabledService } from "./store/appSettings/enableClipboard/screenshotToClipboardEnabled.service"
import { InvertAreaService } from "./store/appSettings/invertArea/invertArea.service"

angular
	.module("app.codeCharta.state", ["app.codeCharta"])
	.service(camelCase(ColorModeService.name), ColorModeService)
	.service(camelCase(RecentFilesService.name), RecentFilesService)
	.service(camelCase(ColorLabelsService.name), ColorLabelsService)
	.service(camelCase(LabelShowMetricValueService.name), LabelShowMetricValueService)
	.service(camelCase(LabelShowNodeNameService.name), LabelShowNodeNameService)
	.service(camelCase(MetricDataService.name), MetricDataService)
	.service(camelCase(EdgeMetricDataService.name), EdgeMetricDataService)
	.service(camelCase(NodeMetricDataService.name), NodeMetricDataService)
	.service(camelCase(PanelSelectionService.name), PanelSelectionService)
	.service(camelCase(CameraTargetService.name), CameraTargetService)
	.service(camelCase(IdToNodeService.name), IdToNodeService)
	.service(camelCase(IdToBuildingService.name), IdToBuildingService)
	.service(camelCase(IsAttributeSideBarVisibleService.name), IsAttributeSideBarVisibleService)
	.service(camelCase(SearchPanelModeService.name), SearchPanelModeService)
	.service(camelCase(IsLoadingFileService.name), IsLoadingFileService)
	.service(camelCase(IsLoadingMapService.name), IsLoadingMapService)
	.service(camelCase(FilesService.name), FilesService)
	.service(camelCase(MapSizeService.name), MapSizeService)
	.service(camelCase(MapColorsService.name), MapColorsService)
	.service(camelCase(ResetCameraIfNewFileIsLoadedService.name), ResetCameraIfNewFileIsLoadedService)
	.service(camelCase(ShowOnlyBuildingsWithEdgesService.name), ShowOnlyBuildingsWithEdgesService)
	.service(camelCase(IsWhiteBackgroundService.name), IsWhiteBackgroundService)
	.service(camelCase(DynamicMarginService.name), DynamicMarginService)
	.service(camelCase(InvertHeightService.name), InvertHeightService)
	.service(camelCase(InvertAreaService.name), InvertAreaService)
	.service(camelCase(HideFlatBuildingsService.name), HideFlatBuildingsService)
	.service(camelCase(CameraService.name), CameraService)
	.service(camelCase(ScalingService.name), ScalingService)
	.service(camelCase(EdgeHeightService.name), EdgeHeightService)
	.service(camelCase(AmountOfEdgePreviewsService.name), AmountOfEdgePreviewsService)
	.service(camelCase(AmountOfTopLabelsService.name), AmountOfTopLabelsService)
	.service(camelCase(MarkedPackagesService.name), MarkedPackagesService)
	.service(camelCase(EdgesService.name), EdgesService)
	.service(camelCase(AttributeTypesService.name), AttributeTypesService)
	.service(camelCase(EdgeMetricService.name), EdgeMetricService)
	.service(camelCase(ColorRangeService.name), ColorRangeService)
	.service(camelCase(MarginService.name), MarginService)
	.service(camelCase(SearchPatternService.name), SearchPatternService)
	.service(camelCase(FocusedNodePathService.name), FocusedNodePathService)
	.service(camelCase(HeightMetricService.name), HeightMetricService)
	.service(camelCase(DistributionMetricService.name), DistributionMetricService)
	.service(camelCase(ColorMetricService.name), ColorMetricService)
	.service(camelCase(AreaMetricService.name), AreaMetricService)
	.service(camelCase(IsPresentationModeService.name), IsPresentationModeService)
	.service(camelCase(BlacklistService.name), BlacklistService)
	.service(camelCase(InjectorService.name), InjectorService)
	.service(camelCase(StoreService.name), StoreService)
	.service(camelCase(LayoutAlgorithmService.name), LayoutAlgorithmService)
	.service(camelCase(MaxTreeMapFilesService.name), MaxTreeMapFilesService)
	.service(camelCase(SharpnessModeService.name), SharpnessModeService)
	.service(camelCase(ExperimentalFeaturesEnabledService.name), ExperimentalFeaturesEnabledService)
	.service(camelCase(ScreenshotToClipboardEnabledService.name), ScreenshotToClipboardEnabledService)
