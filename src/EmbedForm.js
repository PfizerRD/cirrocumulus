import {Switch} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import {connect} from 'react-redux';
import {
    deleteDatasetFilter,
    downloadSelectedIds,
    exportDatasetFilters,
    getDatasetFilterArray,
    getEmbeddingKey,
    handleBrushFilterUpdated,
    handleColorChange,
    handleDimensionFilterUpdated,
    handleMeasureFilterUpdated,
    openDatasetFilter,
    removeDatasetFilter,
    SAVE_DATASET_FILTER_DIALOG,
    setBinSummary,
    setBinValues,
    setCombineDatasetFilters,
    setDialog,
    setInterpolator,
    setMarkerOpacity,
    setMarkerOpacityUI,
    setNumberOfBins,
    setNumberOfBinsUI,
    setPointSize,
    setSearchTokens,
    setSelectedEmbedding,
    setUnselectedMarkerOpacity,
    setUnselectedMarkerOpacityUI
} from './actions';
import AutocompleteVirtualized from './AutocompleteVirtualized';
import CategoricalLegend from './CategoricalLegend';
import ColorSchemeLegendWrapper from './ColorSchemeLegendWrapper';
import ColorSchemeSelector from './ColorSchemeSelector';
import {splitSearchTokens} from './util';

const pointSizeTicks = [{value: 0.25, label: '25%'}, {value: 0.5, label: '50%'}, {
    value: 0.75,
    label: '75%'
}, {value: 1, label: '100%'}, {value: 1.5, label: '150%'}, {value: 2, label: '200%'}, {
    value: 3,
    label: '300%'
}, {value: 4, label: '400%'}];
const summaryOptions = [
    {value: 'max', label: 'Maximum'},
    {value: 'mean', label: 'Mean'},
    {value: 'sum', label: 'Sum'}];
const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        'flex-direction': 'column',
    },
    formControl: {
        display: 'block',
        margin: theme.spacing(1),
        minWidth: 200,
    },
    select: {
        minWidth: 200,
    },
});


const ExpansionPanel = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 0,
        },
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 43,
        '&$expanded': {
            minHeight: 43,
        },
    },
    content: {
        '&$expanded': {
            margin: 0,
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        padding: 0,
    },
}))(MuiExpansionPanelDetails);


class EmbedForm extends React.PureComponent {


    openDatasetFilter = (filterId) => {
        this.props.handleOpenDatasetFilter(filterId);
    };

    deleteDatasetFilter = (filterId) => {
        this.props.handleDeleteDatasetFilter(filterId);
    };

    onMarkerOpacityChange = (event) => {
        this.props.handleMarkerOpacityUI(event.target.value);
    };
    onPointSizeChange = (event) => {
        this.props.handlePointSize(event.target.value);
    };

    onFeaturesChange = (event, value) => {
        this.props.handleSearchTokens(value, true);
    };

    onObservationsChange = (event, value) => {
        this.props.handleSearchTokens(value, false);
    };


    onMarkerOpacityKeyPress = (event) => {
        if (event.key === 'Enter') {
            let opacity = parseFloat(event.target.value);
            if (opacity >= 0 && opacity <= 1) {
                this.props.handleMarkerOpacity(opacity);
            }
        }
    };

    onUnselectedMarkerOpacityChange = (event) => {
        this.props.handleUnselectedMarkerOpacityUI(event.target.value);
    };

    onUnselectedMarkerOpacityKeyPress = (event) => {
        if (event.key === 'Enter') {
            let opacity = parseFloat(event.target.value);
            if (opacity >= 0 && opacity <= 1) {
                this.props.handleUnselectedMarkerOpacity(opacity);
            }
        }
    };

    onNumberOfBinsChange = (event) => {
        this.props.handleNumberOfBinsUI(event.target.value);
    };

    onNumberOfBinsKeyPress = (event) => {
        if (event.key === 'Enter') {
            let value = parseInt(event.target.value);
            if (value >= 0) {
                this.props.handleNumberOfBins(event.target.value);
                let embeddings = this.props.embeddings;
                for (let i = 0; i < embeddings.length; i++) {
                    if (!embeddings[i].precomputed) {
                        embeddings[i] = Object.assign(embeddings[i], {nbins: value, _nbins: value});
                    }
                }
                this.props.handleEmbeddings(embeddings.slice(0));
            }
        }
    };

