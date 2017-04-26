var patch = (function () {
  /*jshint evil: true */

  "use strict";

  var global = new Function("return this;")(), // Get a reference to the global object
      fnProps = Object.getOwnPropertyNames(Function); // Get the own ("static") properties of the Function constructor

  return function (original, originalRef, patches) {

    var ref = global[originalRef] = original, // Maintain a reference to the original constructor as a new property on the global object
        args = [],
        newRef, // This will be the new patched constructor
        i;

    patches.called = patches.called || originalRef; // If we are not patching static calls just pass them through to the original function

    for (i = 0; i < original.length; i++) { // Match the arity of the original constructor
      args[i] = "a" + i; // Give the arguments a name (native constructors don't care, but user-defined ones will break otherwise)
    }

    if (patches.constructed) { // This string is evaluated to create the patched constructor body in the case that we are patching newed calls
      args.push("'use strict'; return (!!this ? " + patches.constructed + " : " + patches.called + ").apply(null, arguments);");
    } else { // This string is evaluated to create the patched constructor body in the case that we are only patching static calls
      args.push("'use strict'; return (!!this ? new (Function.prototype.bind.apply(" + originalRef + ", [{}].concat([].slice.call(arguments))))() : " + patches.called + ".apply(null, arguments));");
    }

    newRef = new (Function.prototype.bind.apply(Function, [{}].concat(args)))(); // Create a new function to wrap the patched constructor
    newRef.prototype = original.prototype; // Keep a reference to the original prototype to ensure instances of the patch appear as instances of the original
    newRef.prototype.constructor = newRef; // Ensure the constructor of patched instances is the patched constructor

    Object.getOwnPropertyNames(ref).forEach(function (property) { // Add any "static" properties of the original constructor to the patched one
      if (fnProps.indexOf(property) < 0) { // Don't include static properties of Function since the patched constructor will already have them
        newRef[property] = ref[property];
      }
    });

    return newRef; // Return the patched constructor
  };

}());

module.exports = patch;
