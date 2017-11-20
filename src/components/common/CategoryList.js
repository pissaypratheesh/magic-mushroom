/**
 * Created by tishya on 6/6/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
import UIEffects from '../../lib/UIEffects';
import langMapping from '../../config/langMapping';
import {  Link } from 'react-router-dom'

var _ = require('underscore');
_.mixin(require('../../lib/mixins'));

@inject("store")
@observer
class CategoryList extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store;
  }

  componentDidMount() {

  }

  componentWillUnmount() {
  }

  componentDidUpdate() {
  }

  render(){
    let context = this;
    return (
      <li key={this.props.key}>
        <Link className="flex-container"  to={context.props.navUrl}>
          <span style={{ backgroundColor: context.props.itemColor }}>
            <div className="flex-item">{context.props.itemFirstChar}</div>
          </span>
          <p>{context.props.itemName}</p>
        </Link>
      </li>
    );
  }
}

export default CategoryList;
