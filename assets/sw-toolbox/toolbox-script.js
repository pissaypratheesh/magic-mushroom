/**
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

(function(global) {
  'use strict';
  global.toolbox.router.get('/',function (req, val, option) {
    return toolbox.networkFirst(new Request("/news/india?mode=pwa"), val, option);
  });

  global.toolbox.router.get('/news',function (req, val, option) {
    return toolbox.networkFirst(new Request("/news/india?mode=pwa"), val, option);
  });

  global.toolbox.router.get('/apis/*', global.toolbox.networkFirst, {
    cache: {
      name: 'dhapis',
      maxEntries: 150,
      maxAgeSeconds: 604800 //1 week: 60 * 60 * 24 * 7
    }
  });
  global.toolbox.router.get('/assets/*', global.toolbox.cacheFirst, {
    cache: {
      name: 'dhassets',
      maxEntries: 100,
      maxAgeSeconds: 604800 //1 week: 60 * 60 * 24 * 7
    }
  });

  global.toolbox.router.get('/bundle.js', global.toolbox.networkFirst, {
    cache: {
      name: 'dhapis',
      maxEntries: 100,
      maxAgeSeconds: 86400 //1 day: 60 * 60 * 24 * 1
    }
  });

  // We want no more than 100 images in the cache. We check using a cache first strategy
  global.toolbox.router.get(/\.(?:png|svg|ttf|gif|jpg|webp)$/, global.toolbox.cacheFirst, {
    cache: {
      name: 'dhimagecaches',
      maxEntries: 100,
      maxAgeSeconds: 30*86400*1000
    }
  });

  global.toolbox.router.get('*',function (req, val, option) {
    var newUrl = req.url;
    if(newUrl.indexOf("mode=pwa") === -1) {
      newUrl = (newUrl.indexOf("?") !== -1) ? (newUrl + "&mode=pwa") : (newUrl + "?mode=pwa");
    }
    return toolbox.networkFirst(new Request(newUrl), val, option);
  });

})(self);
