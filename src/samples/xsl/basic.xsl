<?xml version="1.0" standalone="no" encoding="utf-8" ?>
<!DOCTYPE document SYSTEM "subjects.dtd" [

<!--the markup in the internal DTD
  takes precedence over the external DTD-->
  <!ATTLIST assessment assessment_type (exam | assignment | prac)>
  <!ELEMENT results (#PCDATA)>

<!--close the DOCTYPE declaration-->
]>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:deltaxml="http://www.deltaxml.com/ns/well-formed-delta-v1"
  xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:html="http://www.deltaxml.com/ns/html-table"
  xmlns:saxon="http://saxon.sf.net/" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
  xmlns:preserve="http://www.deltaxml.com/ns/preserve" version="3.0"
  extension-element-prefixes="saxon" exclude-result-prefixes="#all">

  <xsl:import href="modified-html-table-functions.xsl"/>

  <!-- this comment -->
  <?abc processing-instruction <abc name="good">this could be something</abc> any kind?>
  <data attnamve="attvalue">any text <![CDATA["Dolce & Gabbana"]]> some &lt; entity reference is ok</data>

  </xsl:stylesheet>