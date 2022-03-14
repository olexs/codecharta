import { createSelector } from "../../../../state/angular-redux/createSelector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { CodeMapNode, FileCount } from "../../../../codeCharta.model"

export const getFileCount = (node?: Pick<CodeMapNode, "attributes" | "fileCount">): FileCount => {
	if (!node) {
		return
	}

	return {
		all: node.attributes?.unary ?? 0,
		added: node.fileCount?.added ?? 0,
		removed: node.fileCount?.removed ?? 0
	}
}

export const fileCountSelector = createSelector([selectedNodeSelector], getFileCount)