/**
 * Created by pratheesh on 22/6/17.
 */
import React from 'react';


export default class LoadingPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    componentDidUpdate() {
    }

    componentWillReceiveProps(nextProps) {
    }

    render() {
        return (
          <div className="loading">
            <div className="ldwrp">
              <div className="ldImg"></div>
              <p>Initializing...</p>
            </div>
          </div>
        );
    }
}


