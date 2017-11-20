import React from 'react';
import {pageSize, StoSTimeout, callRetries} from '../../config/constants';
const queryString = require('query-string')
var async = require("async");
var _ = require('underscore');
var moment = require('moment');
var urlMap = require('../../config/urls.js');
var defHeader =  require('../../lib/httpHeader');
var appendQuery = require('append-query')
import {makeRequest} from "../../lib/makeRequest"
const timeout = { timeout: StoSTimeout};
let header = {
  headers:defHeader.header
};

_.mixin(require('../../lib/mixins'));


let helpers= {
}

const jsonFormatter =  {
  fetchMultipleNews: function (req) {
    return {}
  },
}


export default jsonFormatter;