    onBinSummaryChange = (event) => {
        const value = event.target.value;
        this.props.handleBinSummary(value);
        let embeddings = this.props.embeddings;
        for (let i = 0; i < embeddings.length; i++) {
            if (!embeddings[i].precomputed) {
                embeddings[i] = Object.assign(embeddings[i], {agg: value});
            }
        }
        this.props.handleEmbeddings(embeddings.slice(0));
    };


    handleReverseColors = (event) => {
        const value = event.target.checked;
        const interpolator = this.props.interpolator;
        interpolator.reversed = value;
        this.props.handleInterpolator(Object.assign({}, interpolator));
    };

    handleBinValuesChange = (event) => {
        const value = event.target.checked;
        this.props.handleBinValues(value);
        let embeddings = this.props.embeddings;
        for (let i = 0; i < embeddings.length; i++) {
            if (!embeddings[i].precomputed) {
                embeddings[i] = Object.assign(embeddings[i], {bin: value});
            }
        }
        this.props.handleEmbeddings(embeddings.slice(0));
    };

    handleEmbeddingsChange = (event) => {
        const embeddings = event.target.value;
        const selection = [];

        embeddings.forEach(embedding => {
            if (!embedding.precomputed) {
                embedding = Object.assign(embedding, {
                    bin: this.props.binValues,
                    nbins: this.props.numberOfBins,
                    _nbins: this.props.numberOfBinsUI,
                    agg: this.props.binSummary
                });
            }
            selection.push(embedding);
        });


        this.props.handleEmbeddings(selection);
    };

    handleSelectedCellsClick = (event) => {
        event.preventDefault();
        this.props.downloadSelectedIds();
    };

    onDatasetFilterChipDeleted = (name) => {
        this.props.removeDatasetFilter(name);
    };

    onDatasetFilterCleared = () => {
        this.props.removeDatasetFilter(null);
    };
    onDatasetFilterSaved = () => {
        this.props.handleDialog(SAVE_DATASET_FILTER_DIALOG);
    };

    handleCombineDatasetFilters = (event) => {
        this.props.handleCombineDatasetFilters(event.target.checked ? 'or' : 'and');
    };

