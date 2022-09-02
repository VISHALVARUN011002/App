import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import SectionList from '../SectionList';
import OptionRowLHN from './OptionRowLHN';
import {propTypes as optionsListPropTypes, defaultProps as optionsListDefaultPropTypes} from './optionsListPropTypesLHN';

const propTypes = {
    /** Determines whether the keyboard gets dismissed in response to a drag */
    keyboardDismissMode: PropTypes.string,

    /** Called when the user begins to drag the scroll view */
    onScrollBeginDrag: PropTypes.func,

    ...optionsListPropTypes,
};

const defaultProps = {
    keyboardDismissMode: 'none',
    onScrollBeginDrag: () => {},
    ...optionsListDefaultPropTypes,
};

class BaseOptionsListLHN extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
        this.buildFlatSectionArray = this.buildFlatSectionArray.bind(this);
        this.extractKey = this.extractKey.bind(this);
        this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
        this.viewabilityConfig = {viewAreaCoveragePercentThreshold: 95};
        this.didLayout = false;

        this.flattenedData = this.buildFlatSectionArray();
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.focusedIndex !== this.props.focusedIndex) {
            return true;
        }

        if (nextProps.headerMessage !== this.props.headerMessage) {
            return true;
        }

        if (!_.isEqual(nextProps.sections, this.props.sections)) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(this.props.sections, prevProps.sections)) {
            return;
        }

        this.flattenedData = this.buildFlatSectionArray();
    }

    onViewableItemsChanged() {
        if (this.didLayout || !this.props.onLayout) {
            return;
        }

        this.didLayout = true;
        this.props.onLayout();
    }

    /**
     * This function is used to compute the layout of any given item in our list.
     * We need to implement it so that we can programmatically scroll to items outside the virtual render window of the SectionList.
     *
     * @param {Array} data - This is the same as the data we pass into the component
     * @param {Number} flatDataArrayIndex - This index is provided by React Native, and refers to a flat array with data from all the sections. This flat array has some quirks:
     *
     *     1. It ALWAYS includes a list header and a list footer, even if we don't provide/render those.
     *     2. Each section includes a header, even if we don't provide/render one.
     *
     *     For example, given a list with two sections, two items in each section, no header, no footer, and no section headers, the flat array might look something like this:
     *
     *     [{header}, {sectionHeader}, {item}, {item}, {sectionHeader}, {item}, {item}, {footer}]
     *
     * @returns {Object}
     */
    getItemLayout(data, flatDataArrayIndex) {
        if (!_.has(this.flattenedData, flatDataArrayIndex)) {
            this.flattenedData = this.buildFlatSectionArray();
        }

        const targetItem = this.flattenedData[flatDataArrayIndex];
        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    }

    /**
     * This helper function is used to memoize the computation needed for getItemLayout. It is run whenever section data changes.
     *
     * @returns {Array<Object>}
     */
    buildFlatSectionArray() {
        const optionHeight = this.props.optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
        let offset = 0;

        // Start with just an empty list header
        const flatArray = [{length: 0, offset}];

        // Build the flat array
        for (let sectionIndex = 0; sectionIndex < this.props.sections.length; sectionIndex++) {
            const section = this.props.sections[sectionIndex];

            // Add the section header
            const sectionHeaderHeight = 0;
            flatArray.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            // Add section items
            for (let i = 0; i < section.data.length; i++) {
                flatArray.push({length: optionHeight, offset});
                offset += optionHeight;
            }

            // Add the section footer
            flatArray.push({length: 0, offset});
        }

        // Then add the list footer
        flatArray.push({length: 0, offset});
        return flatArray;
    }

    /**
     * Returns the key used by the list
     * @param {Object} option
     * @return {String}
     */
    extractKey(option) {
        return option.keyForList;
    }

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     * @param {Object} params.section
     *
     * @return {Component}
     */
    renderItem({item, index, section}) {
        return (
            <OptionRowLHN
                option={item}
                viewMode={this.props.optionMode}
                backgroundColor={this.props.optionBackgroundColor}
                optionIsFocused={!this.props.disableFocusOptions
                        && this.props.focusedIndex === (index + section.indexOffset)}
                onSelectRow={this.props.onSelectRow}
            />
        );
    }

    render() {
        return (
            <View style={[styles.flex1]}>
                <SectionList
                    ref={this.props.innerRef}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={this.props.keyboardDismissMode}
                    onScrollBeginDrag={this.props.onScrollBeginDrag}
                    contentContainerStyle={this.props.contentContainerStyles}
                    showsVerticalScrollIndicator={false}
                    sections={this.props.sections}
                    keyExtractor={this.extractKey}
                    stickySectionHeadersEnabled={false}
                    renderItem={this.renderItem}
                    getItemLayout={this.getItemLayout}
                    extraData={this.props.focusedIndex}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    viewabilityConfig={this.viewabilityConfig}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                />
            </View>
        );
    }
}

BaseOptionsListLHN.propTypes = propTypes;
BaseOptionsListLHN.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseOptionsListLHN {...props} innerRef={ref} />
));
