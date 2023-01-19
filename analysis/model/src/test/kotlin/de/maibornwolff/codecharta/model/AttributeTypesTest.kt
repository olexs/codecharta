package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AttributeTypesTest {

    @Test
    fun `should instantiate with correct type`() {
        val result = AttributeTypes(type = "nodes")

        assertThat(result.type).isEqualTo("nodes")
    }

    @Test
    fun `should instantiate correctly with attribute types`() {
        val attributeMap = mutableMapOf("foo" to AttributeType.relative, "bar" to AttributeType.absolute)

        val result = AttributeTypes(attributeMap, type = "nodes")

        assertThat(result.attributeTypes).isEqualTo(attributeMap)
    }

    @Test
    fun `should be able to add attribute types`() {
        val attributeTypes = AttributeTypes(mutableMapOf("foo" to AttributeType.relative), type = "nodes")
        val expected = mutableMapOf("foo" to AttributeType.relative, "bar" to AttributeType.absolute)

        attributeTypes.add("bar", AttributeType.absolute)

        assertThat(attributeTypes.attributeTypes).isEqualTo(expected)
    }
}
