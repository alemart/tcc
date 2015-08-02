editAreaLoader.load_syntax["chinchilla"] = {
	'DISPLAY_NAME' : 'Chinchilla'
	,'COMMENT_SINGLE' : {1 : "'"}
	,'COMMENT_MULTI' : { }
	,'QUOTEMARKS' : {1: '"'}
	,'KEYWORD_CASE_SENSITIVE' : false
	,'KEYWORDS' : {
		'keywords' : [
			'if','then','elseif','else','endif',
            'for','to','step','next',
            'while','wend',
			'do', 'loop',
            'fun', 'endfun', 'return',
            'break',
			'and', 'mod', 'not', 'or', 'xor'
		]
	}
	,'OPERATORS' :[
		'+', '-', '/', '*', '=', '<', '>'
	]
	,'DELIMITERS' :[
		'(', ')', '[', ']'
	]
    ,'REGEXPS' :{
        'numbers': {
            'search': '([^a-zA-Z_$#?])([+-]?[0-9]+[.]?[0-9]*)()'
            ,'class': 'numbers'
            ,'modifiers': 'gi'
            ,'execute': 'before'
        }
    }
	,'STYLES' : {
		'COMMENTS': 'color: #007700;'
		,'QUOTESMARKS': 'color: #333399;'
        ,'REGEXPS': {
            'numbers' : 'color: #FF0000;'
        }
		,'KEYWORDS' : {
			'keywords' : 'color: #3366FF;'
		}
		,'OPERATORS' : 'color: #000000;'
		,'DELIMITERS' : 'color: #000000;'

	}
};
