package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.LocationResolverStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.PrinterSpy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class ConstructorAndInitializerTest {
    @Test
    @Throws(IOException::class)
    fun example_has_correct_rloc_count() {
        val sourceCode = FileSystemSourceCode("java", code)
        val locationResolverStub = LocationResolverStub(listOf(sourceCode))
        val printerSpy = PrinterSpy()

        SourceApp(locationResolverStub, printerSpy).printMetrics(listOf("this file location is passed to our stub which returns code"))

        assertThatMetricElement(printerSpy.printedRowMetrics!!) {it.summary()[MetricType.RLoc]}.isEqualTo(9)
    }

    private val code =
            """
/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Constructors and initializers
class Foo {

    private static final String hello;

    String str;

    Foo() { // Constructor with no arguments
        // Initialization
    }

    Foo(String str) { // Constructor with one argument
        this.str = str;
    }

    static {
        System.out.println(AbstractClass.class.getName() + ": static block runtime");
        hello = "hello from " + AbstractClass.class.getName();
    }

    {
        System.out.println(AbstractClass.class.getName() + ": instance block runtime");
    }
}
""".trim().lines()
}