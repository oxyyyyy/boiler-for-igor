const { watch, series, parallel, src, dest } = require("gulp");
const pug = require("gulp-pug");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const cleanCSS = require("gulp-clean-css");
const autoprefixer = require("gulp-autoprefixer");
const iconfont = require("gulp-iconfont");
const iconfontCss = require("gulp-iconfont-css");
const log = require("fancy-log");
const browserSync = require("browser-sync").create();

sass.compiler = require("node-sass");

const fontName = "iconfont";

const templates = () =>
  src("./app/templates/**/*.pug")
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(dest("./dist/html"));

const javascript = () =>
  src([
    "./app/assets/js/libs/**/*.js",
    "./app/assets/js/components/**/*.js",
    "./app/assets/js/index.js"
  ])
    .pipe(sourcemaps.init())
    .pipe(concat("index.js"))
    .pipe(babel())
    .pipe(dest("./dist/assets/js"))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("./"))
    .pipe(dest("./dist/assets/js"))
    .pipe(browserSync.stream());

const styles = () =>
  src("./app/assets/scss/style.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .on("error", err => log.error(err.toString()))
    .pipe(dest("./dist/assets/css"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("./"))
    .pipe(dest("./dist/assets/css"))
    .pipe(browserSync.stream());

const iconfonts = () =>
  src("./app/assets/img/icons/**/*.svg")
    .pipe(
      iconfontCss({
        fontName: fontName,
        path: "./app/assets/scss/base/mixins/_iconfont.scss",
        targetPath: "./../../assets/scss/common/_icons.scss",
        fontPath: "./../fonts/"
      })
    )
    .pipe(
      iconfont({
        fontName: fontName,
        prependUnicode: true,
        formats: ["ttf", "eot", "woff", "woff2", "svg"],
        normalize: true,
        fontWeight: "300",
        fontHeight: 100,
        fixedWidth: false,
        centerHorizontally: false
      })
    )
    .pipe(dest("./app/assets/fonts/"));

const serve = done => {
  browserSync.init({
    server: "./dist",
    startPath: "html"
  });
  done();
};

const reload = done => {
  browserSync.reload();
  done();
};

const copyFonts = () =>
  src("./app/assets/fonts/**/*").pipe(dest("./dist/assets/fonts"));

const copyImg = () =>
  src("./app/assets/img/**/*").pipe(dest("./dist/assets/img"));

const watchAssets = () => {
  watch(["./app/**/*.js", "./app/**/*.scss"], parallel(javascript, styles));
  watch("./app/templates/**/*.pug", series(templates, reload));
};

// TODO: jQuery
// TODO: Slick

// TODO: Colors

exports.iconfont = iconfonts;
exports.build = parallel(templates, javascript, styles, copyFonts, copyImg);
exports.default = series(
  parallel(templates, javascript, styles, copyFonts, copyImg),
  serve,
  watchAssets
);
