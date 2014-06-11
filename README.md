A [gulp][] plugin to compile [JST][] HTML templates to JavaScript functions using [lodash][].

## Usage

In `templates/test.html`:

```html
<p>Hello {{place}}</p>
```

In your gulpfile:

```javascript
var compiler = require('gulp-lodash-compile');

gulp.task('templates', function() {
    gulp.src('templates/**/*.html')
        .pipe(compiler('templates.js'));
        .pipe(gulp.dest('js/'));
});
```

In your code:

```javascript
    var templates = require('js/templates.js');
    var html = templates.test({
        place: 'world';
    })
    console.log(html); // <p>Hello world</p>
```

This will compile the templates into a JavaScript AMD module.

## Parameters

* file `string`
    * The name of the file to use for the compiled templates
* options `object`
    * Options passed to the hogan task

## Options

### newLine `string`

The line delimiter, defaults to your operating system's newline.

### wrapper `string`

Either `amd`, `commonjs` or `false` for no wrapper, defaults to `amd`. If wrapper is `false` a local var `templates` will be defined containing the templates.

### templateOptions `object`

Coming soon

### templateName `function(file)`

A function that will be passed the file and should return a name for the template. By default uses the basename of the file without an extension.

[gulp]:http://gulpjs.com
