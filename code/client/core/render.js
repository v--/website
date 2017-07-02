const { renderDispatcherFactory, FactoryRenderer } = require('common/renderer')
const DOMXMLRenderer = require('client/core/dom_xml_renderer')

module.exports = renderDispatcherFactory(DOMXMLRenderer, FactoryRenderer)
