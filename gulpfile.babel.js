import gulp from "gulp";
import pug from "gulp-pug";
import { deleteAsync } from "del";
import webserver from "gulp-webserver";
import image from "gulp-image";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import uglifyify from "uglifyify";
import ghPages from "gulp-gh-pages";

const sass = gulpSass(dartSass);

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

const view = () =>
  gulp.src(routes.pug.src).pipe(pug()).pipe(gulp.dest(routes.pug.dest));

const clean = async () => await deleteAsync(["build"]);

const webServer = () =>
  gulp.src("build").pipe(webserver({ livereload: true, open: true }));

const img = () =>
  gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));

const style = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const ghDeploy = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, view);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, style);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean]);

const assets = gulp.series([view, img, style, js]);

const live = gulp.parallel([webServer, watch]);

export const build = gulp.series([prepare, assets]);

export const dev = gulp.series([build, live]);

export const deploy = gulp.series([build, ghDeploy]);
