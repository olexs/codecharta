package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.util.InputHelper
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
        name = StructureModifier.NAME,
        description = [StructureModifier.DESCRIPTION],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class StructureModifier(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Unit?>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["input project file"])
    private var source: File? = null

    @CommandLine.Option(names = ["-s", "--set-root"], description = ["path within project to be extracted"])
    private var setRoot: String? = null

    @CommandLine.Option(
        names = ["-p", "--print-levels"],
        description = ["show first x layers of project hierarchy"]
    )
    private var printLevels: Int = 0

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-f", "--move-from"], description = ["move nodes in project folder..."])
    private var moveFrom: String? = null

    @CommandLine.Option(
            names = ["-r", "--remove"],
            description = ["node(s) to be removed"],
            converter = [(CommaSeparatedStringToListConverter::class)]
    )
    private var remove: Array<String> = arrayOf()

    @CommandLine.Option(names = ["-t", "--move-to"], description = ["... move nodes to destination folder"])
    private var moveTo: String? = null

    private lateinit var project: Project
    private val logger = KotlinLogging.logger {}

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "modify"
        const val DESCRIPTION = "changes the structure of cc.json files"

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine(StructureModifier(input, output, error)).execute(*args)
        }
    }

    override fun call(): Unit? {

        project = readProject() ?: return null

        when {
            printLevels > 0 -> {
                ProjectStructurePrinter(project, output).printProjectStructure(printLevels)
                return null
            }

            setRoot != null -> project = SubProjectExtractor(project).extract(setRoot!!)
            remove.isNotEmpty() -> project = NodeRemover(project).remove(remove)
            moveFrom != null -> project = FolderMover(project).move(moveFrom, moveTo) ?: return null
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, false)

        return null
    }

    private fun readProject(): Project? {
        if (source == null) {
            return ProjectDeserializer.deserializeProject(input)
        }

        if (!InputHelper.isInputValid(arrayOf(source!!), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for StructureModifier, stopping execution...")
        }

        val input = source!!.inputStream()
        return try {
            ProjectDeserializer.deserializeProject(input)
        } catch (e: Exception) {
            val sourceName = source!!.name
            logger.error("$sourceName is not a valid project file and is therefore skipped.")
            null
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
