const gulp = require("gulp");
const dartSass = require("sass");
const gulpSass = require("gulp-sass");

const sass = gulpSass(dartSass);

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
// copies the static images to the dist directory
gulp.task('images', function() {
  return gulp.src('./static/images/*.*')
    .pipe(gulp.dest('./dist/static/images'));
});
// copies the static js to the dist directory
gulp.task('js', function() {
  return gulp.src('./static/js/*.*')
      .pipe(gulp.dest('./dist/static/js'));
});
// executes all static asset tasks in parallel
exports.static = gulp.parallel(
  gulp.task("govuk-frontend-copy"),
  gulp.task("sass"),
  gulp.task("images"),
  gulp.task("js")
);
