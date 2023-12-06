package de.maibornwolff.codecharta.importer.tokeiimporter

import com.google.gson.JsonElement
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.ImporterStrategy
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.TokeiInnerStrategy
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.TokeiTwelveStrategy
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectInputReader
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParser
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParserSyncFlag
import de.maibornwolff.codecharta.util.InputHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.util.concurrent.Callable

@CommandLine.Command(
        name = TokeiImporter.NAME,
        description = [TokeiImporter.DESCRIPTION],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class TokeiImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Unit>, InteractiveParser, PipeableParser {

    private val logger = KotlinLogging.logger {}

    private val attributeTypes = AttributeTypes(type = "nodes")
        .add("rloc", AttributeType.absolute)
        .add("loc", AttributeType.absolute)
        .add("empty_lines", AttributeType.absolute)
        .add("comment_lines", AttributeType.absolute)

    private lateinit var projectBuilder: ProjectBuilder

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-r", "--root-name"], description = ["root folder as specified when executing tokei"])
    private var rootName = "."

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = "/"

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File "])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["tokei generated json"])
    private var file: File? = null

    private lateinit var importerStrategy: ImporterStrategy

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "tokeiimporter"
        const val DESCRIPTION = "generates cc.json from tokei json"

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine(TokeiImporter(input, output, error)).setOut(PrintWriter(output)).execute(*args)
        }

        @JvmStatic
        val TOP_LEVEL_OBJECT = "inner"
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        logPipeableParserSyncSignal(PipeableParserSyncFlag.SYNC_FLAG)

        projectBuilder = ProjectBuilder()
        val root = getInput() ?: return null
        runBlocking(Dispatchers.Default) {
            determineImporterStrategy(root)
            val languageSummaries = importerStrategy.getLanguageSummaries(root)
            importerStrategy.buildCCJson(languageSummaries, projectBuilder)
        }
        projectBuilder.addAttributeTypes(attributeTypes)
        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())
        val project = projectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun determineImporterStrategy(root: JsonElement) {
        val json = root.asJsonObject
        importerStrategy = if (json.has(TOP_LEVEL_OBJECT)) {
            TokeiInnerStrategy(rootName, pathSeparator)
        } else {
            TokeiTwelveStrategy(rootName, pathSeparator)
        }
    }

    private fun getInput(): JsonElement? {
        var root: JsonElement? = null
        runBlocking(Dispatchers.Default) {
            if (file != null) {
                launch {
                    if (InputHelper.isInputValid(arrayOf(file!!), canInputContainFolders = false)) {
                        val bufferedReader = file!!.bufferedReader()
                        root = JsonParser.parseReader(bufferedReader)
                    } else {
                        throw IllegalArgumentException("Input invalid file for TokeiImporter, stopping execution...")
                    }
                }
            } else {
                launch {
                    val projectString: String = ProjectInputReader.extractProjectString(input)
                    if (projectString.isNotEmpty()) {
                        root = JsonParser.parseString(projectString)
                    } else {
                        logger.error("Neither source file nor piped input found.")
                    }
                }
            }
        }

        return root
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
