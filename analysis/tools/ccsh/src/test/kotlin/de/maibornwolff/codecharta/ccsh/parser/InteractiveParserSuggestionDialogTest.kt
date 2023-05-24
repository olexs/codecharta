package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckbox
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveParserSuggestionDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InteractiveParserSuggestionDialogTest {
    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
    private val errorOut = ByteArrayOutputStream()
    private val originalErrorOut = System.err
    private val cmdLine = CommandLine(Ccsh())

    @BeforeAll
    fun setUpStreams() {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errorOut))
    }

    @AfterAll
    fun restoreStreams() {
        System.setOut(originalOut)
        System.setErr(originalErrorOut)
    }

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should only output message when no usable parsers were found`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""

        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns ""

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns emptyList()

        val usableParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(errorOut.toString()).contains(Ccsh.NO_USABLE_PARSER_FOUND_MESSAGE)
        Assertions.assertThat(usableParsers).isNotNull
        Assertions.assertThat(usableParsers).isEmpty()
    }

    @Test
    fun `should return empty map when user does not select any parser`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""

        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns ""

        mockkStatic("com.github.kinquirer.components.CheckboxKt")
        every {
            KInquirer.promptCheckbox(any(), any(), any(), any(), any(), any(), any())
        } returns emptyList()

        val parser = "dummyParser"

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns listOf(parser)

        val selectedParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
    }

    @Test
    fun `should return configured parsers after user finished configuring selection`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""

        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns ""

        val parser = "dummyParser"
        val configuration = listOf("dummyArg")
        val parserList = listOf(parser)

        mockkStatic("com.github.kinquirer.components.CheckboxKt")
        every {
            KInquirer.promptCheckbox(any(), any(), any(), any(), any(), any(), any())
        } returns parserList

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns parserList

        every {
            ParserService.configureParserSelection(any(), any(), any())
        } returns mapOf(parser to configuration)

        val configuredParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(configuredParsers).isNotNull
        Assertions.assertThat(configuredParsers).isNotEmpty

        Assertions.assertThat(configuredParsers).containsKey(parser)
        Assertions.assertThat(configuredParsers[parser] == configuration).isTrue()
    }
}