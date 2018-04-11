var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
    gulpIgnore = require('gulp-ignore'),
    imagemin  = require('gulp-imagemin'),
    sass = require('gulp-sass'),
    cache = require('gulp-cache'),
    runSequence = require('run-sequence'),
	del = require('del'),
    nodeModulesPath = './node_modules',
    bowerComponentsPath = './bower_components',
    mainBowerFiles = require('main-bower-files'),
    htmlreplace = require('gulp-html-replace'); //This last one is for replacing the asset path in index.html for the build


//INDEX FILE -- Replace asset paths & port to the build folder
gulp.task('index', function() {
   return gulp.src('src/index.html')
    .pipe(htmlreplace({
        'css': 'styles/main.css',
        'js': ['scripts/vendor.min.js', 'scripts/main.min.js']
    }))
    .pipe(gulp.dest('./build')); 
});

//Styles -- compile SCSS to CSS and compress
gulp.task('sass', function() {
   return gulp.src('src/assets/styles/sass/**/*.scss')
   .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
   .pipe(gulp.dest('./build/styles'));
});

gulp.task('styles', function() {
  return gulp.src('build/**/*.css')
    .pipe(sass({
        loadPath: [
            nodeModulesPath + '/font-awesome/scss'
        ] 
    }))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./build'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
});


//### Handle scripts

//Vendor Scripts
gulp.task('vendor-js', function() {
    return gulp.src(mainBowerFiles({filter: '**/*.js'}), { base: bowerComponentsPath })
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('build/scripts'))
});

// Custom Scripts
gulp.task('scripts', function() {
  return gulp.src('src/**/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('build/scripts'))
});

// ### Images
// `gulp images` - Run lossless compression on all the images.
gulp.task('images', function() {
  return gulp.src('src/assets/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('./build'))
});

// ### Clean Tasks

//Del -- delete the folder so can rebuild from scratch
gulp.task('del:build', function() {
  return del.sync(['build']);
});

//Clear the cache to ensure no overwritten data persists
gulp.task('cache:clear', function (callback){
   return cache.clearAll(callback); 
});

gulp.task('clean:build', ['del:build', 'cache:clear'], function() {
    console.log("Cleaning the build");
});

//Build all files/Run all tasks
gulp.task('build', function (callback) {
  runSequence('clean:build', 
    ['index', 'images', 'sass', 'styles', 'vendor-js', 'scripts'],
    callback
  )
})

gulp.task('watch', function() {
    // Watch .html files
  gulp.watch('src/**/*.html', ['index']);
   // Watch .js files
  gulp.watch('src/**/*.js', ['scripts']);
   // Watch .scss files
  gulp.watch('src/assets/styles/sass/**/*.scss', ['sass', 'styles']);
   // Watch image files
  gulp.watch('src/assets/images/**/*', ['images']);
 });

gulp.task('default', ['build', 'watch']);