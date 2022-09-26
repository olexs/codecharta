package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class LogScanParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {

            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            val gitLogFile = KInquirer.promptInput(
                message = "What is the git.log file that has to be parsed?", hint = "path/to/git.log"
            )

            print("You can generate this file with: git ls-files > file-name-list.txt")
            val gitLsFile = KInquirer.promptInput(
                message = "What is the path to the file name list?", hint = "path/to/file-name-list.txt"
            )

            return listOfNotNull(
                "--git-log=$gitLogFile",
                "--repo-files=$gitLsFile"
            )
        }
    }
}