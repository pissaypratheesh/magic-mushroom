/**
 * Created by pratheesh on 17/5/17.
 */
import React , { Component } from 'react';
import { Link } from 'react-router-dom'
import { inject, observer } from "mobx-react";


@inject("store")
@observer
class TrendsListing extends Component {
  constructor(props) {
    super(props);
    this.store =  this.props.store.appState;
  };


  componentWillMount() {

  }
  componentDidMount() {

  }
  componentWillRecieveProps(nextprops) {

  }
  render() {
    let context=this,
        imgSrc = context.props.imgSrc,
        webpSrc = context.props.webpSrc && context.props.webpSrc;
    return (
      <li>
        <div className="inr">
          <Link to={context.props.navUrl}>
            <picture>
              <source srcSet={webpSrc}/>
              <img src={imgSrc} alt={context.props.imgAlt} />
            </picture>
            <h3>{context.props.title}</h3>
          </Link>
        </div>
      </li>
    );
  }

}

export default TrendsListing;
