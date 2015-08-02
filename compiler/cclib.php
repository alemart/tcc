' <?php /*
' =====================================
'
'            CHINCHILLA LIB
'
' Copyright (C) 2011 Alexandre Martins
'              <alemartf at gmail.com>
'
' =====================================








'' @group System
'' @gdesc Generic routines related to the runtime engine.








'' Quits the program
fun exit()
    __asm "halt"
endfun


' Prints a message to the console
' @param msg message to be printed
fun console(msg)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 0"
    __asm "int 5"
endfun

'' Asks some data from the user.
'' @code
''     name = input("Your name?")
''     print name
'' @endcode
'' @param msg a message to be displayed
'' @return the input the user has given
fun input(msg)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push \"\""
    __asm "push a"
    __asm "push 1"
    __asm "int 4"
    __asm "pop fun"
endfun

'' Displays a message box
'' @param msg Message to be displayed
fun msgbox(msg)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 0"
    __asm "int 4"
endfun

'' Displays an OK/Cancel confirm box
'' @param msg Message to be displayed
'' @return true if the user has clicked on OK.
fun confirm(msg)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 2"
    __asm "int 4"
    __asm "pop fun"
endfun


'' Shows an error message and closes the program
'' @param message message to be displayed
fun fatalError(message)
    msgbox message
    exit
endfun













'' @group Time routines
'' @gdesc Routines related to time











'' Number of milliseconds since the application has started
'' @return milliseconds
fun milliseconds()
    __asm "load fun, 288"
endfun

'' Suspends the execution of the program for a while
'' @code
''     ' sleeps during one second
''     sleep 1000
'' @endcode
'' @param ms time to suspend the program, in milliseconds
fun sleep(ms)
    x = milliseconds() + ms
    while milliseconds() < x
    wend
endfun










'' @group String routines
'' @gdesc Auxiliary routines to work with string (text) data.








'' Length of a string
'' @code
''     four = len("abcd")
'' @endcode
'' @param str string to be evaluated
'' @return the length of str
fun len(str)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "len fun"
endfun




'' A substring of str starting at pos and of length size
'' @param str input string
'' @param pos position of the first character to be extracted. pos is zero-based
'' @param size length of the substring
'' @return a substring of str
fun substr(str, pos, size)
    return left$(right$(str, len(str)-pos), size)
endfun


'' Convert to uppercase
'' @param str input string
'' @return uppercase equivalent of str
fun uppercase(str)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "upr fun"
endfun

'' Convert to lowercase
'' @param str input string
'' @return lowercase equivalent of str
fun lowercase(str)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "lwr fun"
endfun

'' Convert character to ASCII code
'' @param ch character
'' @return the ascii code of ch
fun asc(ch)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "asc fun"
endfun

'' Convert ASCII code to character
'' @param ascii ascii code
'' @return the equivalent character
fun chr(ascii)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "chr fun"
endfun

'' Finds a substring
'' @param haystack string to be examined
'' @param needle substring to be found
'' @return the position of needle (>= 0), or < 0 if it couldn't be found
fun indexOf(haystack, needle)
    nl = len(needle)
    lim = len(haystack) - nl - 1
    for i=0 to lim
        if substr(haystack, i, nl) = needle then return i
    next
    return -1
endfun

'' The i-th character of a string
'' @param str string
'' @param i position (zero-based)
'' @return the i-th character
fun charAt(str, i)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "add adr, 1"
    __asm "load a, adr"
    __asm "add a, 1"
    __asm "left fun, a"
    __asm "right fun, 1"
endfun

'' Left substring
'' @param str string to be examined
'' @param n length of the wanted substring
'' @return a string containing the n leftmost characters of str
fun left$(str, n)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "add adr, 1"
    __asm "load a, adr"
    __asm "left fun, a"
endfun

'' Right substring
'' @param str string to be examined
'' @param n length of the wanted substring
'' @return n rightmost characters of str
fun right$(str, n)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "add adr, 1"
    __asm "load a, adr"
    __asm "right fun, a"
endfun

'' Substring (an alias to substr)
'' A substring of str starting at pos and of length size
'' @param str input string
'' @param pos position of the first character to be extracted. pos is zero-based
'' @param size length of the substring
'' @return a substring of str
fun mid$(str, pos, size)
    return left$(right$(str, len(str)-pos), size)
endfun











'' @group Math routines
'' @gdesc Mathematical functions






'' An approximation of pi
'' @return 3.14159...
fun pi()
    return 3.1415926535
endfun

'' Maximum between a and b
'' @param a a number
'' @param b another number
'' @return a if a >= b, b otherwise
fun max(a, b)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load fun, adr"
    __asm "scmp a, fun"
    __asm "jg Lmax_a"
    __asm "jmp Lmax_end"
    __asm "Lmax_a:"
    __asm "mov fun, a"
    __asm "Lmax_end:"
endfun

'' Minimum between a and b
'' @param a a number
'' @param b another number
'' @return a if a < b, b otherwise
fun min(a, b)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load fun, adr"
    __asm "scmp a, fun"
    __asm "jl Lmin_a"
    __asm "jmp Lmin_end"
    __asm "Lmin_a:"
    __asm "mov fun, a"
    __asm "Lmin_end:"
endfun

'' Clamps x between minval and maxval
'' @param minval the minimum value
'' @param maxval the maximum value
'' @return minval if x < minval, maxval if x > maxval, or x otherwise.
fun clamp(x, minval, maxval)
    if x < minval then return minval
    if x > maxval then return maxval
    return x
endfun

'' Absolute value
'' @param a a number
'' @return a if a >= 0, or -a otherwise
fun abs(a)
    if a >= 0 then return a
    return -a
endfun

'' Sign function
'' @param a a number
'' @return The sign of a: -1 if negative or 1 if non-negative
fun sign(a)
    if a >= 0 then return 1
    return -1
endfun

