var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var postcss = require('gulp-postcss');
var browserSync = require('browser-sync').create();
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sourcemaps = require('gulp-sourcemaps');
var imagein = require('gulp-imagemin');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var ghPages = require('gulp-gh-pages');


var paths = {
  css: {
    assets: 'app/assets/scss/*.scss',
    dest: 'app/dist/styles',
  },
  js: {
    assets: 'app/assets/js/*.js',
    dest: 'app/dist/js',
  },
  html: {
    assets: 'app/assets/pages/*.+(html|njk)',
    dest: 'app/dist',
    templates: 'app/assets/templates',
  },
  //   html: {
  //     assets: 'app/assets/*.html',
  //     dest: 'app/dist',
  //   },
  images: {
    assets: 'app/assets/images/*{.png,.jpg,.svg}',
    dest: 'app/dist/images',
  },
  deploy:{
    public:'app/dist/**/*'
  }
};

function styles() {
  return gulp
    .src(paths.css.assets)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src(paths.js.assets)
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream());
}

function pages() {
  return gulp
    .src(paths.html.assets)
    .pipe(data(function (){
      return require('./app/data/data.json');
    }))
    .pipe(
      nunjucksRender({
        path: [paths.html.templates],
        ext: '.html',
      })
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src(paths.images.assets)
    .pipe(imagein())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './app/dist',
    },
  });
  gulp.watch(paths.css.assets, styles);
  gulp.watch(paths.js.assets, scripts);
  gulp.watch(paths.html.assets).on('change', browserSync.reload);
  gulp.watch(paths.images.assets, images);
}


function deploy(){
  return gulp
    .src(paths.deploy.public)
    .pipe(ghPages());
}


// exports.styles = styles;
exports.watch = watch;
exports.deploy = deploy;


//Create default tasks
var build = gulp.parallel(styles, scripts, pages, images, watch);
gulp.task('default', build);
