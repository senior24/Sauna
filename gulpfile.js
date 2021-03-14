const { series, parallel, src, dest, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const fileIncludes = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del')
const wepback = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;

function fonts() {
   src('./src/assets/fonts/**.ttf')
      .pipe(ttf2woff())
      .pipe(dest('./dist/assets/fonts/'))
   return src('./src/assets/fonts/**.ttf')
      .pipe(ttf2woff2())
      .pipe(dest('./dist/assets/fonts/'))
}

// function svgSprites() {
//    return src('./src/assets/img/**.svg')
//       .pipe(svgSprite({
//          mode: {
//             stack: {
//                sprite: "../sprite.svg"
//             }
//          }
//       }))
//       .pipe(dest('./dist/assets/img'))
// }



function htmlIncludes() {
   return src('./src/**.html')
      .pipe(fileIncludes({
         prefix: '@',
         basepath: '@file'
      }))
      .pipe(dest('./dist'))
      .pipe(browserSync.stream());
}

function imgToApp() {
   return src(['./src/assets/img/**.jpg', './src/assets/img/**.png', './src/img/**.jpeg', './src/assets/img/**.svg'])
      .pipe(dest('./dist/assets/img'))
}

function files() {
   return src('./src/files/**')
      .pipe(dest('./dist/files'))
}

function styles() {
   return src("./src/assets/scss/**/*.scss")
      .pipe(sourcemaps.init())
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(autoprefixer({
         cascade: false
      }))
      .pipe(cleanCSS({
         level: 2
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('./dist/assets/css'))
      .pipe(browserSync.stream());
}


function scripts() {
   return src('./src/assets/js/main.js')
      .pipe(webpackStream({
         output: {
            filename: 'main.js'
         },
         module: {
            rules: [
               {
                  test: /\.m?js$/,
                  exclude: /node_modules/,
                  use: {
                     loader: 'babel-loader',
                     options: {
                        presets: [
                           ['@babel/preset-env', { targets: "defaults" }]
                        ],
                        plugins: [
                           '@babel/plugin-proposal-class-properties',
                           '@babel/plugin-proposal-private-methods'
                        ]
                     }
                  }
               }
            ]
         }
      }))
      .pipe(sourcemaps.init())
      .pipe(uglify().on('error', function (err) {
         console.error('WEBPACK ERROR', err);
         this.emit('end');
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('./dist/assets/js'))
      .pipe(browserSync.stream());
}

function clean() {
   return del('./dist/*')
}

const watchFiles = () => {
   browserSync.init({
      server: {
         baseDir: "./dist"
      }
   });

   watch('./src/assets/scss/**/*.scss', styles)
   watch('./src/**.html', htmlIncludes)
   watch('./src/assets/components/**.html', htmlIncludes)

   watch('./src/assets/img/**.jpg', imgToApp)
   watch('./src/assets/img/**.png', imgToApp)
   watch('./src/assets/img/**.jpeg', imgToApp)
   watch('./src/assets/img/*.ico', imgToApp)
   watch('./src/assets/img/**.svg', imgToApp)

   watch('./src/files/**', files)

   watch('./src/fonts/**.ttf', fonts)

   watch('./src/assets/js/**/*.js', scripts)
}


exports.default = series(clean, parallel(htmlIncludes, fonts, files, imgToApp, /* svgSprites */ scripts, styles), watchFiles);


function stylesBuild() {
   return src("./src/assets/scss/**/*.scss")
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(autoprefixer({
         cascade: false
      }))
      .pipe(cleanCSS({
         level: 2
      }))
      .pipe(dest('./dist/assets/css'))
}


function scriptsBuild() {
   return src('./src/assets/js/main.js')
      .pipe(webpackStream({
         output: {
            filename: 'main.js'
         },
         module: {
            rules: [
               {
                  test: /\.m?js$/,
                  exclude: /node_modules/,
                  use: {
                     loader: 'babel-loader',
                     options: {
                        presets: [
                           ['@babel/preset-env', { targets: "defaults" }]
                        ]
                     }
                  }
               }
            ]
         }
      }))
      .pipe(uglify().on('error', function (err) {
         console.error('WEBPACK ERROR', err);
         this.emit('end');
      }))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(dest('./dist/assets/js'))
}

exports.build = series(clean, parallel(htmlIncludes, fonts, files, imgToApp, /* svgSprites */ scriptsBuild, stylesBuild));

