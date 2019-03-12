"use strict";

import * as d3 from "d3";
import {HierarchyNode} from "d3-hierarchy";
import * as deepcopy from "deepcopy";
import {CodeMapNodeDecoratorService} from "../../ui/codeMap/codeMap.nodeDecorator.service";
import { CodeMapNode, CCFile } from "../../codeCharta.model";

export interface KVObject {
    [key: string]: number;
}

/**
 * Calculates the deltas between given maps and modifies the data structure
 */
export class DeltaCalculatorService {

    /* @ngInject */
    constructor(private dataDecoratorService: CodeMapNodeDecoratorService) {

    }

    public provideDeltas(leftFile: CCFile, rightFile: CCFile, metrics: string[]) {

        const leftMap = leftFile.map;
        const rightMap = rightFile.map;

        //null checks
        if(!leftMap || !rightMap){
            return;
        }

        //remove cross origin nodes from maps
        this.removeCrossOriginNodes(leftFile);
        this.removeCrossOriginNodes(rightFile);

        //build hash maps for fast search indices
        let firstLeafHashMap = new Map<string, CodeMapNode>();
        d3.hierarchy(leftMap).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
            firstLeafHashMap.set(node.data.path, node.data);
        });

        let secondLeafHashMap = new Map<string, CodeMapNode>();
        d3.hierarchy(rightMap).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
            secondLeafHashMap.set(node.data.path, node.data);
        });

        //insert nodes from the other map
        this.insertNodesIntoMapsAndHashmaps(firstLeafHashMap, secondLeafHashMap, leftMap, rightMap, metrics);
        this.insertNodesIntoMapsAndHashmaps(secondLeafHashMap, firstLeafHashMap, rightMap, leftMap, metrics);

        //calculate deltas between leaves
        firstLeafHashMap.forEach((node, path) => {
            let otherNode = secondLeafHashMap.get(path);
            otherNode.deltas = this.calculateAttributeListDelta(node.attributes, otherNode.attributes);
            node.deltas = this.calculateAttributeListDelta(otherNode.attributes, node.attributes);
        });

    }

    public removeCrossOriginNodes(file: CCFile) {

            let root = d3.hierarchy<CodeMapNode>(file.map);
            root.each((node) => {
                if (node.data.children) {
                    node.data.children = node.data.children.filter(x => (x.origin === file.fileMeta.fileName));
                }
            });

    }

    private insertNodesIntoMapsAndHashmaps(firstLeafHashMap: Map<string, CodeMapNode>, secondLeafHashMap: Map<string, CodeMapNode>, firstMap: CodeMapNode, secondMap: CodeMapNode, metrics: string[]) {
        firstLeafHashMap.forEach((node, path) => {
            if (!secondLeafHashMap.has(path)) {
                // insert node into secondHashMap and secondMap
                let addedNode = this.deepcopy(node);
                secondLeafHashMap.set(path, addedNode);
                this.insertNodeIntoMapByPath(addedNode, secondMap, metrics);
            }
        });
    }

    private insertNodeIntoMapByPath(node: CodeMapNode, insertMap: CodeMapNode, metrics: string[]) {

        let pathArray: string[] = node.path.split("/");

        let insertPathArray: string[] = pathArray.slice(2, pathArray.length - 1);
        let currentPathArray: string[] = pathArray.slice(0, 2);
        let current = insertMap;


        while (insertPathArray.length > 0) {

            let childFoundSteppingIntoIt = false;

            if (current.children) {

                for (let i = 0; i < current.children.length && !childFoundSteppingIntoIt; i++) {
                    let child = current.children[i];
                    if (child.name === insertPathArray[0]) {
                        // step into existing folder
                        current = child;
                        currentPathArray.push(insertPathArray[0]);
                        insertPathArray = insertPathArray.slice(1);
                        childFoundSteppingIntoIt = true;
                    }
                }

            } else {
                current.children = [];
            }

            if (!childFoundSteppingIntoIt) {
                //create new folder and start again
                currentPathArray.push(insertPathArray[0]);

                let folder = {
                    name: insertPathArray[0],
                    path: currentPathArray.join("/"),
                    type: "Folder",
                    children: [],
                    origin: node.origin,
                    visible: true,
                    attributes: {}
                };

                // TODO: delta -> decorateNodeWithChildrenSumMetrics()
                //this.dataDecoratorService.decorateNodeWithChildrenSumMetrics(d3.hierarchy(folder), metrics);
                folder.attributes["unary"] = 1;

                current.children.push(folder);
                current = folder;


                insertPathArray = insertPathArray.slice(1);
            }

        }

        // insert node
        if (!current.children) {
            current.children = [];
        }
        current.children.push(node);

    }

    private deepcopy(root:CodeMapNode): CodeMapNode {

        //deepcopy
        let h = d3.hierarchy(root);
        let copy: HierarchyNode<CodeMapNode> = deepcopy.default(h.copy()); //Hm this seems to be doing the right thing. First shallow copy then a deep copy ?!

        //make own attributes 0 (not unary)
        for (let property in copy.data.attributes) {
            if (copy.data.attributes.hasOwnProperty(property)) {
                copy.data.attributes[property] = 0;
            }
        }

        copy.data.attributes.unary = 1;

        ////make all ancestors attributes 0
        copy.each((node) => {
            for (let property in node.data.attributes) {
                if (node.data.attributes.hasOwnProperty(property)) {
                    node.data.attributes[property] = 0;
                }
            }
            copy.data.attributes.unary = 1;
        });

        return copy.data;

    }

    private calculateAttributeListDelta(first: KVObject, second: KVObject) {
        let deltas = {};
        for (let key in second) {
            if (key) {
                let firstValue = first[key] ? first[key] : 0; //assume zero if no value in first
                let secondValue = second[key];
                let delta = secondValue - firstValue;
                deltas[key] = delta;
            }
        }
        return deltas;
    }

}
