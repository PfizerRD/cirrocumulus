import React from 'react';

import {connect} from 'react-redux';
import {setDotPlotSortOrder} from './actions';
import {DotPlotGroup} from './DotPlotGroup';

class DotPlots extends React.PureComponent {
    render() {
        const {dotPlotData, categoricalNames, selectedDotPlotData} = this.props;

        if (dotPlotData.length === 0) {
            return <h4>Please enter one or more categorical observations and one or more features.</h4>;
        }
        let selectedDotPlotNameToData = {};
        selectedDotPlotData.forEach(categoryItem => {
            selectedDotPlotNameToData[categoryItem.name] = categoryItem;
        });
        return <div>
            {dotPlotData.map((categoryItem) => {
                let selectedData = selectedDotPlotNameToData[categoryItem.name];
                let renamedCategories = categoricalNames[categoryItem.name];
                return <DotPlotGroup key={categoryItem.name} categoryItem={categoryItem} selectedData={selectedData}
                                     renamedCategories={renamedCategories}/>;
            })}
        </div>;
    }
}

const mapStateToProps = state => {
    return {
        dotPlotData: state.dotPlotData,
        selectedDotPlotData: state.selectedDotPlotData,
        categoricalNames: state.categoricalNames
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onSortOrderChanged: (payload) => {
            dispatch(setDotPlotSortOrder(payload));
        },
    };
};

export default (connect(
    mapStateToProps, mapDispatchToProps,
)(DotPlots));

