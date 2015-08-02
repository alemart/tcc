// Chinchilla Mode
// @author alemartf at gmail.com (Alexandre Martins)
// Based on LUA mode for CodeMirror 2.

// ---------------------------------------

// LUA mode. Ported to CodeMirror 2 from Franciszek Wawrzak's
// CodeMirror 1 mode.
// highlights keywords, strings, comments (no leveling supported! ("[==[")), tokens, basic indenting
 
CodeMirror.defineMode("chinchilla", function(config, parserConfig) {
  var indentUnit = config.indentUnit;

  function prefixRE(words) {
    return new RegExp("^(?:" + words.join("|") + ")", "i");
  }
  function wordRE(words) {
    return new RegExp("^(?:" + words.join("|") + ")$", "i");
  }
  var specials = wordRE(parserConfig.specials || []);
 
  // standard functions
  var builtins = wordRE([
    //"createTable"
  ]);

  // keywords
  var keywords = wordRE([
			'if','then','elseif','else','endif',
            'for','to','step','next','in',
            'while','wend',
			'do', 'loop',
            'fun', 'endfun', 'return',
            'break',
			'and', 'mod', 'not', 'or', 'xor'
  ]);

  var indentTokens = wordRE([ ]);
  var dedentTokens = wordRE([ ]);
  var dedentPartial = prefixRE([ ]);

  function normal(stream, state) {
    var ch = stream.next();
    if (ch == "\"")
      return (state.cur = string(ch))(stream, state);
    if (ch == "'") {
      stream.eatWhile(/[^\r\n]/);
      return "chinchilla-comment";
    }
    if (/\d/.test(ch)) {
      stream.eatWhile(/[\w.%]/);
      return "chinchilla-number";
    }
    if (/[\w_]/.test(ch)) {
      stream.eatWhile(/[\w\\\-_.]/);
      return "chinchilla-variable";
    }
    return null;
  }


  function string(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) break;
        escaped = !escaped && ch == "\\"; //"
      }
      if (!escaped) state.cur = normal;
      return "chinchilla-string";
    };
  }
    
  return {
    startState: function(basecol) {
      return {basecol: basecol || 0, indentDepth: 0, cur: normal};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = state.cur(stream, state);
      var word = stream.current();
      if (style == "chinchilla-variable") {
        if (keywords.test(word)) style = "chinchilla-keyword";
        else if (builtins.test(word)) style = "chinchilla-builtin";
        else if (specials.test(word)) style = "chinchilla-variable-2";
      }
      /*if ((style != "comment") && (style != "string")){
        if (indentTokens.test(word)) ++state.indentDepth;
        else if (dedentTokens.test(word)) --state.indentDepth;
      }*/
      return style;
    },

    indent: function(state, textAfter) {
      var closing = dedentPartial.test(textAfter);
      return state.basecol + indentUnit * (state.indentDepth - (closing ? 1 : 0));
    }
  };
});

//CodeMirror.defineMIME("text/x-lua", "lua");