'' Square root
'' @param x a non-negative number
'' @return The square root of x
fun sqrt(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "sqrt fun"
endfun

'' Arc cosine
'' @param x a number between 1 and -1
'' @return The arc cosine, in degrees, of x
fun acos(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "acos fun"
    __asm "mul fun, 57.295779515"
endfun

'' Arc sine
'' @param x a number between 1 and -1
'' @return The arc sine, in degrees, of x
fun asin(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "asin fun"
    __asm "mul fun, 57.295779515"
endfun

'' Arc tangent
'' @param x a number
'' @return The arc tangent, in degrees, of x
fun atan(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "atan fun"
    __asm "mul fun, 57.295779515"
endfun

'' Improved arc tangent
'' @code
''     arc = atan2(1, 1)
''     print arc ' will print 45
'' @endcode
'' @param y a number
'' @param x another number
'' @return The angle, in degrees, between the vector (x,y) and the positive x-axis
fun atan2(y, x)
    ' http://en.wikipedia.org/wiki/Atan2
    if x>0 then return atan(y/x)
    if y>=0 and x<0 then return 180 + atan(y/x)
    if y<0 and x<0 then return atan(y/x) - 180
    if y>0 then return 90
    if y<0 then return -90
    return 0
endfun

'' Ceiling function
'' @param x a number
'' @return The smallest integer not less than x
fun ceil(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "ceil fun"
endfun

'' Floor function
'' @param x a number
'' @return the smallest integer not greater than x
fun floor(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "floor fun"
endfun

'' Round to nearest integer
'' @param x a number
'' @return the nearest integer from x
fun round(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "add fun, 0.5"
    __asm "floor fun"
endfun

'' Random number
'' @param minval minimum value
'' @param maxval maximum value
'' @return A random integer between minval and maxval, inclusive
fun random(minval, maxval)
    ' formula: Math.floor(Math.random() * (max - min + 1) + min)
    ' from: http://thepenry.net/old/jsrandom.php
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "sub b, a"
    __asm "add b, 1"
    __asm "rnd fun"
    __asm "mul fun, b"
    __asm "add fun, a"
    __asm "floor fun"
endfun

'' Exponential function
'' @param x a number
'' @return The exponential of x
fun exp(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "exp fun"
endfun

'' Natural logarithm
'' @param x a positive number
'' @return The natural logarithm of x
fun log(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "log fun"
endfun

'' Base-10 logarithm
'' @param x a positive number
'' @return The base-10 logarithm of x
fun log10(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "log fun"
    __asm "div fun, 2.302585093"
endfun

'' Sine
'' @param x an angle, in degrees
'' @return The sine of x
fun sin(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "div fun, 57.295779515"
    __asm "sin fun"
endfun

'' Cosine
'' @param x an angle, in degrees
'' @return The cosine of x
fun cos(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "div fun, 57.295779515"
    __asm "cos fun"
endfun

'' Tangent
'' @param x an angle, in degrees
'' @return The tangent of x
fun tan(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "div fun, 57.295779515"
    __asm "tan fun"
endfun
    







'' @group Video routines
'' @gdesc Routines related to the video device.



g_myRedColor# = 1.0
g_myGreenColor# = 1.0
g_myBlueColor# = 1.0
g_myAlpha# = 1.0
g_myScaleX# = 1.0
g_myScaleY# = 1.0
g_myRotation# = 0
g_myOriginX# = 0
g_myOriginY# = 0
g_blendingMode$ = "normal"


'' Enables game mode, i.e., enables double buffering and set the
'' screen update rate to 60 fps.
fun gameMode()
    __asm "push 4"
    __asm "int 7"
endfun

'' Clears the screen
fun cls()
    g_printYPos = 0
    __asm "push 6"
    __asm "int 7"
endfun

'' Updates the screen when in double buffered mode
'' @code
''     gameMode
''     do
''         cls
''         <game logic>
''         <render calls>
''         flip
''     loop
'' @endcode
fun flip()
    __asm "push 5"
    __asm "int 7"
endfun



'' The width of the screen, in pixels
'' @code
''     w = screenWidth()
''     print w
'' @endcode
'' @return screen width
fun screenWidth()
    __asm "push 0"
    __asm "int 7"
    __asm "pop fun"
endfun

'' The height of the screen, in pixels
'' @code
''     h = screenHeight()
''     print h
'' @endcode
'' @return screen height
fun screenHeight()
    __asm "push 1"
    __asm "int 7"
    __asm "pop fun"
endfun

'' Sets current color, affecting print, textout, circlefill, etc.
'' @param red a value between 0 and 255, inclusive
'' @param green a value between 0 and 255, inclusive
'' @param blue a value between 0 and 255, inclusive
fun setColor(red, green, blue)
    g_myRedColor# = red
    g_myGreenColor# = green
    g_myBlueColor# = blue

    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = red
    __asm "add adr, 1"
    __asm "load b, adr" ' b = green
    __asm "add adr, 1"
    __asm "load c, adr" ' c = blue
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 10"
    __asm "int 7"
endfun

'' Gets the current red color, previously specified by setColor.
'' @return a value between 0 and 255, inclusive
fun getRedColor()
    return g_myRedColor#
endfun

'' Gets the current green color, previously specified by setColor.
'' @return a value between 0 and 255, inclusive
fun getGreenColor()
    return g_myGreenColor#
endfun

'' Gets the current blue color, previously specified by setColor.
'' @return a value between 0 and 255, inclusive
fun getBlueColor()
    return g_myBlueColor#
endfun

'' Sets the alpha (translucency) value, affecting print, textout, circlefill, etc.
'' @param alpha a value between 0.0 (transparent) and 1.0 (opaque), inclusive
fun setAlpha(alpha)
    g_myAlpha# = alpha

    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 11"
    __asm "int 7"
endfun

'' Gets the current alpha value, previously set by setAlpha.
'' @return alpha value
fun getAlpha()
    return g_myAlpha#
endfun






'' @group Drawing routines
'' @gdesc Routines to draw stuff (pixels, primitives, text and images) to the screen.




'' Plots a pixel to the screen
'' @param x x-coordinate
'' @param y y-coordinate
fun plot(x, y)
    rectfill(x, y, 1, 1)
endfun

'' Draws a filled rectangle to the screen
'' @param x starting x-coordinate
'' @param y starting y-coordinate
'' @param width width of the rectangle
'' @param height height of the rectangle
fun rectfill(x, y, width, height)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = x
    __asm "add adr, 1"
    __asm "load b, adr" ' b = y
    __asm "add adr, 1"
    __asm "load c, adr" ' c = width
    __asm "add adr, 1"
    __asm "load d, adr" ' d = height
    __asm "push d"
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 12"
    __asm "int 7"
endfun

'' Draws a nonfilled rectangle to the screen
'' @param x starting x-coordinate
'' @param y starting y-coordinate
'' @param width width of the rectangle
'' @param height height of the rectangle
fun rect(x, y, width, height)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = x
    __asm "add adr, 1"
    __asm "load b, adr" ' b = y
    __asm "add adr, 1"
    __asm "load c, adr" ' c = width
    __asm "add adr, 1"
    __asm "load d, adr" ' d = height
    __asm "push d"
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 13"
    __asm "int 7"
endfun

'' Draws a filled circle with the specified centre and radius
'' @param x x-coordinare of its center
'' @param y y-corrdinate of its center
'' @param radius the radius of the circle
fun circlefill(x, y, radius)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = x
    __asm "add adr, 1"
    __asm "load b, adr" ' b = y
    __asm "add adr, 1"
    __asm "load c, adr" ' c = radius
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 14"
    __asm "int 7"
endfun

'' Draws a circle with the specified centre and radius
'' @param x x-coordinare of its center
'' @param y y-corrdinate of its center
'' @param radius the radius of the circle
fun circle(x, y, radius)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = x
    __asm "add adr, 1"
    __asm "load b, adr" ' b = y
    __asm "add adr, 1"
    __asm "load c, adr" ' c = radius
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 15"
    __asm "int 7"
endfun

'' Draws a line from point 1 to point 2
'' @param x1 x-coordinate of the first point
'' @param y1 y-coordinate of the first point
'' @param x2 x-coordinate of the second point
'' @param y2 y-coordinate of the second point
fun line(x1, y1, x2, y2)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = x1
    __asm "add adr, 1"
    __asm "load b, adr" ' b = y1
    __asm "add adr, 1"
    __asm "load c, adr" ' c = x2
    __asm "add adr, 1"
    __asm "load d, adr" ' d = y2
    __asm "push d"
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 16"
    __asm "int 7"
endfun



'' Draws an image on the screen.
'' @code
''     drawImage "bunny.png", 10, 10
'' @endcode
'' @param imageName name of the image to be displayed
'' @param x x-coordinate
'' @param y y-coordinate
fun drawImage(imageName, x, y)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = imageName
    __asm "add adr, 1"
    __asm "load b, adr" ' b = x
    __asm "add adr, 1"
    __asm "load c, adr" ' c = y
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 18"
    __asm "int 7"
endfun

'' Draws a region of an image using the specified parameters.
'' @param imageName name of the image to be displayed
'' @param source_x starting x-coordinate to be clipped
'' @param source_y starting y-coordinate to be clipped
'' @param source_width how large should be the piece of the source image
'' @param source_height how tall should be the piece  of the source image
'' @param dest_x x-coordinate of where the source image should be drawn
'' @param dest_y y-coordinate of where the source image should be drawn
'' @param dest_width wanted width of the resulting piece of the image
'' @param dest_height wanted height of the resulting piece of the image
fun drawImageEx(imageName, source_x, source_y, source_width, source_height, dest_x, dest_y, dest_width, dest_height)
    __asm "mov adr, bp"
    __asm "add adr, 11"
    __asm "load a, adr" ' dest_height
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' dest_width
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' dest_y
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' dest_x
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' source_height
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' source_width
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' source_y
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' source_x
    __asm "push a"
    __asm "sub adr, 1"
    __asm "load a, adr" ' imageName
    __asm "push a"
    __asm "push 20"
    __asm "int 7"
endfun

'' Width of an image
'' @param imageName the image
'' @return the width of the image, in pixels
fun imageWidth(imageName)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 21"
    __asm "int 7"
    __asm "pop fun"
endfun

'' Height of an image
'' @param imageName the image
'' @return the height of the image, in pixels
fun imageHeight(imageName)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 22"
    __asm "int 7"
    __asm "pop fun"
endfun




'' @group Text output
'' @gdesc How to render texts.



g_printYPos = 0

'' Prints a text to the screen, like if it was a console.
'' @code
''     print "Hello!"
'' @endcode
'' @param text text to be printed
fun print(text)
    textout(10, 10 + g_printYPos, 24, text)
    g_printYPos += 30
endfun



'' Displays a text on the screen at the specified position using a default font.
'' @param x starting x-position
'' @param y starting y-position
'' @param size size of the text
'' @param text text to be displayed
'' @code
''     textout 10, 10, 24, "Hello"
'' @endcode
fun textout(x, y, size, text)
    textoutEx(x, y, "sans-serif", size, text)
endfun

'' Displays a text with the specified parameters.
'' @code
''     textoutEx 10, 10, "sans-serif", 36, "Testing"
'' @endcode
'' @param x starting x-position
'' @param y starting y-position
'' @param font name of the font ("serif", "monospace", etc.)
'' @param size size of the text
'' @param text text to be displayed
fun textoutEx(x, y, font, size, text)
    __asm "push fun"
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = x
    __asm "add adr, 1"
    __asm "load b, adr" ' b = y
    __asm "add adr, 1"
    __asm "load c, adr" ' c = font
    __asm "add adr, 1"
    __asm "load d, adr" ' d = size
    __asm "add adr, 1"
    __asm "load fun, adr" ' fun = text
    __asm "push fun"
    __asm "push b"
    __asm "push a"
    __asm "push d"
    __asm "push c"
    __asm "push 17"
    __asm "int 7"
    __asm "pop fun"
endfun







'' @group Transforms
'' @gdesc Advanced routines to handle graphical transforms.





'' Defines a rotation. Affects the drawing routines.
'' @param angle rotation angle, in degrees, clockwise
fun setRotation(angle)
    g_myRotation# = angle
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "div a, 57.295779515"
    __asm "push a"
    __asm "push 25"
    __asm "int 7"
endfun

'' The current rotation angle.
'' @return an angle, in degrees. Normally, it should be 0.0.
fun getRotation()
    return g_myRotation#
endfun

'' Sets the scale, affecting the drawing routines.
'' @param scaleX horizontal scaling. 0.5 means half size, 2.0 means double size, and so on...
'' @param scaleY vertical scaling
fun setScale(scaleX, scaleY)
    g_myScaleX# = scaleX
    g_myScaleY# = scaleY
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 24"
    __asm "int 7"
endfun

'' The current x-scale.
'' @return x-scale. Normally, it should be 1.0.
fun getScaleX()
    return g_myScaleX#
endfun

'' The current y-scale.
'' @return y-scale. Normally, it should be 1.0.
fun getScaleY()
    return g_myScaleY#
endfun

'' Defines a new drawing origin.
'' @param originX x-coordinate of the new origin
'' @param originY y-coordinate of the new origin
fun setOrigin(originX, originY)
    g_myOriginX# = originX
    g_myOriginY# = originY
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 23"
    __asm "int 7"
endfun

'' The current x-origin.
'' @return the current x origin. Normally, it should be 0.0.
fun getOriginX()
    return g_myOriginX#
endfun

'' The current y-origin.
'' @return the current y origin. Normally, it should be 0.0.
fun getOriginY()
    return g_myOriginY#
endfun

'' Defines a new blending mode. Valid modes are: "normal", "additive" and "xor"
'' @param mode the blending mode
fun setBlendingMode(type)
    if type = "normal" then
        __asm "push \"source-over\""
    elseif type = "additive" then
        __asm "push \"lighter\""
    elseif type = "xor" then
        __asm "push \"xor\""
    else
        fatalError "Unknown blending mode: \"" + type + "\"."
    endif

    g_blendingMode$ = type
    __asm "push 26"
    __asm "int 7"   
endfun

'' The current blending mode.
'' @return the current blending mode
fun getBlendingMode()
    return g_blendingMode$
endfun













'' @group Audio routines
'' @gdesc Routines to play samples and musics. For advanced audio control, see 'Voice routines'.
g_samples$ = createTable()
g_musicVoice$ = -1

'' Plays the given sample.
'' @code
''     playSample "click.wav"
'' @endcode
'' @param sample the sample you want to play
'' @return a voice number associated to the sample
fun playSample(sample)
    return playSampleEx(sample, 0)
endfun

'' Plays the given music.
'' @code
''     playMusic "happy.ogg"
'' @endcode
'' @param music the music you want to play
'' @return a voice number associated to the music
fun playMusic(music)
    return playMusicEx(music, 0)
endfun

'' Stops the playing music, if any.
'' @code
''     stopMusic
'' @endcode
fun stopMusic()
    if g_musicVoice$ >= 0 then stopVoice g_musicVoice$
endfun

'' Plays and loops the given sample.
'' @param sample the sample you want to play
'' @param loops number of times to loop the sample. It must be zero if you don't want the sample to loop, or -1 if you want it to loop forever.
'' @return a voice number associated to the sample
fun playSampleEx(sample, loops)
    ' finds a free voice (the sample can play up to limit times simultaneously
    limit = 8
    ch = 1
    x = sample
    while (tableEntryExists(g_samples$, x) and isVoicePlaying(g_samples$[x]) and ch < limit)
        ch += 1
        x = sample + ch
    wend
    if not tableEntryExists(g_samples$, x) then g_samples$[x] = createVoice(sample)
    voice = g_samples$[x]
    playVoiceEx voice, loops
    return voice
endfun


'' Plays and loops the given music.
'' @param music the music you want to play
'' @param loops number of times to loop the music. It must be zero if you don't want the music to loop, or -1 if you want it to loop forever.
'' @return a voice number associated to the music
fun playMusicEx(music, loops)
    if g_musicVoice$ >= 0 then destroyVoice g_musicVoice$
    g_musicVoice$ = createVoice(music)
    playVoiceEx g_musicVoice$, loops
    return g_musicVoice$
endfun







'' @group Voice routines
'' @gdesc Advanced audio routines.

'' Creates a new voice, returning its number.
'' @code
''     explosion = createVoice("x.wav")
''     playVoice(explosion)
'' @endcode
'' @param filename the required filename
'' @return voice number
fun createVoice(filename)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 0"
    __asm "int 6"
    __asm "pop fun"
endfun

'' Destroys an existing voice. Voices should be destroyed after they're used!
'' @code
''     destroyVoice explosion
'' @endcode
'' @param voiceId number of the voice to be destroyed
fun destroyVoice(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 1"
    __asm "int 6"
endfun

'' Plays the given voice
'' @param voiceId the voice
fun playVoice(voiceId)
    playVoiceEx(voiceId, 0)
endfun


'' Plays a voice.
'' @param voiceId number of the requested voice
'' @param loops number of times to loop the voice. It must be zero if you don't want the voice to loop.
fun playVoiceEx(voiceId, loops)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 2"
    __asm "int 6"
endfun


'' Is a voice playing?
'' @param voiceId the voice
'' @return true or false
fun isVoicePlaying(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 11"
    __asm "int 6"
    __asm "pop fun"
endfun

'' Stops a playing voice
'' @param voiceId the voice to be stopped
fun stopVoice(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 3"
    __asm "int 6"
endfun

'' Pauses a playing voice
'' @param voiceId the voice to be paused
fun pauseVoice(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 4"
    __asm "int 6"
endfun

'' Resumes a paused voice
'' @param voiceId the voice to be resumed
fun resumeVoice(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 5"
    __asm "int 6"
endfun

'' Sets the position, in seconds, of a voice
'' @param voiceId the voice
'' @param seconds a non-negative number
fun setVoicePosition(voiceId, seconds)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 6"
    __asm "int 6"
endfun

'' Gets the position, in seconds, of a voice
'' @param voiceId the voice
'' @return voice position, in seconds
fun voicePosition(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 7"
    __asm "int 6"
    __asm "pop fun"
endfun

'' The duration, in seconds, of a voice
'' @param voiceId the voice
'' @return duration
fun voiceDuration(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 10"
    __asm "int 6"
    __asm "pop fun"
endfun

'' Sets the volume of a voice
'' @param voiceId the voice
'' @param a value between 0.0 (quiet) and 1.0 (loud)
fun setVoiceVolume(voiceId, volume)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 8"
    __asm "int 6"
endfun

'' Gets the volume of a voice
'' @param voiceId the voice
'' @return a value between 0.0 (quit) and 1.0 (loud)
fun voiceVolume(voiceId)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 9"
    __asm "int 6"
    __asm "pop fun"
endfun








'' @group Mouse routines
'' @gdesc Utilities related to the mouse device.





'' x position of the mouse cursor
'' @return x position
fun mouseX()
    __asm "load fun, 144"
endfun

'' y position of the mouse cursor
'' @return y position
fun mouseY()
    __asm "load fun, 145"
endfun

'' Is the specified mouse button pressed?
'' @code
''     if mouseDown(1) then
''         msgbox "Left mouse button!"
''     endif
'' @endcode
'' @param button 1 (left), 2 (middle) or 3 (right)
'' @return true or false
fun mouseDown(button)
    if button < 1 or button > 3 then return false
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "mov adr, 145"
    __asm "add adr, a"
    __asm "load fun, adr" ' mem[145+button]
endfun

'' Has the specified mouse button just been pressed?
'' @param button 1 (left), 2 (middle) or 3 (right)
'' @return true or false
fun mouseHit(button)
    if button < 1 or button > 3 then return false
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "mov adr, 145"
    __asm "add adr, a"
    __asm "load fun, adr" ' mem[145+button]
    __asm "add adr, 5"
    __asm "load a, adr" ' mem[150+button]
    __asm "not a"
    __asm "and fun, a" ' mem[145+button] and not(mem[150+button])
endfun

'' Suspend the program until a mouse button click
'' @return the mouse button clicked (1, 2 or 3)
fun waitClick()
    x = -1
    while x < 0
        if mouseHit(1) then x = 1
        if mouseHit(2) then x = 2
        if mouseHit(3) then x = 3
    wend
    return x
endfun








'' @group Keyboard routines
'' @gdesc Routines related to the keyboard.







'' Is the specified keyboard button pressed?
'' @code
''     if keyDown(g_keyA) then 
''         if keyDown(g_keyEscape) then exit
''         if keyDown(g_keyEnter) then cls
''     endif
'' @endcode
'' @param key the key to be checked
'' @return true or false
fun keyDown(key)
    if key < 0 or key > 255 then return false
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "mov adr, 304"
    __asm "add adr, a"
    __asm "load fun, adr" ' mem[304+key]
endfun

'' Has the specified keyboard button just been pressed?
'' @param key the key to be checked
' 0 <= key <= 255
fun keyHit(key)
    if key < 0 or key > 255 then return false
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "mov adr, 304"
    __asm "add adr, a"
    __asm "load fun, adr" ' mem[304+button]
    __asm "add adr, 256"
    __asm "load a, adr" ' mem[304+256+button]
    __asm "not a"
    __asm "and fun, a" ' mem[145+button] and not(mem[304+256+button])
endfun

'' Suspends the program until a key press is given
'' @return the number of the pressed key
fun waitKey()
    x = -1
    while x < 0
        for i=0 to 255
            if keyHit(i) then x = i
        next
    wend
    return x
endfun

' keycodes
g_keyBackspace = 8
g_keyTab = 9
g_keyClear = 12
g_keyReturn = 13
g_keyEnter = 13
g_keyPause = 19
g_keyCapsLock = 20
g_keyEscape = 27
g_keySpace = 32
g_keyPageUp = 33
g_keyPageDown = 34
g_keyEnd = 35
g_keyHome = 36
g_keyLeft = 37
g_keyUp = 38
g_keyRight = 39
g_keyDown = 40
g_keySelect = 41
g_keyPrint = 42
g_keyExecute = 43
g_keyScreen = 44
g_keyInsert = 45
g_keyDelete = 46
g_keyHelp = 47
g_key0 = 48
g_key1 = 49
g_key2 = 50
g_key3 = 51
g_key4 = 52
g_key5 = 53
g_key6 = 54
g_key7 = 55
g_key8 = 56
g_key9 = 57
g_keyA = 65
g_keyB = 66
g_keyC = 67
g_keyD = 68
g_keyE = 69
g_keyF = 70
g_keyG = 71
g_keyH = 72
g_keyI = 73
g_keyJ = 74
g_keyK = 75
g_keyL = 76
g_keyM = 77
g_keyN = 78
g_keyO = 79
g_keyP = 80
g_keyQ = 81
g_keyR = 82
g_keyS = 83
g_keyT = 84
g_keyU = 85
g_keyV = 86
g_keyW = 87
g_keyX = 88
g_keyY = 89
g_keyZ = 90
g_keyLeftSys = 91
g_keyRightSys = 92
g_keyNumpad0 = 96
g_keyNumpad1 = 97
g_keyNumpad2 = 98
g_keyNumpad3 = 99
g_keyNumpad4 = 100
g_keyNumpad5 = 101
g_keyNumpad6 = 102
g_keyNumpad7 = 103
g_keyNumpad8 = 104
g_keyNumpad9 = 105
g_keyNumpadMultiply = 106
g_keyNumpadAdd = 107
g_keyNumpadSubtract = 109
g_keyNumpadDecimal = 110
g_keyNumpadDivide = 111
g_keyF1 = 112
g_keyF2 = 113
g_keyF3 = 114
g_keyF4 = 115
g_keyF5 = 116
g_keyF6 = 117
g_keyF7 = 118
g_keyF8 = 119
g_keyF9 = 120
g_keyF10 = 121
g_keyF11 = 122
g_keyF12 = 123
g_keyNumLock = 144
g_keyScrollLock = 145
g_keyLeftShift = 160
g_keyRightShift = 161
g_keyLeftControl = 162
g_keyRightControl = 163
g_keyLeftAlt = 164
g_keyRightAlt = 165
g_keyTilde = 192
g_keyMinus = 107
g_keyEquals = 109
g_keyOpenBracket = 219
g_keyCloseBracket = 221
g_keyBackslash = 226
g_keySemiColon = 186
g_keyQuote = 222
g_keyComma = 188
g_keyPeriod = 190
g_keySlash = 191






' -------------------------------------------------------------------
' Managed Memory Subsystem
' Implements a heap-based memory allocator
' TODO: rewrite it in the virtual machine some day ;)
' -------------------------------------------------------------------
'
' For each memory block, consider this control structure:
'
' struct memControlBlock {
'   bool isAvailable;
'   int size;
' };
'
' thus, sizeof(struct memControlBlock) = 2 memory cells.
'

__mmInit

' initializes the memory allocator
fun __mmInit()
    __asm "mov a, 16384"
    __asm "store a, 126" ' 126 = heap memory start address
    __asm "store a, 127" ' 127 = heap memory end address
endfun

' requests more heap space from the virtual machine
' returns a pointer to the newly allocated space
fun __mmRequestMoreHeapSpace(numCells)
    __asm "mov adr, bp"
    __asm "add adr, 3"  ' [ old_bp | ret_addr | parameter ]
    __asm "load b, adr" ' b = numCells
    __asm "load a, 127" ' a = heap memory end address
    __asm "mov fun, a"  ' returns old heap end addr
    __asm "add a, b"
    __asm "store a, 127" ' new heap memory end address
    __asm "fcmp a, sp"
    __asm "jl __mmRequestMoreHeapSpace_end"
    fatalError "Out of heap space"
    __asm "__mmRequestMoreHeapSpace_end:"
endfun

' frees some previously-allocated heap space
' returns 0
fun __mmFree(pointer)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr" ' a = pointer
    __asm "sub a, 2"    ' a points to the beginning of the memControlBlock structure
    __asm "mov b, true"
    __asm "store b, a"  ' ((struct memControlBlock*)a)->isAvailable = true;
    __asm "mov fun, 0"
endfun

' allocates some memory
fun __mmAlloc(numCells)
    numCells += 2 ' need to allocate the memControlBlock stuff as well
    
    ' looking for existing heap space
    ptr = __peek(126) ' ptr = beginOfHeapSpace
    while ptr < __peek(127) ' while ptr < endOfHeapSpace
        if __peek(ptr) and __peek(ptr + 1) >= numCells then ' if isAvailable and blockSize >= numCells then
            __poke ptr, false ' this block is no longer available for use
            return ptr + 2 ' yay, we have found a free, large enough block!
        endif
        ptr += __peek(ptr + 1)
    wend
    
    ' we need to request more heap space
    ptr = __mmRequestMoreHeapSpace(numCells)
    __poke ptr, false ' this new block isn't available for use
    __poke ptr+1, numCells ' the size of this block
    return ptr + 2 ' done!
endfun






'' @group Tables
'' @gdesc A table is a dictionary. It's a mechanism to store multiple data in a single variable. They are passed by reference on function calls.







'' Creates a new table
'' @code
''     player = createTable()
''     player["name"] = "Alex"
''     player["x"] = 7
''     player["y"] = 23
''     print player["name"]
''     print player["x"] + "," + player["y"]
'' @endcode
'' @return the address of the new table
fun createTable()
    __asm "push 1"
    __asm "int 3"
    __asm "pop fun"
endfun

'' Destroys an existing table. Tables should be destroyed after they're used!
'' @code
''     destroyTable player
'' @endcode
'' @param table the address of the existing table
fun destroyTable(table)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 2"
    __asm "int 3"
endfun

'' Is a given address a valid table?
'' @param table the table
'' @return true or false
fun isValidTable(table)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 0"
    __asm "int 3"
    __asm "pop fun"
endfun

'' Clones a table
'' @code
''     player2 = cloneTable(player)
''     player2["name"] = "Jane"
''     print player["name"]  ' Alex
''     print player2["name"] ' Jane
'' @endcode
'' @param table table to be cloned
'' @return a clone of table
fun cloneTable(table)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 8"
    __asm "int 3"
    __asm "pop fun"
endfun

'' The number of elements in the given table
'' @param table the table
'' @return number of elements
fun tableSize(table)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 3"
    __asm "int 3"
    __asm "pop fun"
endfun

'' Checks if a given table entry exists
'' @param table the table
'' @param key the key
'' @return true or false
fun tableEntryExists(table, key)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 4"
    __asm "int 3"
    __asm "pop fun"
endfun

'' Removes an entry from a table
'' @param table the table
'' @param key the key
'' @return true if the entry was successfully removed, or false otherwise
fun removeTableEntry(table, key)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 5"
    __asm "int 3"
    __asm "pop fun"
endfun



' >>> internal table stuff <<<


' Gets an entry from a table.
fun getTableEntry(table, key)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 6"
    __asm "int 3"
    __asm "pop fun"
endfun

' Sets an entry to the table
fun setTableEntry(table, key, value)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "add adr, 1"
    __asm "load c, adr"
    __asm "push c"
    __asm "push b"
    __asm "push a"
    __asm "push 7"
    __asm "int 3"
endfun

' auxiliary-functions made in order to traverse a table
fun getTableIterator(table)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "push a"
    __asm "push 9"
    __asm "int 3"
    __asm "pop fun"
endfun

fun tableIteratorIsValid(table, iterator)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 10"
    __asm "int 3"
    __asm "pop fun"
endfun

fun incrementTableIterator(table, iterator)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 11"
    __asm "int 3"
    __asm "pop fun"
endfun

fun getKeyFromTableIterator(table, iterator)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 12"
    __asm "int 3"
    __asm "pop fun"
endfun

fun getValueFromTableIterator(table, iterator)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load a, adr"
    __asm "add adr, 1"
    __asm "load b, adr"
    __asm "push b"
    __asm "push a"
    __asm "push 13"
    __asm "int 3"
    __asm "pop fun"
endfun





'' @group Actors
'' @gdesc Actors are a simplified way to work with sprites (characters, items, etc. - animated or not).






' -------------------------------------------------------------------
' Actor implementation
'
' an actor is a struct:
'
' struct Actor {
'     string signature;
'     float xpos;
'     float ypos;
'     float xanchor;
'     float yanchor;
'     table* animations;
'     table* currentAnimation;
'     float currentAnimationFrame;
' };
'
' therefore, sizeof(struct Actor) = 8
' -------------------------------------------------------------------

g_actorSignature$ = "A$"

fun abortIfInvalidActor(actor)
    if __peek(actor) <> g_actorSignature$ then fatalError "Tried to call an actor function on something that is not an actor"
endfun

'' Creates a new actor
'' @return a new actor
fun createActor()
    actor = __mmAlloc(8)
    __poke actor, g_actorSignature$
    __poke actor+1, 0
    __poke actor+2, 0
    __poke actor+3, 0
    __poke actor+4, 0
    __poke actor+5, createTable()
    __poke actor+6, 0
    __poke actor+7, 0
    return actor
endfun

'' Destroys an existing actor. Actors should be destroyed after they're used!
'' @param actor the actor to be destroyed
fun destroyActor(actor)
    abortIfInvalidActor actor
    ' should we destroy the animations table as well?
    return __mmFree(actor)
endfun

'' Is the given value a valid actor?
'' @param actor the value to test
'' @return true or false
fun isValidActor(actor)
    return __peek(actor) = g_actorSignature$
endfun

'' Clones an actor
'' @param actor actor to clone
'' @return the cloned actor
fun cloneActor(actor)
    abortIfInvalidActor actor
    clone = __mmAlloc(8)
    for i=0 to 7
        ' note that the animation table isn't copied
        __poke clone+i, __peek(actor+i)
    next
    return clone
endfun

'' Adds an animation to an actor, associating a name to it. The image should be a spritesheet, with each animation frame being of the same size
'' @param actor the actor to work with
'' @param animationName the name to be associated with the animation
'' @param image the name of the image containing the sprites
'' @param numberOfHorizontalCells how many horizontal cells does the spritesheet have
'' @param numberOfVerticalCells how many vertical cells does the spritesheet have
'' @param animationSpeed speed of the animation. The greater, the fastest
'' @param repeat? should the animation be repeated after it gets completed?
fun addActorAnimation(actor, animationName, image, numberOfHorizontalCells, numberOfVerticalCells, animationSpeed, repeat?)
    addActorAnimationEx actor, animationName, image, numberOfHorizontalCells, numberOfVerticalCells, 0, numberOfHorizontalCells * numberOfVerticalCells, animationSpeed, repeat?
endfun

'' Like addActorAnimation, but with parameters that allow you to control which frames of the given image are used.
'' @code
''     hero = createActor()
''     addActorAnimationEx hero, "walking", "hero.png", 5, 1, 0, 4, 8, true
''
''     ' hero.png has give consecutive frames, aligned horizontally.
'' @endcode
'' @endcode
'' @param actor the actor to work with
'' @param animationName the name to be associated with the animation
'' @param image the name of the image containing the sprites
'' @param numberOfHorizontalCells how many horizontal cells does the spritesheet have
'' @param numberOfVerticalCells how many vertical cells does the spritesheet have
'' @param initialFrame a number starting on zero
'' @param frameCount a positive number
'' @param animationSpeed speed of the animation. The greater, the fastest
'' @param repeat? should the animation be repeated after it gets completed?
fun addActorAnimationEx(actor, animationName, image, numberOfHorizontalCells, numberOfVerticalCells, initialFrame, frameCount, animationSpeed, repeat?)
    abortIfInvalidActor actor
    animTable = __peek(actor+5)
    if not isValidTable(animTable[animationName]) then animTable[animationName] = createTable()
    anim = animTable[animationName]
    anim["image"] = image
    anim["cellWidth"] = floor( imageWidth(image) / numberOfHorizontalCells )
    anim["cellHeight"] = floor( imageHeight(image) / numberOfVerticalCells )
    anim["horizontalCells"] = floor( imageWidth(image) / anim["cellWidth"] )
    anim["verticalCells"] = floor( imageHeight(image) / anim["cellHeight"] )
    anim["animationSpeed"] = animationSpeed
    anim["repeat"] = repeat?
    anim["initialFrame"] = initialFrame
    anim["frameCount"] = frameCount
    anim["frameLimit"] = initialFrame + frameCount
    anim["finished"] = false
endfun

'' Sets the animation of the given actor
'' @param actor the actor
'' @param animationName the name of the animation
fun setActorAnimation(actor, animationName)
    abortIfInvalidActor actor
    animTable = __peek(actor+5)
    anim = animTable[animationName]
    if not isValidTable(anim) then fatalError "Inexistent actor animation, " + animationName
    if __peek(actor+6) <> anim then
        __poke actor+6, anim
        __poke actor+7, anim["initialFrame"]
    endif
endfun

'' Animates the given actor. Should be called at every frame of the program.
'' @code
''     gameMode
''     hero = createActor()
''     addActorAnimationEx hero, "walking", "hero.png", 5, 1, 0, 4, 8, true
''
''     do
''         cls
''
''         ' <logic>
''         animateActor hero
''         if keyDown(g_keyEscape) then break
''
''         ' <render>
''         drawActor hero
''         flip
''     loop
''     destroyActor hero
'' @endcode
'' @param actor the actor
fun animateActor(actor)
    abortIfInvalidActor actor
    anim = __peek(actor+6) ' current animation
    if not isValidTable(anim) then fatalError "Can't animate actor: no animation has been defined"

    __poke actor+7, __peek(actor+7) + anim["animationSpeed"]
    if __peek(actor+7) >= anim["frameLimit"] then
        if anim["repeat"] then
            __poke actor+7, anim["initialFrame"]
        else
            anim["finished"] = true
            __poke actor+7, anim["frameLimit"] - 1
        endif
    endif
endfun

'' Asks if the animation of an actor has finished playing.
'' @param actor the actor
'' @return true iff it has finished
fun actorAnimationFinished(actor)
    abortIfInvalidActor actor
    anim = __peek(actor+6) ' current animation
    if not isValidTable(anim) then fatalError "Can't test if the actor animation has finished: no animation has been defined"

    return anim["finished"]
endfun

'' Draws an actor to the screen
'' @param actor the actor
fun drawActor(actor)
    abortIfInvalidActor actor
    anim = __peek(actor+6) ' current animation
    if not isValidTable(anim) then fatalError "Can't draw actor: no animation has been defined"

    f = floor( __peek(actor+7) )
    w = anim["horizontalCells"]
    cw = anim["cellWidth"]
    ch = anim["cellHeight"]

    drawImageEx anim["image"], (f mod w) * cw, floor(f / w) * ch, cw, ch, __peek(actor+1) - __peek(actor+3), __peek(actor+2) - __peek(actor+4), cw, ch
endfun

'' The same as drawActor, with more options
'' @param actor the actor
'' @param scaleX horizontal scale (0.5 = half size, 2.0 = double size, and so on...)
'' @param scaleY vertical scale
'' @param rotationAngle rotation angle, in degrees
fun drawActorEx(actor, scaleX, scaleY, rotationAngle)
    abortIfInvalidActor actor
    anim = __peek(actor+6) ' current animation
    if not isValidTable(anim) then fatalError "Can't draw actor: no animation has been defined"

    f = floor( __peek(actor+7) )
    w = anim["horizontalCells"]
    cw = anim["cellWidth"]
    ch = anim["cellHeight"]

    ox = getOriginX()
    oy = getOriginY()
    sx = getScaleX()
    sy = getScaleY()
    ra = getRotation()
    
    setOrigin __peek(actor+1), __peek(actor+2)
    setScale scaleX, scaleY
    setRotation rotationAngle
    drawImageEx anim["image"], (f mod w) * cw, floor(f / w) * ch, cw, ch, -__peek(actor+3), -__peek(actor+4), cw, ch

    setRotation ra
    setScale sx, sy
    setOrigin ox, oy
endfun

'' Sets the position of the actor
'' @param actor the actor
'' @param xpos x-position
'' @param ypos y-position
fun setActorPosition(actor, xpos, ypos)
    abortIfInvalidActor actor
    __poke actor+1, xpos
    __poke actor+2, ypos
endfun

'' Moves the actor by a given amount
'' @param actor the actor
'' @param dx number of pixels to move the actor horizontally
'' @param dy number of pixels to move the actor vertically
fun moveActor(actor, dx, dy)
    abortIfInvalidActor actor
    __poke actor+1, dx + __peek(actor+1)
    __poke actor+2, dy + __peek(actor+2)
endfun

'' Detects collision between two actors.
'' @code
''     for i in coins
''       if actorCollision(hero, coins[i]) then
''         g_score += 100
''         playSample "coin.wav"
''         destroyActor coins[i]
''         removeTableEntry coins, i
''       endif
''     next
'' @endcode
'' @param first an actor
'' @param second another actor
'' @return true if first and second are colliding (according to the bounding box method).
fun actorCollision(first, second)
    abortIfInvalidActor first
    abortIfInvalidActor second

    anim1 = __peek(first+6) ' current animation
    anim2 = __peek(second+6) ' current animation
    if not(isValidTable(anim1) and isValidTable(anim2)) then fatalError "actorCollision: no animations have been defined for the actors"

    a0 = __peek(first+1) - __peek(first+3)
    a1 = __peek(first+2) - __peek(first+4)
    a2 = a0 + anim1["cellWidth"]
    a3 = a1 + anim1["cellHeight"]

    b0 = __peek(second+1) - __peek(second+3)
    b1 = __peek(second+2) - __peek(second+4)
    b2 = b0 + anim2["cellWidth"]
    b3 = b1 + anim2["cellHeight"]

    return ((a0<b2) and (a2>b0) and (a1<b3) and (a3>b1))
endfun

'' The x position of the actor
'' @param actor the actor
'' @return the x position
fun actorX(actor)
    abortIfInvalidActor actor
    return __peek(actor+1)
endfun

'' The y position of the actor
'' @param actor the actor
'' @return the y position
fun actorY(actor)
    abortIfInvalidActor actor
    return __peek(actor+2)
endfun

'' The anchor (hot-spot) of the actor. Normally, the position of the actor represents the top-left (0, 0) of the sprite, but it can be changed.
'' @param actor the actor
'' @param xanchor x-position of the anchor
'' @param yanchor y-position of the anchor
fun setActorAnchor(actor, xanchor, yanchor)
    abortIfInvalidActor actor
    __poke actor+3, xanchor
    __poke actor+4, yanchor
endfun

'' The x-position of the anchor
'' @param actor the actor
'' @return x-anchor
fun actorXAnchor(actor)
    abortIfInvalidActor actor
    return __peek(actor+3)
endfun

'' The y-position of the anchor
'' @param actor the actor
'' @return y-anchor
fun actorYAnchor(actor)
    abortIfInvalidActor actor
    return __peek(actor+4)
endfun

'' Width of the actor
'' @param actor the actor
'' @return the width
fun actorWidth(actor)
    abortIfInvalidActor actor
    anim = __peek(actor+6)
    if not(isValidTable(anim)) then fatalError "actorWidth: no animations have been defined for the actor"
    return anim["cellWidth"]
endfun

'' Height of the actor
'' @param actor the actor
'' @return the height
fun actorHeight(actor)
    abortIfInvalidActor actor
    anim = __peek(actor+6)
    if not(isValidTable(anim)) then fatalError "actorHeight: no animations have been defined for the actor"
    return anim["cellHeight"]
endfun




'' @group Timers
'' @gdesc Objects that will trigger events periodically. Example: "every 1 second, play a sound".

' struct timer {
'     string signature;
'     int intervalms;
'     int triggerTime;
' };
g_timerSignature = "T$"

'' Creates a new timer
'' @code
''    ' Play hi.wav every 1s
''     t = createTimer(1000)
''     do
''       if timerHasExpired(t) then
''         playSample "hi.wav"
''         resetTimer t
''       endif
''     loop
''     ' Call destroyTimer later...
'' @endcode
'' @param intervalms the timer interval, in milliseconds
'' @return a timer
fun createTimer(intervalms)
    t = __mmAlloc(3)
    __poke t, g_timerSignature$
    __poke t+1, intervalms
    __poke t+2, milliseconds() + intervalms
    return t
endfun

'' Destroys an existing timer. You must destroy a timer after you're done with it!
'' @param timer the timer
fun destroyTimer(timer)
    if __peek(timer) <> g_timerSignature$ then fatalError "destroyTimer: invalid timer."
    return __mmFree(timer)
endfun

'' Has the given timer expired?
'' @code
''    ' Play hi.wav after 1s
''     t = createTimer(1000)
''     do
''       if timerHasExpired(t) then
''         playSample "hi.wav"
''       endif
''     loop
''     ' Call destroyTimer later...
'' @endcode
'' @param timer the timer
'' @return true if expired, false otherwise
fun timerHasExpired(timer)
    if __peek(timer) <> g_timerSignature$ then fatalError "timerHasExpired: invalid timer."
    return ( milliseconds() >= __peek(timer+2) )
endfun

'' Resets the given timer
'' @code
''    ' Play hi.wav every 1s
''     t = createTimer(1000)
''     do
''       if timerHasExpired(t) then
''         playSample "hi.wav"
''         resetTimer t
''       endif
''     loop
''     ' Call destroyTimer later...
'' @endcode
'' @param timer the timer
fun resetTimer(timer)
    if __peek(timer) <> g_timerSignature$ then fatalError "resetTimer: invalid timer."    
    __poke timer+2, milliseconds() + __peek(timer+1)
endfun

'' Returns the interval of the given timer
'' @param timer the timer
'' @return the interval, in milliseconds, of timer
fun timerInterval(timer)
    if __peek(timer) <> g_timerSignature$ then fatalError "timerInterval: invalid timer."    
    return __peek(timer+1)
endfun

'' Changes the interval of a timer
'' @param timer the timer
'' @param intervalms the new interval
fun setTimerInterval(timer, intervalms)
    if __peek(timer) <> g_timerSignature$ then fatalError "setTimerInterval: invalid timer."    
    __poke timer+1, intervalms
    resetTimer timer
endfun


'' @group Misc
'' @gdesc Routines that don't fit elsewhere




'' Gets the type of the given variable
'' @param variable the variable
'' @return "string", "number" or "boolean"
fun typeof(variable)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "type fun"
endfun

'' Convert to number.
'' @code
''     seven = toNumber("7")
'' @endcode
'' @param str string to be converted
'' @return number
fun toNumber(str)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "val fun"
endfun

'' Convert to string
'' @param x number to be converted
'' @return string
fun toString(x)
    __asm "mov adr, bp"
    __asm "add adr, 3"
    __asm "load fun, adr"
    __asm "str fun"
endfun

'' Convert to boolean
'' @param x variable to be converted
'' @return true or false
fun toBoolean(x)
    if x then return true
    return false
endfun




' */ ?>
