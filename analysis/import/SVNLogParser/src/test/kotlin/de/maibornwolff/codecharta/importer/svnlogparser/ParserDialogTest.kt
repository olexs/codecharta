package de.maibornwolff.codecharta.importer.svnlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.File

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments that can be parsed`() {
        val fileName = "svn.log"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(SVNLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>())
                .isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }
}