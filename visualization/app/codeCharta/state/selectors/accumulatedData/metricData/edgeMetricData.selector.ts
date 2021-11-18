import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, Edge, EdgeMetricCount, EdgeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { isPathBlacklisted } from "../../../../util/codeMapHelper"
import { createSelector } from "../../../angular-redux/store"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { EdgeMetricDataService } from "../../../store/metricData/edgeMetricData/edgeMetricData.service"
import { visibleFileStatesSelector } from "../../visibleFileStates.selector"
import { sortByMetricName } from "./sortByMetricName"

export type EdgeMetricCountMap = Map<string, EdgeMetricCount>
export type NodeEdgeMetricsMap = Map<string, EdgeMetricCountMap>
// Required for performance improvements
// TODO move this as soon as edgeMetricData.service is deleted, to prevent random access / non unidirectional data flow
export let nodeEdgeMetricsMap: NodeEdgeMetricsMap = new Map()

export const edgeMetricDataSelector = createSelector([visibleFileStatesSelector, blacklistSelector], calculateEdgeMetricData)

export function calculateEdgeMetricData(visibleFileStates: FileState[], blacklist: BlacklistItem[]) {
	nodeEdgeMetricsMap = new Map()
	const allFilePaths: Set<string> = new Set()

	for (const { file } of visibleFileStates) {
		for (const { data } of hierarchy(file.map)) {
			allFilePaths.add(data.path)
		}
	}

	for (const fileState of visibleFileStates) {
		for (const edge of fileState.file.settings.fileSettings.edges) {
			if (bothNodesAssociatedAreVisible(edge, allFilePaths, blacklist)) {
				// TODO: We likely only need the attributes once per file.
				for (const edgeMetric of Object.keys(edge.attributes)) {
					const edgeMetricEntry = getEntryForMetric(edgeMetric)
					addEdgeToNodes(edgeMetricEntry, edge.fromNodeName, edge.toNodeName)
				}
			}
		}
	}
	const newEdgeMetricData = getMetricDataFromMap()
	sortByMetricName(newEdgeMetricData)
	return newEdgeMetricData
}

function bothNodesAssociatedAreVisible(edge: Edge, filePaths: Set<string>, blacklist: BlacklistItem[]) {
	if (filePaths.has(edge.fromNodeName) && filePaths.has(edge.toNodeName)) {
		return (
			!isPathBlacklisted(edge.fromNodeName, blacklist, BlacklistType.exclude) &&
			!isPathBlacklisted(edge.toNodeName, blacklist, BlacklistType.exclude)
		)
	}
	return false
}

function getEntryForMetric(edgeMetricName: string) {
	let nodeEdgeMetric = nodeEdgeMetricsMap.get(edgeMetricName)
	if (!nodeEdgeMetric) {
		nodeEdgeMetric = new Map()
		nodeEdgeMetricsMap.set(edgeMetricName, nodeEdgeMetric)
	}
	return nodeEdgeMetric
}

function addEdgeToNodes(edgeMetricEntry: EdgeMetricCountMap, fromNode: string, toNode: string) {
	const fromNodeEdgeMetric = edgeMetricEntry.get(fromNode)
	if (fromNodeEdgeMetric === undefined) {
		edgeMetricEntry.set(fromNode, { incoming: 0, outgoing: 1 })
	} else {
		fromNodeEdgeMetric.outgoing += 1
	}

	const toNodeEdgeMetric = edgeMetricEntry.get(toNode)
	if (toNodeEdgeMetric === undefined) {
		edgeMetricEntry.set(toNode, { incoming: 1, outgoing: 0 })
	} else {
		toNodeEdgeMetric.incoming += 1
	}
}

function getMetricDataFromMap() {
	const metricData: EdgeMetricData[] = []

	nodeEdgeMetricsMap.set(EdgeMetricDataService.NONE_METRIC, new Map())

	for (const [edgeMetric, occurrences] of nodeEdgeMetricsMap) {
		let maximumMetricValue = 0
		let minimumMetricValue = Number.MIN_SAFE_INTEGER
		for (const value of occurrences.values()) {
			const combinedValue = value.incoming + value.outgoing
			if (combinedValue > maximumMetricValue) {
				maximumMetricValue = combinedValue
			}
			if (combinedValue <= minimumMetricValue) {
				minimumMetricValue = combinedValue
			}
		}
		metricData.push({ name: edgeMetric, maxValue: maximumMetricValue, minValue: minimumMetricValue })
	}

	return metricData
}