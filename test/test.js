'use strict';

const Avatar = require('../lib/avatar.js');

require('fs').writeFileSync('avatar.svg', Avatar( 'foo' ));
