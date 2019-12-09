"use strict"
import { MetricData, RecursivePartial, Settings } from "../codeCharta.model"
import { Vector3 } from "three"
import _ from "lodash"

export interface Scenario {
	name: string
	settings: RecursivePartial<Settings>
}

export class ScenarioHelper {
	//TODO: Move Scenarios to Redux Store
	private static scenarios: Scenario[] = ScenarioHelper.importScenarios(require("../assets/scenarios.json"))

	public static getScenarios(metricData: MetricData[]): Scenario[] {
		return this.scenarios.filter(x => this.isScenarioPossible(x, metricData))
	}

	public static isScenarioPossible(scenario: Scenario, metricData: MetricData[]): boolean {
		const metrics = metricData.map(x => x.name)
		return (
			metrics.includes(scenario.settings.dynamicSettings.areaMetric) &&
			metrics.includes(scenario.settings.dynamicSettings.heightMetric) &&
			metrics.includes(scenario.settings.dynamicSettings.colorMetric)
		)
	}

	public static getDefaultScenario(): Scenario {
		return this.scenarios.find(s => s.name == "Complexity")
	}

	public static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		return this.scenarios.find(s => s.name == name).settings
	}

	public static importScenarios(scenarios: Scenario[]): Scenario[] {
		scenarios.forEach(scenario => {
			this.convertToVectors(scenario.settings)
		})
		return scenarios
	}

	private static convertToVectors(settings: RecursivePartial<Settings>) {
		const DEFAULT_VALUE = 0

		for (let key of Object.keys(settings)) {
			if (_.isObject(settings[key])) {
				const xExists = settings[key].hasOwnProperty("x")
				const yExists = settings[key].hasOwnProperty("y")
				const zExists = settings[key].hasOwnProperty("z")

				if (xExists || yExists || zExists) {
					settings[key] = new Vector3(
						xExists ? settings[key].x : DEFAULT_VALUE,
						yExists ? settings[key].y : DEFAULT_VALUE,
						zExists ? settings[key].z : DEFAULT_VALUE
					)
				}
				this.convertToVectors(settings[key])
			}
		}
	}
}