    render() {
        const {
            numberOfBinsUI, interpolator, binValues, binSummary, embeddings, classes, embeddingData,
            searchTokens, markerOpacity, datasetFilter, datasetFilters,
            featureSummary, shape, nObsSelected, globalFeatureSummary, unselectedMarkerOpacity, dataset,
            handleColorChange, handleMeasureFilterUpdated, handleDimensionFilterUpdated, pointSize, combineDatasetFilters
        } = this.props;

        let currentDatasetFilters = getDatasetFilterArray(datasetFilter);

        const datasetFilterKeys = [];
        let isBrushing = false;
        currentDatasetFilters.forEach(f => {
            if (typeof f[0] === 'object') {
                isBrushing = true;
            } else {
                datasetFilterKeys.push(f[0]);
            }
        });
        if (isBrushing) {
            datasetFilterKeys.push('selection');
        }

        // for filters we only need one embedding trace per feature
        const traceNames = new Set();
        const filterTraces = [];
        embeddingData.forEach(trace => {
            if (trace.active && trace.name !== '__count' && !traceNames.has(trace.name)) {
                traceNames.add(trace.name);
                filterTraces.push(trace);
            }
        });
        let savedDatasetFilter = this.props.savedDatasetFilter;
        if (savedDatasetFilter == null) {
            savedDatasetFilter = {};
        }
        const splitTokens = splitSearchTokens(searchTokens);
        const featureOptions = dataset == null ? [] : dataset.features;
        const availableEmbeddings = dataset == null ? [] : dataset.embeddings;
        const embeddingKeys = embeddings.map(e => getEmbeddingKey(e));
        const isSummarized = dataset == null ? false : dataset.precomputed != null;
        const obsCat = dataset == null ? [] : dataset.obsCat;
        const obs = dataset == null ? [] : dataset.obs;

        let annotationOptions = obs.concat(obsCat);
        annotationOptions.sort((a, b) => {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a < b ? -1 : (a == b ? 0 : 1);
        });


        return (
            <div className={classes.root}>
                <FormControl className={classes.formControl}>
                    <InputLabel id="embedding-label">Embeddings</InputLabel>
                    <Select
                        className={classes.select}
                        labelId="embedding-label"
                        multiple
                        value={embeddings}
                        onChange={this.handleEmbeddingsChange}
                        input={<Input/>}
                        renderValue={selected => selected.map(e => e.name + (e.dimensions === 3 ? ' 3d' : '')).join(', ')}
                    >
                        {availableEmbeddings.map(embedding => (
                            <MenuItem key={getEmbeddingKey(embedding)}
                                      value={embedding}>
                                <Checkbox checked={embeddingKeys.indexOf(getEmbeddingKey(embedding)) !== -1}/>
                                <ListItemText primary={embedding.name + (embedding.dimensions === 3 ? ' 3d' : '')}/>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>

                    {/*<AutocompleteSelect label="Features" options={allOptions}*/}
                    {/*                    defaultOptions={defaultOptions} value={featureValue}*/}
                    {/*                    onChange={this.props.handleFeatures}*/}
                    {/*                    helperText={'Enter or paste list'}*/}
                    {/*                    isMulti={true}/>*/}
                    <AutocompleteVirtualized label={"Features"} options={featureOptions} value={splitTokens.X}
                                             onChange={this.onFeaturesChange}/>
                </FormControl>

                <FormControl className={classes.formControl}>

                    {/*<AutocompleteSelect label="Features" options={allOptions}*/}
                    {/*                    defaultOptions={defaultOptions} value={featureValue}*/}
                    {/*                    onChange={this.props.handleFeatures}*/}
                    {/*                    helperText={'Enter or paste list'}*/}
                    {/*                    isMulti={true}/>*/}
                    <AutocompleteVirtualized label={"Observations"} options={annotationOptions}
                                             value={splitTokens.obs.concat(splitTokens.obsCat)}
                                             onChange={this.onObservationsChange}/>
                </FormControl>

                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary
                        aria-controls="summary-content"
                        id="summary-header"
                    >
                        <div>Filter</div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div style={{marginLeft: 10}}>
                            <div>
                                <Grid component="label" container alignItems="center" spacing={0}>
                                    <Grid item>AND</Grid>
                                    <Grid item>
                                        <Switch
                                            size="small"
                                            checked={combineDatasetFilters === 'or'}
                                            onChange={this.handleCombineDatasetFilters}
                                        />
                                    </Grid>
                                    <Grid item>OR</Grid>
                                </Grid>
                            </div>
                            <div style={{marginBottom: 2}}>

                                <Button disabled={datasetFilterKeys.length === 0} size="small"
                                        onClick={this.onDatasetFilterCleared}>Clear</Button>
                                <Button disabled={datasetFilterKeys.length === 0} size="small"
                                        onClick={this.onDatasetFilterSaved}>Save</Button>
                                <Button disabled={datasetFilterKeys.length === 0} size="small"
                                        onClick={this.handleSelectedCellsClick}>Export</Button>
                            </div>
                            <Divider/>
                            {datasetFilterKeys.map(key => {
                                return <Chip
                                    size="small"
                                    onDelete={() => {
                                        this.onDatasetFilterChipDeleted(key);
                                    }}
                                    style={{marginRight: 2}}
                                    key={key}
                                    label={key}
                                    variant={'outlined'}
                                />;
                            })}


                            {filterTraces.map(traceInfo =>

                                traceInfo.continuous ?
                                    <ColorSchemeLegendWrapper
                                        key={traceInfo.name}
                                        width={140}
                                        showColorScheme={false}
                                        height={30}
                                        style={{paddingBottom: 3, paddingTop: 3}}
                                        handleUpdate={handleMeasureFilterUpdated}
                                        datasetFilter={datasetFilter}
                                        scale={traceInfo.colorScale}
                                        featureSummary={featureSummary}
                                        globalFeatureSummary={globalFeatureSummary}
                                        nObs={shape[0]}
                                        nObsSelected={nObsSelected}
                                        maxHeight={null}
                                        name={traceInfo.name}
                                    /> :
                                    <CategoricalLegend
                                        key={traceInfo.name}
                                        style={{paddingBottom: 3, paddingTop: 3}}
                                        datasetFilter={datasetFilter}
                                        handleClick={handleDimensionFilterUpdated}
                                        handleColorChange={handleColorChange}
                                        name={traceInfo.name}
                                        scale={traceInfo.colorScale}
                                        maxHeight={300}
                                        clickEnabled={true}
                                        nObs={shape[0]}
                                        nObsSelected={nObsSelected}
                                        globalFeatureSummary={globalFeatureSummary}
                                        featureSummary={featureSummary}/>
                            )}


                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary
                        aria-controls="chart-options-content"
                        id="chart-options-header"
                    >
                        <div>View Options</div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div>


                            {/*<TextField type="text" onKeyPress={this.onMarkerSizeKeyPress}*/}
                            {/*           onChange={this.onMarkerSizeChange} label="Marker Size"*/}
                            {/*           className={classes.formControl} value={markerSize}/>*/}
                            {/*<TextField type="text" onKeyPress={this.onUnselectedMarkerSizeKeyPress}*/}
                            {/*           onChange={this.onUnselectedMarkerSizeChange} label="Unselected Marker Size"*/}
                            {/*           className={classes.formControl} value={unselectedMarkerSize}/>*/}
                            <TextField type="text" onKeyPress={this.onMarkerOpacityKeyPress}
                                       onChange={this.onMarkerOpacityChange} label="Marker Opacity"
                                       className={classes.formControl} value={markerOpacity}/>
                            <TextField type="text"
                                       onKeyPress={this.onUnselectedMarkerOpacityKeyPress}
                                       onChange={this.onUnselectedMarkerOpacityChange} label="Unselected Marker Opacity"
                                       className={classes.formControl} value={unselectedMarkerOpacity}/>

                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="point_size">Marker Size</InputLabel>
                                <Select
                                    className={classes.select}
                                    input={<Input id="point_size"/>}
                                    onChange={this.onPointSizeChange}
                                    value={pointSize}
                                    multiple={false}>
                                    {pointSizeTicks.map(item => (
                                        <MenuItem key={item.label} value={item.value}>
                                            <ListItemText primary={item.label}/>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>


                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="color-scheme">Color Scheme</InputLabel>
                                <ColorSchemeSelector/>
                            </FormControl>
                            {<FormControlLabel
                                control={
                                    <Switch
                                        checked={interpolator.reversed || false}
                                        value={'reverseColors'}
                                        onChange={this.handleReverseColors}
                                    />
                                }
                                label="Reverse Colors"
                            />}

                            {!isSummarized && <FormControlLabel
                                control={
                                    <Switch
                                        checked={binValues}
                                        value={'binPlot'}
                                        onChange={this.handleBinValuesChange}
                                    />
                                }
                                label="Bin Plot"
                            />}

                            {!isSummarized && binValues &&
                            <TextField max="1000" min="20" step="100" onKeyPress={this.onNumberOfBinsKeyPress}
                                       value={numberOfBinsUI}
                                       onChange={this.onNumberOfBinsChange} label="# Bins Per Axis"
                                       className={classes.formControl}/>}


                            {!isSummarized && binValues && <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="summary">Bin Summary</InputLabel>
                                <Select
                                    className={classes.select}
                                    input={<Input id="summary"/>}
                                    onChange={this.onBinSummaryChange}
                                    value={binSummary}
                                >
                                    {summaryOptions.map(c => (
                                        <MenuItem key={c.value} value={c.value}>
                                            <ListItemText primary={c.label}/>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>}


                            <Divider/>

                            {/*<Typography*/}
                            {/*    color="textSecondary"*/}
                            {/*    display="block"*/}
                            {/*    variant="caption"*/}
                            {/*>*/}
                            {/*    Unselected Chart Properties*/}
                            {/*</Typography>*/}


                        </div>

                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary
                        aria-controls="filter-options-content"
                        id="filter-options-header"
                    >
                        <div>Saved Filters</div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div>
                            {datasetFilters.length === 0 &&
                            <Box color="text.secondary">No saved filters</Box>}
                            {datasetFilters.length > 0 && <div><List dense={true}>
                                {datasetFilters.map(item => (
                                    <ListItem key={item.id} data-key={item.id} button
                                              selected={item.id === savedDatasetFilter.id}
                                              onClick={e => this.openDatasetFilter(item.id)}>
                                        <ListItemText primary={item.name}/>
                                        <ListItemSecondaryAction onClick={e => this.deleteDatasetFilter(item.id)}>
                                            <IconButton edge="end" aria-label="delete">
                                                <DeleteIcon/>
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                                <Button onClick={this.props.handleExportDatasetFilters}>Export Filters</Button>
                            </div>}
                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        featureSummary: state.featureSummary,
        shape: state.dataset.shape,
        nObsSelected: state.selection.count,
        globalFeatureSummary: state.globalFeatureSummary,
        dataset: state.dataset,
        binValues: state.binValues,
        binSummary: state.binSummary,
        numberOfBins: state.numberOfBins,
        numberOfBinsUI: state.numberOfBinsUI,
        embeddingData: state.embeddingData,
        embeddingChartSize: state.embeddingChartSize,
        interpolator: state.interpolator,
        markerOpacity: state.markerOpacityUI,
        pointSize: state.pointSize,
        savedDatasetFilter: state.savedDatasetFilter,
        embeddings: state.embeddings,
        searchTokens: state.searchTokens,
        unselectedMarkerOpacity: state.unselectedMarkerOpacityUI,
        combineDatasetFilters: state.combineDatasetFilters,
        datasetFilter: state.datasetFilter,
        datasetFilters: state.datasetFilters
    };
};
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleDialog: (value) => {
            dispatch(setDialog(value));
        },
        handleCombineDatasetFilters: (value) => {
            dispatch(setCombineDatasetFilters(value));
        },
        downloadSelectedIds: () => {
            dispatch(downloadSelectedIds());
        },
        removeDatasetFilter: (filter) => {
            dispatch(removeDatasetFilter(filter));
        },
        handleDimensionFilterUpdated: (e) => {
            dispatch(handleDimensionFilterUpdated(e));
        },
        handleColorChange: (e) => {
            dispatch(handleColorChange(e));
        },
        handleMeasureFilterUpdated: (e) => {
            dispatch(handleMeasureFilterUpdated(e));
        },
        onSelect: (e) => {
            dispatch(handleBrushFilterUpdated(e));
        },
        onDeselect: (e) => {
            dispatch(handleBrushFilterUpdated(e));
        },

        handleEmbeddings: value => {
            dispatch(setSelectedEmbedding(value));
        },
        handleInterpolator: value => {
            dispatch(setInterpolator(value));
        },
        handleNumberOfBins: value => {
            dispatch(setNumberOfBins(value));
        },
        handlePointSize: value => {
            dispatch(setPointSize(value));
        },
        handleNumberOfBinsUI: value => {
            dispatch(setNumberOfBinsUI(value));
        },
        handleMarkerOpacity: value => {
            dispatch(setMarkerOpacity(value));
        },
        handleMarkerOpacityUI: value => {
            dispatch(setMarkerOpacityUI(value));
        },
        handleUnselectedMarkerOpacity: value => {
            dispatch(setUnselectedMarkerOpacity(value));
        },
        handleUnselectedMarkerOpacityUI: value => {
            dispatch(setUnselectedMarkerOpacityUI(value));
        },
        handleBinSummary: value => {
            dispatch(setBinSummary(value));
        },
        handleBinValues: value => {
            dispatch(setBinValues(value));
        },
        handleSearchTokens: (value, isX) => {
            dispatch(setSearchTokens(value == null ? [] : value, isX));
        },
        handleOpenDatasetFilter: value => {
            dispatch(openDatasetFilter(value));
        },
        handleDeleteDatasetFilter: value => {
            dispatch(deleteDatasetFilter(value));
        },
        handleExportDatasetFilters: () => {
            dispatch(exportDatasetFilters());
        }
    };
};

export default withStyles(styles)(connect(
    mapStateToProps, mapDispatchToProps,
)(EmbedForm));


