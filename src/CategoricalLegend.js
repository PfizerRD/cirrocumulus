import React from 'react';

class CategoricalLegend extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        const scale = this.props.scale;
        const domain = scale.domain();
        // return (
        //     <List dense={true}>{domain.map(d => {
        //         return <ListItem key={d}>
        //             <div style={{width: 10, height: 10, background: scale(d)}}/>
        //             <ListItemText>{d}</ListItemText></ListItem>;
        //     })
        //     }</List>);
        return (
            <div style={{display: 'inline-block', padding: 10}}>{domain.map(d => {
                return <div key={d}>
                    <div style={{
                        display: 'inline-block',
                        paddingRight: 4,
                        width: 10,
                        height: 10,
                        background: scale(d)
                    }}/>
                    <label>{d}</label></div>;
            })
            }</div>);
    }
}

export default CategoricalLegend;


