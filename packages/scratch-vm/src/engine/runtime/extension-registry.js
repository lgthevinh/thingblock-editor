/**
 * Registration and lookup of extension block metadata on the runtime: filling category info
 * from an extension's `getInfo()` results and producing the palette (XML/JSON) forms consumed
 * by scratch-blocks.
 *
 * The exported functions take the runtime as their first parameter; they read and update the
 * runtime's `_blockInfo`, `_primitives`, and `_hats` registries and emit extension events on it.
 */

const BlockType = require('../../extension-support/block-type');
const TargetType = require('../../extension-support/target-type');
const log = require('../../util/log');
const maybeFormatMessage = require('../../util/maybe-format-message');
const StringUtil = require('../../util/string-util');
const RuntimeEventNames = require('./event-names');
const {
    buildCustomFieldInfo,
    buildMenuForScratchBlocks,
    convertForScratchBlocks
} = require('./extension-block-converter');

const defaultExtensionColors = ['#0FBD8C', '#0DA57A', '#0B8E69'];

/**
 * Read extension information, convert menus, blocks and custom field types
 * and store the results in the provided category object.
 * @param {Runtime} runtime - the runtime whose block registries are updated.
 * @param {CategoryInfo} categoryInfo - the category to be filled
 * @param {ExtensionMetadata} extensionInfo - the extension metadata to read
 */
const fillExtensionCategory = function (runtime, categoryInfo, extensionInfo) {
    categoryInfo.blocks = [];
    categoryInfo.customFieldTypes = {};
    categoryInfo.menus = [];
    categoryInfo.menuInfo = {};

    for (const menuName in extensionInfo.menus) {
        if (Object.prototype.hasOwnProperty.call(extensionInfo.menus, menuName)) {
            const menuInfo = extensionInfo.menus[menuName];
            const convertedMenu = buildMenuForScratchBlocks(runtime, menuName, menuInfo, categoryInfo);
            categoryInfo.menus.push(convertedMenu);
            categoryInfo.menuInfo[menuName] = menuInfo;
        }
    }
    for (const fieldTypeName in extensionInfo.customFieldTypes) {
        if (Object.prototype.hasOwnProperty.call(extensionInfo.customFieldTypes, fieldTypeName)) {
            const fieldType = extensionInfo.customFieldTypes[fieldTypeName];
            const fieldTypeInfo = buildCustomFieldInfo(
                fieldTypeName,
                fieldType,
                extensionInfo.id,
                categoryInfo
            );

            categoryInfo.customFieldTypes[fieldTypeName] = fieldTypeInfo;
        }
    }

    for (const blockInfo of extensionInfo.blocks) {
        try {
            const convertedBlock = convertForScratchBlocks(runtime, blockInfo, categoryInfo);
            categoryInfo.blocks.push(convertedBlock);
            if (convertedBlock.json) {
                const opcode = convertedBlock.json.type;
                if (blockInfo.blockType !== BlockType.EVENT) {
                    runtime._primitives[opcode] = convertedBlock.info.func;
                }
                if (blockInfo.blockType === BlockType.EVENT || blockInfo.blockType === BlockType.HAT) {
                    runtime._hats[opcode] = {
                        edgeActivated: blockInfo.isEdgeActivated,
                        restartExistingThreads: blockInfo.shouldRestartExistingThreads
                    };
                }
            }
        } catch (e) {
            log.error('Error parsing block: ', {block: blockInfo, error: e});
        }
    }
};

/**
 * Register the primitives provided by an extension.
 * @param {Runtime} runtime - the runtime to register the extension on.
 * @param {ExtensionMetadata} extensionInfo - information about the extension (id, blocks, etc.)
 */
const registerExtensionPrimitives = function (runtime, extensionInfo) {
    const categoryInfo = {
        id: extensionInfo.id,
        name: maybeFormatMessage(extensionInfo.name),
        showStatusButton: extensionInfo.showStatusButton,
        blockIconURI: extensionInfo.blockIconURI,
        menuIconURI: extensionInfo.menuIconURI
    };

    if (extensionInfo.color1) {
        categoryInfo.color1 = extensionInfo.color1;
        categoryInfo.color2 = extensionInfo.color2;
        categoryInfo.color3 = extensionInfo.color3;
    } else {
        categoryInfo.color1 = defaultExtensionColors[0];
        categoryInfo.color2 = defaultExtensionColors[1];
        categoryInfo.color3 = defaultExtensionColors[2];
    }

    runtime._blockInfo.push(categoryInfo);

    fillExtensionCategory(runtime, categoryInfo, extensionInfo);

    for (const fieldTypeName in categoryInfo.customFieldTypes) {
        if (Object.prototype.hasOwnProperty.call(extensionInfo.customFieldTypes, fieldTypeName)) {
            const fieldTypeInfo = categoryInfo.customFieldTypes[fieldTypeName];

            // Emit events for custom field types from extension
            runtime.emit(RuntimeEventNames.EXTENSION_FIELD_ADDED, {
                name: `field_${fieldTypeInfo.extendedName}`,
                implementation: fieldTypeInfo.fieldImplementation
            });
        }
    }

    runtime.emit(RuntimeEventNames.EXTENSION_ADDED, categoryInfo);
};

