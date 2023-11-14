package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.parser.rawtextparser.model.toInt
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.util.concurrent.Callable

@CommandLine.Command(
        name = RawTextParser.NAME,
        description = [RawTextParser.DESCRIPTION],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class RawTextParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err,
) : Callable<Void>, InteractiveParser {

    private val logger = KotlinLogging.logger {}

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-v", "--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parse"])
    private var inputFile: File? = null

    @CommandLine.Option(
        arity = "0..",
        names = ["-m", "--metrics"],
        description = ["metrics to be computed (select all if not specified)"]
    )
    private var metrics: List<String> = listOf()

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--tab-width"], description = ["tab width used (estimated if not provided)"])
    private var tabWidth: Int? = null

    @CommandLine.Option(names = ["--max-indentation-level"], description = ["maximum Indentation Level (default 10)"])
    private var maxIndentLvl: Int? = null

    @CommandLine.Option(names = ["-e", "--exclude"], description = ["exclude file/folder according to regex pattern"])
    private var exclude: Array<String> = arrayOf()

    @CommandLine.Option(
        names = ["-f", "--file-extensions"],
        description = ["parse only files with specified extensions (default: any)"],
        split = "\\s*,\\s*"
    )
    private var fileExtensions: Array<String> = arrayOf()

    @CommandLine.Option(
        names = ["--without-default-excludes"],
        description = ["include build, target, dist, resources and out folders as well as files/folders starting with '.' "]
    )
    private var withoutDefaultExcludes = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "rawtextparser"
        const val DESCRIPTION = "generates cc.json from projects or source code files"

        @JvmStatic
        fun mainWithInOut(outputStream: PrintStream, input: InputStream, error: PrintStream, args: Array<String>) {
            CommandLine(RawTextParser(input, outputStream, error)).setOut(PrintWriter(outputStream)).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call(): Void? {
        print(" ")
        if (!InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            throw IllegalArgumentException("Input invalid file for RawTextParser, stopping execution...")
        }

        if (!withoutDefaultExcludes) exclude += DEFAULT_EXCLUDES

        val parameterMap = assembleParameterMap()
        val results: Map<String, FileMetrics> =
            MetricCollector(inputFile!!, exclude, fileExtensions, parameterMap, metrics).parse()
        println()

        if (results.isEmpty()) {
            println()
            logger.error("No files with specified file extension(s) were found within the given folder - not generating an output file!")
            return null
        }

        val notFoundFileExtensions = mutableListOf<String>()
        for (fileExtension in fileExtensions) {
            var isFileExtensionIncluded = false
            for (relativeFileName in results.keys) {
                if (relativeFileName.contains(fileExtension)) {
                    isFileExtensionIncluded = true
                }
            }
            if (!isFileExtensionIncluded) {
                notFoundFileExtensions.add(fileExtension)
            }
        }
        if (notFoundFileExtensions.size != 0) {
            println()
            notFoundFileExtensions.forEach { logger.warn("The specified file extension '$it' was not found within the given folder!") }
        }

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        val project = ProjectGenerator().generate(results, pipedProject)

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun assembleParameterMap(): Map<String, Int> {
        return mapOf(
            "verbose" to verbose.toInt(),
            "maxIndentationLevel" to maxIndentLvl,
            "tabWidth" to tabWidth
        ).filterValues { it != null }.mapValues { it.value as Int }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if RawTextParser is applicable...")

        if (resourceToBeParsed == "") {
            return false
        }

        val searchFile = File(resourceToBeParsed.trim())
        if (searchFile.isFile) {
            return true
        }

        if (!searchFile.isDirectory) {
            return false
        }

        val fileSearch = searchFile.walk()
        return fileSearch.asSequence()
                .filter { it.isFile }
                .any()
    }
}
