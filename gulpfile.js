const gulp = require("gulp");
const sass = require("gulp-sass");

sass.compiler = require('node-sass');

// copies the fonts and images from the govuk-frontend package to the dist directory
gulp.task("govuk-frontend-copy", function() {
  return gulp.src([
    "./node_modules/govuk-frontend/govuk/assets/**/*"
  ]).pipe(gulp.dest("./dist/static"));
});

// compiles the sass down to css
gulp.task('sass', function() {
  return gulp.src('./static/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./dist/static'));
});

// executes all static asset tasks in parallel
exports.static = gulp.parallel(
  gulp.task("sass"),
  gulp.task("govuk-frontend-copy")
);
