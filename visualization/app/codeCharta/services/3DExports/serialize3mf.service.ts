import { strToU8, zipSync } from "fflate"
import { Matrix4, Mesh, MeshBasicMaterial, Vector3 } from "three"

interface Volume {
	id: number
	name: string
	color: string
	extruder: number
	firstTriangleId: number
	lastTriangleId: number
}

export async function serialize3mf(mesh: Mesh): Promise<string> {
	const { vertices, triangles, volumes } = await extractMeshData(mesh)
	const model = buildModel(vertices, triangles)
	const modelConfig = buildModelConfig(volumes)
	const contentType = buildContentType()

	const data = {
		"3D": {
			"3dmodel.model": strToU8(model)
		},
		rels: {
			".rels": strToU8(buildRels())
		},
		Metadata: {
			"Slic3r_PE_model.config": strToU8(modelConfig)
		},
		"[Content_Types].xml": strToU8(contentType)
	}
	const options = {
		comment: "created by CodeCharta"
	}

	const compressed3mf = zipSync(data, options).buffer
	return compressed3mf as unknown as string
}

function buildModel(vertices, triangles): string {
	const modelHeader = buildModelHeader()
	const verticesString = buildModelVertices(vertices)
	const trianglesString = buildModelTriangles(triangles)
	const modelFooter = buildModelFooter()

	return modelHeader + verticesString + trianglesString + modelFooter
}
function buildModelHeader(): string {
	let model = '<?xml version="1.0" encoding="UTF-8"?>\n'
	model +=
		'<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06">\n'
	model += ' <metadata name="Application">CodeCharta-JSCAD</metadata>\n'
	model += " <resources>\n"
	model += '  <object id="1" type="model">\n'
	model += "   <mesh>\n"
	return model
}
function buildModelVertices(vertices): string {
	let verticesString = `    <vertices>\n`
	for (const vertex of vertices) {
		verticesString += `     ${vertex}`
	}
	verticesString += `    </vertices>\n`
	return verticesString
}
function buildModelTriangles(triangles): string {
	let trianglesString = `    <triangles>\n`
	for (const triangle of triangles) {
		trianglesString += `     ${triangle}`
	}
	trianglesString += `    </triangles>\n`
	return trianglesString
}
function buildModelFooter(): string {
	let modelFooter = `   </mesh>\n`
	modelFooter += `  </object>\n`
	modelFooter += ` </resources>\n`
	modelFooter += ` <build>\n`
	modelFooter += `  <item objectid="1"/>\n`
	modelFooter += ` </build>\n`
	modelFooter += `</model>`
	return modelFooter
}

function buildModelConfig(volumes: Volume[]): string {
	let modelConfig = buildModelConfigHeader()

	for (const volume of volumes) {
		modelConfig += buildModelConfigVolumes(volume)
	}

	modelConfig += buildModelConfigFooter()

	return modelConfig
}
function buildModelConfigHeader(): string {
	let modelConfig = '<?xml version="1.0" encoding="UTF-8"?>\n<config>\n'
	modelConfig += ` <object id="1" type="model">\n`
	modelConfig += `  <metadata type="object" key="name" value="CodeCharta Map"/>\n`
	return modelConfig
}
function buildModelConfigVolumes(volume: Volume) {
	return (
		`  <volume firstid="${volume.firstTriangleId}" lastid="${volume.lastTriangleId}">\n` +
		`   <metadata type="volume" key="name" value="${volume.name}"/>\n` +
		`   <metadata type="volume" key="extruder" value="${volume.extruder}"/>\n` +
		`   <metadata type="volume" key="source_object_id" value="1"/>\n` +
		`   <metadata type="volume" key="source_volume_id" value="${volume.id}"/>\n` +
		"  </volume>\n"
	)
}
function buildModelConfigFooter(): string {
	let modelConfigFooter = " </object>\n"
	modelConfigFooter += "</config>"
	return modelConfigFooter
}

function buildRels(): string {
	return (
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'   <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'   <Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>' +
		"</Relationships>"
	)
}

function buildContentType(): string {
	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		` <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n` +
		`  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n` +
		`  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n` +
		`  <Default Extension="png" ContentType="image/png"/>\n` +
		` </Types>`
	)
}

function extractMeshData(mesh: Mesh): {
	vertices: string[]
	triangles: string[]
	volumes: Volume[]
} {
	const vertices: string[] = []
	const triangles: string[] = []
	const volumes: Volume[] = []
	const vertexToNewVertexIndex: Map<string, number> = new Map()
	const colorToExtruder: Map<string, number> = new Map()
	const volumeCount = 1

	for (const child of mesh.children as Mesh[]) {
		extractChildMeshData(child, vertices, triangles, vertexToNewVertexIndex, volumeCount, colorToExtruder, volumes)
	}

	return { vertices, triangles, volumes }
}

