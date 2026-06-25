import {xmlEscape} from './make-toolbox-xml';

/**
 * Convert a resource-pack `ToolboxCategory` — the plain data a device extension or peripheral
 * contributes (`{kind:'category', name, colour?, contents:[{kind:'block', type}]}`) — into the
 * `{id, xml}` shape the toolbox builder appends. The pack describes its palette as data; Blockly's
 * toolbox is XML, so this is where the two meet. The id is namespaced by `idPrefix` so pack categories
 * never collide with each other or with the core category ids the toolbox builder reorders.
 * @param {object} category - the pack's toolbox category.
 * @param {string} idPrefix - id namespace, e.g. `device` or `peripheral`.
 * @returns {{id: string, xml: string}} the category id and its `<category>` XML.
 */
const packCategoryToToolboxXML = function (category, idPrefix) {
    const id = `${idPrefix}_${category.name.toLowerCase().replace(/\s+/g, '_')}`;
    const colour = category.colour || '#0FBD8C';
    const blocks = category.contents
        .filter(item => item.kind === 'block')
        .map(item => `<block type="${xmlEscape(item.type)}"/>`)
        .join('');
    const xml =
        `<category name="${xmlEscape(category.name)}" toolboxitemid="${id}" colour="${colour}">` +
        `${blocks}</category>`;
    return {id, xml};
};

export {
    packCategoryToToolboxXML
};
