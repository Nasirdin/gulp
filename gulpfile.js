const { src, dest, watch, parallel, series } = require('gulp');

const scss          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const del           = require('del');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/img/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/src/img'))
}

function scripts() {
    return src([
        'app/src/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/src/js'))
        .pipe(browserSync.stream())

}

function styles() {
    return src('app/src/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/src/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/src/css/style.min.css',
        'app/src/fonts/**/*',
        'app/src/js/main.min.js',
        'app/*.html',
    ], {base: 'app'})
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/src/scss/**/*.scss'], styles);
    watch(['app/src/js/**/*.js', '!app/src/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles      = styles
exports.watching    = watching;
exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanDist      = cleanDist;

exports.build       = series(cleanDist, build);

exports.default = parallel(styles, scripts, browsersync, watching);