/**
 * Reregister the primitives for an extension
 * @param {Runtime} runtime - the runtime the extension is registered on.
 * @param {ExtensionMetadata} extensionInfo - new info (results of running getInfo) for an extension
 */
const refreshExtensionPrimitives = function (runtime, extensionInfo) {
    const categoryInfo = runtime._blockInfo.find(info => info.id === extensionInfo.id);
    if (categoryInfo) {
        categoryInfo.name = maybeFormatMessage(extensionInfo.name);
        fillExtensionCategory(runtime, categoryInfo, extensionInfo);

        runtime.emit(RuntimeEventNames.BLOCKSINFO_UPDATE, categoryInfo);
    }
};

/**
 * @param {Runtime} runtime - the runtime whose extension categories are read.
 * @param {?Target} [target] - the active editing target (optional)
 * @returns {Array.<object>} scratch-blocks XML for each category of extension blocks, in category order.
 * @property {string} id - the category / extension ID
 * @property {string} xml - the XML text for this category, starting with `<category>` and ending with `</category>`
 */
const getBlocksXML = function (runtime, target) {
    return runtime._blockInfo.map(categoryInfo => {
        const {name, color1, color2} = categoryInfo;
        // Filter out blocks that aren't supposed to be shown on this target, as determined by the block info's
        // `hideFromPalette` and `filter` properties.
        const paletteBlocks = categoryInfo.blocks.filter(block => {
            let blockFilterIncludesTarget = true;
            // If an editing target is not passed, include all blocks
            // If the block info doesn't include a `filter` property, always include it
            if (target && block.info.filter) {
                blockFilterIncludesTarget = block.info.filter.includes(
                    target.isStage ? TargetType.STAGE : TargetType.SPRITE
                );
            }
            // If the block info's `hideFromPalette` is true, then filter out this block
            return blockFilterIncludesTarget && !block.info.hideFromPalette;
        });

        const colorXML = `colour="${color1}" secondaryColour="${color2}"`;

        // Use a menu icon if there is one. Otherwise, use the block icon. If there's no icon,
        // the category menu will show its default colored circle.
        let menuIconURI = '';
        if (categoryInfo.menuIconURI) {
            menuIconURI = categoryInfo.menuIconURI;
        } else if (categoryInfo.blockIconURI) {
            menuIconURI = categoryInfo.blockIconURI;
        }
        const menuIconXML = menuIconURI ?
            `iconURI="${menuIconURI}"` : '';

        let statusButtonXML = '';
        if (categoryInfo.showStatusButton) {
            statusButtonXML = 'showStatusButton="true"';
        }

        return {
            id: categoryInfo.id,
            xml: `<category name="${name}" toolboxitemid="${categoryInfo.id}" ` +
                `${statusButtonXML} ${colorXML} ${menuIconXML}>` +
                `${paletteBlocks.map(block => block.xml).join('')}</category>`
        };
    });
};

/**
 * @param {Runtime} runtime - the runtime whose extension categories are read.
 * @returns {Array.<string>} - an array containing the scratch-blocks JSON information for each dynamic block.
 */
const getBlocksJSON = function (runtime) {
    return runtime._blockInfo.reduce(
        (result, categoryInfo) => result.concat(categoryInfo.blocks.map(blockInfo => blockInfo.json)), []);
};

/**
 * Get the label or label function for an opcode
 * @param {Runtime} runtime - the runtime whose extension categories are read.
 * @param {string} extendedOpcode - the opcode you want a label for
 * @returns {object} - object with label and category
 * @property {string} category - the category for this opcode
 * @property {Function} [labelFn] - function to generate the label for this opcode
 * @property {string} [label] - the label for this opcode if `labelFn` is absent
 */
const getLabelForOpcode = function (runtime, extendedOpcode) {
    const [category, opcode] = StringUtil.splitFirst(extendedOpcode, '_');
    if (!(category && opcode)) return;

    const categoryInfo = runtime._blockInfo.find(ci => ci.id === category);
    if (!categoryInfo) return;

    const block = categoryInfo.blocks.find(b => b.info.opcode === opcode);
    if (!block) return;

    // TODO: we may want to format the label in a locale-specific way.
    return {
        category: 'extension', // This assumes that all extensions have the same monitor color.
        label: `${categoryInfo.name}: ${block.info.text}`
    };
};

module.exports = {
    registerExtensionPrimitives,
    refreshExtensionPrimitives,
    getBlocksXML,
    getBlocksJSON,
    getLabelForOpcode
};
