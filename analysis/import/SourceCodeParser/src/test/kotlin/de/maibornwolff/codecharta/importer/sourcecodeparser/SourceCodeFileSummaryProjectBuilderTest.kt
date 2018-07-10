package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FileSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricCollection
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.JsonPrinter
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class SourceCodeFileSummaryProjectBuilderTest {

    @Test
    fun project_name_matches() {
        val projectName = "CoolProject"

        val project = JsonPrinter(projectName).build()

        assertThat(project.projectName).isEqualTo(projectName)
    }

    @Test
    fun empty_project_has_no_nodes_except_root() {
        val projectName = "CoolProject"

        val project = JsonPrinter(projectName).build()

        assertThat(project.rootNode.children.size).isEqualTo(0)
    }

    @Test
    fun component_without_path_is_right_under_root() {
        val projectName = "CoolProject"
        val fileSummary = FileSummary("CoolComponent", "", MetricCollection())

        val project = JsonPrinter(projectName)
                .addComponentAsNode(fileSummary)
                .build()

        assertThat(project.rootNode.children[0].name).isEqualTo(fileSummary.name)
    }

    @Test
    fun project_node_matches_metrics() {
        val projectName = "CoolProject"
        val fileSummary = FileSummary("CoolComponent", "", MetricCollection(MetricType.LoC to 1))

        val project = JsonPrinter(projectName)
                .addComponentAsNode(fileSummary)
                .build()

        assertThat(project.rootNode.children[0].attributes["lines_of_code"]).isEqualTo(fileSummary[MetricType.LoC])
    }

    @Test
    fun project_file_node_count_matches_components() {
        val projectName = "CoolProject"

        val project = JsonPrinter(projectName)
                .addComponentAsNode(FileSummary("CoolComponent", "", MetricCollection()))
                .addComponentAsNode(FileSummary("CoolerComponent", "", MetricCollection()))
                .addComponentAsNode(FileSummary("BestComponent", "de", MetricCollection()))
                .build()

        assertThat(filterFiles(project.rootNode).size).isEqualTo(3)
    }

    private fun filterFiles(node: Node): List<Node>{
        val files = mutableListOf<Node>()
        node.children.forEach{
            if(it.type == NodeType.File){ files.add(it)}
            else {files.addAll(filterFiles(it))}
        }
        return files
    }

}