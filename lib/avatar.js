'use strict';

const Crypto = require('crypto');
const Options = require('liqd-options');

const PALLETE = [ '#D50000', '#C51162', '#AA00FF', '#6200EA', '#304FFE', '#2962FF', '#0091EA', '#00B8D4', '#00BFA5', '#00C853', '#64DD17', '#AEEA00', '#FFD600', '#FFAB00', '#FF6D00', '#DD2C00', '#4E342E', '#424242' ];

function generateSVG( width, height, avatar, color )
{
    if( !height ){ height = width; }
    if( !width ){ width = height; }

    let size = Math.sqrt( avatar.length ), side = Math.min( width, height ), point = Math.floor( side / size );

    let svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">';

    for( let y = 0; y < size; ++y )
    {
        for( let x = 0; x < size; ++x )
        {
            if( avatar[ x + y * size ] === 1 )
            {
                svg += '<rect x="'+Math.floor( x * point + ( width - side ) / 2 )+'" y="'+Math.floor( y * point + ( height - side ) / 2 )+'" width="'+point+'" height="'+point+'" fill="'+color+'"/>';
            }
        }
    }

    svg += '</svg>';

    return Buffer.from( svg, 'utf8' );
}

module.exports = function Avatar( id, options = {})
{
    options = Options( options,
    {
        size: { _type: 'number', _default: 5 },
        width: { _type: 'number', _default: 250 },
        height: { _type: 'number' },
        symmetry: { _any: [ 'none', 'vertical', 'horizontal', 'radial' ], _default: 'vertical' },
        format: { _any: [ 'svg' ], _default: 'svg' },
        pallete: { _passes: $ => Array.isArray( $ ), _default: PALLETE }
    });

    let hash = Crypto.createHash('sha256').update( id.toString(), 'utf8' ).digest(),
        avatar = new Array( options.size * options.size ).fill( 0 ),
        quadrant = Math.floor( options.size / 2 ),
        vertical = [ 'vertical', 'radial' ].includes( options.symmetry ),
        horizontal = [ 'horizontal', 'radial' ].includes( options.symmetry ),
        bit = 7, i = 0;

    for( let y = 0, h = horizontal ? Math.ceil( options.size / 2 ) : options.size; y < h; ++y )
    {
        for( let x = 0, w = vertical ? Math.ceil( options.size / 2 ) : options.size; x < w; ++x )
        {
            if( hash[ i ] & ( 1 << bit ))
            {
                avatar[ x + y * options.size ] = 1;

                if( vertical && x < quadrant )
                {
                    avatar[ options.size - 1 - x + y * options.size ] = 1;

                    if( horizontal && y < quadrant )
                    {
                        avatar[ options.size - 1 - x + ( options.size - 1 - y ) * options.size ] = 1;
                    }
                }
                if( horizontal && y < quadrant )
                {
                    avatar[ x + ( options.size - 1 - y ) * options.size ] = 1;
                }
            }

            if( bit === 0 ){ bit = 7; i = ( i + 1 ) % hash.length; } else { --bit; }
        }
    }

    return generateSVG( options.width, options.height, avatar, options.pallete[ hash[hash.length - 1] % options.pallete.length ] );
}