function extractChildMeshData(
	mesh: Mesh,
	vertices,
	triangles,
	vertexToNewVertexIndex,
	volumeCount,
	colorToExtruder,
	volumes,
	parentMatrix: Matrix4 = undefined
): void {
	if (!mesh.visible) {
		return
	}
	for (const child of mesh.children as Mesh[]) {
		let parentMatrix = mesh.matrix
		if (parentMatrix) {
			parentMatrix = parentMatrix.clone().multiply(mesh.matrix)
		}
		extractChildMeshData(child, vertices, triangles, vertexToNewVertexIndex, volumeCount, colorToExtruder, volumes, parentMatrix)
	}

	const colorNodeGroups = groupMeshVerticesByColor(mesh)
	const vertexIndexToNewVertexIndex: Map<number, number> = new Map()

	for (const { color, vertexIndexes } of colorNodeGroups) {
		const firstTriangleId = triangles.length

		const { firstVertexId, lastVertexId } = constructVertices(
			vertices,
			vertexToNewVertexIndex,
			vertexIndexToNewVertexIndex,
			vertexIndexes,
			mesh,
			parentMatrix
		)

		constructTriangles(mesh.geometry, triangles, vertexIndexToNewVertexIndex, firstVertexId, lastVertexId)

		constructVolume(mesh, color, firstTriangleId, triangles.length - 1, volumes, volumeCount, colorToExtruder)
		volumeCount++
	}
}
function groupMeshVerticesByColor(mesh: Mesh): { color: string; vertexIndexes: number[] }[] {
	const colorNodeGroups: { color: string; vertexIndexes: number[] }[] = []

	if (mesh.geometry.attributes.color) {
		for (let index = 0; index < mesh.geometry.attributes.color.count; index++) {
			const hexColorString = convertColorArrayToHexString(mesh.geometry.attributes.color, index)
			const colorNodeGroup = colorNodeGroups.find(cng => cng.color === hexColorString)

			if (colorNodeGroup) {
				colorNodeGroup.vertexIndexes.push(index)
			} else {
				colorNodeGroups.push({ color: hexColorString, vertexIndexes: [index] })
			}
		}
	} else {
		const material = mesh.material as MeshBasicMaterial
		const hexColorString = material.color.getHexString()
		const colorNodeGroup = colorNodeGroups.find(cng => cng.color === hexColorString)
		const indexArray = Array.from({ length: mesh.geometry.attributes.position.count }, (_, index) => index)

		if (colorNodeGroup) {
			colorNodeGroup.vertexIndexes.push(...indexArray)
		} else {
			colorNodeGroups.push({ color: hexColorString, vertexIndexes: indexArray })
		}
	}
	return colorNodeGroups
}

function constructVertices(
	vertices,
	vertexToNewVertexIndex,
	vertexIndexToNewVertexIndex,
	vertexIndexes,
	mesh: Mesh,
	parentMatrix: Matrix4
): { firstVertexId: number; lastVertexId: number } {
	const firstVertexId = vertexIndexToNewVertexIndex.size

	const positionAttribute = mesh.geometry.attributes.position
	for (const vertexIndex of vertexIndexes) {
		const vertex = new Vector3(
			positionAttribute.getX(vertexIndex) * mesh.scale.x,
			positionAttribute.getY(vertexIndex) * mesh.scale.y,
			positionAttribute.getZ(vertexIndex) * mesh.scale.z
		)
		if (parentMatrix) {
			vertex.applyMatrix4(parentMatrix)
		}
		vertex.add(mesh.position)

		const vertexString = `<vertex x="${vertex.x}" y="${vertex.y}" z="${vertex.z}"/>\n`

		if (!vertexToNewVertexIndex.has(vertexString)) {
			vertices.push(vertexString)
			vertexToNewVertexIndex.set(vertexString, vertices.length - 1)
			vertexIndexToNewVertexIndex.set(vertexIndex, vertices.length - 1)
		} else {
			vertexIndexToNewVertexIndex.set(vertexIndex, vertexToNewVertexIndex.get(vertexString))
		}
	}

	return { firstVertexId, lastVertexId: vertexIndexToNewVertexIndex.size - 1 }
}
function constructTriangles(geometry, triangles, vertexIndexToNewVertexIndex, firstVertexId, lastVertexId): void {
	if (!geometry.index) {
		for (let index = 0; index < geometry.attributes.position.count; index += 3) {
			const triangle = `<triangle v1="${vertexIndexToNewVertexIndex.get(index)}" v2="${vertexIndexToNewVertexIndex.get(
				index + 1
			)}" v3="${vertexIndexToNewVertexIndex.get(index + 2)}" />\n`
			triangles.push(triangle)
		}
	} else {
		const indexAttribute = geometry.index
		for (let index = 0; index < indexAttribute.count; index += 3) {
			const index1 = indexAttribute.getX(index)
			const index2 = indexAttribute.getY(index)
			const index3 = indexAttribute.getZ(index)

			if (
				index1 >= firstVertexId &&
				index1 <= lastVertexId &&
				index2 >= firstVertexId &&
				index2 <= lastVertexId &&
				index3 >= firstVertexId &&
				index3 <= lastVertexId
			) {
				const triangle = `<triangle v1="${vertexIndexToNewVertexIndex.get(index1)}" v2="${vertexIndexToNewVertexIndex.get(
					index2
				)}" v3="${vertexIndexToNewVertexIndex.get(index3)}" />\n`
				triangles.push(triangle)
			}
		}
	}
}
function constructVolume(child, color, firstTriangleId, lastTriangleId, volumes, volumeCount, colorToExtruder): void {
	if (!colorToExtruder.has(color)) {
		colorToExtruder.set(color, colorToExtruder.size + 1)
	}
	const extruder = colorToExtruder.get(color)
	const volumeName = child.name === "Map" ? `${child.name} 0x${color}` : child.name
	const volume: Volume = {
		id: volumeCount,
		name: volumeName,
		color,
		extruder,
		firstTriangleId,
		lastTriangleId
	}
	volumes.push(volume)
}

function convertColorArrayToHexString(color, index: number): string {
	const colorsArray = [color.getX(index), color.getY(index), color.getZ(index)]

	if (colorsArray[0] === colorsArray[1] && colorsArray[1] === colorsArray[2]) {
		colorsArray[0] = 0.5
		colorsArray[1] = 0.5
		colorsArray[2] = 0.5
	}

	return colorsArray
		.map(c =>
			Math.round(c * 255)
				.toString(16)
				.padStart(2, "0")
		)
		.join("")
}
