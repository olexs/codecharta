package de.maibornwolff.codecharta.importer.gitlogparser.util

import java.io.File
import java.util.concurrent.TimeUnit

class GitAdapter(private val gitDirectory: File, private val fileHandle: File) {

    fun getGitLog() {
        val process = ProcessBuilder("git", "log", "--numstat", "--raw", "--topo-order", "--reverse", "-m")
        executeProcess(process)
    }

    fun getGitFiles() {
        val process = ProcessBuilder("git", "ls-files")
        executeProcess(process)
    }

    private fun executeProcess(process: ProcessBuilder) {
        process.directory(gitDirectory)
        process.redirectOutput(fileHandle)
        val runningProcess = process.start()
        runningProcess.waitFor(3, TimeUnit.MINUTES)
    }
}
