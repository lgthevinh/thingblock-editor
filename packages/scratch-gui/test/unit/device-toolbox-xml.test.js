import {packCategoryToToolboxXML} from '../../src/lib/device-toolbox-xml';

describe('packCategoryToToolboxXML', () => {
    test('builds a category with namespaced id and its block entries', () => {
        const {id, xml} = packCategoryToToolboxXML({
            kind: 'category',
            name: 'ThingBot',
            colour: '#0FBD8C',
            contents: [
                {kind: 'block', type: 'thingbot_digitalwrite'},
                {kind: 'block', type: 'thingbot_analogread'}
            ]
        }, 'device');

        expect(id).toBe('device_thingbot');
        expect(xml).toContain('name="ThingBot"');
        expect(xml).toContain('toolboxitemid="device_thingbot"');
        expect(xml).toContain('colour="#0FBD8C"');
        expect(xml).toContain('<block type="thingbot_digitalwrite"/>');
        expect(xml).toContain('<block type="thingbot_analogread"/>');
    });

    test('namespaces the id by the given prefix', () => {
        const {id} = packCategoryToToolboxXML({
            kind: 'category',
            name: 'Servo',
            contents: [{kind: 'block', type: 'servo_setangle'}]
        }, 'peripheral');

        expect(id).toBe('peripheral_servo');
    });

    test('escapes the category name and falls back to a default colour', () => {
        const {id, xml} = packCategoryToToolboxXML({
            kind: 'category',
            name: 'A & B',
            contents: []
        }, 'device');

        expect(id).toBe('device_a_&_b');
        expect(xml).toContain('name="A &amp; B"');
        expect(xml).toContain('colour="#0FBD8C"');
    });

    test('ignores non-block contents', () => {
        const {xml} = packCategoryToToolboxXML({
            kind: 'category',
            name: 'Mixed',
            contents: [
                {kind: 'label', text: 'Section'},
                {kind: 'block', type: 'thingbot_digitalwrite'}
            ]
        }, 'device');

        expect(xml).not.toContain('Section');
        expect(xml).toContain('<block type="thingbot_digitalwrite"/>');
    });
});
