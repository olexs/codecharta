package de.maibornwolff.codecharta.indentationlevelparser

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.importer.indentationlevelparser.model.FileMetrics
import de.maibornwolff.codecharta.importer.indentationlevelparser.ProjectGenerator
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStreamWriter
import java.io.PrintStream

class ProjectGeneratorTest {

    @Test
    fun `project name is set correctly`() {
        val metricsMap = mapOf<String, FileMetrics>()
        val result = ByteArrayOutputStream()
        val projectName = "foo"

        val metricWriter = ProjectGenerator(OutputStreamWriter(PrintStream(result)))
        metricWriter.generate(metricsMap, projectName, null)

        Assertions.assertThat(result.toString()).contains("\"projectName\":\"foo\"")
    }

    @Test
    fun `file hierarchy and metrics are stored correctly`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_1.cc.json").absoluteFile
        val metricsMap = mutableMapOf<String, FileMetrics>()
        metricsMap["bar/FooBar.java"] = FileMetrics().addMetric("foo", 0).addMetric("bar", 18)
        metricsMap["foo.java"] = FileMetrics().addMetric("barx", 42)
        val result = ByteArrayOutputStream()

        ProjectGenerator(OutputStreamWriter(PrintStream(result))).generate(metricsMap, "", null)

        val resultJSON = JsonParser().parse(result.toString())
        val expectedJson = JsonParser().parse(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `piped project is merged`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_2.cc.json").absoluteFile
        val pipedProject = ProjectDeserializer.deserializeProject(File("src/test/resources/cc_projects/project_1.cc.json").inputStream())
        val metricsMap = mutableMapOf<String, FileMetrics>()
        metricsMap["foo.java"] = FileMetrics().addMetric("bar", 18)
        val result = ByteArrayOutputStream()

        ProjectGenerator(OutputStreamWriter(PrintStream(result))).generate(metricsMap, "", pipedProject)

        val resultJSON = JsonParser().parse(result.toString())
        val expectedJson = JsonParser().parse(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }
}