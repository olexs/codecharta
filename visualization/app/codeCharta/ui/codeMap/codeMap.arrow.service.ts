import { Node, EdgeVisibility } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { Edge } from "../../codeCharta.model"
import { ArrowHelper, BufferGeometry, CubicBezierCurve3, Line, LineBasicMaterial, Object3D, Vector3 } from "three"
import { BuildingHoveredEventSubscriber, CodeMapBuildingTransition, CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { ColorConverter } from "../../util/color/colorConverter"

export enum EdgeColor {
	Outgoing_Color = "#ff00ff",
	Incoming_Color = "#0066ff"
}

export class CodeMapArrowService implements BuildingHoveredEventSubscriber {
	private VERTICES_PER_LINE = 5
	private map: Map<String, Node>
	private arrows: Object3D[]
	private isHovered: boolean = false
	private hoveredNode: Node

	constructor(
		private $rootScope: IRootScopeService,
		private threeSceneService: ThreeSceneService,
		private settingsService: SettingsService
	) {
		this.arrows = new Array<Object3D>()
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		const edges = this.settingsService.getSettings().fileSettings.edges
		if (data.to && !data.to.node.flat) {
			this.isHovered = true
			this.hoveredNode = data.to.node
			this.clearArrows()
			this.showEdgesOfHoveredBuilding(data.to.node, edges)
		} else {
			this.isHovered = false
			this.clearArrows()
			this.addEdgeArrows(null, edges.filter(x => x.visible != EdgeVisibility.none))
		}
	}

	public clearArrows() {
		this.arrows = []
		while (this.threeSceneService.edgeArrows.children.length > 0) {
			this.threeSceneService.edgeArrows.children.pop()
		}
	}

	public addEdgeArrows(nodes: Node[], edges: Edge[]) {
		if (nodes) {
			this.map = this.getNodesAsMap(nodes)
		}

		for (const edge of edges) {
			const originNode: Node = this.map.get(edge.fromNodeName)
			const targetNode: Node = this.map.get(edge.toNodeName)

			if (originNode && targetNode) {
				this.addArrow(targetNode, originNode, edge.visible)
			}
		}
	}

	private showEdgesOfHoveredBuilding(hoveredNode: Node, edges: Edge[]) {
		for (const edge of edges) {
			const originNode: Node = this.map.get(edge.fromNodeName)
			const targetNode: Node = this.map.get(edge.toNodeName)

			if (originNode && targetNode && (originNode.name === hoveredNode.name || targetNode.name === hoveredNode.name)) {
				this.addArrow(targetNode, originNode)
			}
		}
	}

	public addArrow(arrowTargetNode: Node, arrowOriginNode: Node, edgeVisibility?: EdgeVisibility): void {
		const settings = this.settingsService.getSettings()
		const mapSize = settings.treeMapSettings.mapSize
		const curveScale = 100 * settings.appSettings.edgeHeight

		if (
			arrowTargetNode.attributes &&
			arrowTargetNode.attributes[this.settingsService.getSettings().dynamicSettings.heightMetric] &&
			arrowOriginNode.attributes &&
			arrowOriginNode.attributes[this.settingsService.getSettings().dynamicSettings.heightMetric]
		) {
			const xTarget: number = arrowTargetNode.x0 - mapSize * 0.5
			const yTarget: number = arrowTargetNode.z0
			const zTarget: number = arrowTargetNode.y0 - mapSize * 0.5

			const wTarget: number = arrowTargetNode.width
			const hTarget: number = arrowTargetNode.height
			const lTarget: number = arrowTargetNode.length

			const xOrigin: number = arrowOriginNode.x0 - mapSize * 0.5
			const yOrigin: number = arrowOriginNode.z0
			const zOrigin: number = arrowOriginNode.y0 - mapSize * 0.5

			const wOrigin: number = arrowOriginNode.width
			const hOrigin: number = 1
			const lOrigin: number = arrowOriginNode.length

			const curve = new CubicBezierCurve3(
				arrowOriginNode.outgoingEdgePoint,
				new Vector3(xOrigin + wOrigin / 2, Math.max(yOrigin + hOrigin, yTarget + hTarget) + curveScale, zOrigin + lOrigin / 2),
				new Vector3(xTarget + wTarget / 2, Math.max(yOrigin + hOrigin, yTarget + hTarget) + curveScale, zTarget + lTarget / 2),
				arrowTargetNode.incomingEdgePoint
			)

			if (this.isHovered) {
				this.hoveredMode(curve, arrowOriginNode)
			} else {
				this.previewMode(curve, arrowOriginNode, edgeVisibility)
			}
		}
	}

	private hoveredMode(bezier: CubicBezierCurve3, arrowOriginNode: Node, bezierPoints: number = 50) {
		const points = bezier.getPoints(bezierPoints)
		if (this.hoveredNode.path === arrowOriginNode.path) {
			const curveObject = this.buildLine(points, ColorConverter.convertHexToNumber(EdgeColor.Outgoing_Color))
			curveObject.add(this.buildArrow(points))

			this.threeSceneService.edgeArrows.add(curveObject)
		} else {
			const curveObject = this.buildLine(points, ColorConverter.convertHexToNumber(EdgeColor.Incoming_Color))
			curveObject.add(this.buildArrow(points))

			this.threeSceneService.edgeArrows.add(curveObject)
		}
	}

	private previewMode(curve, arrowOriginNode: Node, edgeVisibility: EdgeVisibility) {
		if (edgeVisibility === EdgeVisibility.both || edgeVisibility === EdgeVisibility.from) {
			const outgoingArrow: Object3D = this.makeOutgoingArrowFromBezier(curve, arrowOriginNode.height)
			this.threeSceneService.edgeArrows.add(outgoingArrow)
			this.arrows.push(outgoingArrow)
		}

		if (edgeVisibility === EdgeVisibility.both || edgeVisibility === EdgeVisibility.to) {
			const incomingArrow: Object3D = this.makeIncomingArrowFromBezier(curve)
			this.threeSceneService.edgeArrows.add(incomingArrow)
			this.arrows.push(incomingArrow)
		}
	}

	public scale(scale: Vector3) {
		for (const arrow of this.arrows) {
			arrow.scale.x = scale.x
			arrow.scale.y = scale.y
			arrow.scale.z = scale.z
		}
	}

	private getNodesAsMap(nodes: Node[]): Map<string, Node> {
		const map = new Map<string, Node>()
		nodes.forEach(node => map.set(node.path, node))
		return map
	}

	private makeIncomingArrowFromBezier(bezier: CubicBezierCurve3, bezierPoints: number = 50): Object3D {
		const points = bezier.getPoints(bezierPoints)
		const pointsIncoming = points.slice(bezierPoints + 1 - this.VERTICES_PER_LINE)

		return this.buildEdge(pointsIncoming, ColorConverter.convertHexToNumber(EdgeColor.Incoming_Color))
	}

	private makeOutgoingArrowFromBezier(bezier: CubicBezierCurve3, height: number, bezierPoints: number = 50): Object3D {
		const points = bezier.getPoints(bezierPoints)
		const pointsOutgoing = this.getPointsToSurpassBuildingHeight(points, height)

		return this.buildEdge(pointsOutgoing, ColorConverter.convertHexToNumber(EdgeColor.Outgoing_Color))
	}

	private buildEdge(points: Vector3[], color: number): Object3D {
		const curveObject = this.buildLine(points, color)
		curveObject.add(this.buildArrow(points))

		return curveObject
	}

	private buildLine(points: Vector3[], color: number = 0) {
		const geometry = new BufferGeometry()
		geometry.setFromPoints(points)

		const material = new LineBasicMaterial({ color, linewidth: 1 })
		return new Line(geometry, material)
	}

	private buildArrow(points: Vector3[], ARROW_COLOR: number = 0, headLength: number = 10, headWidth: number = 10) {
		const dir = points[points.length - 1]
			.clone()
			.sub(points[points.length - 2].clone())
			.normalize()

		const origin = points[points.length - 1].clone()
		return new ArrowHelper(dir, origin, 0, ARROW_COLOR, headLength, headWidth)
	}

	private getPointsToSurpassBuildingHeight(points: Vector3[], height: number): Vector3[] {
		const THRESHHOLD = 100
		const result = []
		let length = 0
		let i = 0

		while (length < height + THRESHHOLD && i < points.length - 1) {
			length += points[i].distanceTo(points[i + 1])
			result.push(points[i])
			i++
		}

		return result
	}
}
